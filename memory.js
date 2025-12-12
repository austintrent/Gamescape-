// Memory Card Game
const memoryBoard = document.getElementById('memory-board');
const memoryMovesEl = document.getElementById('memory-moves');
const memoryMatchesEl = document.getElementById('memory-matches');
const memoryStartBtn = document.getElementById('memory-start');

let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let canFlip = true;

const cardSymbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎹'];

function initMemory() {
    memoryCards = [...cardSymbols, ...cardSymbols];
    memoryCards.sort(() => Math.random() - 0.5);
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    canFlip = true;
    memoryMovesEl.textContent = moves;
    memoryMatchesEl.textContent = matchedPairs;
    renderMemoryBoard();
}

function renderMemoryBoard() {
    if (!memoryBoard) return;

    memoryBoard.innerHTML = '';
    memoryCards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-front">?</div>
                <div class="memory-card-back">${symbol}</div>
            </div>
        `;
        card.addEventListener('click', () => flipCard(index));
        memoryBoard.appendChild(card);
    });
}

function flipCard(index) {
    if (!canFlip) return;

    const card = memoryBoard.children[index];

    if (card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }

    card.classList.add('flipped');
    flippedCards.push(index);

    if (flippedCards.length === 2) {
        canFlip = false;
        moves++;
        memoryMovesEl.textContent = moves;

        setTimeout(checkMatch, 800);
    }
}

function checkMatch() {
    const [index1, index2] = flippedCards;
    const card1 = memoryBoard.children[index1];
    const card2 = memoryBoard.children[index2];

    if (memoryCards[index1] === memoryCards[index2]) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        memoryMatchesEl.textContent = matchedPairs;

        if (matchedPairs === cardSymbols.length) {
            setTimeout(() => {
                alert(`Congratulations! You won in ${moves} moves!`);
            }, 500);
        }
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }

    flippedCards = [];
    canFlip = true;
}

if (memoryStartBtn) {
    memoryStartBtn.addEventListener('click', initMemory);
}

// Initialize
if (memoryBoard) {
    initMemory();
}
