// ── Constants ──────────────────────────────────────
const BOARD_W = 800;
const BOARD_H = 500;
const TILE = 25;
const COLS = BOARD_W / TILE;   // 32
const ROWS = BOARD_H / TILE;   // 20
let tickMs = 100;              // default = Medium

// ── DOM Elements ───────────────────────────────────
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-value');
const bestScoreEl = document.getElementById('best-score-value');
const restartBtn = document.getElementById('restart-btn');
const diffBtns = document.querySelectorAll('.diff-btn');
const pauseBtn = document.getElementById('pause-btn');
const pauseOverlay = document.getElementById('pause-overlay');

// ── Sound Effects ──────────────────────────────────
const eatSound = new Audio('assets/Point_SFX.mp3');
const gameOverSound = new Audio('assets/Game_Over_SFX.mp3');

function playEatSound() {
    if (window.CyberSystem && window.CyberSystem.Audio && window.CyberSystem.Audio.isMuted()) return;
    eatSound.currentTime = 0;
    eatSound.play().catch(() => {});
}

function playGameOverSound() {
    if (window.CyberSystem && window.CyberSystem.Audio && window.CyberSystem.Audio.isMuted()) return;
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(() => {});
}

// ── Game State ─────────────────────────────────────
let snake, direction, nextDirection, food, score, gameOver, loopId;
let waitingForStart;
let isPaused = false;

function updateBestScoreUI() {
    if (bestScoreEl && window.CyberSystem && window.CyberSystem.Scores) {
        const best = window.CyberSystem.Scores.get('snake');
        bestScoreEl.textContent = best;
    }
}

// ── Initialise / Reset ─────────────────────────────
function init() {
    snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    score = 0;
    gameOver = false;
    waitingForStart = true;
    isPaused = false;

    if (pauseOverlay) pauseOverlay.style.display = 'none';
    if (pauseBtn) pauseBtn.textContent = 'Pause';

    diffBtns.forEach(btn => btn.disabled = false);

    scoreEl.textContent = '0';
    restartBtn.style.display = 'none';

    updateBestScoreUI();
    spawnFood();

    if (loopId) clearInterval(loopId);
    loopId = setInterval(gameLoop, tickMs);

    draw();
}

// ── Pause Toggle ───────────────────────────────────
function togglePause() {
    if (gameOver || waitingForStart) return;
    isPaused = !isPaused;

    if (isPaused) {
        if (pauseOverlay) pauseOverlay.style.display = 'flex';
        if (pauseBtn) pauseBtn.textContent = 'Resume';
        if (window.CyberSystem) window.CyberSystem.Audio.playAlert();
    } else {
        if (pauseOverlay) pauseOverlay.style.display = 'none';
        if (pauseBtn) pauseBtn.textContent = 'Pause';
        if (window.CyberSystem) window.CyberSystem.Audio.playClick();
    }
}

// ── Food Generation ─────────────────────────────────
function spawnFood() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        };
    } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
    food = pos;
}

// ── Direction Input Helper ──────────────────────────
function handleDirectionInput(dirKey) {
    if (isPaused) {
        togglePause();
        return;
    }

    switch (dirKey) {
        case 'ArrowUp':
        case 'Up':
        case 'w':
        case 'W':
            if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
        case 'Down':
        case 's':
        case 'S':
            if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
        case 'Left':
        case 'a':
        case 'A':
            if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
        case 'Right':
        case 'd':
        case 'D':
            if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
            break;
    }

    if (waitingForStart && (nextDirection.x !== 0 || nextDirection.y !== 0)) {
        waitingForStart = false;
        diffBtns.forEach(btn => btn.disabled = true);
    }
}

// ── Keyboard Input ──────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
        e.preventDefault();
        return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(e.key)) {
        e.preventDefault();
    }

    handleDirectionInput(e.key);
});

// ── Game Loop ──────────────────────────────────────
function gameLoop() {
    if (gameOver || waitingForStart || isPaused) return;

    direction = nextDirection;

    // Move body
    for (let i = snake.length - 1; i > 0; i--) {
        snake[i] = { ...snake[i - 1] };
    }

    // Move head
    snake[0].x += direction.x;
    snake[0].y += direction.y;

    // Wall collision
    if (snake[0].x < 0 || snake[0].x >= COLS || snake[0].y < 0 || snake[0].y >= ROWS) {
        endGame();
        return;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            endGame();
            return;
        }
    }

    // Food collision
    if (snake[0].x === food.x && snake[0].y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        scoreEl.classList.remove('score-pop');
        void scoreEl.offsetWidth;
        scoreEl.classList.add('score-pop');

        // Check high score record
        if (window.CyberSystem && window.CyberSystem.Scores) {
            window.CyberSystem.Scores.set('snake', score);
            updateBestScoreUI();
        }

        snake.push({ ...snake[snake.length - 1] });
        spawnFood();
        playEatSound();
    }

    draw();
}

