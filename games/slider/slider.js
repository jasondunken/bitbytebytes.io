const RESTART_BUTTON = document
    .getElementById("restart")
    .addEventListener("click", () => {
        this.initGame();
    });

const WIDTH = 512;
const HEIGHT = 512;

const STARTING_TILES_PER_SIDE = 2;
let tilesPerSide;
let tileSize;

let tiles;

let playing = false;
let level = 0;
let turns = 0;

let images = [];
let currentImage = null;
let emptyTile = null;

const IMAGE_SPLASH_TIME = 300;
let splashTimer = 0;

const WIN_BREAK_TIME = 300;
let breakTimer = 0;

const levelTextX = WIDTH / 2;
const LEVEL_TEXT_Y_MAX = HEIGHT / 2;
const LEVEL_TEXT_Y_START_POS = -32;
let levelTextY = LEVEL_TEXT_Y_START_POS;

function preload() {
    images.push(loadImage("./slider/res/img/image_1.png"));
    images.push(loadImage("./slider/res/img/image_2.png"));
    images.push(loadImage("./slider/res/img/image_3.png"));
    images.push(loadImage("./slider/res/img/image_4.png"));
    images.push(loadImage("./slider/res/img/image_5.png"));
    images.push(loadImage("./slider/res/img/image_6.png"));
    images.push(loadImage("./slider/res/img/image_7.png"));
    images.push(loadImage("./slider/res/img/image_8.png"));
    images.push(loadImage("./slider/res/img/image_9.png"));
    images.push(loadImage("./slider/res/img/image_10.png"));
}

function setup() {
    const canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent("game");
    initGame();
}

function initGame() {
    levelStarting = true;
    levelTextY = LEVEL_TEXT_Y_START_POS;
    turns = 0;
    let currentImageIndex = level % images.length;
    currentImage = images[currentImageIndex];
    tilesPerSide = STARTING_TILES_PER_SIDE + level;
    tileSize = width / tilesPerSide;
    tiles = [];
    for (let i = 0; i < tilesPerSide; i++) {
        tiles[i] = [];
        for (let j = 0; j < tilesPerSide; j++) {
            let tileImage = createImage(tileSize, tileSize);
            tileImage.copy(
                currentImage,
                (currentImage.width / tilesPerSide) * i,
                (currentImage.height / tilesPerSide) * j,
                currentImage.width / tilesPerSide,
                currentImage.height / tilesPerSide,
                0,
                0,
                tileSize,
                tileSize
            );
            tiles[i][j] = {
                id: tilesPerSide * i + j,
                color: "blue",
                tileImage,
                empty: false,
            };
        }
    }
    shuffleTiles(999 * level + 1);
    splashTimer = IMAGE_SPLASH_TIME;
}

function update() {
    if (splashTimer > 0) {
        levelTextY += 3;
        if (levelTextY >= LEVEL_TEXT_Y_MAX) {
            levelTextY = LEVEL_TEXT_Y_MAX;
        }
        splashTimer--;
        if (splashTimer <= 0) {
            levelStarting = false;
            playing = true;
        }
    }
    if (breakTimer > 0) {
        breakTimer--;
        if (breakTimer <= 0 && !playing) {
            initGame();
        }
    }
}

function mouseClicked(event) {
    if (playing) {
        const clickX = Math.floor(mouseX / tileSize);
        const clickY = Math.floor(mouseY / tileSize);
        if (
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
}

function checkTiles(indexX, indexY) {
    if (!tiles[indexX][indexY].empty) {
        const tileSound = new Audio();
        tileSound.src = "./slider/res/snd/click.wav";
        tileSound.play();
        if (indexX !== 0 && tiles[indexX - 1][indexY].empty) {
            swapTiles(indexX, indexY, indexX - 1, indexY);
        } else if (
            indexX !== tilesPerSide - 1 &&
            tiles[indexX + 1][indexY].empty
        ) {
            swapTiles(indexX, indexY, indexX + 1, indexY);
        } else if (indexY !== 0 && tiles[indexX][indexY - 1].empty) {
            swapTiles(indexX, indexY, indexX, indexY - 1);
        } else if (
            indexY !== tilesPerSide - 1 &&
            tiles[indexX][indexY + 1].empty
        ) {
            swapTiles(indexX, indexY, indexX, indexY + 1);
        } else {
            const tileSound = new Audio();
            tileSound.src = "./slider/res/snd/dud.wav";
            tileSound.play();
        }
    } else {
        const tileSound = new Audio();
        tileSound.src = "./slider/res/snd/dud.wav";
        tileSound.play();
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
        const winSound = new Audio();
        winSound.src = "./slider/res/snd/win.wav";
        winSound.play();
        emptyTile.empty = false;
        playing = false;
        level++;
        breakTimer = WIN_BREAK_TIME;
    }
}

function swapTiles(x1, y1, x2, y2) {
    let tile1 = tiles[x1][y1];
    let tile2 = tiles[x2][y2];
    tiles[x1][y1] = tile2;
    tiles[x2][y2] = tile1;
}

function shuffleTiles(times) {
    let index = getRandomIndex();
    tiles[index.x][index.y].empty = true;
    emptyTile = tiles[index.x][index.y];
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

    background("gray");
    setColor("white");

    // draw background
    for (let i = 0; i < width / 32; i++) {
        for (let j = 0; j < height / 32; j++) {
            if ((j + i) % 2 === 0) {
                rect(i * 32, j * 32, 32, 32);
            }
        }
    }

    if (levelStarting) {
        image(currentImage, 0, 0, width, height);
        textAlign(CENTER, CENTER);
        textSize(48);
        stroke("black");
        strokeWeight(4);
        text(`${level + 2} x ${level + 2}`, levelTextX, levelTextY);
    } else {
        for (let i = 0; i < tiles.length; i++) {
            for (let j = 0; j < tiles[i].length; j++) {
                setColor("white");
                if (!tiles[i][j].empty) {
                    image(
                        tiles[i][j].tileImage,
                        (width / tilesPerSide) * i,
                        (height / tilesPerSide) * j
                    );
                    if (playing) {
                        setColor("orange", true);
                        strokeWeight(2);
                        rect(
                            (width / tilesPerSide) * i + 1,
                            (height / tilesPerSide) * j + 1,
                            tileSize - 2,
                            tileSize - 2
                        );
                    }
                }
            }
        }
    }
    if (playing) {
        setColor("black", true);
        strokeWeight(1);
        for (let i = 1; i < tilesPerSide; i++) {
            line(i * tileSize, 0, i * tileSize, height);
            line(0, i * tileSize, width, i * tileSize);
        }
        setColor("green", true);
        strokeWeight(4);
        rect(
            Math.floor(mouseX / tileSize) * tileSize + 2,
            Math.floor(mouseY / tileSize) * tileSize + 2,
            tileSize - 4,
            tileSize - 4
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
