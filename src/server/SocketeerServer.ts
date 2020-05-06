import { EventEmitter } from 'events';
import { clearTimeout, setTimeout } from 'timers';
import ws, { Data, Server } from 'ws';
import { DEFAULT_WSS_OPTS, PING_MSG, PONG_MSG } from './defs';
import { Socket } from './Socket';
import { IEventHandler } from './types/IEventHandler';
import { IMessage } from './types/IMessage';
import { IMessageHandler } from './types/IMessageHandler';
import { IServerOptions } from './types/IServerOptions';
import { ServerEventType } from './types/ServerEventType';

/**
 * Server API class.
 */
export class SocketeerServer {

    private server!: Server;
    private eventHandle: EventEmitter = new EventEmitter();
    private messageHandle: EventEmitter = new EventEmitter();

    private options: IServerOptions;
    private heartbeats: Map<ws, NodeJS.Timeout> = new Map<ws, NodeJS.Timeout>();

    /**
     * Creates new SocketeerServer instance.
     * @param opts Server options.
     */
    constructor(opts: IServerOptions = DEFAULT_WSS_OPTS) {
        this.options = opts;
    }

    /**
     * Server begins to listen to new connections and messages.
     */
    public listen() {
        this.server = new Server({ ...DEFAULT_WSS_OPTS, ...this.options });
        this.server.on('error', this.onError.bind(this));
        this.server.on('listening', this.onListening.bind(this));
        this.server.on('connection', this.onConnection.bind(this));
    }

    /**
     * Closes server and all connections.
     */
    public close() {
        this.server.close();
    }

    /**
     * Add listener to an certain event.
     * @param type Type of event to listen to.
     * @param handler Event handler.
     */
    public on(type: ServerEventType, handler: IEventHandler) {
        this.eventHandle.addListener(type, handler);
    }

    /**
     * Subscribes to a certain type of message.
     * @param type Type of message to subscribe to.
     * @param handler Message handler.
     */
    public subscribe<T>(type: string, handler: IMessageHandler<T>) {
        this.messageHandle.addListener(type, handler);
    }

    /**
     * Sends message to all connected sockets.
     * @param type Type of message.
     * @param data Data to be sent.
     */
    public broadcast<T>(type: string, data?: T) {
        const msg = JSON.stringify({ type, data });
        this.server.clients.forEach((socket) => {
            socket.send(msg);
        });
    }

    /**
     * Returns all connected clients.
     */
    public clients(): ReadonlySet<ws> {
        return this.server.clients;
    }

    /* --- Event handlers --- */
    private onError() {
        this.eventHandle.emit('error');
    }

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
