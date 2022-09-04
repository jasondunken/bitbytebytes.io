GAME_WIDTH = 960;
GAME_HEIGHT = 540;

game = null;

function preload() {}

function setup() {
    frameRate(30);
    const canvas = createCanvas(GAME_WIDTH, GAME_HEIGHT);
    canvas.parent("game");
    game = new MineSquadPlus(GAME_WIDTH, GAME_HEIGHT, null);
    game.startDemo();
}

function draw() {
    //game.update();
    game.render();
}

function mousePressed(event) {
    if (this.game) {
        this.game.handleMouseClick(mouseX, mouseY);
    }
}

class MineSquadPlus {
    PLAYER_1_START_BUTTON = document.getElementById("start-1p").addEventListener("click", () => {
        this.start1Player();
    });

    TILES_PER_COLUMN = 16;
    TILES_PER_ROW = 30;
    TILE_HEIGHT = 30;
    HALF_TILE = Math.floor(this.TILE_HEIGHT / 2);

    BOARD_X_OFFSET = 30;
    BOARD_Y_OFFSET = 4;
    BOMB_HEIGHT = this.TILE_HEIGHT * 0.7;
    TOTAL_TILES = this.TILES_PER_COLUMN * this.TILES_PER_ROW;
    MAX_MINES = 99;
    MAX_SQUADS = 3;
    SQUAD_COST = 1000;
    TILE_SCORE = 10;
    TILE_BONUS = 100;
    FLAG_PENALTY = 25;

    tileIndexX = 0;
    tileIndexY = 0;
    tile = null;

    playing = false;
    winner = false;
    board = [];
    score = 0;
    time = 0;
    squadsLeft = 0;
    minesUncovered = 0;
    constructor(width, height, sprites) {
        this.width = width;
        this.height = height;
        this.sprites = sprites;
        // this.BOARD_X_OFFSET = (this.width - this.TILES_PER_ROW * this.TILE_HEIGHT) / 2;
        this.BOARD_X_OFFSET = 30;
    }

    startDemo() {
        this.startGame();
    }

    start1Player() {
        this.startGame();
    }

    startGame() {
        this.time = 0;
        this.score = 0;
        this.squadsLeft = this.MAX_SQUADS;
        this.minesUncovered = 0;
        this.board = this.initializeBoard();
        this.playing = true;
        this.winner = false;
    }

    update() {}

