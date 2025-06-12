const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.7;
const GROUND_FRICTION = 0.9; // Decreased from 0.95
const AIR_FRICTION = 0.99; // Friction in the air (much smaller)
const PLAYER_SPEED = 5;
const JUMP_POWER = 15;
const ORBIT_SPEED = 0.1; // Speed of orbit rotation
const MAX_ORBIT_VELOCITY = 10; // Maximum velocity when orbiting ends
const ELASTICITY = 0.7; // Elasticity for bouncing off walls

// Player object
const player = {
  x: 75,  // Start on the starting platform
  y: 380, // Just above the starting platform
  width: 20,
  height: 20,
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

// Define platforms for the second stage
const secondStagePlatforms = [
  { x: 0, y: 500, width: 800, height: 20 }, // Ground
  { x: 100, y: 400, width: 100, height: 20 }, // Platform
  { x: 300, y: 300, width: 100, height: 20 }, // Platform
  { x: 500, y: 200, width: 100, height: 20 }, // Platform
  { x: 700, y: 100, width: 100, height: 20 }, // Platform
];

// Define platforms for the third stage
const thirdStagePlatforms = [
  { x: 0, y: 500, width: 800, height: 20 }, // Ground
  { x: 100, y: 400, width: 100, height: 20 }, // Platform
  { x: 300, y: 300, width: 100, height: 20 }, // Platform
  { x: 500, y: 200, width: 100, height: 20 }, // Platform
  { x: 700, y: 100, width: 100, height: 20 }, // Platform
  { x: 400, y: 50, width: 100, height: 20 }, // Additional higher platform
];

// Spider-Man stage
const stage4 = [
  // Ground
  { x: 0, y: 500, width: 800, height: 20 },
  // Starting platform
  { x: 50, y: 400, width: 100, height: 20 },
  // Main platforms
  { x: 200, y: 450, width: 100, height: 20 },
  { x: 400, y: 300, width: 100, height: 20 },
  { x: 600, y: 250, width: 100, height: 20 },
  // Side platforms for wall jumping
  { x: 0, y: 400, width: 50, height: 20 },
  { x: 750, y: 300, width: 50, height: 20 }
];

// Define the door
const door = {
  x: 700,
  y: 80,
  width: 40,
  height: 60,
};

// Track the current stage
let currentStage = 4; // Set Spider-Man stage as default

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
  const currentPlatforms = currentStage === 1 ? platforms : (currentStage === 2 ? secondStagePlatforms : (currentStage === 3 ? thirdStagePlatforms : stage4));
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

canvas.addEventListener('mouseup', (e) => {
  if (drawLine) {
    // Calculate tangential velocity at release
    const dx = player.x + player.width / 2 - lineEnd.x;
    const dy = player.y + player.height / 2 - lineEnd.y;
    const radius = Math.sqrt(dx * dx + dy * dy);
    const angularVelocity = player.orbitDirection * ORBIT_SPEED;
    
    // Calculate tangential velocity (perpendicular to radius)
    const tangentialSpeed = radius * Math.abs(angularVelocity);
    // Calculate the tangent angle based on the orbit direction
    const tangentAngle = Math.atan2(dy, dx) + (Math.PI / 2) * Math.sign(angularVelocity);
    
    // Set velocity components based on tangential direction
    player.vx = tangentialSpeed * Math.cos(tangentAngle);
    player.vy = tangentialSpeed * Math.sin(tangentAngle);
    
    drawLine = false;
    lineEnd = null;
    player.orbiting = false;
    player.orbitDirection = 0;
  }
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
      const currentPlatforms = currentStage === 1 ? platforms : (currentStage === 2 ? secondStagePlatforms : (currentStage === 3 ? thirdStagePlatforms : stage4));
      for (const plat of currentPlatforms) {
        if (
          newX < plat.x + plat.width &&
          newX + player.width > plat.x &&
          newY < plat.y + plat.height &&
          newY + player.height > plat.y
        ) {
          collision = true;
          // Reverse orbit direction on collision
          player.orbitDirection *= -1;
          break;
        }
      }

      if (!collision) {
        player.x = newX;
        player.y = newY;
      }
    }
  } else {
    // Normal movement
    if (keys['ArrowLeft'] || keys['a']) {
      player.vx = -PLAYER_SPEED;
    } else if (keys['ArrowRight'] || keys['d']) {
      player.vx = PLAYER_SPEED;
    } else {
      // Apply friction based on whether the player is on the ground or in the air
      const friction = player.onGround ? GROUND_FRICTION : AIR_FRICTION;
      player.vx *= friction;
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
    const currentPlatforms = currentStage === 1 ? platforms : (currentStage === 2 ? secondStagePlatforms : (currentStage === 3 ? thirdStagePlatforms : stage4));
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
          player.vy = -player.vy * ELASTICITY; // Bounce off ceiling
        } else if (player.x + player.width - player.vx <= plat.x) {
          // From left
          player.x = plat.x - player.width;
          player.vx = -player.vx * ELASTICITY; // Bounce off left wall
        } else if (player.x - player.vx >= plat.x + plat.width) {
          // From right
          player.x = plat.x + plat.width;
          player.vx = -player.vx * ELASTICITY; // Bounce off right wall
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
    if (player.x < 0) {
      player.x = 0;
      player.vx = -player.vx * ELASTICITY; // Bounce off left boundary
    }
    if (player.x + player.width > canvas.width) {
      player.x = canvas.width - player.width;
      player.vx = -player.vx * ELASTICITY; // Bounce off right boundary
    }
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
  const currentPlatforms = currentStage === 1 ? platforms : (currentStage === 2 ? secondStagePlatforms : (currentStage === 3 ? thirdStagePlatforms : stage4));
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

// Add stage selection buttons
const stageControls = document.createElement('div');
stageControls.style.position = 'absolute';
stageControls.style.top = '10px';
stageControls.style.left = '10px';
stageControls.style.display = 'flex';
stageControls.style.gap = '10px';

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

const stage3Button = document.createElement('button');
stage3Button.textContent = 'Stage III';
stage3Button.onclick = () => {
  currentStage = 3;
  player.x = 100;
  player.y = 400;
};

const spidermanButton = document.createElement('button');
spidermanButton.textContent = 'Spider-Man Stage';
spidermanButton.onclick = () => {
  currentStage = 4;
  player.x = 75;
  player.y = 380;
};

stageControls.appendChild(stage1Button);
stageControls.appendChild(stage2Button);
stageControls.appendChild(stage3Button);
stageControls.appendChild(spidermanButton);
document.body.appendChild(stageControls); 