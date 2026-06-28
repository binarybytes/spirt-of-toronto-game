const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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

// =====================
// LOAD FLAGS
// =====================
let bgReady = false;
let spiritReady = false;
let holidayReady = false;
let stitchReady = false;

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
// CHARACTER SYSTEM (UNIFIED)
// =====================
const SPRITE_COLS = 4;
const SPRITE_ROWS = 5;

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
// HOLIDAY (NPC)
// =====================
const holiday = {
  x: 300,
  y: 300,
  moving: false,
  dir: 0,
  frame: 0,
  tick: 0
};

// =====================
// STITCH (NPC)
// =====================
const stitch = {
  x: 500,
  y: 200,
  moving: false,
  dir: 0,
  frame: 0,
  tick: 0
};

// =====================
// GAME STATE / NEXT STEPS SYSTEM
// =====================
const game = {
  mission: "find_holiday",
  missionComplete: false,
  canInteract: false,
  nearbyNPC: null
};

// =====================
// LOADERS
// =====================
bgImg.onload = () => bgReady = true;

spiritImg.onload = () => spiritReady = true;
holidayImg.onload = () => holidayReady = true;
stitchImg.onload = () => stitchReady = true;

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
// NPC AI (HOLIDAY)
// =====================
function updateHoliday() {
  const dx = player.x - holiday.x;
  const dy = player.y - holiday.y;
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d > 2) {
    holiday.x += (dx / d) * 2;
    holiday.y += (dy / d) * 2;
    holiday.moving = true;
  } else {
    holiday.moving = false;
  }

  holiday.dir = Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 3 : 2)
    : (dy > 0 ? 0 : 1);

  holiday.tick++;
  if (holiday.tick % 10 === 0) {
    holiday.frame = (holiday.frame + 1) % SPRITE_COLS;
  }
}

// =====================
// STITCH AI (IDLE PATROL)
// =====================
function updateStitch() {
  stitch.tick++;

  stitch.x += Math.sin(Date.now() * 0.001) * 0.3;

  stitch.dir = 0;

  if (stitch.tick % 12 === 0) {
    stitch.frame = (stitch.frame + 1) % SPRITE_COLS;
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
// ANIMATION (PLAYER)
// =====================
function updateAnimation() {
  if (!player.moving) {
    player.frame = 0;
    return;
  }

  player.tick++;
  if (player.tick % 10 === 0) {
    player.frame = (player.frame + 1) % SPRITE_COLS;
  }
}

// =====================
// BACKGROUND (FIXED FOR SMALL IMAGE)
// =====================
function drawBackground() {
  if (!bgReady) {
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const x = (canvas.width / 2) - (bgImg.width / 2) - camera.x * 0.05;
  const y = (canvas.height / 2) - (bgImg.height / 2) - camera.y * 0.05;

  ctx.drawImage(bgImg, x, y);
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
// GENERIC SPRITE DRAW
// =====================
function drawSprite(img, obj) {
  const fw = img.width / SPRITE_COLS;
  const fh = img.height / SPRITE_ROWS;

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
// DRAW
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
// INTERACTION SYSTEM (NEXT STEP HOOK)
// =====================
function checkInteraction() {
  game.canInteract = false;
  game.nearbyNPC = null;

  const npcs = [holiday, stitch];

  for (let npc of npcs) {
    const dx = player.x - npc.x;
    const dy = player.y - npc.y;

    if (Math.sqrt(dx * dx + dy * dy) < 40) {
      game.canInteract = true;
      game.nearbyNPC = npc;
    }
  }

  if (game.canInteract && keys["e"]) {
    console.log("Interact with NPC!");
  }

  if (game.mission === "find_holiday") {
    const dx = player.x - holiday.x;
    const dy = player.y - holiday.y;

    if (Math.sqrt(dx * dx + dy * dy) < 30) {
      game.missionComplete = true;
      console.log("MISSION COMPLETE: Found Holiday!");
    }
  }
}

// =====================
// LOOP
// =====================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateHoliday();
  updateStitch();
  updateAnimation();
  updateCamera();
  checkInteraction();

  drawBackground();
  drawMap();
  drawStitch();
  drawHoliday();
  drawPlayer();

  requestAnimationFrame(loop);
}
