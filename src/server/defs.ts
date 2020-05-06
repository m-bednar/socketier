import { IServerOptions } from './types/IServerOptions';

/** @internal */
export const PING_MSG = '__ping__';

/** @internal */
export const PONG_MSG = '__pong__';

export const CLOSE_CODE = 1000;

export const DEFAULT_WSS_OPTS: IServerOptions = {
    port: 300,
    timeout: 12000
};
