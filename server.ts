import * as net from 'net';

interface Client {
    socket: net.Socket;
    id: string;
    opponentId?: string;
    wordToGuess?: string;
    hint?: string;
    role: 'guesser' | 'setter' | 'none';
}

const PORT = 8080;
const PASSWORD = 'secret';
let clients: Client[] = [];
let clientIdCounter = 0; // Counter for unique client IDs

function createMessage(type: number, content: string = ''): Buffer {
    const contentBuffer = Buffer.from(content, 'utf-8');
    const buffer = Buffer.alloc(2 + contentBuffer.length);
    buffer.writeUInt8(type, 0);
    buffer.writeUInt8(contentBuffer.length, 1);
    contentBuffer.copy(buffer, 2);
    return buffer;
}

const server = net.createServer((socket) => {
    console.log('Client connected');
    const client: Client = { socket, id: `Client${++clientIdCounter}`, role: 'none' }; // Increment counter for each new client
    socket.write(createMessage(0x01, 'Welcome! Please send the password.'));

    socket.on('data', (data) => {
        const messageType = data.readUInt8(0);
        const contentLength = data.readUInt8(1);
        const content = data.slice(2, 2 + contentLength).toString();

        switch (messageType) {
            case 0x02: // Password message
                if (content === PASSWORD) {
                    clients.push(client);
                    socket.write(createMessage(0x03, `Authenticated! Your ID is ${client.id}.`));
                } else {
                    socket.write(createMessage(0x04, 'Wrong password. Disconnecting.'));
                    socket.end(); // This closes the connection for the client
                    return; // Ensure no further processing for this connection
                }
                break;
            case 0x05:
                const opponentIds = clients.filter(c => c.id !== client.id && c.role !== 'setter').map(c => c.id).join(',');
                socket.write(createMessage(0x06, opponentIds));
                break;
            case 0x07: // Start match request
                const [opponentId, word, hint] = content.split(',');
                if (opponentId === client.id) {
                    client.socket.write(createMessage(0x04, "Error: You cannot play against yourself."));
                    break;
                }
                const opponent = clients.find(c => c.id === opponentId);
                if (!opponent) {
                    client.socket.write(createMessage(0x04, "Error: Opponent ID does not exist."));
                    break;
                }
                if (opponent.role !== 'none' || opponent.opponentId) {
                    client.socket.write(createMessage(0x04, "Error: Your selected opponent is already in a game."));
                    break;
                }
                if (opponent) {
                    client.wordToGuess = word;
                    client.opponentId = opponentId;
                    client.role = 'setter';
                    // Assuming we add a new property to store the hint
                    client.hint = hint || "No hint provided"; // Default hint
                    opponent.opponentId = client.id;
                    opponent.role = 'guesser';
                    opponent.socket.write(createMessage(0x08, `Match started. Guess the word set by ${client.id}. Hint: ${hint}`));
                    socket.write(createMessage(0x08, `Match started. Your word: "${word}" is being guessed by ${opponent.id}. Hint: ${hint}`));
                }
        
                break;
            
            case 0x09: // Guess word
                if (client.role === 'guesser') {
                    const setter = clients.find(c => c.id === client.opponentId);
                    if (setter && setter.wordToGuess) {
                        const result = content === setter.wordToGuess ? 'correct' : 'wrong';
                        // Include the hint in the response
                        const responseMessage = `Your guess: "${content}" is ${result}.`;
                        client.socket.write(createMessage(0x0A, responseMessage));
                        if (result === 'correct') {
                            // Reset roles and opponent IDs after a correct guess
                            client.role = 'none';
                            setter.role = 'none';
                            client.opponentId = undefined;
                            setter.opponentId = undefined;
                            setter.wordToGuess = undefined; // Also clear the word to guess
                        }
                    } else {
                        client.socket.write(createMessage(0x04, "Error: Your match opponent is no longer available."));
                    }
                } else {
                    client.socket.write(createMessage(0x04, 'Error: You are not in guessing mode.'));
                }
                break;
            
            case 0x0B: // Client gives up
                if (client.role === 'guesser') {
                    const setter = clients.find(c => c.id === client.opponentId);
                    if (setter) {
                        setter.socket.write(createMessage(0x0A, `${client.id} has given up.`));
                        client.socket.write(createMessage(0x0A, "You've given up."));
                        client.role = 'none';
                        setter.role = 'none';
                        client.opponentId = undefined;
                        setter.opponentId = undefined;
                        setter.wordToGuess = undefined;
                    }
                } else {
                    client.socket.write(createMessage(0x04, 'Error: You are not currently guessing.'));
                }
                break;
                
            default: // Unrecognized command
                client.socket.write(createMessage(0x04, 'Error: Unrecognized command.'));
                break;
        }
    });

    // Ensure the server has error handling to catch and log errors without shutting down
    server.on('error', (err) => {
        console.error(`Server error: ${err.message}`);
    });

    // This ensures the server does not shut down on client disconnect
    socket.on('error', (err) => {
        console.error(`Socket error: ${err.message}`);
    });

    socket.on('end', () => {
        console.log(`${client.id} disconnected.`);
        clients = clients.filter(c => c.id !== client.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});


