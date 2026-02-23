const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Game state storage
const rooms = {};

const initialGameState = () => ({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    players: {
        X: null,
        O: null
    },
    status: 'waiting', // waiting, playing, complete
    winner: null // X, O, or 'draw'
});

const checkWin = (board) => {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    if (!board.includes(null)) {
        return 'draw';
    }

    return null;
};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', (roomCode) => {
        if (!rooms[roomCode]) {
            rooms[roomCode] = initialGameState();
        }

        const room = rooms[roomCode];

        if (room.players.X === null) {
            room.players.X = socket.id;
            socket.join(roomCode);
            socket.emit('joined', { symbol: 'X', roomCode });
        } else if (room.players.O === null) {
            room.players.O = socket.id;
            socket.join(roomCode);
            socket.emit('joined', { symbol: 'O', roomCode });
            room.status = 'playing';
            io.to(roomCode).emit('gameState', room); // Game starts!
        } else {
            socket.emit('error', 'Room is full.');
            return;
        }

        socket.on('disconnect', () => {
             console.log('User disconnected:', socket.id);
             if (room.players.X === socket.id) room.players.X = null;
             if (room.players.O === socket.id) room.players.O = null;
             
             // If a player disconnects, reset the room or notify the other player
             room.status = 'waiting';
             room.board = Array(9).fill(null);
             room.currentPlayer = 'X';
             room.winner = null;
             io.to(roomCode).emit('opponentDisconnected');
             io.to(roomCode).emit('gameState', room);
             
             // Cleanup empty rooms
             if (!room.players.X && !room.players.O) {
                 delete rooms[roomCode];
             }
        });

        socket.on('makeMove', (index) => {
            if (room.status !== 'playing') return;

            const isPlayerX = room.players.X === socket.id;
            const isPlayerO = room.players.O === socket.id;

            if ((isPlayerX && room.currentPlayer === 'X') || (isPlayerO && room.currentPlayer === 'O')) {
                if (room.board[index] === null) {
                    room.board[index] = room.currentPlayer;
                    
                    const winResult = checkWin(room.board);
                    if (winResult) {
                        room.status = 'complete';
                        room.winner = winResult;
                    } else {
                        // Switch turns
                        room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
                    }

                    io.to(roomCode).emit('gameState', room);
                }
            }
        });
        
        socket.on('restart', () => {
             if (room.status === 'complete' || room.status === 'waiting') {
                 room.board = Array(9).fill(null);
                 room.currentPlayer = 'X';
                 room.winner = null;
                 // Only restart if both are present
                 if(room.players.X && room.players.O) {
                    room.status = 'playing';
                 } else {
                    room.status = 'waiting';
                 }
                 io.to(roomCode).emit('gameState', room);
             }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
