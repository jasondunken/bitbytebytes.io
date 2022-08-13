GAME_WIDTH = 900;
GAME_HEIGHT = 580;

game = null;

function preload() {}

function setup() {
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
    SCOREBOARD_HEIGHT = 100;
    TILE_HEIGHT = 30;
    HALF_TILE = Math.floor(this.TILE_HEIGHT / 2);
    BOMB_HEIGHT = this.TILE_HEIGHT * 0.7;
    TOTAL_TILES = this.TILES_PER_COLUMN * this.TILES_PER_ROW;
    MAX_MINES = 99;
    MAX_SQUADS = 3;
    SQUAD_COST = 1000;

    playing = false;
    board = [];
    score = 0;
    time = 0;
    squadsLeft = 0;
    minesUncovered = 0;
    constructor(width, height, sprites) {
        this.width = width;
        this.height = height;
        this.sprites = sprites;
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
    }

    update() {}

    render() {
        const minesLeftBox = Math.floor(this.SCOREBOARD_HEIGHT / 2);
        textSize(this.TILE_HEIGHT);
        textAlign(CENTER, CENTER);
        for (let i = 0; i < this.board.length; i++) {
            const x = (i % this.TILES_PER_ROW) * this.TILE_HEIGHT;
            const y = Math.floor(i / this.TILES_PER_ROW) * this.TILE_HEIGHT;
            const tile = this.board[i];

            if (this.playing) {
                stroke("black");
                fill("green");
                rect(x, y, this.TILE_HEIGHT, this.TILE_HEIGHT);
                if (tile.flagged) {
                    stroke("black");
                    strokeWeight(1);
                    fill("yellow");
                    ellipse(x + this.HALF_TILE, y + this.HALF_TILE, this.BOMB_HEIGHT, this.BOMB_HEIGHT);
                }
            }

            if (this.board[i].hidden === false) {
                stroke("black");
                strokeWeight(1);
                fill("gray");
                rect(x, y, this.TILE_HEIGHT, this.TILE_HEIGHT);
                if (tile.bomb === Tile.BOMB_TYPE.NONE && tile.value !== 0) {
                    stroke("black");
                    fill("black");
                    if (tile.value === 1) {
                        setColor("blue");
                    } else if (tile.value === 2) {
                        setColor("green");
                    } else if (tile.value === 3) {
                        setColor("purple");
                    } else if (tile.value === 4) {
                        setColor("orange");
                    } else if (tile.value === 5) {
                        setColor("red");
                    } else if (tile.value === 6) {
                        setColor("yellow");
                    } else if (tile.value === 7) {
                        setColor("magenta");
                    } else {
                        setColor("teal");
                    }
                    text(tile.value, x + this.HALF_TILE, y + this.TILE_HEIGHT * 0.6);
                }

                if (tile.bomb != Tile.BOMB_TYPE.NONE) {
                    noStroke();
                    fill("red");
                    if (tile.bomb === Tile.BOMB_TYPE.MINI) fill("blue");
                    ellipse(x + this.HALF_TILE, y + this.HALF_TILE, this.BOMB_HEIGHT, this.BOMB_HEIGHT);
                }

                if (!this.playing) {
                    if (tile.flagged === true) {
                        if (tile.type === "mine") {
                            stroke("green");
                        } else {
                            stroke("red");
                        }
                        strokeWeight(5);
                        line(x, y, x + this.TILE_HEIGHT, y + this.TILE_HEIGHT);
                        line(x + this.TILE_HEIGHT, y, x, y + this.TILE_HEIGHT);
                    }
                }
            }
        }

        // draws box around selected tile
        stroke("red");
        strokeWeight(1);
        noFill();
        rect(
            Math.floor(mouseX / this.TILE_HEIGHT) * this.TILE_HEIGHT + 1,
            Math.floor(mouseY / this.TILE_HEIGHT) * this.TILE_HEIGHT + 1,
            this.TILE_HEIGHT - 2,
            this.TILE_HEIGHT - 2
        );

        // draws dashboard
        stroke("black");
        fill("black");
        rect(
            0,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT,
            this.TILES_PER_ROW * this.TILE_HEIGHT,
            this.SCOREBOARD_HEIGHT
        );

        // draws mines left counter
        fill("gray");
        let minesLeftBoxX = this.TILES_PER_ROW * this.TILE_HEIGHT - (minesLeftBox + minesLeftBox / 2);
        let minesLeftBoxY = this.TILES_PER_COLUMN * this.TILE_HEIGHT + minesLeftBox / 2;
        rect(minesLeftBoxX, minesLeftBoxY, minesLeftBox, minesLeftBox);
        fill("red");
        text(
            "" + (this.MAX_MINES - this.getNumFlags() - this.minesUncovered),
            minesLeftBoxX + minesLeftBox / 2,
            minesLeftBoxY + minesLeftBox / 2
        );

        // draws bomb squads left
        fill("magenta");
        for (let i = 0; i < this.squadsLeft; i++) {
            if (i === this.squadsLeft - 1 && this.score > this.SQUAD_COST) {
                fill("green");
            }
            ellipse(
                this.TILE_HEIGHT / 2 + this.TILE_HEIGHT * 2 + i * (this.TILE_HEIGHT * 2),
                this.TILES_PER_COLUMN * this.TILE_HEIGHT + minesLeftBox - this.TILE_HEIGHT / 2,
                this.BOMB_HEIGHT,
                this.BOMB_HEIGHT
            );
        }

        // draws score
        fill("white");
        text(
            "" + this.score,
            this.TILE_HEIGHT / 2 + this.TILE_HEIGHT * 2,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT + minesLeftBox - this.TILE_HEIGHT / 2 + this.TILE_HEIGHT
        );
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

    getNumFlags() {
        let result = 0;
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i].flagged) {
                result++;
            }
        }
        return result;
    }

    unhide(tile, checked) {
        if (this.board[tile].flagged === false) {
            this.board[tile].hidden = false;
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
            this.board[damage[i]].hidden = false;
            if (this.board[i].bomb === Tile.BOMB_TYPE.MINE || this.board[i].bomb === Tile.BOMB_TYPE.MINI) {
                this.minesUncovered++;
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
        const x = Math.floor(mouseX / this.TILE_HEIGHT);
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
                        if (this.squadsLeft > 0 && score > this.SQUAD_COST) {
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
        }
    }

    gameOver() {
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i].hidden === false) {
                this.score += 100;
            }
            this.board[i].hidden = false;
        }
        this.playing = false;
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
