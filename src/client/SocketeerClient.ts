import { CLOSE_CODE, DEFAULT_CLIENT_OPTS, PING_MSG, PONG_MSG } from './defs.js';
import { EventType } from './types/EventType.js';
import { IClientOpts } from './types/IClientOpts.js';
import { IMessageListener } from './types/IMessageListener.js';

export class SocketeerClient {

    private url: string;
    private connection?: WebSocket;

    private eventHandle: EventTarget;
    private messageHandle: EventTarget;

    private opts: IClientOpts;

    private heartbeat?: number;
    private ponged: boolean = true;

    constructor(url: string, opts: IClientOpts = DEFAULT_CLIENT_OPTS) {
        this.url = url;
        this.opts = opts;
        this.eventHandle = new EventTarget();
        this.messageHandle = new EventTarget();
    }

    public connect() {
        if (this.connection) {
            throw Error(`Connection already estabilished.`);
        }
        this.connection = new WebSocket(this.url);
        this.addListeners();
    }

    public on(type: EventType, listener: EventListener) {
        this.eventHandle.addEventListener(type, listener);
    }

    public send<T>(type: string, data: T) {
        if (!this.connection || this.isDisposed()) {
            throw Error(`Cannot send data when connection is not estabilished.`);
        }
        const msg = JSON.stringify({ type, data });
        this.connection.send(msg);
    }

    public subscribe<T>(type: string, listener: IMessageListener<T>) {
        this.messageHandle.addEventListener(type, (event: Event) => {
            listener((<any> event).data);
        });
    }

    public close() {
        this.stopHeartbeat();
        this.removeListeners();
        this.connection?.close(CLOSE_CODE);
        this.connection = undefined;
    }

    private addListeners() {
        if (!this.connection) {
            throw Error(`Cannot add listeners before connection is estabilished.`);
        }
        this.connection.addEventListener('open', this.onOpen.bind(this));
        this.connection.addEventListener('close', this.onClose.bind(this));
        this.connection.addEventListener('error', this.onError.bind(this));
        this.connection.addEventListener('message', this.onMessage.bind(this));
    }

    private removeListeners() {
        if (!this.connection) {
            throw Error(`Cannot remove listeners when connection is not estabilished.`);
        }
        this.connection.removeEventListener('open', this.onOpen.bind(this));
        this.connection.removeEventListener('close', this.onClose.bind(this));
        this.connection.removeEventListener('error', this.onError.bind(this));
        this.connection.removeEventListener('message', this.onMessage.bind(this));
    }

    private isDisposed() {
        return this.connection?.readyState === WebSocket.CLOSING || this.connection?.readyState === WebSocket.CLOSED;
    }

    private onOpen() {
        this.startHeartbeat();
        this.dispatchEvent('connected');
    }

    private onClose() {
        this.stopHeartbeat();
        this.dispatchEvent('disconnected');
    }

    private onError() {
        this.stopHeartbeat();
        this.dispatchEvent('error');
    }

    private onMessage(event: MessageEvent) {
        const data = event.data.toString();
        if (data === PING_MSG) {
            this.sendPong();
            return;
        }
        if (data === PONG_MSG) {
            this.ponged = true;
            return;
        }
        try {
            const msg = JSON.parse(data);
            const e = new Event(msg.type);
            (<any> e).data = msg.data;
            this.messageHandle.dispatchEvent(e);
        } catch (err) {
            throw Error(`Recieved data were not JSON string.`);
        }
    }

    private dispatchEvent(type: EventType) {
        this.eventHandle.dispatchEvent(new Event(type));
    }

    private sendPing() {
        if (this.connection && !this.isDisposed()) {
            this.ponged = false;
            setTimeout(this.timeout.bind(this), this.opts.pongTimeout);
            this.connection.send(PING_MSG);
        }
    }

    private sendPong() {
        if (this.connection && !this.isDisposed()) {
            this.connection.send(PONG_MSG);
        }
    }

    private startHeartbeat() {
        if (!this.heartbeat) {
            this.heartbeat = <any> setInterval(this.sendPing.bind(this), this.opts.pingInterval);
        }
    }

    private stopHeartbeat() {
        if (this.heartbeat) {
            clearInterval(this.heartbeat);
        }
    }

    private timeout() {
        if (!this.ponged) {
            this.close();
        }
    }

}
