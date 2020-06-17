# P2PChat Browser SDK

libarry to develop peer-to-peer chat cliet on browser

## Quick Start

you should have signalling service installed on your system before use this library, signalling service is necessary to create rooms and manage access to those rooms.

1. install this library via `NPM` repositry

    ```bash
    npm install p2pchat-browser-sdk
    ```

1. simple client usage

    ```typescript
    import {} from 'p2pchat-browser-sdk'

    const client = createNewClient({
      signalingUrl: 'https://my-signalling-service.com',
      logLevel: 'info',
    });

    // get token from signaling service. then you can connect as user
    await client.login('token-from-signalling');
    await client.connect();

    // send message to a rooms
    await client.sendMessage('room-id', {
      type: MessageType.MESSAGE,
      content: 'hello!'
    });

    ```
