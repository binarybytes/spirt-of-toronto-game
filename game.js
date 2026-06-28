// =====================
// SETUP
// =====================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =====================
// CAMERA (SCROLLING WORLD)
// =====================
const camera = {
  x: 0,
  y: 0
};

// WORLD SIZE
const world = {
  width: 2000,
  height: 2000
};

// =====================
// LOAD SPRITES
// =====================
const playerImg = new Image();
playerImg.src = "player.png";

const holidayImg = new Image();
holidayImg.src = "holiday.png";

const bgImg = new Image();
bgImg.src = "background.png";

// =====================
// INPUT
// =====================
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// =====================
// PLAYER
// =====================
const player = {
  x: 300,
  y: 300,
  speed: 4,
  frame: 0,
  frameTick: 0,
  frameW: 32,
  frameH: 32
};

// =====================
// COMPANION (HOLIDAY)
// =====================
const companion = {
  x: 250,
  y: 250,
  speed: 3
};

// =====================
// MISSION SYSTEM
// =====================
const mission = {
  text: "Find Holiday in the city",
  complete: false,
  targetX: 600,
  targetY: 500
};

// =====================
// UPDATE PLAYER
// =====================
function updatePlayer() {
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  // animation frames
  player.frameTick++;
  if (player.frameTick % 10 === 0) {
    player.frame = (player.frame + 1) % 4;
  }

  // mission check
  const dx = player.x - mission.targetX;
  const dy = player.y - mission.targetY;
  if (Math.sqrt(dx*dx + dy*dy) < 50) {
    mission.complete = true;
    mission.text = "Mission Complete: Holiday found!";
  }
}

// =====================
// COMPANION AI (FOLLOW PLAYER)
// =====================
function updateCompanion() {
  const dx = player.x - companion.x;
  const dy = player.y - companion.y;

  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist > 40) {
    companion.x += (dx / dist) * companion.speed;
    companion.y += (dy / dist) * companion.speed;
  }
}

// =====================
// CAMERA FOLLOW PLAYER
// =====================
function updateCamera() {
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;

  // clamp to world
  camera.x = Math.max(0, Math.min(camera.x, world.width - canvas.width));
  camera.y = Math.max(0, Math.min(camera.y, world.height - canvas.height));
}

// =====================
// DRAW WORLD
// =====================
function drawWorld() {
  ctx.drawImage(bgImg, -camera.x, -camera.y, world.width, world.height);
}

// =====================
// DRAW SPRITES
// =====================
function drawSprite(img, x, y, size = 32) {
  ctx.drawImage(img, x - camera.x, y - camera.y, size, size);
}

// =====================
// DRAW PLAYER (ANIMATED)
// =====================
function drawPlayer() {
  ctx.drawImage(
    playerImg,
    player.frame * player.frameW,
    0,
    player.frameW,
    player.frameH,
    player.x - camera.x,
    player.y - camera.y,
    48,
    48
  );
}

// =====================
// DRAW UI
// =====================
function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(mission.text, 20, 30);
}

// =====================
// MAIN LOOP
// =====================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateCompanion();
  updateCamera();

  drawWorld();
  drawPlayer();
  drawSprite(holidayImg, companion.x, companion.y, 40);
  drawUI();

  requestAnimationFrame(loop);
}

loop();
