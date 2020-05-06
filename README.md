
# Socketeer

Small, but useful wrapper around [ws package](https://www.npmjs.com/package/ws). API similar to Socket.io, but without performance issues and long-polling.

Full **Socketeer documentation** can be found [here](https://m-bednar.github.io/socketeer/).


## Server usage

```typescript
import { SocketeerServer } from 'socketeer';

const server = new SocketeerServer();

server.on('listening', () => console.log('Server listening'));

server.subscribe<string>('hello-world' (socket, data) => {
    console.log(`Socket data recieved: ${data}`);
});

server.listen();   // DO NOT FORGET THIS LINE!!!
```


## Client usage

For more convenient usage please use along with some bundling tool.

```typescript
import { SocketeerClient } from 'node_modules/socketeer/client';

const client = new SocketeerClient('ws://localhost:300');

client.on('connected', () => {
    console.log('Connection estabilished');
    client.send('hello-world', 'Hello world!');
});

client.connect();   // DO NOT FORGET THIS LINE!!!
```

You can also **use client on server-side** to connect server/node.js app to another Socketeer server.

```typescript
import { SocketeerServer } from 'socketeer';
import { SocketeerClient } from 'socketeer/client';


const server = new SocketeerServer();
const client = new SocketeerClient('ws://another-socketeer.com');

server.on('listening', () => {
    // Make connection, when server is ready
    client.connect();
});

server.subscribe<string>('hello-world' (socket, data) => {
    // Resend data to another server
    client.send('hello-world', data);
});

server.listen();
```
