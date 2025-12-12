// Pac-Man Game
const pacmanCanvas = document.getElementById('pacman-canvas');
const pacmanCtx = pacmanCanvas ? pacmanCanvas.getContext('2d') : null;
const pacmanStartBtn = document.getElementById('pacman-start');
const pacmanScoreEl = document.getElementById('pacman-score');
const pacmanLivesEl = document.getElementById('pacman-lives');
const pacmanLevelEl = document.getElementById('pacman-level');

const TILE_SIZE = 20;
const COLS = 28;
const ROWS = 31;

let pacmanGameLoop = null;
let pacmanRunning = false;
let pacman = null;
let ghosts = [];
let dots = [];
let powerPellets = [];
let pacmanScore = 0;
let pacmanLives = 3;
let pacmanLevel = 1;
let ghostsEatable = false;
let eatableTimer = 0;

// Maze layout (1 = wall, 0 = path, 2 = dot, 3 = power pellet)
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,0,0,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

function showPacmanNotification(title, message) {
    const existing = document.querySelector('.game-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'game-notification';
    notification.innerHTML = `<h2>${title}</h2><p>${message}</p>`;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}

function initPacman() {
    pacmanScore = 0;
    pacmanLives = 3;
    pacmanLevel = 1;
    ghostsEatable = false;
    eatableTimer = 0;

    if (pacmanScoreEl) pacmanScoreEl.textContent = pacmanScore;
    if (pacmanLivesEl) pacmanLivesEl.textContent = pacmanLives;
    if (pacmanLevelEl) pacmanLevelEl.textContent = pacmanLevel;

    // Initialize Pac-Man
    pacman = {
        x: 14,
        y: 23,
        direction: {x: 0, y: 0},
        nextDirection: {x: 0, y: 0},
        mouthOpen: 0
    };

    // Initialize ghosts
    const ghostColors = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];
    const ghostNames = ['Blinky', 'Pinky', 'Inky', 'Clyde'];
    ghosts = [];
    for (let i = 0; i < 4; i++) {
        ghosts.push({
            x: 12 + i,
            y: 14,
            direction: {x: 0, y: -1},
            color: ghostColors[i],
            name: ghostNames[i],
            scatter: false
        });
    }

    // Initialize dots and power pellets
    dots = [];
    powerPellets = [];
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (maze[row][col] === 2) {
                dots.push({x: col, y: row});
            } else if (maze[row][col] === 3) {
                powerPellets.push({x: col, y: row});
            }
        }
    }

    drawPacman();
}

function drawPacman() {
    if (!pacmanCtx) return;

    // Clear canvas
    pacmanCtx.fillStyle = '#000000';
    pacmanCtx.fillRect(0, 0, pacmanCanvas.width, pacmanCanvas.height);

    // Draw maze
    pacmanCtx.fillStyle = '#0000ff';
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (maze[row][col] === 1) {
                pacmanCtx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Draw dots
    pacmanCtx.fillStyle = '#ffb8ae';
    dots.forEach(dot => {
        pacmanCtx.beginPath();
        pacmanCtx.arc(
            dot.x * TILE_SIZE + TILE_SIZE / 2,
            dot.y * TILE_SIZE + TILE_SIZE / 2,
            2, 0, Math.PI * 2
        );
        pacmanCtx.fill();
    });

    // Draw power pellets
    pacmanCtx.fillStyle = '#ffb8ae';
    powerPellets.forEach(pellet => {
        pacmanCtx.beginPath();
        pacmanCtx.arc(
            pellet.x * TILE_SIZE + TILE_SIZE / 2,
            pellet.y * TILE_SIZE + TILE_SIZE / 2,
            6, 0, Math.PI * 2
        );
        pacmanCtx.fill();
    });

    // Draw Pac-Man
    if (pacman) {
        pacmanCtx.fillStyle = '#ffff00';
        pacmanCtx.beginPath();
        const centerX = pacman.x * TILE_SIZE + TILE_SIZE / 2;
        const centerY = pacman.y * TILE_SIZE + TILE_SIZE / 2;

        // Determine mouth angle based on direction
        let startAngle = 0.2;
        let endAngle = 1.8;
        if (pacman.direction.x === 1) {
            startAngle = 0.2;
            endAngle = 1.8;
        } else if (pacman.direction.x === -1) {
            startAngle = 1.2;
            endAngle = 2.8;
        } else if (pacman.direction.y === 1) {
            startAngle = 0.7;
            endAngle = 2.3;
        } else if (pacman.direction.y === -1) {
            startAngle = 1.7;
            endAngle = 3.3;
        }

        pacmanCtx.arc(centerX, centerY, TILE_SIZE / 2 - 2, startAngle * Math.PI, endAngle * Math.PI);
        pacmanCtx.lineTo(centerX, centerY);
        pacmanCtx.fill();
    }

    // Draw ghosts
    ghosts.forEach(ghost => {
        pacmanCtx.fillStyle = ghostsEatable ? '#0000ff' : ghost.color;
        const x = ghost.x * TILE_SIZE;
        const y = ghost.y * TILE_SIZE;

        // Ghost body
        pacmanCtx.beginPath();
        pacmanCtx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 2 - 2, Math.PI, 0);
        pacmanCtx.lineTo(x + TILE_SIZE - 2, y + TILE_SIZE - 2);
        pacmanCtx.lineTo(x + 2, y + TILE_SIZE - 2);
        pacmanCtx.closePath();
        pacmanCtx.fill();

        // Ghost eyes
        if (!ghostsEatable) {
            pacmanCtx.fillStyle = '#ffffff';
            pacmanCtx.fillRect(x + 5, y + 6, 5, 5);
            pacmanCtx.fillRect(x + 12, y + 6, 5, 5);
            pacmanCtx.fillStyle = '#000000';
            pacmanCtx.fillRect(x + 6, y + 7, 3, 3);
            pacmanCtx.fillRect(x + 13, y + 7, 3, 3);
        }
    });
}

