import { EventEmitter } from 'events';
import { clearTimeout, setTimeout } from 'timers';
import ws, { Data, Server } from 'ws';
import { EventType } from '../client/types/EventType';
import { DEFAULT_WSS_OPTS, PING_MSG, PONG_MSG } from './defs';
import { Socket } from './Socket';
import { IEventHandler } from './types/IEventHandler';
import { IMessage } from './types/IMessage';
import { IMessageHandler } from './types/IMessageHandler';
import { IServerOptions } from './types/IServerOptions';

export class SocketeerServer {

    private server: Server;
    private eventHandle: EventEmitter = new EventEmitter();
    private messageHandle: EventEmitter = new EventEmitter();

    private options: IServerOptions;
    private heartbeats: Map<ws, NodeJS.Timeout> = new Map<ws, NodeJS.Timeout>();

    constructor(opts: IServerOptions = DEFAULT_WSS_OPTS) {
        this.options = opts;
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
        this.startHeartbeat(socket);
    }

    private onDisconnection(socket: ws) {
        this.eventHandle.emit('disconnected', new Socket(this.server, socket));
        this.removeHeartbeat(socket);
    }

    private onMessage(socket: ws, msg: Data) {
        if (msg === PING_MSG) {
            this.restoreHeartbeat(socket);
            this.sendPong(socket);
            return;
        }
        if (msg === PONG_MSG) {
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

    private startHeartbeat(socket: ws) {
        if (!this.heartbeats.has(socket)) {
            this.heartbeats.set(socket, this.setTimeout(socket));
        }
    }

    private restoreHeartbeat(socket: ws) {
        this.removeHeartbeat(socket);
        this.startHeartbeat(socket);
    }

    private removeHeartbeat(socket: ws) {
        const hb = this.heartbeats.get(socket);
        if (hb) {
            clearTimeout(hb);
            this.heartbeats.delete(socket);
        }
    }

    private setTimeout(socket: ws) {
        return setTimeout(() => new Socket(this.server, socket).close(), this.options.timeout);
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
