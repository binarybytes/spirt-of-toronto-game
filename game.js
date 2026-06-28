"use strict";

// =====================================================
// CANVAS
// =====================================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

// =====================================================
// ASSETS
// =====================================================
const assets = {
  bg: load("assets/background.png"),
  spirit: load("assets/spirit.png"),
  holiday: load("assets/holiday.png"),
  stitch: load("assets/stitch.png"),
  trash: load("assets/tsprites.png")
};

function load(src) {
  const img = new Image();
  img.src = src;
  return img;
}

// =====================================================
// CONSTANTS
// =====================================================
const SPRITE_COLS = 4;
const SPRITE_ROWS = 5;

const TRASH_COLS = 8;
const TRASH_ROWS = 10;
const TRASH_FRAMES = TRASH_COLS * TRASH_ROWS;

// =====================================================
// INPUT
// =====================================================
const keys = Object.create(null);

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Space") beamStart();
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
  if (e.code === "Space") beamEnd();
});

// =====================================================
// WORLD
// =====================================================
const world = {
  width: 2000,
  height: 1200
};

const camera = { x: 0, y: 0 };

// =====================================================
// ENTITIES
// =====================================================
const player = createActor(120, 120);
const holiday = createFollower(320, 260, 2);
const stitch = createFollower(520, 180, 1.6);

// STATIC TRASH (NO ANIMATION)
const trash = [
  createTrash(260, 240),
  createTrash(520, 320),
  createTrash(740, 460),
  createTrash(900, 300),
  createTrash(1100, 500)
];

let score = 0;

// =====================================================
// BEAM SYSTEM
// =====================================================
let beamActive = false;
let beamPower = 0;

// =====================================================
// FACTORIES
// =====================================================
function createActor(x, y) {
  return {
    x, y,
    dir: 0,
    frame: 0,
    tick: 0,
    speed: 4,
    moving: false
  };
}

function createFollower(x, y, speed) {
  return {
    x, y,
    speed,
    dir: 0,
    frame: 0,
    tick: 0
  };
}

function createTrash(x, y) {
  return {
    x,
    y,
    frame: Math.floor(Math.random() * TRASH_FRAMES), // STATIC ONCE
    cleaned: false
  };
}

// =====================================================
// PLAYER
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
// FOLLOW AI
// =====================================================
function updateFollower(f) {
  const dx = player.x - f.x;
  const dy = player.y - f.y;
  const d = Math.hypot(dx, dy);

  if (d > 2) {
    f.x += (dx / d) * f.speed;
    f.y += (dy / d) * f.speed;
  }
}

// =====================================================
// CAMERA
// =====================================================
function updateCamera() {
  camera.x = clamp(player.x - canvas.width / 2, 0, world.width - canvas.width);
  camera.y = clamp(player.y - canvas.height / 2, 0, world.height - canvas.height);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// =====================================================
// TRASH (NO ANIMATION ANYMORE)
// =====================================================
function updateTrash() {
  // intentionally empty
}

// =====================================================
// BEAM LOGIC
// =====================================================
function beamStart() {
  beamActive = true;
}

function beamEnd() {
  beamActive = false;

  if (beamPower > 25) {
    burstClean();
  }

  beamPower = 0;
}

function updateBeam() {
  if (beamActive) beamPower += 2;
  else beamPower *= 0.9;
}

function burstClean() {
  const radius = 150;

  for (const t of trash) {
    if (t.cleaned) continue;

    const d = Math.hypot(player.x - t.x, player.y - t.y);

    if (d < radius) {
      t.cleaned = true;
      score += 10;
    }
  }
}

// =====================================================
// SPRITE RENDER
// =====================================================
function drawSprite(img, e) {
  if (!img || !img.complete || img.width === 0) return;

  const fw = img.width / SPRITE_COLS;
  const fh = img.height / SPRITE_ROWS;

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
// TRASH RENDER (FIXED STATIC SPRITESHEET USAGE)
// =====================================================
function drawTrash() {
  const img = assets.trash;
  if (!img || !img.complete || img.width === 0) return;

  const fw = img.width / TRASH_COLS;
  const fh = img.height / TRASH_ROWS;

  for (const t of trash) {
    if (t.cleaned) continue;

    const sx = (t.frame % TRASH_COLS) * fw;
    const sy = Math.floor(t.frame / TRASH_COLS) * fh;

    ctx.drawImage(
      img,
      sx,
      sy,
      fw,
      fh,
      t.x - camera.x,
      t.y - camera.y,
      48,
      48
    );
  }
}

// =====================================================
// RAINBOW BEAM VISUAL
// =====================================================
function drawBeam() {
  if (!beamActive) return;

  const x = player.x - camera.x + 24;
  const y = player.y - camera.y + 24;

  const r = 150;

  const grad = ctx.createRadialGradient(x, y, 10, x, y, r);
  grad.addColorStop(0, "rgba(255,0,255,0.6)");
  grad.addColorStop(0.3, "rgba(0,255,255,0.5)");
  grad.addColorStop(0.6, "rgba(255,255,0,0.3)");
  grad.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// =====================================================
// UI
// =====================================================
function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 20, 30);
}

// =====================================================
// LOOP
// =====================================================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateFollower(holiday);
  updateFollower(stitch);
  updateBeam();
  updateTrash();
  updateCamera();

  ctx.drawImage(assets.bg, 0, 0, canvas.width, canvas.height);

  drawTrash();
  drawBeam();

  drawSprite(assets.stitch, stitch);
  drawSprite(assets.holiday, holiday);
  drawSprite(assets.spirit, player);

  drawUI();

  requestAnimationFrame(loop);
}

loop();