    render() {
        const SCOREBOARD_HEIGHT = this.height - (this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.BOARD_Y_OFFSET);
        const minesLeftBox = Math.floor(SCOREBOARD_HEIGHT / 2);

        textSize(this.TILE_HEIGHT);
        textAlign(CENTER, CENTER);
        textSize(28);
        strokeWeight(1);
        setColor("darkgray");
        // background
        rect(0, 0, this.width, this.height);

        setColor("black");
        // draws dashboard
        rect(
            4,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT + 4 + this.BOARD_Y_OFFSET,
            this.width - 8,
            SCOREBOARD_HEIGHT - 8
        );

        // draws hidden tiles counter
        fill("gray");
        let minesLeftBoxX = this.TILES_PER_ROW * this.TILE_HEIGHT - (minesLeftBox + minesLeftBox / 2) - 64;
        let minesLeftBoxY = this.TILES_PER_COLUMN * this.TILE_HEIGHT + minesLeftBox / 2 + this.BOARD_Y_OFFSET;
        rect(minesLeftBoxX, minesLeftBoxY, minesLeftBox * 2, minesLeftBox);
        fill("red");
        if (this.playing) {
            text("" + this.getNumHiddenTiles(), minesLeftBoxX + minesLeftBox, minesLeftBoxY + minesLeftBox / 2 + 2);
        } else {
            text("X", minesLeftBoxX + minesLeftBox, minesLeftBoxY + minesLeftBox / 2 + 2);
        }

        // draws flags placed counter
        fill("gray");
        let flagsPlacedBoxX = this.TILES_PER_ROW * this.TILE_HEIGHT - (minesLeftBox + minesLeftBox / 2);
        let flagsPlacedBoxY = this.TILES_PER_COLUMN * this.TILE_HEIGHT + minesLeftBox / 2 + this.BOARD_Y_OFFSET;
        rect(flagsPlacedBoxX, flagsPlacedBoxY, minesLeftBox * 2, minesLeftBox);
        fill("red");
        if (this.playing) {
            text(
                "" + this.getNumMinesNotFound(),
                flagsPlacedBoxX + minesLeftBox,
                flagsPlacedBoxY + minesLeftBox / 2 + 2
            );
        } else {
            text("X", flagsPlacedBoxX + minesLeftBox, flagsPlacedBoxY + minesLeftBox / 2 + 2);
        }

        // draws bomb squads left
        fill("magenta");
        for (let i = 0; i < this.squadsLeft; i++) {
            if (i === this.squadsLeft - 1 && this.score > this.SQUAD_COST) {
                fill("green");
            }
            ellipse(
                this.TILE_HEIGHT * 1.5 + i * (this.TILE_HEIGHT * 2),
                this.TILES_PER_COLUMN * this.TILE_HEIGHT + SCOREBOARD_HEIGHT / 2 + this.BOARD_Y_OFFSET,
                this.BOMB_HEIGHT,
                this.BOMB_HEIGHT
            );
        }

        // draws score
        fill("white");
        text(
            "" + this.score,
            this.TILE_HEIGHT * 8,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT + SCOREBOARD_HEIGHT / 2 + 2 + this.BOARD_Y_OFFSET
        );

        for (let i = 0; i < this.TOTAL_TILES; i++) {
            this.tileIndexX = (i % this.TILES_PER_ROW) * this.TILE_HEIGHT;
            this.tileIndexY = Math.floor(i / this.TILES_PER_ROW) * this.TILE_HEIGHT;
            this.tile = this.board[i];

            if (this.tile.hidden === false) {
                setColor("gray");
                stroke("darkgray");
                rect(
                    this.BOARD_X_OFFSET + this.tileIndexX,
                    this.tileIndexY + this.BOARD_Y_OFFSET,
                    this.TILE_HEIGHT,
                    this.TILE_HEIGHT
                );
                if (this.tile.bomb === Tile.BOMB_TYPE.NONE && this.tile.value !== 0) {
                    if (this.tile.value === 1) {
                        setColor("black");
                    } else if (this.tile.value === 2) {
                        setColor("blue");
                    } else if (this.tile.value === 3) {
                        setColor("purple");
                    } else if (this.tile.value === 4) {
                        setColor("orange");
                    } else if (this.tile.value === 5) {
                        setColor("red");
                    } else if (this.tile.value === 6) {
                        setColor("yellow");
                    } else if (this.tile.value === 7) {
                        setColor("magenta");
                    } else if (this.tile.value === 8) {
                        setColor("teal");
                    }
                    text(
                        this.tile.value,
                        this.BOARD_X_OFFSET + this.tileIndexX + this.HALF_TILE,
                        this.tileIndexY + this.TILE_HEIGHT * 0.6 + this.BOARD_Y_OFFSET
                    );
                    setColor("black");
                }

                if (this.tile.bomb != Tile.BOMB_TYPE.NONE) {
                    setColor("red");
                    if (this.tile.bomb === Tile.BOMB_TYPE.MINI) setColor("blue");
                    ellipse(
                        this.BOARD_X_OFFSET + this.tileIndexX + this.HALF_TILE,
                        this.tileIndexY + this.HALF_TILE + this.BOARD_Y_OFFSET,
                        this.BOMB_HEIGHT,
                        this.BOMB_HEIGHT
                    );
                }

                if (!this.playing) {
                    if (this.tile.flagged === true) {
                        if (this.tile.bomb === Tile.BOMB_TYPE.MINE || this.tile.bomb === Tile.BOMB_TYPE.MINI) {
                            setColor("green");
                        } else {
                            setColor("red");
                        }
                        strokeWeight(5);
                        line(
                            this.BOARD_X_OFFSET + this.tileIndexX,
                            this.tileIndexY + this.BOARD_Y_OFFSET,
                            this.tileIndexX + this.TILE_HEIGHT,
                            this.tileIndexY + this.TILE_HEIGHT
                        );
                        line(
                            this.BOARD_X_OFFSET + this.tileIndexX + this.TILE_HEIGHT,
                            this.tileIndexY + this.BOARD_Y_OFFSET,
                            this.tileIndexX,
                            this.tileIndexY + this.TILE_HEIGHT
                        );
                    }
                }
            } else {
                setColor("green");
                stroke("black");
                rect(
                    this.BOARD_X_OFFSET + this.tileIndexX,
                    this.tileIndexY + this.BOARD_Y_OFFSET,
                    this.TILE_HEIGHT - 1,
                    this.TILE_HEIGHT - 1
                );
                if (this.tile.flagged) {
                    setColor("yellow");
                    ellipse(
                        this.BOARD_X_OFFSET + this.tileIndexX + this.HALF_TILE,
                        this.tileIndexY + this.HALF_TILE + this.BOARD_Y_OFFSET,
                        this.BOMB_HEIGHT,
                        this.BOMB_HEIGHT
                    );
                }
            }
        }

        // draws box around selected tile
        setColor("red");
        strokeWeight(3);
        noFill();
        rect(
            Math.floor(mouseX / this.TILE_HEIGHT) * this.TILE_HEIGHT + 1,
            Math.floor(mouseY / this.TILE_HEIGHT) * this.TILE_HEIGHT + 1 + this.BOARD_Y_OFFSET,
            this.TILE_HEIGHT - 1,
            this.TILE_HEIGHT - 1
        );

        // draw winner
        textSize(64);
        if (this.winner) {
            fill("white");
            text(
                "You Win!",
                (this.TILES_PER_ROW / 2) * this.TILE_HEIGHT,
                (this.TILES_PER_COLUMN / 2) * this.TILE_HEIGHT + this.BOARD_Y_OFFSET
            );
        } else if (!this.playing) {
            fill("white");
            text(
                "Game Over!",
                (this.TILES_PER_ROW / 2) * this.TILE_HEIGHT,
                (this.TILES_PER_COLUMN / 2) * this.TILE_HEIGHT + this.BOARD_Y_OFFSET
            );
        }
    }

