
# Socketier

Small, but useful wrapper around [ws package](https://www.npmjs.com/package/ws). API similar to Socket.io, but without performance issues and long-polling.

Full **documentation** can be found [here](https://m-bednar.github.io/socketier/).


## Server usage

```typescript
import { SocketierServer } from 'socketier';

const server = new SocketierServer();

server.on('listening', () => console.log('Server listening'));

server.subscribe<string>('hello-world' (socket, data) => {
    console.log(`Socket data recieved: ${data}`);
    // Process data...
});

server.listen();   // DO NOT FORGET THIS LINE!!!
```


## Client usage

For more convenient usage please use along with some bundling tool.

```typescript
import { SocketierClient } from 'node_modules/socketier/client';

const client = new SocketierClient('ws://localhost:300');

client.on('connected', () => {
    console.log('Connection estabilished');
    // Send 'Hello world!' to the server
    client.send('hello-world', 'Hello world!');
});

client.connect();   // DO NOT FORGET THIS LINE!!!
```


You can also **use client on server-side** to connect server/node.js app to another Socketier server.

```typescript
import { SocketierServer } from 'socketier';
import { SocketierClient } from 'socketier/client';

const server = new SocketierServer();
const client = new SocketierClient('ws://another-socketier.com');

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
