// Main navigation between games
const gameButtons = document.querySelectorAll('.game-btn');
const games = document.querySelectorAll('.game');

gameButtons.forEach(button => {
    button.addEventListener('click', () => {
        const gameId = button.dataset.game;

        // Remove active class from all buttons and games
        gameButtons.forEach(btn => btn.classList.remove('active'));
        games.forEach(game => game.classList.remove('active'));

        // Add active class to clicked button and corresponding game
        button.classList.add('active');
        document.getElementById(gameId).classList.add('active');
    });
});
