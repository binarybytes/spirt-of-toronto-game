const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --------------------
// LOAD SPRITE
// --------------------
const spiritImg = new Image();
spiritImg.src = "assets/spirit.png";

// --------------------
// PLAYER
// --------------------
const player = {
  x: 300,
  y: 300,
  speed: 4
};

// --------------------
// INPUT
// --------------------
const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// --------------------
// UPDATE
// --------------------
function update() {
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;
}

// --------------------
// DRAW
// --------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    spiritImg,
    player.x,
    player.y,
    48,
    48
  );
}

// --------------------
// LOOP
// --------------------
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// --------------------
// START ONLY WHEN IMAGE LOADS
// --------------------
spiritImg.onload = () => {
  console.log("Spirit loaded");
  loop();
};
