GAME_WIDTH = 960;
GAME_HEIGHT = 540;

game = null;

function preload() {}

function setup() {
    // disable context menu
    document.body.addEventListener("contextmenu", function (evt) {
        evt.preventDefault();
        return false;
    });

    frameRate(30);
    const canvas = createCanvas(GAME_WIDTH, GAME_HEIGHT);
    canvas.parent("game");
    game = new MineSquadPlus(GAME_WIDTH, GAME_HEIGHT, null);
    game.startDemo();
}

function draw() {
    game.update();
    game.render();
}

function keyPressed(event) {
    if (this.game) this.game.keyPressed(event);
}

function mousePressed(event) {
    if (this.game && event.button === 0) {
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
    STARTING_SQUADS = 1;
    FIRST_SQUAD_AWARD = 2500;
    SECOND_SQUAD_AWARD = 7500;
    MAX_SQUADS = 3;
    TILE_SCORE = 10;
    TILE_BONUS = 100;
    SQUAD_BONUS = 10000;
    DEFUSE_BONUS = 4000;
    FLAG_PENALTY = 25;

    showHighScores = false;

    tileIndexX = 0;
    tileIndexY = 0;
    tile = null;

    winner = false;
    board = [];
    score = 0;
    time = 0;
    squadCount = 0;
    squadAward = 0;
    flaggedTiles = 0;

    mouseClicks = [];

    visualEffects = new Set();

    GAME_STATE = Object.freeze({
        STARTING: "STARTING",
        HELP: "HELP",
        PLAYING: "PLAYING",
        ENDING: "ENDING",
        GAME_OVER: "GAME_OVER",
    });
    currentState = this.GAME_STATE.STARTING;

    constructor(width, height, sprites) {
        this.width = width;
        this.height = height;
        this.sprites = sprites;
        this.highScorePanel = new HighScorePanel(this.width, this.height);
    }

    startDemo() {
        this.startGame();
    }

    start1Player() {
        this.startGame();
    }

    startGame() {
        this.lastTime = Date.now();
        this.elapsedTime = 0;
        this.score = 0;
        this.squadCount = this.STARTING_SQUADS;
        this.squadAward = 0;
        this.flaggedTiles = 0;
        this.board = this.initializeBoard();
        this.winner = false;

        this.mouseClicks = [];
        this.visualEffects = new Set();

        this.showHighScores = false;
        this.currentState = this.GAME_STATE.STARTING;
    }

    update() {
        const nowTime = Date.now();
        if (this.currentState == this.GAME_STATE.STARING || this.currentState == this.GAME_STATE.PLAYING) {
            this.elapsedTime += nowTime - this.lastTime;
        }
        this.lastTime = nowTime;

        this.visualEffects.forEach((effect) => {
            effect.update();
            if (effect.done) this.visualEffects.delete(effect);
        });

        if (this.currentState == this.GAME_STATE.ENDING && this.visualEffects.size < 1) {
            this.gameOver();
        }
    }

    keyPressed(key) {
        if (this.currentState == this.GAME_STATE.GAME_OVER && key.code === "Space") {
            this.showHighScores = !this.showHighScores;
        }
        if (key.code == "Tab") {
            key.preventDefault();
            if (this.currentState == this.GAME_STATE.PLAYING) {
                this.showHelp();
            } else if (this.currentState == this.GAME_STATE.HELP) {
                this.hideHelp();
            }
        }
    }

    showHelp() {
        this.currentState = this.GAME_STATE.HELP;
    }

    hideHelp() {
        this.currentState = this.GAME_STATE.PLAYING;
    }

    getElapsedTime() {
        return this.elapsedTime;
    }

    getElapsedTimeString() {
        const elapsedSeconds = (this.elapsedTime % 60000) / 1000;
        let secondsStr = ("" + elapsedSeconds).split(".")[0];
        if (elapsedSeconds < 10) secondsStr = "0" + secondsStr;
        const minutes = (this.elapsedTime - (this.elapsedTime % 60000)) / 60000;
        return minutes + ":" + secondsStr;
    }

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
        if (this.currentState == this.GAME_STATE.PLAYING) {
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
        if (this.currentState == this.GAME_STATE.PLAYING) {
            text(
                "" + this.MAX_MINES - this.flaggedTiles,
                flagsPlacedBoxX + minesLeftBox,
                flagsPlacedBoxY + minesLeftBox / 2 + 2
            );
        } else {
            text("X", flagsPlacedBoxX + minesLeftBox, flagsPlacedBoxY + minesLeftBox / 2 + 2);
        }

        // draws bomb squads left
        fill("white");
        noStroke();
        text("SQUADS", 72, this.TILES_PER_COLUMN * this.TILE_HEIGHT + SCOREBOARD_HEIGHT / 2 + 2 + this.BOARD_Y_OFFSET);
        fill("gray");
        for (let i = 0; i < this.MAX_SQUADS; i++) {
            if (i + 1 > this.MAX_SQUADS - this.squadCount) {
                fill("SpringGreen");
            }
            if (i === this.MAX_SQUADS - this.squadCount) {
                if (keyIsDown(SHIFT) && frameCount % 30 > 15) {
                    fill("Green");
                } else if (!keyIsDown(SHIFT) && frameCount % 60 > 30) {
                    fill("Green");
                }
            }
            ellipse(
                this.TILE_HEIGHT * 1.5 + i * (this.TILE_HEIGHT * 2) + 120,
                this.TILES_PER_COLUMN * this.TILE_HEIGHT + SCOREBOARD_HEIGHT / 2 + this.BOARD_Y_OFFSET,
                this.BOMB_HEIGHT,
                this.BOMB_HEIGHT
            );
        }

        // draws score
        fill("white");
        text(
            "" + this.score,
            this.width / 2,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT + SCOREBOARD_HEIGHT / 2 + 2 + this.BOARD_Y_OFFSET
        );

        // draws timer
        fill("white");
        text(
            this.getElapsedTimeString(),
            this.width * 0.75,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT + SCOREBOARD_HEIGHT / 2 + 2 + this.BOARD_Y_OFFSET
        );

        // draw board
        for (let i = 0; i < this.TOTAL_TILES; i++) {
            this.tileIndexX = (i % this.TILES_PER_ROW) * this.TILE_HEIGHT;
            this.tileIndexY = Math.floor(i / this.TILES_PER_ROW) * this.TILE_HEIGHT;
            this.tile = this.board[i];

            if (this.tile.hidden === false) {
                setColor("gray");
                stroke("darkgray");
                strokeWeight(1);
                rect(
                    this.BOARD_X_OFFSET + this.tileIndexX,
                    this.tileIndexY + this.BOARD_Y_OFFSET,
                    this.TILE_HEIGHT,
                    this.TILE_HEIGHT
                );
                if (!this.tile.bomb && this.tile.value !== 0) {
                    setColor(valueToColor(this.tile.value));
                    text(
                        this.tile.value,
                        this.BOARD_X_OFFSET + this.tileIndexX + this.HALF_TILE,
                        this.tileIndexY + this.TILE_HEIGHT * 0.6 + this.BOARD_Y_OFFSET
                    );
                    setColor("black");
                }

                if (this.tile.bomb) {
                    setColor("red");
                    ellipse(
                        this.BOARD_X_OFFSET + this.tileIndexX + this.HALF_TILE,
                        this.tileIndexY + this.HALF_TILE + this.BOARD_Y_OFFSET,
                        this.BOMB_HEIGHT,
                        this.BOMB_HEIGHT
                    );
                }

                // when game over mark flags correct/incorrect
                if (this.currentState == this.GAME_STATE.GAME_OVER) {
                    if (this.tile.flagged === true) {
                        setColor("red");
                        strokeWeight(5);
                        if (this.tile.bomb) {
                            setColor("green");
                        }
                        line(
                            this.BOARD_X_OFFSET + this.tileIndexX,
                            this.tileIndexY + this.BOARD_Y_OFFSET,
                            this.BOARD_X_OFFSET + this.tileIndexX + this.TILE_HEIGHT,
                            this.tileIndexY + this.BOARD_Y_OFFSET + this.TILE_HEIGHT
                        );
                        line(
                            this.BOARD_X_OFFSET + this.tileIndexX + this.TILE_HEIGHT,
                            this.tileIndexY + this.BOARD_Y_OFFSET,
                            this.tileIndexX + this.TILE_HEIGHT,
                            this.tileIndexY + this.TILE_HEIGHT + this.BOARD_Y_OFFSET
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
        const [x, y] = this.mousePositionToTileScreenLocation([mouseX, mouseY - this.BOARD_Y_OFFSET]);
        if (
            x >= this.BOARD_X_OFFSET &&
            x < this.TILES_PER_ROW * this.TILE_HEIGHT + this.BOARD_X_OFFSET &&
            y >= 0 &&
            y < this.TILES_PER_COLUMN * this.TILE_HEIGHT
        ) {
            setColor("red");
            strokeWeight(3);
            noFill();
            rect(x, y, this.TILE_HEIGHT, this.TILE_HEIGHT);
        }

        // draw visual effects
        this.visualEffects.forEach((effect) => {
            effect.render();
        });

        // draw help panel
        if (this.currentState == this.GAME_STATE.HELP) {
            stroke("black");
            strokeWeight(3);
            fill("gray");
            rect(this.width / 2 - 200, 30, 400, 425);
            noStroke();
            fill("black");
            text("Hold shift to use bomb squad!", this.width / 2, 70);
        }

        // when game over draw mouse path & last tile
        if (this.currentState == this.GAME_STATE.GAME_OVER) {
            stroke("orange");
            strokeWeight(2);
            for (let i = 0; i < this.mouseClicks.length - 1; i++) {
                line(
                    this.mouseClicks[i][0],
                    this.mouseClicks[i][1],
                    this.mouseClicks[i + 1][0],
                    this.mouseClicks[i + 1][1]
                );
            }

            stroke("green");
            noFill();
            strokeWeight(3);
            const lastClick = this.mouseClicks[this.mouseClicks.length - 1];
            const [x, y] = this.mousePositionToTileScreenLocation(lastClick);
            rect(x, y, this.TILE_HEIGHT, this.TILE_HEIGHT);
        }

        // draw win/lose & highscores
        if (this.currentState == this.GAME_STATE.GAME_OVER && this.showHighScores) {
            this.highScorePanel.render(this.winner);
        }

        // draw crosshair
        setColor("red");
        noFill();
        strokeWeight(1);
        let crosshairDiameter = 10;
        if (keyIsDown(SHIFT)) crosshairDiameter *= 10;
        ellipse(mouseX, mouseY, crosshairDiameter, crosshairDiameter);
        setColor("black");
        line(mouseX - 10, mouseY, mouseX + 10, mouseY);
        line(mouseX, mouseY - 10, mouseX, mouseY + 10);
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
            if (!newBoard[tileIndex].bomb) {
                newBoard[tileIndex].bomb = true;
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
            if (newBoard[neighbors[i]].bomb) {
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
            if (!this.board[i].hidden && !this.board[i].bomb) result--;
        }
        return result;
    }

    unhide(tile, checked) {
        if (this.board[tile].flagged === false) {
            this.board[tile].hidden = false;
            const tileValue = this.board[tile].value;
            const tileScore = tileValue > 0 ? this.board[tile].value * 10 : 5;
            this.score += tileScore;
            const position = new Vec3(
                (tile % this.TILES_PER_ROW) * this.TILE_HEIGHT + this.BOARD_X_OFFSET + this.TILE_HEIGHT / 2,
                Math.floor(tile / this.TILES_PER_ROW) * this.TILE_HEIGHT
            );
            if (tileValue > 0) {
                this.visualEffects.add(new ScoreEffect(position, tileScore, tileValue));
            }
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

    defuseRadius(tileIndex) {
        this.board[tileIndex].hidden = false;
        if (this.board[tileIndex].bomb) {
            this.score += this.DEFUSE_BONUS;
        }
        const damage = this.getNeighbors(tileIndex);
        damage.push(tileIndex + 2);
        damage.push(tileIndex - 2);
        damage.push(tileIndex + this.TILES_PER_ROW * 2);
        damage.push(tileIndex - this.TILES_PER_ROW * 2);

        for (let i = 0; i < damage.length; i++) {
            if (damage[i] > 0 && damage[i] < this.TOTAL_TILES) {
                const tile = this.board[damage[i]];
                if (tile.hidden) {
                    this.score += tile.value * this.TILE_BONUS;
                    if (tile.bomb) {
                        const position = new Vec3(
                            (damage[i] % this.TILES_PER_ROW) * this.TILE_HEIGHT +
                                this.BOARD_X_OFFSET +
                                this.TILE_HEIGHT / 2,
                            Math.floor(damage[i] / this.TILES_PER_ROW) * this.TILE_HEIGHT
                        );
                        this.visualEffects.add(new BonusEffect(position, this.DEFUSE_BONUS));
                        this.score += this.DEFUSE_BONUS;
                    }
                }
                tile.hidden = false;
            }
        }
    }

    bombSquad(tileIndex) {
        this.squadCount--;
        this.defuseRadius(tileIndex);
    }

    detonate(x, y) {
        this.visualEffects.add(new Explosion(new Vec3(x, y)));
    }

    handleMouseClick(mouseX, mouseY) {
        const x = Math.floor((mouseX - this.BOARD_X_OFFSET) / this.TILE_HEIGHT);
        const y = Math.floor((mouseY - this.BOARD_Y_OFFSET) / this.TILE_HEIGHT);
        if (x < 0 || x > this.TILES_PER_ROW - 1) return;
        if (y < 0 || y > this.TILES_PER_COLUMN - 1) return;
        const tileIndex = y * this.TILES_PER_ROW + x;
        let tile = this.board[tileIndex];
        if (this.currentState == this.GAME_STATE.STARTING) {
            while (tile.bomb) {
                this.board = this.initializeBoard();
                tile = this.board[tileIndex];
            }
            this.currentState = this.GAME_STATE.PLAYING;
        }
        if (this.currentState == this.GAME_STATE.PLAYING) this.mouseClicks.push([mouseX, mouseY]);
        if (this.currentState == this.GAME_STATE.PLAYING && tile && tile.hidden) {
            if (tile.flagged) {
                this.flaggedTiles--;
                tile.flagged = false;
            } else if (keyIsDown(CONTROL)) {
                if (this.flaggedTiles < this.MAX_MINES) {
                    this.flaggedTiles++;
                    tile.flagged = true;
                }
            } else if (keyIsDown(SHIFT)) {
                if (this.squadCount > 0) {
                    this.bombSquad(tileIndex);
                }
            } else {
                if (tile.bomb) {
                    tile.hidden = false;
                    this.detonate(mouseX, mouseY);
                    this.currentState = this.GAME_STATE.ENDING;
                } else {
                    this.unhide(tileIndex, []);
                }
            }

            if (this.currentState == this.GAME_STATE.PLAYING) {
                this.checkForWin();
            }
        } else if (this.currentState == this.GAME_STATE.GAME_OVER) {
            this.start1Player();
        }
        if (this.score > this.FIRST_SQUAD_AWARD && this.squadAward === 0) {
            this.squadAward = this.FIRST_SQUAD_AWARD;
            this.squadCount++;
        }
        if (this.score > this.SECOND_SQUAD_AWARD && this.squadAward === this.FIRST_SQUAD_AWARD) {
            this.squadAward = this.SECOND_SQUAD_AWARD;
            this.squadCount++;
        }
    }

    checkForWin() {
        let win = true;
        this.board.forEach((tile) => {
            if (!tile.bomb && tile.hidden === true) win = false;
        });

        if (win) {
            this.winner = true;
            this.gameOver();
        }
    }

    gameOver() {
        this.calculateScore();
        this.currentState = this.GAME_STATE.GAME_OVER;
        this.highScorePanel.updateHighScores(this.score, this.winner);
        this.showHighScores = true;
    }

    calculateScore() {
        for (let i = 0; i < this.TOTAL_TILES; i++) {
            const tile = this.board[i];
            if (tile.hidden === false && this.winner) {
                this.score += this.TILE_BONUS;
            }
            if (tile.flagged) {
                this.score -= this.FLAG_PENALTY;
            }
            //tile.hidden = false;
        }
        if (this.winner) {
            this.score += this.squadCount * this.SQUAD_BONUS;
        }
    }

    mousePositionToTileScreenLocation(position) {
        let x = Math.floor(position[0] / this.TILE_HEIGHT) * this.TILE_HEIGHT;
        let y = Math.floor(position[1] / this.TILE_HEIGHT) * this.TILE_HEIGHT + this.BOARD_Y_OFFSET;
        return [x, y];
    }
}

class Tile {
    constructor() {
        this.hidden = true;
        this.bomb = false;
        this.flagged = false;
        this.value = 0;
    }
}

class Bomb {
    constructor() {
        this.defused = false;
    }
}

class Flag {
    constructor() {}
}
