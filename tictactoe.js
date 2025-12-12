// Tic-Tac-Toe Game
const tttBoard = document.getElementById('ttt-board');
const tttPlayerEl = document.getElementById('ttt-player');
const tttStatusEl = document.getElementById('ttt-status');
const tttRestartBtn = document.getElementById('ttt-restart');

let tttGrid = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

function initTicTacToe() {
    tttGrid = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    tttPlayerEl.textContent = currentPlayer;
    tttStatusEl.textContent = '';
    renderTTTBoard();
}

function renderTTTBoard() {
    if (!tttBoard) return;

    tttBoard.innerHTML = '';
    tttGrid.forEach((cell, index) => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'ttt-cell';
        cellDiv.textContent = cell;
        cellDiv.addEventListener('click', () => makeMove(index));
        tttBoard.appendChild(cellDiv);
    });
}

function makeMove(index) {
    if (!gameActive || tttGrid[index] !== '') return;

    tttGrid[index] = currentPlayer;
    renderTTTBoard();

    if (checkWinner()) {
        tttStatusEl.textContent = `Player ${currentPlayer} wins!`;
        tttStatusEl.style.color = '#00ff41';
        gameActive = false;
        return;
    }

    if (tttGrid.every(cell => cell !== '')) {
        tttStatusEl.textContent = "It's a draw!";
        tttStatusEl.style.color = '#ffd700';
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    tttPlayerEl.textContent = currentPlayer;
}

function checkWinner() {
    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        return tttGrid[a] !== '' &&
               tttGrid[a] === tttGrid[b] &&
               tttGrid[a] === tttGrid[c];
    });
}

if (tttRestartBtn) {
    tttRestartBtn.addEventListener('click', initTicTacToe);
}

// Initialize
if (tttBoard) {
    initTicTacToe();
}
