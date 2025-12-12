// Tetris Game
const tetrisCanvas = document.getElementById('tetris-canvas');
const tetrisCtx = tetrisCanvas ? tetrisCanvas.getContext('2d') : null;
const tetrisStartBtn = document.getElementById('tetris-start');
const tetrisScoreEl = document.getElementById('tetris-score');
const tetrisLinesEl = document.getElementById('tetris-lines');
const tetrisLevelEl = document.getElementById('tetris-level');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

let tetrisGameLoop = null;
let tetrisRunning = false;
let tetrisGrid = [];
let currentPiece = null;
let tetrisScore = 0;
let tetrisLines = 0;
let tetrisLevel = 1;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

const SHAPES = {
    I: [[1,1,1,1]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1]],
    S: [[0,1,1],[1,1,0]],
    Z: [[1,1,0],[0,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]]
};

function showTetrisNotification(title, message) {
    const existing = document.querySelector('.game-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'game-notification';
    notification.innerHTML = `<h2>${title}</h2><p>${message}</p>`;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}

function initTetris() {
    tetrisGrid = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    tetrisScore = 0;
    tetrisLines = 0;
    tetrisLevel = 1;
    dropCounter = 0;
    dropInterval = 1000;

    if (tetrisScoreEl) tetrisScoreEl.textContent = tetrisScore;
    if (tetrisLinesEl) tetrisLinesEl.textContent = tetrisLines;
    if (tetrisLevelEl) tetrisLevelEl.textContent = tetrisLevel;

    spawnPiece();
    drawTetris();
}

function spawnPiece() {
    const pieces = Object.keys(SHAPES);
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    currentPiece = {
        shape: SHAPES[type],
        color: COLORS[type],
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
        y: 0
    };

    if (checkCollision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        tetrisGameOver();
    }
}

function drawTetris() {
    if (!tetrisCtx) return;

    // Clear canvas
    tetrisCtx.fillStyle = '#1a1a2e';
    tetrisCtx.fillRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);

    // Draw grid
    tetrisCtx.strokeStyle = '#16213e';
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const x = col * BLOCK_SIZE;
            const y = row * BLOCK_SIZE;

            if (tetrisGrid[row][col]) {
                tetrisCtx.fillStyle = tetrisGrid[row][col];
                tetrisCtx.fillRect(x, y, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }

            tetrisCtx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    // Draw current piece
    if (currentPiece) {
        tetrisCtx.fillStyle = currentPiece.color;
        currentPiece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const x = (currentPiece.x + dx) * BLOCK_SIZE;
                    const y = (currentPiece.y + dy) * BLOCK_SIZE;
                    tetrisCtx.fillRect(x, y, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                }
            });
        });
    }
}

function checkCollision(x, y, shape) {
    for (let dy = 0; dy < shape.length; dy++) {
        for (let dx = 0; dx < shape[dy].length; dx++) {
            if (shape[dy][dx]) {
                const newX = x + dx;
                const newY = y + dy;

                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }

                if (newY >= 0 && tetrisGrid[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function mergePiece() {
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                const y = currentPiece.y + dy;
                const x = currentPiece.x + dx;
                if (y >= 0) {
                    tetrisGrid[y][x] = currentPiece.color;
                }
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;

    for (let row = ROWS - 1; row >= 0; row--) {
        if (tetrisGrid[row].every(cell => cell !== 0)) {
            tetrisGrid.splice(row, 1);
            tetrisGrid.unshift(Array(COLS).fill(0));
            linesCleared++;
            row++;
        }
    }

    if (linesCleared > 0) {
        tetrisLines += linesCleared;
        const points = [0, 100, 300, 500, 800][linesCleared] * tetrisLevel;
        tetrisScore += points;

        if (tetrisScoreEl) tetrisScoreEl.textContent = tetrisScore;
        if (tetrisLinesEl) tetrisLinesEl.textContent = tetrisLines;

        // Level up every 10 lines
        const newLevel = Math.floor(tetrisLines / 10) + 1;
        if (newLevel > tetrisLevel) {
            tetrisLevel = newLevel;
            dropInterval = Math.max(100, 1000 - (tetrisLevel - 1) * 100);
            if (tetrisLevelEl) tetrisLevelEl.textContent = tetrisLevel;
        }
    }
}

function rotate(shape) {
    const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
    return rotated;
}

function movePiece(dir) {
    if (!currentPiece || !tetrisRunning) return;

    const newX = currentPiece.x + dir;
    if (!checkCollision(newX, currentPiece.y, currentPiece.shape)) {
        currentPiece.x = newX;
        drawTetris();
    }
}

function rotatePiece() {
    if (!currentPiece || !tetrisRunning) return;

    const rotated = rotate(currentPiece.shape);
    if (!checkCollision(currentPiece.x, currentPiece.y, rotated)) {
        currentPiece.shape = rotated;
        drawTetris();
    }
}

function dropPiece() {
    if (!currentPiece || !tetrisRunning) return;

    while (!checkCollision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
        currentPiece.y++;
    }
    mergePiece();
    clearLines();
    spawnPiece();
    drawTetris();
}

function updateTetris(time = 0) {
    if (!tetrisRunning) return;

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        if (!checkCollision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
            currentPiece.y++;
        } else {
            mergePiece();
            clearLines();
            spawnPiece();
        }
        dropCounter = 0;
        drawTetris();
    }

    tetrisGameLoop = requestAnimationFrame(updateTetris);
}

function tetrisGameOver() {
    tetrisRunning = false;
    if (tetrisGameLoop) cancelAnimationFrame(tetrisGameLoop);
    if (tetrisStartBtn) tetrisStartBtn.textContent = 'Start Game';
    showTetrisNotification('Game Over!', `Score: ${tetrisScore} | Lines: ${tetrisLines}`);
}

function startTetris() {
    if (tetrisRunning) {
        tetrisRunning = false;
        if (tetrisGameLoop) cancelAnimationFrame(tetrisGameLoop);
        if (tetrisStartBtn) tetrisStartBtn.textContent = 'Start Game';
    } else {
        initTetris();
        tetrisRunning = true;
        lastTime = 0;
        tetrisGameLoop = requestAnimationFrame(updateTetris);
        if (tetrisStartBtn) tetrisStartBtn.textContent = 'Stop Game';
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    const game = document.getElementById('tetris');
    if (!game || !game.classList.contains('active')) return;

    const isGameKey = e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
                      e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
                      e.key === ' ';

    if (!isGameKey) return;

    e.preventDefault();

    // Auto-start on arrow key
    if (!tetrisRunning) {
        startTetris();
        return;
    }

    switch(e.key) {
        case 'ArrowLeft':
            movePiece(-1);
            break;
        case 'ArrowRight':
            movePiece(1);
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case 'ArrowDown':
            if (!checkCollision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
                currentPiece.y++;
                drawTetris();
            }
            break;
        case ' ':
            dropPiece();
            break;
    }
});

if (tetrisStartBtn) {
    tetrisStartBtn.addEventListener('click', startTetris);
}

// Initialize
if (tetrisCtx) {
    initTetris();
}
