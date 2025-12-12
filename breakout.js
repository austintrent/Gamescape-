// Breakout Game
const breakoutCanvas = document.getElementById('breakout-canvas');
const breakoutCtx = breakoutCanvas ? breakoutCanvas.getContext('2d') : null;
const breakoutStartBtn = document.getElementById('breakout-start');
const breakoutScoreEl = document.getElementById('breakout-score');
const breakoutLivesEl = document.getElementById('breakout-lives');

let breakoutGameLoop = null;
let breakoutRunning = false;

// Game state
let currentLevel = 1;

// Paddle
const paddle = {
    width: 80,
    height: 10,
    x: 200,
    speed: 8,
    moveLeft: false,
    moveRight: false,
    hasBumps: false
};

// Balls array (can have multiple balls)
let balls = [];

// Lasers
let lasers = [];
let laserTimeout = null;
let laserShootInterval = null;

// Bricks
const brickConfig = {
    rows: 5,
    cols: 8,
    width: 55,
    height: 20,
    padding: 5,
    offsetX: 20,
    offsetY: 30
};

let bricks = [];
let breakoutScore = 0;
let breakoutLives = 3;

function initBreakout(resetLevel = true) {
    if (resetLevel) {
        breakoutScore = 0;
        breakoutLives = 3;
        currentLevel = 1;
    }

    if (breakoutScoreEl) breakoutScoreEl.textContent = breakoutScore;
    if (breakoutLivesEl) breakoutLivesEl.textContent = breakoutLives;

    // Reset balls - start with one ball
    const speed = 3 + (currentLevel - 1) * 0.3;
    balls = [{
        x: 240,
        y: 300,
        radius: 6,
        dx: speed,
        dy: -speed
    }];

    // Reset paddle
    paddle.x = 200;
    paddle.hasBumps = false;

    // Reset lasers
    lasers = [];
    if (laserTimeout) clearTimeout(laserTimeout);
    if (laserShootInterval) clearInterval(laserShootInterval);

    // Create bricks
    createLevel(currentLevel);

    if (breakoutCtx) drawBreakout();
}

function createLevel(level) {
    bricks = [];
    const colors = ['#ff0066', '#ff6600', '#ffcc00', '#00ff41', '#00ccff', '#9966ff', '#ff3399'];
    const numRows = Math.min(5 + (level - 1), 8);

    for (let row = 0; row < numRows; row++) {
        bricks[row] = [];
        for (let col = 0; col < brickConfig.cols; col++) {
            bricks[row][col] = {
                x: col * (brickConfig.width + brickConfig.padding) + brickConfig.offsetX,
                y: row * (brickConfig.height + brickConfig.padding) + brickConfig.offsetY,
                status: 1,
                color: colors[row % colors.length],
                type: 'normal',
                row: row,
                col: col
            };
        }
    }

    // Add special blocks
    const specialPositions = [];
    const totalBricks = numRows * brickConfig.cols;

    while (specialPositions.length < Math.min(7, totalBricks - 5)) {
        const row = Math.floor(Math.random() * numRows);
        const col = Math.floor(Math.random() * brickConfig.cols);
        const pos = `${row}-${col}`;
        if (!specialPositions.includes(pos)) {
            specialPositions.push(pos);
        }
    }

    let posIndex = 0;

    // 2 Bomb blocks
    for (let i = 0; i < 2 && posIndex < specialPositions.length; i++) {
        const [row, col] = specialPositions[posIndex++].split('-').map(Number);
        if (bricks[row] && bricks[row][col]) {
            bricks[row][col].type = 'bomb';
            bricks[row][col].color = '#000000';
        }
    }

    // 2 Extra ball blocks
    for (let i = 0; i < 2 && posIndex < specialPositions.length; i++) {
        const [row, col] = specialPositions[posIndex++].split('-').map(Number);
        if (bricks[row] && bricks[row][col]) {
            bricks[row][col].type = 'extraball';
            bricks[row][col].color = '#ffffff';
        }
    }

    // 2 Extra life blocks
    for (let i = 0; i < 2 && posIndex < specialPositions.length; i++) {
        const [row, col] = specialPositions[posIndex++].split('-').map(Number);
        if (bricks[row] && bricks[row][col]) {
            bricks[row][col].type = 'extralife';
            bricks[row][col].color = '#ff00ff';
        }
    }

    // 1 Super laser block
    if (posIndex < specialPositions.length) {
        const [row, col] = specialPositions[posIndex++].split('-').map(Number);
        if (bricks[row] && bricks[row][col]) {
            bricks[row][col].type = 'laser';
            bricks[row][col].color = '#ffd700';
        }
    }
}

