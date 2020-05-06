
# Socketeer

Small, but useful wrapper around [ws package](https://www.npmjs.com/package/ws). API similar to Socket.io, but without performance issues and long-polling.


## Server usage

```typescript
import { SocketeerServer } from 'socketeer';

let server = new SocketeerServer();

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

let client = new SocketeerClient('ws://localhost:300');

client.on('connected', () => {
    console.log('Connection estabilished');
    client.send('hello-world', 'Hello world!');
});

client.connect();   // DO NOT FORGET THIS LINE!!!
```
