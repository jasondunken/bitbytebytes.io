const WIDTH = 600;
const HEIGHT = 600;

const STARTING_TILES_PER_SIDE = 2;
let tilesPerSide;
let tileSize;

let tiles;

let playing = false;
let level = 0;
let turns = 0;

let breakTimer = 0;

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
  tilesPerSide = STARTING_TILES_PER_SIDE + level;
  tileSize = width / tilesPerSide;
  tiles = [];
  for (let i = 0; i < tilesPerSide; i++) {
    tiles[i] = [];
    for (let j = 0; j < tilesPerSide; j++) {
      tiles[i][j] = {
        id: tilesPerSide * i + j,
        color: "blue",
        empty: false,
      };
    }
  }
  shuffleTiles(1000);
}

function update() {
  breakTimer--;
  if (breakTimer <= 0 && !playing) {
    initGame();
  }
}

function mouseClicked(event) {
  const clickX = Math.floor(mouseX / tileSize);
  const clickY = Math.floor(mouseY / tileSize);
  if (
    playing &&
    tiles &&
    clickX >= 0 &&
    clickY >= 0 &&
    clickX < tilesPerSide &&
    clickY < tilesPerSide
  ) {
    turns++;
    checkTiles(clickX, clickY);
    checkForWin();
  }
}

function checkTiles(indexX, indexY) {
  if (!tiles[indexX][indexY].empty) {
    if (indexX !== 0 && tiles[indexX - 1][indexY].empty) {
      swapTiles(indexX, indexY, indexX - 1, indexY);
    } else if (indexX !== tilesPerSide - 1 && tiles[indexX + 1][indexY].empty) {
      swapTiles(indexX, indexY, indexX + 1, indexY);
    } else if (indexY !== 0 && tiles[indexX][indexY - 1].empty) {
      swapTiles(indexX, indexY, indexX, indexY - 1);
    } else if (indexY !== tilesPerSide - 1 && tiles[indexX][indexY + 1].empty) {
      swapTiles(indexX, indexY, indexX, indexY + 1);
    }
  }
}

function checkForWin() {
  let gameOver = true;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = 0; j < tiles[i].length; j++) {
      if (tiles[i][j].id !== tilesPerSide * i + j) {
        gameOver = false;
      }
    }
  }
  if (gameOver) {
    playing = false;
    level++;
    breakTimer = 300;
  }
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

  if (emptyTileIndex.x + 1 < tilesPerSide) {
    let n2 = { x: emptyTileIndex.x + 1, y: emptyTileIndex.y };
    if (tiles[n2.x][n2.y]) neighbors.push(n2);
  }

  if (emptyTileIndex.y - 1 >= 0) {
    let n3 = { x: emptyTileIndex.x, y: emptyTileIndex.y - 1 };
    if (tiles[n3.x][n3.y]) neighbors.push(n3);
  }

  if (emptyTileIndex.y + 1 < tilesPerSide) {
    let n4 = { x: emptyTileIndex.x, y: emptyTileIndex.y + 1 };
    if (tiles[n4.x][n4.y]) neighbors.push(n4);
  }
  return neighbors;
}

function getRandomIndex() {
  randomIndex = { x: 0, y: 0 };
  randomIndex.x = Math.floor(Math.random() * tilesPerSide);
  randomIndex.y = Math.floor(Math.random() * tilesPerSide);
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
        if (playing) {
          fill(tiles[i][j].color);
        } else {
          fill("red");
        }
        rect(
          (width / tilesPerSide) * i,
          (height / tilesPerSide) * j,
          width / tilesPerSide,
          height / tilesPerSide
        );
        setColor("white");
        text(
          tiles[i][j].id,
          (width / tilesPerSide) * i + 10,
          (height / tilesPerSide) * j + 20
        );
      }
    }
  }
  if (playing) {
    setColor("red", true);
    rect(
      Math.floor(mouseX / tileSize) * tileSize,
      Math.floor(mouseY / tileSize) * tileSize,
      tileSize - 2,
      tileSize - 2
    );
  }
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
