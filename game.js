"use strict";

// =====================================================
// CANVAS INIT
// =====================================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

// =====================================================
// ASSETS
// =====================================================
const assets = {
  bg: new Image(),
  spirit: new Image(),
  holiday: new Image(),
  stitch: new Image(),
  trash: new Image()
};

assets.bg.src = "assets/background.png";
assets.spirit.src = "assets/spirit.png";
assets.holiday.src = "assets/holiday.png";
assets.stitch.src = "assets/stitch.png";
assets.trash.src = "assets/tsprites.png";

// =====================================================
// CONSTANTS
// =====================================================
const COLS = 4;
const ROWS = 5;

const TRASH_COLS = 8;
const TRASH_ROWS = 10;
const TRASH_FRAMES = TRASH_COLS * TRASH_ROWS;

const TILE = 40;

// =====================================================
// INPUT
// =====================================================
const keys = Object.create(null);

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Space") beginClean();
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
  if (e.code === "Space") endClean();
});

// =====================================================
// WORLD / CAMERA
// =====================================================
const world = {
  width: 25 * TILE,
  height: 10 * TILE
};

const camera = { x: 0, y: 0 };

// =====================================================
// ENTITIES
// =====================================================
const player = makeActor(120, 120);
const holiday = makeFollower(300, 300, 2);
const stitch = makeFollower(500, 200, 1.5);

// =====================================================
// TRASH SYSTEM
// =====================================================
const trash = [
  makeTrash(250, 250),
  makeTrash(500, 300),
  makeTrash(700, 450)
];

let score = 0;

// =====================================================
// CLEAN SYSTEM
// =====================================================
let cleaning = false;
let cleanCharge = 0;

// =====================================================
// FACTORIES (CLEAN STRUCTURE)
// =====================================================
function makeActor(x, y) {
  return {
    x, y,
    dir: 0,
    frame: 0,
    tick: 0,
    speed: 4,
    moving: false
  };
}

function makeFollower(x, y, speed) {
  return {
    x, y,
    speed,
    dir: 0,
    frame: 0,
    tick: 0
  };
}

function makeTrash(x, y) {
  return {
    x, y,
    frame: 0,
    tick: 0,
    cleaned: false
  };
}

// =====================================================
// UPDATE: PLAYER
// =====================================================
function updatePlayer() {
  player.moving = false;

  if (keys["ArrowUp"]) {
    player.y -= player.speed;
    player.dir = 1;
    player.moving = true;
  } else if (keys["ArrowDown"]) {
    player.y += player.speed;
    player.dir = 0;
    player.moving = true;
  } else if (keys["ArrowLeft"]) {
    player.x -= player.speed;
    player.dir = 2;
    player.moving = true;
  } else if (keys["ArrowRight"]) {
    player.x += player.speed;
    player.dir = 3;
    player.moving = true;
  }
}

// =====================================================
// UPDATE: FOLLOWERS (FIXED)
// =====================================================
function updateFollower(obj) {
  const dx = player.x - obj.x;
  const dy = player.y - obj.y;
  const dist = Math.hypot(dx, dy);

  if (dist > 2) {
    obj.x += (dx / dist) * obj.speed;
    obj.y += (dy / dist) * obj.speed;
  }
}

// =====================================================
// UPDATE: TRASH ANIMATION (FIXED FRAME LOGIC)
// =====================================================
function updateTrash() {
  for (const t of trash) {
    if (t.cleaned) continue;

    t.tick++;

    if (t.tick % 18 === 0) {
      t.frame = (t.frame + 1) % TRASH_FRAMES;
    }
  }
}

// =====================================================
// CLEAN SYSTEM (RAINBOW BURST)
// =====================================================
function beginClean() {
  cleaning = true;
}

function endClean() {
  if (cleanCharge > 40) {
    burstClean();
  }

  cleaning = false;
  cleanCharge = 0;
}

function burstClean() {
  const radius = 120;

  for (const t of trash) {
    if (t.cleaned) continue;

    const d = Math.hypot(player.x - t.x, player.y - t.y);

    if (d < radius) {
      t.cleaned = true;
      score++;
    }
  }
}

// =====================================================
// CAMERA
// =====================================================
function updateCamera() {
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;

  camera.x = clamp(camera.x, 0, world.width - canvas.width);
  camera.y = clamp(camera.y, 0, world.height - canvas.height);
}

// =====================================================
// SPRITE RENDER (SAFE + ROBUST)
// =====================================================
function drawSprite(img, e) {
  if (!img || !img.complete || img.width === 0) return;

  const fw = img.width / COLS;
  const fh = img.height / ROWS;

  ctx.drawImage(
    img,
    e.frame * fw,
    e.dir * fh,
    fw,
    fh,
    e.x - camera.x,
    e.y - camera.y,
    48,
    48
  );
}

// =====================================================
// TRASH RENDER (FIXED 8x10 GRID)
// =====================================================
function drawTrash() {
  const img = assets.trash;

  if (!img || !img.complete || img.width === 0) return;

  const fw = img.width / TRASH_COLS;
  const fh = img.height / TRASH_ROWS;

  for (const t of trash) {
    if (t.cleaned) continue;

    const f = t.frame;

    const sx = (f % TRASH_COLS) * fw;
    const sy = Math.floor(f / TRASH_COLS) * fh;

    ctx.drawImage(
      img,
      sx, sy, fw, fh,
      t.x - camera.x,
      t.y - camera.y,
      48,
      48
    );
  }
}

// =====================================================
// UI
// =====================================================
function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 20, 30);

  // rainbow charge bar (simple but stable)
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(20, 50, 200, 10);

  ctx.fillStyle = "cyan";
  ctx.fillRect(20, 50, Math.min(200, cleanCharge * 2), 10);
}

// =====================================================
// HELPERS
// =====================================================
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// =====================================================
// LOOP
// =====================================================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateFollower(holiday);
  updateFollower(stitch);

  updateTrash();
  updateCamera();

  if (cleaning) cleanCharge += 1.5;
  else cleanCharge *= 0.9;

  // RENDER ORDER (IMPORTANT)
  ctx.drawImage(assets.bg, 0, 0, canvas.width, canvas.height);

  drawTrash();

  drawSprite(assets.stitch, stitch);
  drawSprite(assets.holiday, holiday);
  drawSprite(assets.spirit, player);

  drawUI();

  requestAnimationFrame(loop);
}

loop();
