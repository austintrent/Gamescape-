// Snake Game
const snakeCanvas = document.getElementById('snake-canvas');
const snakeCtx = snakeCanvas ? snakeCanvas.getContext('2d') : null;
const snakeStartBtn = document.getElementById('snake-start');
const snakeScoreEl = document.getElementById('snake-score');

let snake = [{x: 200, y: 200}];
let dx = 20;
let dy = 0;
let nextDx = 20;
let nextDy = 0;
let food = {x: 0, y: 0};
let snakeScore = 0;
let snakeGameLoop = null;
let snakeGameRunning = false;

function initSnake(keepDirection = false) {
    snake = [{x: 200, y: 200}];
    if (!keepDirection) {
        dx = 20;
        dy = 0;
        nextDx = 20;
        nextDy = 0;
    }
    snakeScore = 0;
    if (snakeScoreEl) snakeScoreEl.textContent = snakeScore;
    generateFood();
}

function generateFood() {
    food.x = Math.floor(Math.random() * 20) * 20;
    food.y = Math.floor(Math.random() * 20) * 20;

    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

function drawSnake() {
    if (!snakeCtx) return;

    // Clear canvas
    snakeCtx.fillStyle = '#1a1a2e';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

    // Draw grid
    snakeCtx.strokeStyle = '#16213e';
    for (let i = 0; i <= 20; i++) {
        snakeCtx.beginPath();
        snakeCtx.moveTo(i * 20, 0);
        snakeCtx.lineTo(i * 20, 400);
        snakeCtx.stroke();
        snakeCtx.beginPath();
        snakeCtx.moveTo(0, i * 20);
        snakeCtx.lineTo(400, i * 20);
        snakeCtx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        snakeCtx.fillStyle = index === 0 ? '#00ff41' : '#00cc33';
        snakeCtx.fillRect(segment.x, segment.y, 18, 18);
    });

    // Draw food
    snakeCtx.fillStyle = '#ff0066';
    snakeCtx.fillRect(food.x, food.y, 18, 18);
}

function moveSnake() {
    // Apply the next direction
    dx = nextDx;
    dy = nextDy;

    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Check wall collision
    if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400) {
        gameOver();
        return;
    }

    // Check self collision
    for (let segment of snake) {
        if (segment.x === head.x && segment.y === head.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        snakeScore += 10;
        if (snakeScoreEl) snakeScoreEl.textContent = snakeScore;
        generateFood();
    } else {
        snake.pop();
    }

    drawSnake();
}

function showNotification(title, message) {
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

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function gameOver() {
    clearInterval(snakeGameLoop);
    snakeGameRunning = false;
    if (snakeStartBtn) snakeStartBtn.textContent = 'Start Game';
    showNotification('Game Over!', `Your score: ${snakeScore}`);
}

function startSnake(keepDirection = false) {
    if (snakeGameRunning) {
        clearInterval(snakeGameLoop);
        snakeGameRunning = false;
        if (snakeStartBtn) snakeStartBtn.textContent = 'Start Game';
    } else {
        initSnake(keepDirection);
        drawSnake();
        snakeGameLoop = setInterval(moveSnake, 100);
        snakeGameRunning = true;
        if (snakeStartBtn) snakeStartBtn.textContent = 'Stop Game';
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    const game = document.getElementById('snake');
    if (!game || !game.classList.contains('active')) return;

    const isArrowKey = e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
                       e.key === 'ArrowLeft' || e.key === 'ArrowRight';

    if (!isArrowKey) return;

    e.preventDefault();

    // Auto-start the game if not running and arrow key is pressed
    if (!snakeGameRunning) {
        // Set initial direction based on first key press
        switch(e.key) {
            case 'ArrowUp':
                nextDx = 0; nextDy = -20;
                break;
            case 'ArrowDown':
                nextDx = 0; nextDy = 20;
                break;
            case 'ArrowLeft':
                nextDx = -20; nextDy = 0;
                break;
            case 'ArrowRight':
                nextDx = 20; nextDy = 0;
                break;
        }
        startSnake(true); // Keep the direction we just set
        return;
    }

    // Change direction while running
    switch(e.key) {
        case 'ArrowUp':
            if (dy === 0) { nextDx = 0; nextDy = -20; }
            break;
        case 'ArrowDown':
            if (dy === 0) { nextDx = 0; nextDy = 20; }
            break;
        case 'ArrowLeft':
            if (dx === 0) { nextDx = -20; nextDy = 0; }
            break;
        case 'ArrowRight':
            if (dx === 0) { nextDx = 20; nextDy = 0; }
            break;
    }
});

if (snakeStartBtn) {
    snakeStartBtn.addEventListener('click', startSnake);
}

// Initialize
if (snakeCtx) {
    initSnake();
    drawSnake();
}
