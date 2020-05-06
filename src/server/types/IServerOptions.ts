import { ServerOptions } from 'ws';

/**
 * Server options.
 */
export interface IServerOptions extends ServerOptions {
    /**
     * Timeout in milliseconds, determinating, how much
     * time must pass without socket to ping, to be disconnected.
     */
    timeout: number;
}
