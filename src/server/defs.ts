import { IServerOptions } from './types/IServerOptions';

export const PING_MSG = '__ping__';
export const PONG_MSG = '__pong__';
export const CLOSE_CODE = 1000;

export const DEFAULT_WSS_OPTS: IServerOptions = {
    port: 300,
    timeout: 12000,
    noServer: false
};
