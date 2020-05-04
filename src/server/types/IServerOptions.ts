import { ServerOptions } from 'ws';

export interface IServerOptions extends ServerOptions {
    timeout: number;
}
