import { IClientOpts } from './types/IClientOpts.js';

export const PING_MSG = '__ping__';
export const PONG_MSG = '__pong__';
export const CLOSE_CODE = 1000;

export const DEFAULT_CLIENT_OPTS: IClientOpts = {
    pingInterval: 8000,
    pongTimeout: 4000
};
