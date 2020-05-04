import { Socket } from '../Socket';

export interface IMessageHandler<T> {
    (socket: Socket, data: T): void;
}
