import * as net from 'net';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const client = net.createConnection({ port: 8080 }, () => {
    console.log('Connected to server!');
});

client.on('data', (data) => {
    const messageType = data.readUInt8(0);
    const contentLength = data.readUInt8(1);
    const messageContent = data.slice(2, 2 + contentLength).toString();

    console.log(`Received: ${messageContent}`);

    switch (messageType) {
        case 0x01: // Initial handshake message
            rl.question('Enter password: ', (password) => {
                send(0x02, password);
            });
            break;
        case 0x03: // Authentication success message
            console.log(`You are now authenticated. Your actions:\n- Type "opponents" to list available opponents.\n- If you are in a game, type "guess" to make a guess.\n- If you are in a game, type "give up" to give up.`);
            break;
        case 0x06: // Opponents list
            console.log('Available opponents: ', messageContent);
            rl.question('Enter the ID of the opponent you wish to play with: ', (opponentId) => {
                rl.question('Enter a word for your opponent to guess: ', (word) => {
                    rl.question('Enter a hint for the word (optional): ', (hint) => {
                        send(0x07, `${opponentId},${word},${hint}`);
                    });
                });
            });
            break;
        case 0x08: // Match started or guess response
            // Additional handling for match started or guess response
            break;
    }
});

client.on('end', () => {
    console.log('Disconnected from server');
    rl.close();
    process.exit();
});

function send(type: number, content: string) {
    const message = createMessage(type, content);
    client.write(message);
}

function createMessage(type: number, content: string): Buffer {
    const contentBuffer = Buffer.from(content, 'utf-8');
    const buffer = Buffer.alloc(2 + contentBuffer.length); // 1 byte for type, 1 byte for length
    buffer.writeUInt8(type, 0);
    buffer.writeUInt8(contentBuffer.length, 1);
    contentBuffer.copy(buffer, 2);
    return buffer;
}

rl.on('line', (line) => {
    const input = line.trim().toLowerCase();

    switch (input) {
        case "opponents":
            send(0x05, ''); // Request list of opponents
            break;
        case "guess":
            rl.question('Enter your guess: ', (guess) => {
                send(0x09, guess); // Send guess to the server
            });
            break;
        case "give up":
            send(0x0B, ''); // Send give up command to the server
            break;
        
        default:
            console.log('Unrecognized command. Available commands are "guess", "opponents", and "give up".');
            break;
    }
});
