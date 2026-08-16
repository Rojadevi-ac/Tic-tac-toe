// DOM Elements
const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const gameStatus = document.getElementById('gameStatus');
const restartButton = document.getElementById('restartButton');
const themeToggle = document.getElementById('themeToggle');
const winningLine = document.getElementById('winningLine');
const confettiContainer = document.getElementById('confetti');
const howToPlayBtn = document.getElementById('howToPlayBtn');
const modal = document.getElementById('howToPlayModal');
const closeModal = document.querySelector('.close-modal');
const gotItBtn = document.querySelector('.got-it-btn');
const playerXCard = document.querySelector('.player-x');
const playerOCard = document.querySelector('.player-o');
const playerXScore = document.querySelector('.player-x .player-score');
const playerOScore = document.querySelector('.player-o .player-score');
const gameTimer = document.querySelector('.game-timer');

// Game state
let currentPlayer = 'X';
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let scores = { X: 0, O: 0 };
let gameStartTime;
let timerInterval;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
];

// Initialize game
function initGame() {
    // Reset game state
    gameState = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    currentPlayer = 'X';

    // Reset UI
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('x', 'o', 'winner');
    });

    winningLine.style.width = "0";
    gameStatus.textContent = `Your turn, ${currentPlayer}!`;
    updateActivePlayer();

    // Start timer
    startTimer();
}

// Start game timer
function startTimer() {
    clearInterval(timerInterval);
    gameStartTime = new Date();
    updateTimerDisplay();
    timerInterval = setInterval(updateTimerDisplay, 1000);
}

// Update timer display
function updateTimerDisplay() {
    if (!gameStartTime) return;

    const now = new Date();
    const diff = Math.floor((now - gameStartTime) / 1000);
    const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
    const seconds = (diff % 60).toString().padStart(2, '0');
    gameTimer.textContent = `${minutes}:${seconds}`;
}

// Update active player UI
function updateActivePlayer() {
    if (currentPlayer === 'X') {
        playerXCard.classList.add('active');
        playerOCard.classList.remove('active');
    } else {
        playerXCard.classList.remove('active');
        playerOCard.classList.add('active');
    }
}

// Handle cell click
function handleCellClick(e) {
    const idx = parseInt(e.target.getAttribute('data-index'));

    // Ignore if cell already filled or game not active
    if (gameState[idx] !== "" || !gameActive) return;

    // Update game state
    gameState[idx] = currentPlayer;
    e.target.textContent = currentPlayer;
    e.target.classList.add(currentPlayer.toLowerCase());

    // Add click animation
    e.target.style.transform = 'scale(0.9)';
    setTimeout(() => {
        e.target.style.transform = 'scale(1)';
    }, 100);

    checkResult();
}

// Check game result
function checkResult() {
    let winCombo = [];

    // Check for win
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            winCombo = condition;
            break;
        }
    }

    // Handle win
    if (winCombo.length) {
        handleWin(winCombo);
        return;
    }

    // Handle draw
    if (!gameState.includes("")) {
        handleDraw();
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    gameStatus.textContent = `Your turn, ${currentPlayer}!`;
    updateActivePlayer();
}

// Handle win
function handleWin(winCombo) {
    // Update UI
    gameStatus.textContent = `Player ${currentPlayer} wins!`;
    gameActive = false;
    clearInterval(timerInterval);

    // Highlight winning cells
    highlightCells(winCombo);

    // Show winning line
    showWinningLine(winCombo);

    // Update score
    scores[currentPlayer]++;
    if (currentPlayer === 'X') {
        playerXScore.textContent = scores.X;
    } else {
        playerOScore.textContent = scores.O;
    }

    // Show confetti
    createConfetti();
}

// Handle draw
function handleDraw() {
    gameStatus.textContent = "It's a draw!";
    gameActive = false;
    clearInterval(timerInterval);
}

// Highlight winning cells
function highlightCells(combo) {
    combo.forEach(i => {
        cells[i].classList.add('winner');
    });
}

// Show winning line
function showWinningLine(combo) {
    const startCell = cells[combo[0]];
    const endCell = cells[combo[2]];
    const boardRect = board.getBoundingClientRect();
    const startRect = startCell.getBoundingClientRect();
    const endRect = endCell.getBoundingClientRect();

    // Calculate positions inside cells (accounting for padding)
    const lineInset = 20;

    const startX = startRect.left - boardRect.left + lineInset;
    const startY = startRect.top - boardRect.top + lineInset;
    const endX = endRect.left - boardRect.left + endRect.width - lineInset;
    const endY = endRect.top - boardRect.top + endRect.height - lineInset;

    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    // Reset line first
    winningLine.style.transition = 'none';
    winningLine.style.width = '0';

    // Position the line
    winningLine.style.top = `${startY}px`;
    winningLine.style.left = `${startX}px`;
    winningLine.style.transformOrigin = '0 50%';
    winningLine.style.transform = `rotate(${angle}deg)`;

    // Animate the line
    setTimeout(() => {
        winningLine.style.transition = 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        winningLine.style.width = `${length}px`;
    }, 10);
}

// Create confetti
function createConfetti() {
    const colors = ['#ff4d4d', '#4d79ff', '#fdcb6e', '#fd79a8', '#00b894', '#6c5ce7'];

    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDuration = 2 + Math.random() * 3 + 's';
        confetti.style.width = 8 + Math.random() * 8 + 'px';
        confetti.style.height = 8 + Math.random() * 8 + 'px';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confettiContainer.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 4000);
    }
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');

    // Update icon
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('light-theme')) {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
}

// Show how to play modal
function showHowToPlay() {
    modal.style.display = 'flex';
}

// Close modal
function closeHowToPlay() {
    modal.style.display = 'none';
}

// Event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', initGame);
themeToggle.addEventListener('click', toggleTheme);
howToPlayBtn.addEventListener('click', showHowToPlay);
closeModal.addEventListener('click', closeHowToPlay);
gotItBtn.addEventListener('click', closeHowToPlay);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeHowToPlay();
    }
});

// Initialize game
initGame();