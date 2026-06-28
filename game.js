const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --------------------
// IMAGES
// --------------------
const bgImg = new Image();
bgImg.src = "assets/background.png";

const spiritImg = new Image();
spiritImg.src = "assets/spirit.png";

const holidayImg = new Image();
holidayImg.src = "assets/holiday.png";

const stitchImg = new Image();
stitchImg.src = "assets/stitch.png";

// --------------------
// LOAD FLAGS
// --------------------
let bgLoaded = false;
let spiritLoaded = false;
let holidayLoaded = false;
let stitchLoaded = false;

// --------------------
// WORLD
// --------------------
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

// --------------------
// CAMERA
// --------------------
const camera = { x: 0, y: 0 };

// --------------------
// PLAYER
// --------------------
const player = {
  x: 120,
  y: 120,
  speed: 4,
  moving: false,
  dir: 0
};

// --------------------
// NPCs
// --------------------
const holiday = {
  x: 300,
  y: 300,
  frame: 0,
  tick: 0
};

const stitch = {
  x: 500,
  y: 200
};

// --------------------
// INPUT
// --------------------
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// --------------------
// SPRITE CONFIG (SPIRIT ONLY)
// --------------------
const COLS = 4;
const ROWS = 5;

let FRAME_W = 0;
let FRAME_H = 0;

let frame = 0;
let tick = 0;
const MAX_FRAMES = 4;

// --------------------
// LOAD HANDLERS
// --------------------
bgImg.onload = () => bgLoaded = true;

spiritImg.onload = () => {
  spiritLoaded = true;
  FRAME_W = spiritImg.width / COLS;
  FRAME_H = spiritImg.height / ROWS;
  startIfReady();
};

holidayImg.onload = () => holidayLoaded = true;
stitchImg.onload = () => stitchLoaded = true;

function startIfReady() {
  if (spiritLoaded) loop();
}

// --------------------
// COLLISION
// --------------------
function isBlocked(x, y) {
  const c = Math.floor(x / TILE_SIZE);
  const r = Math.floor(y / TILE_SIZE);

  return !map[r] || map[r][c] === 1;
}

// --------------------
// PLAYER UPDATE
// --------------------
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

  if (!isBlocked(nx, player.y)) player.x = nx;
  if (!isBlocked(player.x, ny)) player.y = ny;
}

// --------------------
// HOLIDAY SPRITE SHEET FIX
// --------------------
// assume SAME layout as spirit (4x5)
function updateHoliday() {
  const dx = player.x - holiday.x;
  const dy = player.y - holiday.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 2) {
    holiday.x += (dx / dist) * 2;
    holiday.y += (dy / dist) * 2;
  }

  holiday.tick++;
  if (holiday.tick % 15 === 0) {
    holiday.frame = (holiday.frame + 1) % 4;
  }
}

// --------------------
// CAMERA
// --------------------
function updateCamera() {
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;

  camera.x = Math.max(0, Math.min(world.width - canvas.width, camera.x));
  camera.y = Math.max(0, Math.min(world.height - canvas.height, camera.y));
}

// --------------------
// ANIMATION
// --------------------
function updateAnimation() {
  if (!player.moving) {
    frame = 0;
    return;
  }

  tick++;
  if (tick % 10 === 0) {
    frame = (frame + 1) % MAX_FRAMES;
  }
}

// --------------------
// BACKGROUND (FIXED)
// --------------------
function drawBackground() {
  if (!bgLoaded) return;

  ctx.drawImage(bgImg, -camera.x * 0.2, -camera.y * 0.2, world.width, world.height);
}

// --------------------
// MAP
// --------------------
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

// --------------------
// DRAW PLAYER
// --------------------
function drawPlayer() {
  const col = frame;
  const row = player.moving ? player.dir : 4;

  ctx.drawImage(
    spiritImg,
    col * FRAME_W,
    row * FRAME_H,
    FRAME_W,
    FRAME_H,
    player.x - camera.x,
    player.y - camera.y,
    48,
    48
  );
}

// --------------------
// DRAW HOLIDAY (SPRITE SHEET FIXED)
// --------------------
function drawHoliday() {
  const col = holiday.frame || 0;
  const row = 0;

  ctx.drawImage(
    holidayImg,
    col * FRAME_W,
    row * FRAME_H,
    FRAME_W,
    FRAME_H,
    holiday.x - camera.x,
    holiday.y - camera.y,
    48,
    48
  );
}

// --------------------
// DRAW STITCH
// --------------------
function drawStitch() {
  ctx.drawImage(
    stitchImg,
    stitch.x - camera.x,
    stitch.y - camera.y,
    48,
    48
  );
}

// --------------------
// LOOP
// --------------------
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateHoliday();
  updateAnimation();
  updateCamera();

  drawBackground();
  drawMap();
  drawStitch();
  drawHoliday();
  drawPlayer();

  requestAnimationFrame(loop);
}
