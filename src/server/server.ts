import { EventEmitter } from 'events';
import ws, { Data, Server, ServerOptions } from 'ws';
import { EventType } from '../client/types/EventType';
import { DEFAULT_WSS_OPTS, PING_MSG, PONG_MSG } from './defs';
import { Socket } from './Socket';
import { IEventHandler } from './types/IEventHandler';
import { IMessage } from './types/IMessage';
import { IMessageHandler } from './types/IMessageHandler';

export class SocketeerServer {

    private server: Server;
    private eventHandle: EventEmitter = new EventEmitter();
    private messageHandle: EventEmitter = new EventEmitter();

    constructor(opts?: ServerOptions) {
        this.server = new Server({ ...DEFAULT_WSS_OPTS, ...opts });
        this.server.on('listening', this.onListening.bind(this));
        this.server.on('connection', this.onConnection.bind(this));
    }

    public on(type: EventType, handler: IEventHandler) {
        this.eventHandle.addListener(type, handler);
    }

    public subscribe<T>(type: string, handler: IMessageHandler<T>) {
        this.messageHandle.addListener(type, handler);
    }

    public clients(): ReadonlySet<ws> {
        return this.server.clients;
    }

    /* --- Event handlers --- */

    private onListening() {
        this.eventHandle.emit('listening');
    }

    private onConnection(socket: ws) {
        socket.on('message', (data) => this.onMessage(socket, data));
        socket.on('close', () => this.onDisconnection(socket));
        this.eventHandle.emit('connected', new Socket(this.server, socket));
    }

    private onDisconnection(socket: ws) {
        this.eventHandle.emit('disconnected', new Socket(this.server, socket));
    }

    private onMessage(socket: ws, msg: Data) {
        if (msg === PING_MSG) {
            this.sendPong(socket);
            return;
        }
        if (msg === PONG_MSG) {
            // TODO:
            return;
        }
        const _msg = this.decode(msg);
        if (_msg) {
            this.messageHandle.emit(_msg.type, new Socket(this.server, socket), _msg.data);
        }
    }

    /* --- Private methods --- */

    /*
    private sendPing() {
        this.server.clients.forEach((socket) => socket.send(PING_MSG));
    }
    */

    private sendPong(socket: ws) {
        socket.send(PONG_MSG);
    }

    private decode(msg: Data): IMessage | null {
        try {
            const parsed = JSON.parse(msg.toString());
            if (typeof parsed.type !== 'string' || !parsed.data) {
                return null;
            }
            return <IMessage> parsed;
        } catch (error) {
            return null;
        }
    }

}
