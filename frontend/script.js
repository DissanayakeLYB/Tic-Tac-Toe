// Set the backend URL based on environment
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://your-backend-url.onrender.com'; // TODO: Update with your Render URL

const socket = io(BACKEND_URL);

// UI Elements
const lobbyScreen = document.getElementById('lobby-screen');
const gameScreen = document.getElementById('game-screen');
const roomInput = document.getElementById('room-input');
const joinBtn = document.getElementById('join-btn');
const errorMessage = document.getElementById('error-message');
const roomDisplay = document.getElementById('room-display');
const playerSymbolDisplay = document.getElementById('player-symbol');
const statusMessage = document.getElementById('status-message');
const cells = document.querySelectorAll('.cell');
const restartBtn = document.getElementById('restart-btn');

// State
let mySymbol = null;
let currentRoom = null;
let isMyTurn = false;
let gameStatus = 'waiting';

// Event Listeners for UI
joinBtn.addEventListener('click', () => {
    const code = roomInput.value.trim().toUpperCase();
    if (code.length > 0) {
        socket.emit('joinRoom', code);
    }
});

roomInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinBtn.click();
    }
});

cells.forEach(cell => {
    cell.addEventListener('click', (e) => {
        if (!isMyTurn || gameStatus !== 'playing') return;
        
        const index = e.target.getAttribute('data-index');
        // Optimistic UI update could go here, but let's wait for server to ensure consistency
        socket.emit('makeMove', parseInt(index));
    });
});

restartBtn.addEventListener('click', () => {
    socket.emit('restart');
    restartBtn.classList.add('hidden');
});

// Socket Events
socket.on('joined', (data) => {
    mySymbol = data.symbol;
    currentRoom = data.roomCode;
    
    // Update UI
    lobbyScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    roomDisplay.textContent = `Room: ${currentRoom}`;
    playerSymbolDisplay.textContent = mySymbol;
    playerSymbolDisplay.className = `symbol-display symbol-${mySymbol}`;
    
    errorMessage.classList.add('hidden');
});

socket.on('error', (msg) => {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
});

socket.on('opponentDisconnected', () => {
    statusMessage.textContent = 'Opponent disconnected. Waiting...';
    statusMessage.style.color = 'var(--text-muted)';
    resetBoard();
});

socket.on('gameState', (state) => {
    gameStatus = state.status;
    updateBoard(state.board);
    
    if (gameStatus === 'waiting') {
        statusMessage.textContent = 'Waiting for opponent...';
        statusMessage.style.color = 'var(--text-muted)';
        isMyTurn = false;
        restartBtn.classList.add('hidden');
    } else if (gameStatus === 'playing') {
        isMyTurn = state.currentPlayer === mySymbol;
        if (isMyTurn) {
            statusMessage.textContent = 'Your Turn!';
            statusMessage.style.color = 'var(--text-main)';
        } else {
            statusMessage.textContent = `Opponent's Turn (${state.currentPlayer})`;
            statusMessage.style.color = 'var(--text-muted)';
        }
        restartBtn.classList.add('hidden');
    } else if (gameStatus === 'complete') {
        isMyTurn = false;
        if (state.winner === 'draw') {
            statusMessage.textContent = "It's a Draw!";
            statusMessage.style.color = 'var(--text-main)';
        } else if (state.winner === mySymbol) {
            statusMessage.textContent = 'You Won! 🎉';
            statusMessage.style.color = 'var(--secondary)';
        } else {
            statusMessage.textContent = 'You Lost!';
            statusMessage.style.color = 'var(--danger)';
        }
        restartBtn.classList.remove('hidden');
    }
});

function updateBoard(boardArray) {
    cells.forEach((cell, index) => {
        const val = boardArray[index];
        if (val !== cell.textContent) {
            cell.textContent = val !== null ? val : '';
            if (val) {
                cell.className = `cell symbol-${val} pop`;
            } else {
                cell.className = 'cell';
            }
        }
    });
}

function resetBoard() {
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });
}
