const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const TILE_SIZE = 16;
const MAP = [
"1111111111111111111111111111",
"1222222222222222222222222221",
"1211111211111111111211111121",
"1211111211111111111211111121",
"1211111222222222222221111121",
"1222222222222222222222222221",
"1211111212111111111212111121",
"1211111212111111111212111121",
"1222221222222222222222211121",
"1111111212111111111212111111",
"2222222222111111112222222222",
"1111111212111111111212111111",
"1222221222222222222222222221",
"1211111212111111111212111121",
"1211111222222222222222221121",
"1222222222222222222222222221",
"1211111211111111111211111121",
"1211111211111111111211111121",
"1222222222222222222222222221",
"1111111111111221111111111111",
"1222222222222222222222222221",
"1211111211111111111211111121",
"1211111222222222222221111121",
"1222222222222222222222222221",
"1111111111111111111111111111"
];

let pacman = { x: 14*TILE_SIZE, y: 23*TILE_SIZE, dir: 'right', mouth: 0.2, speed: 2.8 };
let ghost = { x: 14*TILE_SIZE, y: 11*TILE_SIZE, color: '#ff0000', speed: 2.0 };
let dots = [];
let score = 0;
let gameOver = false;
let won = false;

const keys = {};

// Генерация точек
for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < MAP[y].length; x++) {
        if (MAP[y][x] === '2') dots.push({x: x * TILE_SIZE + TILE_SIZE / 2, y: y * TILE_SIZE + TILE_SIZE / 2});
    }
}

document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

function isWall(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    return MAP[row] && MAP[row][col] === '1';
}

function drawMap() {
    ctx.fillStyle = '#00b7eb';
    for (let y = 0; y < MAP.length; y++) {
        for (let x = 0; x < MAP[y].length; x++) {
            if (MAP[y][x] === '1') {
                ctx.fillRect(x * TILE_SIZE + 1, y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            }
        }
    }
}

function drawDots() {
    ctx.fillStyle = '#ffff00';
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// УМЕНЬШЕННЫЙ ПАКМАН
function drawPacman() {
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    let startAngle = 0;
    let endAngle = Math.PI * 2;
    
    switch(pacman.dir) {
        case 'right': startAngle = pacman.mouth; break;
        case 'left': startAngle = Math.PI + pacman.mouth; endAngle = Math.PI * 3 - pacman.mouth; break;
        case 'up': startAngle = Math.PI * 1.5 + pacman.mouth; endAngle = Math.PI * 3.5 - pacman.mouth; break;
        case 'down': startAngle = Math.PI * 0.5 + pacman.mouth; endAngle = Math.PI * 2.5 - pacman.mouth; break;
    }
    
    ctx.arc(pacman.x, pacman.y, TILE_SIZE * 0.25, startAngle, endAngle); // ← ещё меньше
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fill();
    
    // Маленький глаз
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(pacman.x + 3.5, pacman.y - 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawGhost() {
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(ghost.x, ghost.y - 4, 12, Math.PI, 0, false);
    ctx.fillRect(ghost.x - 12, ghost.y - 4, 24, 14);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ghost.x - 5, ghost.y - 6, 4, 0, Math.PI * 2);
    ctx.arc(ghost.x + 5, ghost.y - 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(ghost.x - 5, ghost.y - 6, 2, 0, Math.PI * 2);
    ctx.arc(ghost.x + 5, ghost.y - 6, 2, 0, Math.PI * 2);
    ctx.fill();
}

function updatePacman() {
    let nx = pacman.x;
    let ny = pacman.y;

    if (keys['ArrowRight'] || keys['d'] || keys['D']) { 
        nx += pacman.speed; 
        pacman.dir = 'right'; 
    }
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) { 
        nx -= pacman.speed; 
        pacman.dir = 'left'; 
    }
    if (keys['ArrowUp'] || keys['w'] || keys['W']) { 
        ny -= pacman.speed; 
        pacman.dir = 'up'; 
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) { 
        ny += pacman.speed; 
        pacman.dir = 'down'; 
    }

    // Минимальная область вокруг Пакмана (почти убрана)
    const padding = 6;   // Можно поставить 5 или даже 4.5, если хочешь совсем вплотную

    if (!isWall(nx - padding, ny - padding) && 
        !isWall(nx + padding, ny - padding) && 
        !isWall(nx - padding, ny + padding) && 
        !isWall(nx + padding, ny + padding)) {
        
        pacman.x = nx;
        pacman.y = ny;
    }

    pacman.mouth = Math.abs(Math.sin(Date.now() / 70)) * 0.75 + 0.15;

    // Сбор точек
    for (let i = dots.length - 1; i >= 0; i--) {
        const d = dots[i];
        if (Math.hypot(d.x - pacman.x, d.y - pacman.y) < 13) {
            dots.splice(i, 1);
            score += 10;
            scoreElement.textContent = score;
            playEatSound();
        }
    }
}

function updateGhost() {
    const dx = pacman.x - ghost.x;
    const dy = pacman.y - ghost.y;
    
    let newX = ghost.x + Math.sign(dx) * ghost.speed;
    let newY = ghost.y + Math.sign(dy) * ghost.speed;

    if (!isWall(newX - 11, newY - 11) && !isWall(newX + 11, newY - 11) && 
        !isWall(newX - 11, newY + 11) && !isWall(newX + 11, newY + 11)) {
        ghost.x = newX;
        ghost.y = newY;
    } else {
        ghost.x += (Math.random() - 0.5) * ghost.speed * 2;
        ghost.y += (Math.random() - 0.5) * ghost.speed * 2;
    }
}

function checkCollisions() {
    if (Math.hypot(pacman.x - ghost.x, pacman.y - ghost.y) < 20) gameOver = true;
    if (dots.length === 0) won = true;
}

function playEatSound() {
    try {
        const audio = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audio.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 900;
        osc.connect(audio.destination);
        osc.start();
        setTimeout(() => osc.stop(), 40);
    } catch(e) {}
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawDots();
    updatePacman();
    drawPacman();
    updateGhost();
    drawGhost();
    checkCollisions();

    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 52px Arial';
        ctx.fillText('GAME OVER', 65, 240);
    } else if (won) {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 52px Arial';
        ctx.fillText('YOU WIN!', 95, 240);
    } else {
        requestAnimationFrame(gameLoop);
    }
}

gameLoop();