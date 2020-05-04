import { SocketeerClient } from './SocketeerClient.js';

const client = new SocketeerClient('ws://localhost:300');

client.on('connected', () => {
    console.log('connected!');
});

client.on('disconnected', () => {
    console.log('disconnected!');
});

client.connect();
