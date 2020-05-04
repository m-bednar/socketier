import ws from 'ws';

export const PING_MSG = '__ping__';
export const PONG_MSG = '__pong__';
export const CLOSE_CODE = 1000;

export const DEFAULT_WSS_OPTS: ws.ServerOptions = {
    port: 300,
    noServer: false
};
