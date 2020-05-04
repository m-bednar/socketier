import { SocketeerServer } from './server';

const server = new SocketeerServer();

server.on('connected', () => {
    console.log('Connected', server.clients().size);
});

server.on('disconnected', () => {
    console.log('Disconnected', server.clients().size);
});
