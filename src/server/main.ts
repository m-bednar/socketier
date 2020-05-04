import { SocketeerServer } from './server';

const server = new SocketeerServer({ port: 300 });

server.subscribe('hello', (socket, data) => {
    console.log(data);
    socket.send('hello-world', data);
});

server.on('connected', (socket) => {
    console.log('Connected', server.clients().size);
    socket.close();
});

server.on('disconnected', () => {
    console.log('Disconnected', server.clients().size);
});
