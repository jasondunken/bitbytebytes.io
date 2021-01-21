const WIDTH = 600;
const HEIGHT = 600;

const TILES_PER_SIDE = 6;
let TILE_SIZE;

let tiles;

let playing = false;
let turns = 0;

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
  playing = true;
  turns = 0;
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
  shuffleTiles(1000);
}

function update() {}

function mouseClicked(event) {
  const clickX = Math.floor(mouseX / TILE_SIZE);
  const clickY = Math.floor(mouseY / TILE_SIZE);
  if (
    playing &&
    tiles &&
    clickX >= 0 &&
    clickY >= 0 &&
    clickX < TILES_PER_SIDE &&
    clickY < TILES_PER_SIDE
  ) {
    turns++;
    checkTiles(clickX, clickY);
    playing = !checkForWin();
  }
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

function checkForWin() {
  for (let i = 0; i < tiles.length; i++) {
    for (let j = 0; j < tiles[i].length; j++) {
      if (tiles[i][j].id !== TILES_PER_SIDE * i + j) {
        return false;
      }
    }
  }
  return true;
}

function swapTiles(x1, y1, x2, y2) {
  let tempTile1 = tiles[x1][y1];
  let tempTile2 = tiles[x2][y2];
  tiles[x1][y1] = tempTile2;
  tiles[x2][y2] = tempTile1;
}

function shuffleTiles(times) {
  let index = getRandomIndex();
  tiles[index.x][index.y].empty = true;
  for (let i = 0; i < times; i++) {
    let neighbors = getNeighbors(index);
    if (neighbors.length > 0) {
      let roll = Math.floor(Math.random() * neighbors.length);
      neighbor = neighbors[roll];
      swapTiles(index.x, index.y, neighbor.x, neighbor.y);
      index = neighbor;
    }
  }
}

function getNeighbors(emptyTileIndex) {
  let neighbors = [];
  if (emptyTileIndex.x - 1 >= 0) {
    let n1 = { x: emptyTileIndex.x - 1, y: emptyTileIndex.y };
    if (tiles[n1.x][n1.y]) neighbors.push(n1);
  }

  if (emptyTileIndex.x + 1 < TILES_PER_SIDE) {
    let n2 = { x: emptyTileIndex.x + 1, y: emptyTileIndex.y };
    if (tiles[n2.x][n2.y]) neighbors.push(n2);
  }

  if (emptyTileIndex.y - 1 >= 0) {
    let n3 = { x: emptyTileIndex.x, y: emptyTileIndex.y - 1 };
    if (tiles[n3.x][n3.y]) neighbors.push(n3);
  }

  if (emptyTileIndex.y + 1 < TILES_PER_SIDE) {
    let n4 = { x: emptyTileIndex.x, y: emptyTileIndex.y + 1 };
    if (tiles[n4.x][n4.y]) neighbors.push(n4);
  }
  return neighbors;
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
        setColor("white");
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
    Math.floor(mouseX / TILE_SIZE) * TILE_SIZE,
    Math.floor(mouseY / TILE_SIZE) * TILE_SIZE,
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
