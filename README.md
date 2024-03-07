# Luxonis TCP Word Guessing Game

## Introduction

This project is a part of the job application process for Luxonis. It showcases a client-server application that utilizes TCP sockets to facilitate a word guessing game. The implementation demonstrates proficiency in networking, protocol design, and TypeScript.

## Overview

The game allows multiple clients to connect to a server over TCP. Clients can authenticate, find opponents, initiate a guessing game, and either guess the word or give up. The server manages client connections, authentication, and game state, ensuring a smooth gameplay experience.

Additionally, a WebSocket-based web interface is provided to observe game progress in real-time, serving as a bonus implementation.

## Features

- **TCP Sockets**: Utilizes TCP sockets for communication between the server and clients.
- **Custom Binary Protocol**: Implements a custom binary protocol over TCP for efficient data exchange.
- **Authentication**: Clients must authenticate with a predefined password upon connection.
- **Dynamic Matchmaking**: Clients can request a list of connected opponents and choose one for the game.
- **Word Guessing Game**: Supports initiating a match, setting a word, guessing words, and giving up.
- **Real-time Game Observing**: A web interface that uses WebSockets to observe game progress in real-time.

## Setup

### Requirements

- Node.js (v14 or newer recommended)
- TypeScript
- A terminal or command prompt capable of running Node.js applications

### Running the Server

1. Navigate to the server directory.
2. Compile TypeScript files to JavaScript: `tsc server.ts`
3. Start the server: `node server.js`
4. The server will listen on TCP port 8080 for client connections and on port 8081 for WebSocket connections.

### Running a Client

1. Navigate to the client directory.
2. Compile TypeScript files to JavaScript: `tsc client.ts`
3. Start the client: `node client.js`
4. Follow the prompts for authentication and game actions.

### Observing Game Progress

1. Ensure the WebSocket server is running as part of the game server.
2. Open `index.html` in a web browser to connect to the WebSocket server and observe game updates in real-time.

## Game Commands

- **guess**: Make a guess for the current word.
- **opponents**: List available opponents for initiating a match.
- **give up**: Concede the current match.

## Development Notes

- This application was developed as a part of the selection process for Luxonis.
- Ensure WebSocket communication on port 8081 is not blocked by any firewall settings for the web interface to function correctly.
