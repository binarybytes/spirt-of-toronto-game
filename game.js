const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =====================
// CANVAS SIZE
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
spiritImg.src = "assets/holiday.png";

const stitchImg = new Image();
stitchImg.src = "assets/stitch.png";

// NEW TRASH SHEET (8x10)
const tsprites = new Image();
tsprites.src = "assets/tsprites.png";

// =====================
// LOAD FLAGS
// =====================
let bgReady = false;
bgImg.onload = () => bgReady = true;

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

  if (e.code === "Space") {
    startClean();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;

  if (e.code === "Space") {
    stopClean();
  }
});

// =====================
// SPRITE SETTINGS (YOUR ENGINE)
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
const holiday = {
  x: 300,
  y: 300,
  frame: 0,
  tick: 0,
  dir: 0
};

const stitch = {
  x: 500,
  y: 200,
  frame: 0,
  tick: 0,
  dir: 0
};

// =====================
// TRASH SYSTEM
// =====================
const trash = [
  { x: 250, y: 250, cleaned: false, frame: 0, tick: 0 },
  { x: 500, y: 300, cleaned: false, frame: 0, tick: 0 },
  { x: 700, y: 450, cleaned: false, frame: 0, tick: 0 }
];

let score = 0;

// CLEAN STATE
let cleaning = false;
let cleanProgress = 0;
let targetTrash = null;

// =====================
// MOVEMENT (UNCHANGED)
// =====================
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

function updateFollowers() {
  follow(holiday, 2);
  follow(stitch, 1.5);
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
// TRASH ANIMATION (8x10 SAFE)
// =====================
function updateTrash() {
  trash.forEach(t => {
    if (t.cleaned) return;

    t.tick++;
    if (t.tick % 15 === 0) {
      t.frame = (t.frame + 1) % 80; // 8x10 = 80 frames
    }
  });
}

// =====================
// CLEAN SYSTEM
// =====================
function startClean() {
  if (cleaning) return;

  targetTrash = trash.find(t => {
    if (t.cleaned) return false;
    return Math.hypot(player.x - t.x, player.y - t.y) < 50;
  });

  if (targetTrash) {
    cleaning = true;
    cleanProgress = 0;
  }
}

function stopClean() {
  cleaning = false;
  cleanProgress = 0;
  targetTrash = null;
}

function updateClean() {
  if (!cleaning || !targetTrash) return;

  cleanProgress += 2;

  if (cleanProgress >= 100) {
    targetTrash.cleaned = true;
    score++;

    cleaning = false;
    cleanProgress = 0;
    targetTrash = null;
  }
}

// =====================
// YOUR ORIGINAL SPRITE ENGINE (UNCHANGED)
// =====================
function drawSprite(img, obj) {
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
// TRASH DRAW (FIXED FOR 8x10)
// =====================
function drawTrash() {
  if (!tsprites.complete) return;

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
// BACKGROUND + MAP
// =====================
function drawBackground() {
  if (!bgReady) return;

  ctx.drawImage(
    bgImg,
    -camera.x * 0.1,
    -camera.y * 0.1,
    canvas.width,
    canvas.height
  );
}

function drawMap() {
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      ctx.fillStyle = map[r][c] === 1
        ? "rgba(80,80,80,0.6)"
        : "rgba(20,20,20,0.4)";

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
// LOOP
// =====================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateFollowers();
  updateTrash();
  updateClean();
  updateCamera();

  drawBackground();
  drawMap();

  drawTrash();

  drawSprite(stitchImg, stitch);
  drawSprite(holidayImg, holiday);
  drawSprite(spiritImg, player);

  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 20, 40);

  requestAnimationFrame(loop);
}

loop();
