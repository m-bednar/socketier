import { Socket } from '../Socket';

export interface IEventHandler {
    (socket: Socket): void;
}
