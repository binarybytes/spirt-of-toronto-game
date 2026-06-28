const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --------------------
// LOAD IMAGES
// --------------------
const playerImg = new Image();
playerImg.src = "player.png";

const bgImg = new Image();
bgImg.src = "background.png";

// --------------------
// PLAYER OBJECT
// --------------------
const player = {
  x: 400,
  y: 300,
  speed: 4,
  size: 32
};

// --------------------
// INPUT
// --------------------
const keys = {};

document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

// --------------------
// UPDATE LOGIC
// --------------------
function update() {
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;
}

// --------------------
// DRAW EVERYTHING
// --------------------
function draw() {
  // background
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // player
  ctx.drawImage(
    playerImg,
    player.x,
    player.y,
    player.size,
    player.size
  );
}

// --------------------
// GAME LOOP
// --------------------
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
