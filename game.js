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

const tsprites = new Image();
tsprites.src = "assets/tsprites.png";

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

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.code === "Space") cleaning = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;

  if (e.code === "Space") {
    cleaning = false;

    if (cleanCharge > 40) {
      burstClean();
    }

    cleanCharge = 0;
  }
});

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
// NPCS
// =====================
const holiday = { x: 300, y: 300, frame: 0, tick: 0, dir: 0 };
const stitch = { x: 500, y: 200, frame: 0, tick: 0, dir: 0 };

// =====================
// TRASH
// =====================
const trash = [
  { x: 250, y: 250, cleaned: false, frame: 0, tick: 0 },
  { x: 500, y: 300, cleaned: false, frame: 0, tick: 0 },
  { x: 700, y: 450, cleaned: false, frame: 0, tick: 0 }
];

let score = 0;

// =====================
// CLEAN SYSTEM
// =====================
let cleaning = false;
let cleanCharge = 0;

// =====================
// PLAYER MOVEMENT
// =====================
function updatePlayer() {
  player.moving = false;

  if (keys["ArrowUp"]) { player.y -= player.speed; player.dir = 1; player.moving = true; }
  else if (keys["ArrowDown"]) { player.y += player.speed; player.dir = 0; player.moving = true; }
  else if (keys["ArrowLeft"]) { player.x -= player.speed; player.dir = 2; player.moving = true; }
  else if (keys["ArrowRight"]) { player.x += player.speed; player.dir = 3; player.moving = true; }
}

// =====================
// FOLLOW SYSTEM
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
// TRASH UPDATE
// =====================
function updateTrash() {
  trash.forEach(t => {
    if (t.cleaned) return;

    t.tick++;
    if (t.tick % 18 === 0) {
      t.frame = (t.frame + 1) % 80;
    }
  });
}

// =====================
// BURST CLEAN (SPACE RELEASE)
// =====================
function burstClean() {
  trash.forEach(t => {
    if (t.cleaned) return;

    const dist = Math.hypot(player.x - t.x, player.y - t.y);

    if (dist < 120) {
      t.cleaned = true;
      score++;
    }
  });
}

// =====================
// DRAW SPRITE (SAFE)
// =====================
function drawSprite(img, obj) {
  if (!img || !img.complete || img.width === 0) return;

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
// TRASH DRAW (8x10 SAFE)
// =====================
function drawTrash() {
  if (!tsprites || !tsprites.complete || tsprites.width === 0) return;

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
      fx,
      fy,
      fw,
      fh,
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
  follow(holiday, 2);
  follow(stitch, 1.5);

  updateTrash();
  updateCamera();

  if (cleaning) cleanCharge += 1.5;
  else cleanCharge *= 0.9;

  drawBackground();

  drawTrash();

  drawSprite(stitchImg, stitch);
  drawSprite(holidayImg, holiday);
  drawSprite(spiritImg, player);

  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 20, 40);

  // clean bar
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(20, 20, 200, 10);

  ctx.fillStyle = "cyan";
  ctx.fillRect(20, 20, Math.min(200, cleanCharge * 2), 10);

  requestAnimationFrame(loop);
}

loop();
