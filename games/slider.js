const WIDTH = 600;
const HEIGHT = 600;

const TILES_PER_SIDE = 4;
let TILE_SIZE;

let tiles;
let numTiles = TILES_PER_SIDE * TILES_PER_SIDE - 1;

let mouseLocation = {
  x: 0,
  y: 0,
};

function preload() {
  // preload assets here
}

function setup() {
  // setup stuff here
  const canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent("p5-container");
  initGame();
}

function initGame() {
  TILE_SIZE = width / TILES_PER_SIDE;
  tiles = [];
  for (let i = 0; i < TILES_PER_SIDE; i++) {
    tiles[i] = [];
    for (let j = 0; j < TILES_PER_SIDE; j++) {
      tiles[i][j] = {
        id: TILES_PER_SIDE * i + j,
        color: "blue",
        empty: false,
      };
    }
  }
  setEmptyTile();
  shuffleTiles();
}

function update() {}

function mouseClicked(event) {
  if (tiles) {
    checkTiles(mouseLocation.x, mouseLocation.y);
  }
}

function mouseMoved(event) {
  mouseLocation.x = Math.floor(mouseX / TILE_SIZE);
  mouseLocation.y = Math.floor(mouseY / TILE_SIZE);
}

function checkTiles(indexX, indexY) {
  if (!tiles[indexX][indexY].empty) {
    if (indexX !== 0 && tiles[indexX - 1][indexY].empty) {
      swapTiles(indexX, indexY, indexX - 1, indexY);
    } else if (
      indexX !== TILES_PER_SIDE - 1 &&
      tiles[indexX + 1][indexY].empty
    ) {
      swapTiles(indexX, indexY, indexX + 1, indexY);
    } else if (indexY !== 0 && tiles[indexX][indexY - 1].empty) {
      swapTiles(indexX, indexY, indexX, indexY - 1);
    } else if (
      indexY !== TILES_PER_SIDE - 1 &&
      tiles[indexX][indexY + 1].empty
    ) {
      swapTiles(indexX, indexY, indexX, indexY + 1);
    }
  }
}

function swapTiles(x1, y1, x2, y2) {
  let tempTile1 = tiles[x1][y1];
  let tempTile2 = tiles[x2][y2];
  tiles[x1][y1] = tempTile2;
  tiles[x2][y2] = tempTile1;
}

function setEmptyTile() {
  const index = getRandomIndex();
  tiles[index.x][index.y].empty = true;
}

function shuffleTiles() {
  for (let i = 0; i < 1000; i++) {
    const index1 = getRandomIndex();
    const index2 = getRandomIndex();
    let temp = tiles[index1.x][index1.y];
    tiles[index1.x][index1.y] = tiles[index2.x][index2.y];
    tiles[index2.x][index2.y] = temp;
  }
}

function getRandomIndex() {
  randomIndex = { x: 0, y: 0 };
  randomIndex.x = Math.floor(Math.random() * TILES_PER_SIDE);
  randomIndex.y = Math.floor(Math.random() * TILES_PER_SIDE);
  return randomIndex;
}

// p5.draw is called @ 60fps by default
function draw() {
  // update game logic
  update();

  background("black");
  for (let i = 0; i < tiles.length; i++) {
    for (let j = 0; j < tiles[i].length; j++) {
      setColor("white");
      if (!tiles[i][j].empty) {
        fill(tiles[i][j].color);
        rect(
          (width / TILES_PER_SIDE) * i,
          (height / TILES_PER_SIDE) * j,
          width / TILES_PER_SIDE,
          height / TILES_PER_SIDE
        );
        setColor("black");
        text(
          tiles[i][j].id,
          (width / TILES_PER_SIDE) * i + 10,
          (height / TILES_PER_SIDE) * j + 20
        );
      }
    }
  }
  setColor("red", true);
  rect(
    mouseLocation.x * TILE_SIZE + 1,
    mouseLocation.y * TILE_SIZE + 1,
    TILE_SIZE - 2,
    TILE_SIZE - 2
  );
}

function setColor(newColor, noFill) {
  if (noFill) {
    stroke(newColor);
    fill(color(0, 0, 0, 0.25));
  } else {
    stroke(newColor);
    fill(newColor);
  }
}
