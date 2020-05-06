import ws from 'ws';
import { CLOSE_CODE } from './defs';

export class Socket {

    private socket: ws;
    private server: ws.Server;

    constructor(server: ws.Server, socket: ws) {
        this.socket = socket;
        this.server = server;
    }

    /**
     * Sends named message to a socket.
     * @param type Name of message.
     * @param data Data to be send.
     */
    public send<T>(type: string, data?: T) {
        this.socket.send(JSON.stringify({ type, data }));
    }

    /**
     * Sends message to all sockets, except the one that it is
     * called on.
     * @param type Name of message.
     * @param data Data to be send.
     */
    public broadcast<T>(type: string, data?: T) {
        const msg = JSON.stringify({ type, data });
        this.server.clients.forEach((socket) => {
            if (socket !== this.socket) {
                socket.send(msg);
            }
        });
    }

    /**
     * Closes the connection.
     */
    public close(code: number = CLOSE_CODE) {
        this.socket.close(code);
    }

}
