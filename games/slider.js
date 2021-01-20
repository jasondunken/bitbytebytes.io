const WIDTH = 600;
const HEIGHT = 600;

const TILES_PER_SIDE = 4;
let tiles;
let numTiles = (TILES_PER_SIDE * TILES_PER_SIDE) - 1;

function preload() {
    // preload assets here
}

function setup() {
    // setup stuff here
    const canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent('p5-container');
    initGame();
}

function initGame() {
    tiles = [];
    for (let i = 0; i < TILES_PER_SIDE; i++) {
        tiles[i] = [];
        for (let j = 0; j < TILES_PER_SIDE; j++) {
            tiles[i][j] = TILES_PER_SIDE * i + j;
        }
    }
    console.log(tiles);
}

function update() {
    //xPos++;
}

// p5.draw is called @ 60fps by default
function draw() {
    // update game logic
    update();

    background('black');
    setColor('beige');
    noStroke();
    ellipse(WIDTH / 2, HEIGHT / 2, 200, 200);
    setColor('black');
    line(WIDTH / 2 - 100, HEIGHT / 2, WIDTH / 2 + 100, HEIGHT / 2);
}

function setColor(newColor) {
    stroke(newColor);
    fill(newColor);
}