function drawBreakout() {
    if (!breakoutCtx) return;

    // Clear canvas
    breakoutCtx.fillStyle = '#1a1a2e';
    breakoutCtx.fillRect(0, 0, breakoutCanvas.width, breakoutCanvas.height);

    // Draw level indicator
    breakoutCtx.fillStyle = '#00ff41';
    breakoutCtx.font = 'bold 16px Arial';
    breakoutCtx.textAlign = 'left';
    breakoutCtx.fillText(`Level ${currentLevel}`, 10, 20);

    // Draw bricks
    bricks.forEach(row => {
        row.forEach(brick => {
            if (brick && brick.status === 1) {
                breakoutCtx.fillStyle = brick.color;
                breakoutCtx.fillRect(brick.x, brick.y, brickConfig.width, brickConfig.height);

                // Draw special block symbols
                breakoutCtx.font = 'bold 14px Arial';
                breakoutCtx.textAlign = 'center';
                breakoutCtx.textBaseline = 'middle';

                if (brick.type === 'bomb') {
                    breakoutCtx.fillText('💣', brick.x + brickConfig.width / 2, brick.y + brickConfig.height / 2);
                } else if (brick.type === 'extraball') {
                    breakoutCtx.fillStyle = '#000000';
                    breakoutCtx.fillText('⚽', brick.x + brickConfig.width / 2, brick.y + brickConfig.height / 2);
                } else if (brick.type === 'extralife') {
                    breakoutCtx.fillStyle = '#ffffff';
                    breakoutCtx.fillText('❤️', brick.x + brickConfig.width / 2, brick.y + brickConfig.height / 2);
                } else if (brick.type === 'laser') {
                    breakoutCtx.fillStyle = '#000000';
                    breakoutCtx.fillText('⚡', brick.x + brickConfig.width / 2, brick.y + brickConfig.height / 2);
                }
            }
        });
    });

    // Draw paddle
    breakoutCtx.fillStyle = '#00ff41';
    breakoutCtx.fillRect(paddle.x, breakoutCanvas.height - 20, paddle.width, paddle.height);

    // Draw laser bumps if active
    if (paddle.hasBumps) {
        breakoutCtx.fillStyle = '#ffd700';
        breakoutCtx.fillRect(paddle.x - 5, breakoutCanvas.height - 25, 8, 15);
        breakoutCtx.fillRect(paddle.x + paddle.width - 3, breakoutCanvas.height - 25, 8, 15);
    }

    // Draw lasers
    breakoutCtx.fillStyle = '#00ffff';
    lasers.forEach(laser => {
        breakoutCtx.fillRect(laser.x - 2, laser.y, 4, 15);
    });

    // Draw balls
    breakoutCtx.fillStyle = '#ffffff';
    balls.forEach(ball => {
        breakoutCtx.beginPath();
        breakoutCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        breakoutCtx.fill();
    });
}

function explodeBomb(row, col) {
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < bricks.length && c >= 0 && c < brickConfig.cols) {
                if (bricks[r] && bricks[r][c] && bricks[r][c].status === 1) {
                    bricks[r][c].status = 0;
                    breakoutScore += 10;
                }
            }
        }
    }
    if (breakoutScoreEl) breakoutScoreEl.textContent = breakoutScore;
}