    initializeBoard() {
        const newBoard = [];
        for (let i = 0; i < this.TOTAL_TILES; i++) {
            newBoard[i] = new Tile();
        }
        this.placeMines(newBoard);
        this.calculateValues(newBoard);
        return newBoard;
    }

    placeMines(newBoard) {
        let placedMines = 0;
        while (placedMines < this.MAX_MINES) {
            const tileIndex = Math.floor(Math.random() * this.TOTAL_TILES);
            if (newBoard[tileIndex].bomb === Tile.BOMB_TYPE.NONE) {
                if (Math.random() * 100 < 10) {
                    newBoard[tileIndex].bomb = Tile.BOMB_TYPE.MINI;
                } else {
                    newBoard[tileIndex].bomb = Tile.BOMB_TYPE.MINE;
                }
                placedMines++;
            }
        }
    }

    calculateValues(newBoard) {
        for (let i = 0; i < newBoard.length; i++) {
            newBoard[i].value = this.countNeighbors(newBoard, i);
        }
    }

    countNeighbors(newBoard, tileIndex) {
        let value = 0;
        const neighbors = this.getNeighbors(tileIndex);
        for (let i = 0; i < neighbors.length; i++) {
            if (newBoard[neighbors[i]].bomb != Tile.BOMB_TYPE.NONE) {
                value++;
            }
        }
        return value;
    }

    getNeighbors(tile) {
        let neighbors = [];
        let topLeft = tile - this.TILES_PER_ROW - 1;
        let topCenter = tile - this.TILES_PER_ROW;
        let topRight = tile - this.TILES_PER_ROW + 1;
        let midLeft = tile - 1;
        let midRight = tile + 1;
        let btmLeft = tile + this.TILES_PER_ROW - 1;
        let btmCenter = tile + this.TILES_PER_ROW;
        let btmRight = tile + this.TILES_PER_ROW + 1;

        if (this.getNeighbor(tile, topLeft)) {
            neighbors.push(topLeft);
        }
        if (this.getNeighbor(tile, topCenter)) {
            neighbors.push(topCenter);
        }
        if (this.getNeighbor(tile, topRight)) {
            neighbors.push(topRight);
        }
        if (this.getNeighbor(tile, midLeft)) {
            neighbors.push(midLeft);
        }
        if (this.getNeighbor(tile, midRight)) {
            neighbors.push(midRight);
        }
        if (this.getNeighbor(tile, btmLeft)) {
            neighbors.push(btmLeft);
        }
        if (this.getNeighbor(tile, btmCenter)) {
            neighbors.push(btmCenter);
        }
        if (this.getNeighbor(tile, btmRight)) {
            neighbors.push(btmRight);
        }
        return neighbors;
    }

    getNeighbor(tile, neighbor) {
        const tileX = Math.floor(tile % this.TILES_PER_ROW);
        const neighborX = Math.floor(neighbor % this.TILES_PER_ROW);
        const distanceApart = Math.abs(tileX - neighborX);
        if (neighbor < 0 || neighbor > this.TOTAL_TILES - 1) {
            return false;
        } else {
            if (distanceApart > 1) {
                return false;
            } else return true;
        }
    }

    getNumHiddenTiles() {
        let result = this.TOTAL_TILES;
        for (let i = 0; i < this.TOTAL_TILES; i++) {
            if (!this.board[i].hidden) result--;
        }
        return result;
    }

