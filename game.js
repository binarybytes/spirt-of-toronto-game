const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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

// TRASH SHEET
const tsprites = new Image();
tsprites.src = "assets/tsprites.png";

// =====================
// LOAD FLAGS (IMPORTANT FIX)
// =====================
let assetsReady = 0;
const totalAssets = 5;

function markLoaded() {
  assetsReady++;
}

bgImg.onload = markLoaded;
spiritImg.onload = markLoaded;
holidayImg.onload = markLoaded;
stitchImg.onload = markLoaded;
tsprites.onload = markLoaded;

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
// SPRITES
// =====================
const COLS = 4;
const ROWS = 5;

// =====================
// PLAYER
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
// NPCs
// =====================
const holiday = { x: 300, y: 300, frame: 0, tick: 0, dir: 0 };
const stitch = { x: 500, y: 200, frame: 0, tick: 0, dir: 0 };

// =====================
// TRASH (SAFE)
// =====================
const trash = [
  { x: 250, y: 250, cleaned: false, frame: 0, tick: 0 },
  { x: 500, y: 300, cleaned: false, frame: 0, tick: 0 },
  { x: 700, y: 450, cleaned: false, frame: 0, tick: 0 }
];

let score = 0;

// =====================
// MOVEMENT (UNCHANGED)
// =====================
function updatePlayer() {
  player.moving = false;

  if (keys["ArrowUp"]) { player.y -= player.speed; player.dir = 1; player.moving = true; }
  else if (keys["ArrowDown"]) { player.y += player.speed; player.dir = 0; player.moving = true; }
  else if (keys["ArrowLeft"]) { player.x -= player.speed; player.dir = 2; player.moving = true; }
  else if (keys["ArrowRight"]) { player.x += player.speed; player.dir = 3; player.moving = true; }
}

// =====================
// FOLLOWERS
// =====================
function follow(obj, speed) {
  const dx = player.x - obj.x;
  const dy = player.y - obj.y;
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d > 2) {
    obj.x += (dx / d) * speed;
    obj.y += (dy / d) * speed;
  }
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
// TRASH UPDATE (SAFE)
// =====================
function updateTrash() {
  trash.forEach(t => {
    if (t.cleaned) return;
    t.tick++;
    if (t.tick % 20 === 0) {
      t.frame = (t.frame + 1) % 80;
    }
  });
}

// =====================
// DRAW SPRITE (UNCHANGED)
// =====================
function drawSprite(img, obj) {
  if (!img.complete || img.width === 0) return;

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
// TRASH DRAW (SAFE GUARDED)
// =====================
function drawTrash() {
  if (!tsprites.complete || tsprites.width === 0) return;

  const cols = 8;
  const rows = 10;

  const fw = Math.floor(tsprites.width / cols);
  const fh = Math.floor(tsprites.height / rows);

  trash.forEach(t => {
    if (t.cleaned) return;

    const frame = t.frame;

    const fx = (frame % cols) * fw;
    const fy = Math.floor(frame / cols) * fh;

    ctx.drawImage(
      tsprites,
      fx, fy, fw, fh,
      t.x - camera.x,
      t.y - camera.y,
      48,
      48
    );
  });
}

// =====================
// BACKGROUND
// =====================
function drawBackground() {
  if (!bgImg.complete) return;
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

// =====================
// LOOP
// =====================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateTrash();
  updateCamera();

  drawBackground();

  drawTrash();

  drawSprite(stitchImg, stitch);
  drawSprite(holidayImg, holiday);
  drawSprite(spiritImg, player);

  requestAnimationFrame(loop);
}

loop();