function activateLaser() {
    paddle.hasBumps = true;

    // Auto-shoot lasers every 150ms
    if (laserShootInterval) clearInterval(laserShootInterval);
    laserShootInterval = setInterval(() => {
        if (paddle.hasBumps && breakoutRunning) {
            shootLaser();
        }
    }, 150);

    // Deactivate after 5 seconds
    if (laserTimeout) clearTimeout(laserTimeout);
    laserTimeout = setTimeout(() => {
        paddle.hasBumps = false;
        if (laserShootInterval) clearInterval(laserShootInterval);
    }, 5000);
}

function shootLaser() {
    if (!paddle.hasBumps) return;

    lasers.push({
        x: paddle.x,
        y: breakoutCanvas.height - 25
    });

    lasers.push({
        x: paddle.x + paddle.width,
        y: breakoutCanvas.height - 25
    });
}

function showNotification(title, message, duration = 3000) {
    // Remove any existing notification
    const existing = document.querySelector('.game-notification');
    if (existing) existing.remove();

    // Create notification
    const notification = document.createElement('div');
    notification.className = 'game-notification';
    notification.innerHTML = `
        <h2>${title}</h2>
        <p>${message}</p>
    `;
    document.body.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
        notification.remove();
    }, duration);
}

function nextLevel() {
    currentLevel++;

    showNotification(`Level ${currentLevel}`, 'Get ready!', 3000);

    setTimeout(() => {
        initBreakout(false);

        // Restart game loop
        if (breakoutGameLoop) clearInterval(breakoutGameLoop);
        breakoutGameLoop = setInterval(updateBreakout, 1000 / 60);
        breakoutRunning = true;
        if (breakoutStartBtn) breakoutStartBtn.textContent = 'Stop Game';
    }, 3200);
}

