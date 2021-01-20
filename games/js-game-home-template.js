const message = "Satellite Transmission Error";
let messageLength = 0;

let x = 0;
let y = 0;

function setup() {
  frameRate(15);
  let canvas = createCanvas(600, 400);
  canvas.parent("game");
  y = canvas.height / 2;
  x = canvas.width;

  textSize(68);
  messageLength = textWidth(message);
  setColor("red");
}

function draw() {
  loadPixels();
  for (let i = 0; i < 600 * 400 * 4; i += 4) {
    let flip = Math.random() < 0.5 ? 0 : 255;
    //     r               g               b
    pixels[i] = pixels[i + 1] = pixels[i + 2] = flip;
    //         alpha
    pixels[i + 3] = 255;
  }
  updatePixels();

  text(message, x, y);
  x -= 2;
  if (x <= 0 - messageLength) {
    x = canvas.width;
  }
}

function setColor(newColor) {
  stroke(newColor);
  fill(newColor);
}
