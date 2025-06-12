const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.7;
const FRICTION = 0.95;
const PLAYER_SPEED = 5;
const JUMP_POWER = 15;
const ORBIT_SPEED = 0.1; // Speed of orbit rotation

// Player object
const player = {
  x: 100,
  y: 400,
  width: 40,
  height: 40,
  vx: 0,
  vy: 0,
  onGround: false,
  color: '#ff5252',
  orbiting: false,
  orbitDirection: 0, // -1 for left, 1 for right, 0 for no orbit
  momentum: { x: 0, y: 0 } // Momentum for orbiting
};

// Platforms (multi-level arena) + vertical walls
const platforms = [
  { x: 0, y: 470, width: 800, height: 30 }, // ground
  { x: 100, y: 370, width: 200, height: 20 },
  { x: 400, y: 320, width: 180, height: 20 },
  { x: 250, y: 220, width: 150, height: 20 },
  { x: 600, y: 180, width: 120, height: 20 },
  { x: 50, y: 120, width: 120, height: 20 },
  { x: 350, y: 70, width: 200, height: 20 },
  // Left wall
  { x: 0, y: 0, width: 20, height: 500 },
  // Right wall
  { x: 780, y: 0, width: 20, height: 500 }
];

// Second stage platforms
const secondStagePlatforms = [
  { x: 0, y: 470, width: 800, height: 30 }, // ground
  { x: 200, y: 370, width: 200, height: 20 },
  { x: 500, y: 320, width: 180, height: 20 },
  { x: 300, y: 220, width: 150, height: 20 },
  // Left wall
  { x: 0, y: 0, width: 20, height: 500 },
  // Right wall
  { x: 780, y: 0, width: 20, height: 500 }
];

// Door to second stage
const door = { x: 700, y: 430, width: 40, height: 40, color: '#00e676' };

// Current stage
let currentStage = 1;

// Input state
const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup', e => { keys[e.key] = false; });

// Line drawing state
let drawLine = false;
let lineEnd = null;
let prevOrbitPos = null;

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  // Check if click is on any platform or wall
  const currentPlatforms = currentStage === 1 ? platforms : secondStagePlatforms;
  for (const plat of currentPlatforms) {
    if (
      mouseX >= plat.x &&
      mouseX <= plat.x + plat.width &&
      mouseY >= plat.y &&
      mouseY <= plat.y + plat.height
    ) {
      drawLine = true;
      lineEnd = { x: mouseX, y: mouseY };
      break;
    }
  }
});

canvas.addEventListener('mouseup', () => {
  if (player.orbiting && prevOrbitPos) {
    player.vx = player.x - prevOrbitPos.x;
    player.vy = player.y - prevOrbitPos.y;
  }
  drawLine = false;
  lineEnd = null;
  player.orbiting = false;
  player.orbitDirection = 0;
  prevOrbitPos = null;
});

function updatePlayer() {
  if (drawLine && lineEnd) {
    // Orbit logic
    if (keys['ArrowLeft']) {
      player.orbiting = true;
      player.orbitDirection = -1;
    } else if (keys['ArrowRight']) {
      player.orbiting = true;
      player.orbitDirection = 1;
    }

    if (player.orbiting) {
      // Store previous position before updating
      prevOrbitPos = { x: player.x, y: player.y };
      const dx = player.x + player.width / 2 - lineEnd.x;
      const dy = player.y + player.height / 2 - lineEnd.y;
      const angle = Math.atan2(dy, dx) + player.orbitDirection * ORBIT_SPEED;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const newX = lineEnd.x + radius * Math.cos(angle) - player.width / 2;
      const newY = lineEnd.y + radius * Math.sin(angle) - player.height / 2;

      // Check collision before updating position
      let collision = false;
      const currentPlatforms = currentStage === 1 ? platforms : secondStagePlatforms;
      for (const plat of currentPlatforms) {
        if (
          newX < plat.x + plat.width &&
          newX + player.width > plat.x &&
          newY < plat.y + plat.height &&
          newY + player.height > plat.y
        ) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        player.x = newX;
        player.y = newY;
      } else {
        player.orbiting = false;
        player.orbitDirection = 0;
      }
    }
  } else {
    // Normal movement
    if (keys['ArrowLeft'] || keys['a']) {
      player.vx = -PLAYER_SPEED;
    } else if (keys['ArrowRight'] || keys['d']) {
      player.vx = PLAYER_SPEED;
    } else {
      player.vx *= FRICTION;
      if (Math.abs(player.vx) < 0.1) player.vx = 0;
    }

    // Jump
    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.onGround) {
      player.vy = -JUMP_POWER;
      player.onGround = false;
    }

    // Apply gravity
    player.vy += GRAVITY;

    // Move player
    player.x += player.vx;
    player.y += player.vy;

    // Collision detection
    player.onGround = false;
    const currentPlatforms = currentStage === 1 ? platforms : secondStagePlatforms;
    for (const plat of currentPlatforms) {
      // AABB collision
      if (
        player.x < plat.x + plat.width &&
        player.x + player.width > plat.x &&
        player.y < plat.y + plat.height &&
        player.y + player.height > plat.y
      ) {
        // From above
        if (player.vy > 0 && player.y + player.height - player.vy <= plat.y) {
          player.y = plat.y - player.height;
          player.vy = 0;
          player.onGround = true;
        } else if (player.vy < 0 && player.y >= plat.y + plat.height - 1) {
          // From below
          player.y = plat.y + plat.height;
          player.vy = 0;
        } else if (player.x + player.width - player.vx <= plat.x) {
          // From left
          player.x = plat.x - player.width;
          player.vx = 0;
        } else if (player.x - player.vx >= plat.x + plat.width) {
          // From right
          player.x = plat.x + plat.width;
          player.vx = 0;
        }
      }
    }

    // Check for door collision
    if (
      currentStage === 1 &&
      player.x < door.x + door.width &&
      player.x + player.width > door.x &&
      player.y < door.y + door.height &&
      player.y + player.height > door.y
    ) {
      currentStage = 2;
      player.x = 100;
      player.y = 400;
    }

    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y + player.height > canvas.height) {
      player.y = canvas.height - player.height;
      player.vy = 0;
      player.onGround = true;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw platforms and walls
  ctx.fillStyle = '#444';
  const currentPlatforms = currentStage === 1 ? platforms : secondStagePlatforms;
  for (const plat of currentPlatforms) {
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
  }

  // Draw door if in first stage
  if (currentStage === 1) {
    ctx.fillStyle = door.color;
    ctx.fillRect(door.x, door.y, door.width, door.height);
  }

  // Draw player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw line if needed
  if (drawLine && lineEnd) {
    ctx.save();
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y + player.height / 2);
    ctx.lineTo(lineEnd.x, lineEnd.y);
    ctx.stroke();
    ctx.restore();
  }
}

function gameLoop() {
  updatePlayer();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

// Add stage selection controls
const stageControls = document.createElement('div');
stageControls.style.position = 'absolute';
stageControls.style.top = '10px';
stageControls.style.left = '10px';
stageControls.style.zIndex = '1000';

const stage1Button = document.createElement('button');
stage1Button.textContent = 'Stage I';
stage1Button.onclick = () => {
  currentStage = 1;
  player.x = 100;
  player.y = 400;
};

const stage2Button = document.createElement('button');
stage2Button.textContent = 'Stage II';
stage2Button.onclick = () => {
  currentStage = 2;
  player.x = 100;
  player.y = 400;
};

stageControls.appendChild(stage1Button);
stageControls.appendChild(stage2Button);
document.body.appendChild(stageControls); 