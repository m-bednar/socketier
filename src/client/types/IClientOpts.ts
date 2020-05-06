
export interface IClientOpts {
    /**
     * Interval (in milliseconds) between each ping to server.
     */
    pingInterval: number;
    /**
     * Timeout (in milliseconds) how long to wait for server to respond to ping.
     */
    pongTimeout: number;
}
