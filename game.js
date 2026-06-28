const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =====================
// FORCE CANVAS SIZE (prevents black screen bugs)
// =====================
canvas.width = 800;
canvas.height = 600;

// =====================
// IMAGES
// =====================
const bgImg = new Image();
bgImg.src = "assets/background.png";

const spiritImg = new Image();
spiritImg.src = "assets/spirit.png";

const holidayImg = new Image();
holidayImg.src = "assets/holiday.png";

const stitchImg = new Image();
stitchImg.src = "assets/stitch.png";

// =====================
// LOAD FLAGS
// =====================
let bgReady = false;
let spiritReady = false;
let holidayReady = false;
let stitchReady = false;

bgImg.onload = () => bgReady = true;
spiritImg.onload = () => spiritReady = true;
holidayImg.onload = () => holidayReady = true;
stitchImg.onload = () => stitchReady = true;

// =====================
// WORLD
// =====================
const TILE_SIZE = 40;

const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const world = {
  width: map[0].length * TILE_SIZE,
  height: map.length * TILE_SIZE
};

// =====================
// CAMERA
// =====================
const camera = { x: 0, y: 0 };

// =====================
// INPUT
// =====================
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// =====================
// SPRITE SETTINGS
// =====================
const COLS = 4;
const ROWS = 5;

// =====================
// PLAYER (SPIRIT)
// =====================
const player = {
  x: 120,
  y: 120,
  speed: 4,
  moving: false,
  dir: 0,
  frame: 0,
  tick: 0
};

// =====================
// HOLIDAY (FIXED)
// =====================
const holiday = {
  x: 300,
  y: 300,
  frame: 0,
  tick: 0,
  dir: 0
};

// =====================
// STITCH (FIXED)
// =====================
const stitch = {
  x: 500,
  y: 200,
  frame: 0,
  tick: 0,
  dir: 0
};

// =====================
// COLLISION
// =====================
function blocked(x, y) {
  const c = Math.floor(x / TILE_SIZE);
  const r = Math.floor(y / TILE_SIZE);
  return !map[r] || map[r][c] === 1;
}

// =====================
// PLAYER UPDATE
// =====================
function updatePlayer() {
  player.moving = false;

  let nx = player.x;
  let ny = player.y;

  if (keys["ArrowUp"]) {
    ny -= player.speed;
    player.dir = 1;
    player.moving = true;
  } else if (keys["ArrowDown"]) {
    ny += player.speed;
    player.dir = 0;
    player.moving = true;
  } else if (keys["ArrowLeft"]) {
    nx -= player.speed;
    player.dir = 2;
    player.moving = true;
  } else if (keys["ArrowRight"]) {
    nx += player.speed;
    player.dir = 3;
    player.moving = true;
  }

  if (!blocked(nx, player.y)) player.x = nx;
  if (!blocked(player.x, ny)) player.y = ny;
}

// =====================
// HOLIDAY (RESTORED SAFE FOLLOW AI)
// =====================
function updateHoliday() {
  if (!holidayReady) return;

  const dx = player.x - holiday.x;
  const dy = player.y - holiday.y;
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d > 2) {
    holiday.x += (dx / d) * 2;
    holiday.y += (dy / d) * 2;
  }

  // clamp so she NEVER disappears
  holiday.x = Math.max(0, Math.min(world.width, holiday.x));
  holiday.y = Math.max(0, Math.min(world.height, holiday.y));

  holiday.tick++;
  if (holiday.tick % 12 === 0) {
    holiday.frame = (holiday.frame + 1) % COLS;
  }

  holiday.dir = Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 3 : 2)
    : (dy > 0 ? 0 : 1);
}

// =====================
// STITCH (SAFE ANIMATION)
// =====================
function updateStitch() {
  if (!stitchReady) return;

  stitch.tick++;

  if (stitch.tick % 12 === 0) {
    stitch.frame = (stitch.frame + 1) % COLS;
  }

  stitch.dir = 0;
}

// =====================
// CAMERA
// =====================
function updateCamera() {
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;

  camera.x = Math.max(0, Math.min(world.width - canvas.width, camera.x));
  camera.y = Math.max(0, Math.min(world.height - canvas.height, camera.y));
}

// =====================
// PLAYER ANIMATION
// =====================
function updateAnimation() {
  if (!player.moving) {
    player.frame = 0;
    return;
  }

  player.tick++;
  if (player.tick % 10 === 0) {
    player.frame = (player.frame + 1) % COLS;
  }
}

// =====================
// BACKGROUND (SAFE + ALWAYS VISIBLE)
// =====================
function drawBackground() {
  ctx.fillStyle = "#0b0b0b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!bgReady) return;

  ctx.drawImage(
    bgImg,
    (canvas.width - bgImg.width) / 2,
    (canvas.height - bgImg.height) / 2
  );
}

// =====================
// MAP
// =====================
function drawMap() {
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      ctx.fillStyle = map[r][c] === 1 ? "#444" : "#1a1a1a";
      ctx.fillRect(
        c * TILE_SIZE - camera.x,
        r * TILE_SIZE - camera.y,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }
}

// =====================
// SPRITE DRAW SAFE
// =====================
function drawSprite(img, obj) {
  if (!img || img.width === 0) return;

  const fw = img.width / COLS;
  const fh = img.height / ROWS;

  ctx.drawImage(
    img,
    obj.frame * fw,
    obj.dir * fh,
    fw,
    fh,
    obj.x - camera.x,
    obj.y - camera.y,
    48,
    48
  );
}

// =====================
// DRAW ENTITIES
// =====================
function drawPlayer() {
  drawSprite(spiritImg, player);
}

function drawHoliday() {
  drawSprite(holidayImg, holiday);
}

function drawStitch() {
  drawSprite(stitchImg, stitch);
}

// =====================
// LOOP
// =====================
function loop() {
  updatePlayer();
  updateHoliday();
  updateStitch();
  updateAnimation();
  updateCamera();

  drawBackground();
  drawMap();
  drawStitch();
  drawHoliday();
  drawPlayer();

  requestAnimationFrame(loop);
}

loop();
