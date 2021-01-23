const message = "Satellite Transmission Error";
let messageLength = 0;

const WIDTH = 600;
const HEIGHT = 400;

function setup() {
  frameRate(15);
  let canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent("game");

  textSize(68);
  messageLength = textWidth(message);
  setColor("red");
}

function draw() {
  loadPixels();
  for (let i = 0; i < WIDTH * HEIGHT * 4; i += 4) {
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
