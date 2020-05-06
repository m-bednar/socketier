import { Socket } from '../Socket';

/**
 * Message handle. Called whenever valid message is recieved.
 */
export interface IMessageHandler<T> {
    (socket: Socket, data: T): void;
}