// ── Canvas Rendering ────────────────────────────────
function draw() {
    const pal = window.ToyBox.palette();

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);

    // Checkerboard lawn
    ctx.fillStyle = pal.grid;
    for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
            if ((i + j) % 2 === 0) ctx.fillRect(i * TILE, j * TILE, TILE, TILE);
        }
    }

    // Snack (a little cherry)
    const fx = food.x * TILE + TILE / 2;
    const fy = food.y * TILE + TILE / 2 + 1;
    ctx.fillStyle = pal.red;
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(fx, fy, TILE / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = pal.green;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fx, fy - TILE / 2 + 3);
    ctx.quadraticCurveTo(fx + 2, fy - TILE / 2 - 3, fx + 7, fy - TILE / 2 - 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(fx - 3, fy - 3, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Snake body: chunky rounded tiles in two alternating greens
    snake.forEach((seg, i) => {
        const sx = seg.x * TILE;
        const sy = seg.y * TILE;
        const inset = i === 0 ? 1 : 2;
        ctx.fillStyle = i === 0 ? pal.green : (i % 2 === 0 ? pal.green : pal.blue);
        ctx.strokeStyle = pal.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(sx + inset, sy + inset, TILE - inset * 2, TILE - inset * 2, i === 0 ? 9 : 7);
        ctx.fill();
        ctx.stroke();
    });

    drawEyes();

    // Prompt when waiting for start
    if (waitingForStart) {
        ctx.fillStyle = pal.bg;
        ctx.strokeStyle = pal.ink;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(BOARD_W / 2 - 250, BOARD_H / 2 + 60, 500, 52, 26);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = pal.ink;
        ctx.font = '700 20px "Fredoka", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Press an arrow key or swipe to start!', BOARD_W / 2, BOARD_H / 2 + 87);
    }
}

// ── Draw Cybernetic Eyes ────────────────────────────
function drawEyes() {
    const head = snake[0];
    const hx = head.x * TILE;
    const hy = head.y * TILE;
    let e1, e2;

    const dx = direction.x || 1;
    const dy = direction.y;

    if (dx === 1 && dy === 0) {
        e1 = { x: hx + 17, y: hy + 8 };
        e2 = { x: hx + 17, y: hy + 17 };
    } else if (dx === -1 && dy === 0) {
        e1 = { x: hx + 8, y: hy + 8 };
        e2 = { x: hx + 8, y: hy + 17 };
    } else if (dy === -1) {
        e1 = { x: hx + 8, y: hy + 8 };
        e2 = { x: hx + 17, y: hy + 8 };
    } else {
        e1 = { x: hx + 8, y: hy + 17 };
        e2 = { x: hx + 17, y: hy + 17 };
    }

    const pal = window.ToyBox.palette();
    [e1, e2].forEach((e) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.ink;
        ctx.beginPath();
        ctx.arc(e.x + direction.x * 1.2, e.y + direction.y * 1.2, 1.7, 0, Math.PI * 2);
        ctx.fill();
    });
}

// ── End Game Terminal Overlay ───────────────────────
function endGame() {
    gameOver = true;
    clearInterval(loopId);
    playGameOverSound();

    const pal = window.ToyBox.palette();

    ctx.fillStyle = pal.bg;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);
    ctx.globalAlpha = 1;

    ctx.fillStyle = pal.bg;
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(BOARD_W / 2 - 230, BOARD_H / 2 - 100, 460, 200, 28);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = pal.pink;
    ctx.font = '700 44px "Fredoka", system-ui, sans-serif';
    ctx.fillText('Oh no! Chomp!', BOARD_W / 2, BOARD_H / 2 - 40);

    ctx.fillStyle = pal.ink;
    ctx.font = '700 26px "Fredoka", system-ui, sans-serif';
    ctx.fillText(`Snacks eaten: ${score}`, BOARD_W / 2, BOARD_H / 2 + 12);

    ctx.fillStyle = pal.soft;
    ctx.font = '700 17px "Nunito", system-ui, sans-serif';
    ctx.fillText('Tap "Play again" to have another go', BOARD_W / 2, BOARD_H / 2 + 56);

    restartBtn.style.display = 'inline-flex';
    restartBtn.focus();
}

// ── Event Listeners ─────────────────────────────────
restartBtn.addEventListener('click', () => {
    init();
});

if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        togglePause();
    });
}

if (pauseOverlay) {
    pauseOverlay.addEventListener('click', () => {
        togglePause();
    });
}

// Mobile Virtual D-Pad buttons
document.querySelectorAll('#virtual-dpad .dpad-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const dir = btn.dataset.dir;
        handleDirectionInput(dir);
    });
});

// Mobile Canvas Touch Swipe
if (window.CyberSystem && window.CyberSystem.attachSwipeListener) {
    window.CyberSystem.attachSwipeListener(canvas, (swipeDir) => {
        handleDirectionInput(swipeDir);
    });
}

// Difficulty Selector
diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        diffBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        tickMs = parseInt(btn.dataset.speed, 10);

        if (loopId) clearInterval(loopId);
        loopId = setInterval(gameLoop, tickMs);
    });
});

// Redraw right away when the theme changes so the board matches the page
window.addEventListener('toybox:themechange', () => {
    if (snake) draw();
});

// ── Start ──────────────────────────────────────────
init();
