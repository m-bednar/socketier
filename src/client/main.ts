import { SocketeerClient } from './SocketeerClient.js';

const client = new SocketeerClient('ws://localhost:300');

client.on('connected', () => {
    console.log('connected!');
    client.send('hello', { world: true });
});

client.on('disconnected', () => {
    console.log('disconnected!');
});

client.subscribe('hello-world', (data) => {
    console.log(data);
});

client.connect();
