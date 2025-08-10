const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 16;
const PLAYER_X = 30;
const AI_X = canvas.width - PLAYER_X - PADDLE_WIDTH;
const PLAYER_MOVE_SPEED = 6;
const MAX_BALL_SPEED_X = 12;
const MAX_BALL_SPEED_Y = 8;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Game variables
let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let ballX = canvas.width / 2 - BALL_SIZE / 2;
let ballY = canvas.height / 2 - BALL_SIZE / 2;
let ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);

// Score state and UI
let playerScore = 0;
let aiScore = 0;
const playerScoreEl = document.getElementById('playerScore');
const aiScoreEl = document.getElementById('aiScore');
function updateScoreboard() {
    if (playerScoreEl) playerScoreEl.textContent = String(playerScore);
    if (aiScoreEl) aiScoreEl.textContent = String(aiScore);
}
updateScoreboard();

// Player input state
let playerVelocityY = 0;

function toCanvasY(clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    return (clientY - rect.top) * scaleY;
}

// Mouse control for player paddle
canvas.addEventListener('mousemove', function(e) {
    const mouseY = toCanvasY(e.clientY);
    playerY = mouseY - PADDLE_HEIGHT / 2;
    playerY = clamp(playerY, 0, canvas.height - PADDLE_HEIGHT);
});

// Touch control for player paddle (mobile)
canvas.addEventListener('touchmove', function(e) {
    if (e.touches && e.touches.length > 0) {
        const touchY = toCanvasY(e.touches[0].clientY);
        playerY = touchY - PADDLE_HEIGHT / 2;
        playerY = clamp(playerY, 0, canvas.height - PADDLE_HEIGHT);
    }
}, { passive: true });

// Keyboard controls
window.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        playerVelocityY = -PLAYER_MOVE_SPEED;
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        playerVelocityY = PLAYER_MOVE_SPEED;
    }
});
window.addEventListener('keyup', function(e) {
    if (
        e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'w' || e.key === 'W' ||
        e.key === 's' || e.key === 'S'
    ) {
        playerVelocityY = 0;
    }
});

// Basic AI for right paddle
function moveAI() {
    const aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (aiCenter < ballY + BALL_SIZE / 2 - 10) {
        aiY += 4;
    } else if (aiCenter > ballY + BALL_SIZE / 2 + 10) {
        aiY -= 4;
    }
    aiY = clamp(aiY, 0, canvas.height - PADDLE_HEIGHT);
}

function clampBallSpeed() {
    ballSpeedX = clamp(ballSpeedX, -MAX_BALL_SPEED_X, MAX_BALL_SPEED_X);
    ballSpeedY = clamp(ballSpeedY, -MAX_BALL_SPEED_Y, MAX_BALL_SPEED_Y);
}

// Game loop
function draw() {
    // Integrate keyboard movement
    if (playerVelocityY !== 0) {
        playerY += playerVelocityY;
        playerY = clamp(playerY, 0, canvas.height - PADDLE_HEIGHT);
    }

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX + BALL_SIZE / 2, ballY + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Ball movement
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Wall collision (top/bottom)
    if (ballY <= 0 || ballY + BALL_SIZE >= canvas.height) {
        ballSpeedY *= -1;
        ballY = clamp(ballY, 0, canvas.height - BALL_SIZE);
        clampBallSpeed();
    }

    // Paddle collision (player)
    if (
        ballX <= PLAYER_X + PADDLE_WIDTH &&
        ballY + BALL_SIZE > playerY &&
        ballY < playerY + PADDLE_HEIGHT
    ) {
        ballX = PLAYER_X + PADDLE_WIDTH;
        ballSpeedX *= -1.1;
        ballSpeedY += (Math.random() - 0.5) * 2;
        clampBallSpeed();
    }

    // Paddle collision (AI)
    if (
        ballX + BALL_SIZE >= AI_X &&
        ballY + BALL_SIZE > aiY &&
        ballY < aiY + PADDLE_HEIGHT
    ) {
        ballX = AI_X - BALL_SIZE;
        ballSpeedX *= -1.1;
        ballSpeedY += (Math.random() - 0.5) * 2;
        clampBallSpeed();
    }

    // Score check (ball out of bounds)
    if (ballX < 0) {
        aiScore += 1;
        updateScoreboard();
        resetBall();
    } else if (ballX + BALL_SIZE > canvas.width) {
        playerScore += 1;
        updateScoreboard();
        resetBall();
    }

    moveAI();
    requestAnimationFrame(draw);
}

function resetBall() {
    ballX = canvas.width / 2 - BALL_SIZE / 2;
    ballY = canvas.height / 2 - BALL_SIZE / 2;
    ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
}

// Start the game
draw();