function updateBreakout() {
    // Move paddle
    if (paddle.moveLeft && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
    if (paddle.moveRight && paddle.x + paddle.width < breakoutCanvas.width) {
        paddle.x += paddle.speed;
    }

    // Move and check lasers
    for (let i = lasers.length - 1; i >= 0; i--) {
        lasers[i].y -= 7;

        let hitBrick = false;
        for (let r = 0; r < bricks.length && !hitBrick; r++) {
            for (let c = 0; c < bricks[r].length && !hitBrick; c++) {
                const brick = bricks[r][c];
                if (brick && brick.status === 1) {
                    if (lasers[i].x >= brick.x &&
                        lasers[i].x <= brick.x + brickConfig.width &&
                        lasers[i].y >= brick.y &&
                        lasers[i].y <= brick.y + brickConfig.height) {
                        brick.status = 0;
                        breakoutScore += 10;
                        if (breakoutScoreEl) breakoutScoreEl.textContent = breakoutScore;
                        hitBrick = true;
                        lasers.splice(i, 1);
                    }
                }
            }
        }

        if (!hitBrick && lasers[i] && lasers[i].y < 0) {
            lasers.splice(i, 1);
        }
    }

    // Move balls
    for (let ballIdx = balls.length - 1; ballIdx >= 0; ballIdx--) {
        const ball = balls[ballIdx];
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collision
        if (ball.x + ball.radius > breakoutCanvas.width || ball.x - ball.radius < 0) {
            ball.dx = -ball.dx;
        }
        if (ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
        }

        // Paddle collision
        if (ball.y + ball.radius > breakoutCanvas.height - 20 &&
            ball.x > paddle.x && ball.x < paddle.x + paddle.width &&
            ball.dy > 0) {
            ball.dy = -ball.dy;
            const hitPos = (ball.x - paddle.x) / paddle.width;
            ball.dx = (hitPos - 0.5) * 8;
        }

        // Bottom wall
        if (ball.y + ball.radius > breakoutCanvas.height) {
            if (balls.length > 1) {
                balls.splice(ballIdx, 1);
            } else {
                breakoutLives--;
                if (breakoutLivesEl) breakoutLivesEl.textContent = breakoutLives;

                if (breakoutLives <= 0) {
                    breakoutGameOver();
                    return;
                }

                const speed = 3 + (currentLevel - 1) * 0.3;
                ball.x = 240;
                ball.y = 300;
                ball.dx = speed;
                ball.dy = -speed;
            }
        }

        // Brick collision
        for (let r = 0; r < bricks.length; r++) {
            for (let c = 0; c < bricks[r].length; c++) {
                const brick = bricks[r][c];
                if (brick && brick.status === 1) {
                    if (ball.x > brick.x &&
                        ball.x < brick.x + brickConfig.width &&
                        ball.y > brick.y &&
                        ball.y < brick.y + brickConfig.height) {
                        ball.dy = -ball.dy;
                        brick.status = 0;
                        breakoutScore += 10;
                        if (breakoutScoreEl) breakoutScoreEl.textContent = breakoutScore;

                        // Handle special blocks
                        if (brick.type === 'bomb') {
                            explodeBomb(brick.row, brick.col);
                        } else if (brick.type === 'extraball') {
                            balls.push({
                                x: brick.x + brickConfig.width / 2,
                                y: brick.y + brickConfig.height,
                                radius: 6,
                                dx: Math.random() > 0.5 ? 3 : -3,
                                dy: 3
                            });
                        } else if (brick.type === 'extralife') {
                            breakoutLives++;
                            if (breakoutLivesEl) breakoutLivesEl.textContent = breakoutLives;
                        } else if (brick.type === 'laser') {
                            activateLaser();
                        }

                        // Check if level complete
                        let allClear = true;
                        for (let row of bricks) {
                            for (let b of row) {
                                if (b && b.status === 1) {
                                    allClear = false;
                                    break;
                                }
                            }
                            if (!allClear) break;
                        }

                        if (allClear) {
                            breakoutLevelComplete();
                            return;
                        }
                    }
                }
            }
        }
    }

    drawBreakout();
}

function breakoutLevelComplete() {
    clearInterval(breakoutGameLoop);
    breakoutRunning = false;
    if (laserTimeout) clearTimeout(laserTimeout);
    if (laserShootInterval) clearInterval(laserShootInterval);
    nextLevel();
}

function breakoutGameOver() {
    clearInterval(breakoutGameLoop);
    breakoutRunning = false;
    if (breakoutStartBtn) breakoutStartBtn.textContent = 'Start Game';
    if (laserTimeout) clearTimeout(laserTimeout);
    if (laserShootInterval) clearInterval(laserShootInterval);
    showNotification('Game Over!', `Level ${currentLevel} - Score: ${breakoutScore}`);
}

function startBreakout() {
    if (breakoutRunning) {
        clearInterval(breakoutGameLoop);
        breakoutRunning = false;
        if (breakoutStartBtn) breakoutStartBtn.textContent = 'Start Game';
        if (laserTimeout) clearTimeout(laserTimeout);
        if (laserShootInterval) clearInterval(laserShootInterval);
    } else {
        initBreakout();
        breakoutGameLoop = setInterval(updateBreakout, 1000 / 60);
        breakoutRunning = true;
        if (breakoutStartBtn) breakoutStartBtn.textContent = 'Stop Game';
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    const game = document.getElementById('breakout');
    if (!game || !game.classList.contains('active')) return;

    const isArrowKey = e.key === 'ArrowLeft' || e.key === 'ArrowRight';
    if (!isArrowKey) return;

    e.preventDefault();

    // Auto-start the game if not running
    if (!breakoutRunning) {
        startBreakout();
    }

    if (e.key === 'ArrowLeft') {
        paddle.moveLeft = true;
    } else if (e.key === 'ArrowRight') {
        paddle.moveRight = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        paddle.moveLeft = false;
    } else if (e.key === 'ArrowRight') {
        paddle.moveRight = false;
    }
});

if (breakoutStartBtn) {
    breakoutStartBtn.addEventListener('click', startBreakout);
}

// Initialize
if (breakoutCtx) {
    initBreakout();
}