function canMove(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    return maze[y][x] !== 1;
}

function updatePacman() {
    if (!pacmanRunning) return;

    // Update power pellet timer
    if (ghostsEatable) {
        eatableTimer--;
        if (eatableTimer <= 0) {
            ghostsEatable = false;
        }
    }

    // Try to change direction
    if (pacman.nextDirection.x !== 0 || pacman.nextDirection.y !== 0) {
        const nextX = pacman.x + pacman.nextDirection.x;
        const nextY = pacman.y + pacman.nextDirection.y;
        if (canMove(nextX, nextY)) {
            pacman.direction = {...pacman.nextDirection};
        }
    }

    // Move Pac-Man
    const newX = pacman.x + pacman.direction.x;
    const newY = pacman.y + pacman.direction.y;

    if (canMove(newX, newY)) {
        pacman.x = newX;
        pacman.y = newY;

        // Wrap around
        if (pacman.x < 0) pacman.x = COLS - 1;
        if (pacman.x >= COLS) pacman.x = 0;
    }

    // Eat dots
    for (let i = dots.length - 1; i >= 0; i--) {
        if (dots[i].x === pacman.x && dots[i].y === pacman.y) {
            dots.splice(i, 1);
            pacmanScore += 10;
            if (pacmanScoreEl) pacmanScoreEl.textContent = pacmanScore;
        }
    }

    // Eat power pellets
    for (let i = powerPellets.length - 1; i >= 0; i--) {
        if (powerPellets[i].x === pacman.x && powerPellets[i].y === pacman.y) {
            powerPellets.splice(i, 1);
            pacmanScore += 50;
            ghostsEatable = true;
            eatableTimer = 200;
            if (pacmanScoreEl) pacmanScoreEl.textContent = pacmanScore;
        }
    }

    // Move ghosts
    ghosts.forEach(ghost => {
        const possibleMoves = [];
        const directions = [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}];

        directions.forEach(dir => {
            const testX = ghost.x + dir.x;
            const testY = ghost.y + dir.y;
            if (canMove(testX, testY)) {
                possibleMoves.push(dir);
            }
        });

        if (possibleMoves.length > 0) {
            ghost.direction = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }

        ghost.x += ghost.direction.x;
        ghost.y += ghost.direction.y;

        // Wrap around
        if (ghost.x < 0) ghost.x = COLS - 1;
        if (ghost.x >= COLS) ghost.x = 0;
    });

    // Check ghost collision
    ghosts.forEach((ghost, index) => {
        if (Math.abs(ghost.x - pacman.x) < 0.5 && Math.abs(ghost.y - pacman.y) < 0.5) {
            if (ghostsEatable) {
                // Eat ghost
                pacmanScore += 200;
                if (pacmanScoreEl) pacmanScoreEl.textContent = pacmanScore;
                ghost.x = 12 + index;
                ghost.y = 14;
            } else {
                // Lose life
                pacmanLives--;
                if (pacmanLivesEl) pacmanLivesEl.textContent = pacmanLives;

                if (pacmanLives <= 0) {
                    pacmanGameOver();
                    return;
                }

                // Reset positions
                pacman.x = 14;
                pacman.y = 23;
                pacman.direction = {x: 0, y: 0};
                ghosts.forEach((g, i) => {
                    g.x = 12 + i;
                    g.y = 14;
                });
            }
        }
    });

    // Check win
    if (dots.length === 0 && powerPellets.length === 0) {
        pacmanLevel++;
        if (pacmanLevelEl) pacmanLevelEl.textContent = pacmanLevel;
        showPacmanNotification(`Level ${pacmanLevel}!`, 'Get ready!');
        setTimeout(() => initPacman(), 3000);
    }

    drawPacman();
}

function pacmanGameOver() {
    pacmanRunning = false;
    if (pacmanGameLoop) clearInterval(pacmanGameLoop);
    if (pacmanStartBtn) pacmanStartBtn.textContent = 'Start Game';
    showPacmanNotification('Game Over!', `Score: ${pacmanScore} | Level: ${pacmanLevel}`);
}

function startPacman() {
    if (pacmanRunning) {
        pacmanRunning = false;
        if (pacmanGameLoop) clearInterval(pacmanGameLoop);
        if (pacmanStartBtn) pacmanStartBtn.textContent = 'Start Game';
    } else {
        initPacman();
        pacmanRunning = true;
        pacmanGameLoop = setInterval(updatePacman, 150);
        if (pacmanStartBtn) pacmanStartBtn.textContent = 'Stop Game';
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    const game = document.getElementById('pacman');
    if (!game || !game.classList.contains('active')) return;

    const isArrowKey = e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
                       e.key === 'ArrowLeft' || e.key === 'ArrowRight';

    if (!isArrowKey) return;

    e.preventDefault();

    // Auto-start on arrow key
    if (!pacmanRunning) {
        startPacman();
    }

    if (pacman) {
        switch(e.key) {
            case 'ArrowUp':
                pacman.nextDirection = {x: 0, y: -1};
                break;
            case 'ArrowDown':
                pacman.nextDirection = {x: 0, y: 1};
                break;
            case 'ArrowLeft':
                pacman.nextDirection = {x: -1, y: 0};
                break;
            case 'ArrowRight':
                pacman.nextDirection = {x: 1, y: 0};
                break;
        }
    }
});

if (pacmanStartBtn) {
    pacmanStartBtn.addEventListener('click', startPacman);
}

// Initialize
if (pacmanCtx) {
    initPacman();
}