    getNumMinesNotFound() {
        let result = 0;
        for (let i = 0; i < this.TOTAL_TILES; i++) {
            const tile = this.board[i];
            if (tile.flagged || (tile.bomb != Tile.BOMB_TYPE.NONE && !tile.hidden)) {
                result++;
            }
        }
        return this.MAX_MINES - result;
    }

    unhide(tile, checked) {
        if (this.board[tile].flagged === false) {
            this.board[tile].hidden = false;
            this.score += this.TILE_SCORE;
        }
        // if tile.value is zero, uncover all the tiles around it
        // if one of the ones uncovered is a zero uncover all the ones around it and so on
        // checked is a blank list to track zeros already checked
        if (this.board[tile].value === 0 && !checked.includes(tile)) {
            checked.push(tile);
            // a list of the valid neighbors
            let neighbors = this.getNeighbors(tile);
            for (const n in neighbors) {
                this.unhide(neighbors[n], checked);
            }
        }
    }

    blastRadius(tileIndex) {
        let damage = this.getNeighbors(tileIndex);
        damage.push(tileIndex + 2);
        damage.push(tileIndex - 2);
        damage.push(tileIndex + this.TILES_PER_ROW * 2);
        damage.push(tileIndex - this.TILES_PER_ROW * 2);
        for (let i = 0; i < damage.length; i++) {
            if (damage[i] > 0 && damage[i] < this.TOTAL_TILES) {
                this.board[damage[i]].hidden = false;
                if (this.board[i].bomb === Tile.BOMB_TYPE.MINE || this.board[i].bomb === Tile.BOMB_TYPE.MINI) {
                    this.minesUncovered++;
                }
            }
        }
    }

    bombSquad(tileIndex) {
        if (this.board[tileIndex].bomb != Tile.BOMB_TYPE.MINE) {
            this.squadsLeft = this.squadsLeft - 1;
            this.board[tileIndex].hidden = false;
            this.minesUncovered++;
            this.blastRadius(tileIndex);
            this.score -= this.SQUAD_COST;
        } else {
            this.gameOver();
        }
    }

    handleMouseClick(mouseX, mouseY) {
        const x = Math.floor((mouseX - this.BOARD_X_OFFSET) / this.TILE_HEIGHT);
        const y = Math.floor(mouseY / this.TILE_HEIGHT);
        const tileIndex = y * this.TILES_PER_ROW + x;
        const tile = this.board[tileIndex];
        if (this.playing && tile) {
            if (keyIsDown(CONTROL)) {
                if (tile.hidden) {
                    tile.flagged = true;
                }
            } else {
                if (tile.flagged) {
                    tile.flagged = false;
                } else {
                    if (keyIsDown(SHIFT)) {
                        if (this.squadsLeft > 0 && this.score > this.SQUAD_COST) {
                            this.bombSquad(tileIndex);
                        }
                    } else if (tile.bomb === Tile.BOMB_TYPE.MINI) {
                        this.board[tileIndex].hidden = false;
                        this.minesUncovered++;
                        this.blastRadius(tileIndex);
                    } else if (tile.bomb === Tile.BOMB_TYPE.MINE) {
                        this.gameOver();
                    } else {
                        if (tile.hidden === true) {
                            this.score += tile.value > 0 ? tile.value * 10 : 5;
                            this.unhide(tileIndex, []);
                        }
                    }
                }
            }
            if (this.playing) {
                this.checkForWin();
            }
        } else if (!this.playing) {
            this.start1Player();
        }
    }

    checkForWin() {
        let win = true;
        this.board.forEach((tile) => {
            if (tile.bomb === Tile.BOMB_TYPE.NONE && tile.hidden === true) win = false;
        });

        if (win) {
            this.winner = true;
            this.gameOver();
        }
    }

    gameOver() {
        this.calculateScore();
        this.playing = false;
    }

    calculateScore() {
        for (let i = 0; i < this.TOTAL_TILES; i++) {
            if (this.board[i].hidden === false && this.winner) {
                this.score += this.TILE_BONUS;
            }
            if (this.board[i].flagged) {
                this.score -= this.FLAG_PENALTY;
            }
            this.board[i].hidden = false;
        }
        this.score += this.squadsLeft * this.squadsLeft * this.SQUAD_COST;
    }
}

class Tile {
    static BOMB_TYPE = { NONE: 0, MINE: 1, MINI: 2 };
    constructor() {
        this.hidden = true;
        this.bomb = Tile.BOMB_TYPE.NONE;
        this.flagged = false;
        this.value = 0;
    }
}

class Bomb {
    constructor() {}
}

class Flag {
    constructor() {}
}
