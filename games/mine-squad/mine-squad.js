import { HighScorePanel } from "./modules/highscore-panel.js";
import { BonusEffect, BonusSquadEffect, Explosion, Firework, ScoreEffect } from "./modules/visual-effects.js";
import {
    setColor,
    Vec2,
    mousePositionToTileScreenLocation,
    valueToColor,
    tileIndexToTileCenter,
} from "./modules/utils.js";

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.mousePressed = mousePressed;

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

let game = null;

function preload() {
    let sprites = {};
    sprites["bomb"] = loadImage("./mine-squad/res/img/bomb.png");
    MineSquadPlus.sprites = sprites;
}

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
    if (game) game.keyPressed(event);
}

function mousePressed(event) {
    if (game && event.button === 0) {
        game.handleMouseClick(mouseX, mouseY);
    }
}

class MineSquadPlus {
    PLAYER_1_START_BUTTON = document.getElementById("start-1p").addEventListener("click", () => {
        this.start1Player();
    });

    static sprites;

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
    FIRST_SQUAD_AWARD = 7500;
    SECOND_SQUAD_AWARD = 20000;
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

    level = 1;

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
        LEVEL_STARTING: "LEVEL_STARTING",
        PLAYING: "PLAYING",
        ENDING: "ENDING",
        GAME_OVER: "GAME_OVER",
    });
    currentState = this.GAME_STATE.STARTING;

    constructor(width, height, sprites) {
        this.width = width;
        this.height = height;
        this.scoreboardHeight = this.height - (this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.BOARD_Y_OFFSET);
        this.minesLeftBox = Math.floor(this.scoreboardHeight / 2);
        this.minesLeftBoxX = this.TILES_PER_ROW * this.TILE_HEIGHT - (this.minesLeftBox + this.minesLeftBox / 2) - 64;
        this.minesLeftBoxY = this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.minesLeftBox / 2 + this.BOARD_Y_OFFSET;
        this.flagsPlacedBoxX = this.TILES_PER_ROW * this.TILE_HEIGHT - (this.minesLeftBox + this.minesLeftBox / 2);
        this.flagsPlacedBoxY = this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.minesLeftBox / 2 + this.BOARD_Y_OFFSET;
        this.sprites = sprites;

        textSize(this.TILE_HEIGHT);
        textAlign(CENTER, CENTER);
        textSize(28);
    }

    startDemo() {
        this.startGame();
    }

    start1Player() {
        this.startGame();
    }

    startGame() {
        this.lastTime = Date.now();
        this.gameTime = 0;
        this.level = 1;
        this.score = 0;
        this.squadCount = this.STARTING_SQUADS;
        this.squadAward = 0;
        this.flaggedTiles = 0;
        this.board = this.initializeBoard();
        this.winner = false;
        this.mouseClicks = [];
        this.visualEffects = new Set();

        this.currentState = this.GAME_STATE.STARTING;
    }

    update() {
        const nowTime = Date.now();
        if (this.currentState === this.GAME_STATE.PLAYING) {
            this.gameTime += nowTime - this.lastTime;
        }
        this.lastTime = nowTime;

        this.visualEffects.forEach((effect) => {
            effect.update();
            if (effect.done) this.visualEffects.delete(effect);
        });

        if (this.currentState === this.GAME_STATE.ENDING && this.visualEffects.size < 1) {
            this.gameOver();
        }
    }

    handleMouseClick(mouseX, mouseY) {
        const x = Math.floor((mouseX - this.BOARD_X_OFFSET) / this.TILE_HEIGHT);
        const y = Math.floor((mouseY - this.BOARD_Y_OFFSET) / this.TILE_HEIGHT);
        if (x < 0 || x > this.TILES_PER_ROW - 1) return;
        if (y < 0 || y > this.TILES_PER_COLUMN - 1) return;
        const tileIndex = y * this.TILES_PER_ROW + x;
        let tile = this.board[tileIndex];
        if (this.currentState === this.GAME_STATE.STARTING) {
            while (tile.value != 0 || tile.bomb) {
                this.board = this.initializeBoard();
                tile = this.board[tileIndex];
            }
            this.currentState = this.GAME_STATE.PLAYING;
        }
        if (this.currentState === this.GAME_STATE.PLAYING) {
            this.mouseClicks.push([mouseX, mouseY]);
            if (tile && tile.hidden) {
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
                        this.useBombSquad(tileIndex);
                    }
                } else {
                    if (tile.bomb) {
                        tile.hidden = false;
                        this.detonateBomb(mouseX, mouseY);
                        this.endGame();
                        return;
                    } else {
                        this.uncover(tileIndex, []);
                    }
                }

                if (this.currentState === this.GAME_STATE.PLAYING) {
                    this.checkForWin();
                }
            } else if (this.currentState === this.GAME_STATE.GAME_OVER) {
                this.start1Player();
            }
            if (this.score > this.FIRST_SQUAD_AWARD && this.squadAward === 0) {
                this.squadAward = this.FIRST_SQUAD_AWARD;
                this.addSquad();
            }
            if (this.score > this.SECOND_SQUAD_AWARD && this.squadAward === this.FIRST_SQUAD_AWARD) {
                this.squadAward = this.SECOND_SQUAD_AWARD;
                this.addSquad();
            }
        }
        if (this.currentState === this.GAME_STATE.GAME_OVER) {
            this.startGame();
        }
    }

    keyPressed(key) {
        if (key.code === "Space") {
            if (this.currentState === this.GAME_STATE.GAME_OVER && this.highScorePanel) {
                this.highScorePanel.isShowing() ? this.highScorePanel.hidePanel() : this.highScorePanel.showPanel();
            }
        }
        if (key.code === "Tab") {
            key.preventDefault();
            if (this.currentState != this.GAME_STATE.HELP) {
                this.prevState = this.currentState;
                this.currentState = this.GAME_STATE.HELP;
            } else if (this.currentState === this.GAME_STATE.HELP) {
                if (this.prevState) this.currentState = this.prevState;
            }
        }
    }

    getElapsedTime() {
        return this.gameTime;
    }

    getElapsedTimeString() {
        const elapsedSeconds = (this.gameTime % 60000) / 1000;
        let secondsStr = ("" + elapsedSeconds).split(".")[0];
        if (elapsedSeconds < 10) secondsStr = "0" + secondsStr;
        const minutes = (this.gameTime - (this.gameTime % 60000)) / 60000;
        return minutes + ":" + secondsStr;
    }

    render() {
        this.drawBackground();
        this.drawDashboard();
        this.drawBoard();
        this.drawCursor();

        this.visualEffects.forEach((effect) => {
            effect.render();
        });

        if (this.currentState === this.GAME_STATE.GAME_OVER) {
            this.showMousePath();
            if (this.highScorePanel && this.highScorePanel.isShowing()) {
                this.highScorePanel.draw();
            }
        }

        if (this.currentState === this.GAME_STATE.HELP) {
            this.drawHelp();
        }

        this.drawCrosshair();
    }

    drawBackground() {
        setColor("darkgray");
        rect(0, 0, this.width, this.height);
    }

    drawDashboard() {
        setColor("black");
        strokeWeight(1);
        rect(
            4,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT + 4 + this.BOARD_Y_OFFSET,
            this.width - 8,
            this.scoreboardHeight - 8
        );
        this.drawHiddenTiles();
        this.drawFlagsPlaced();
        this.drawSquads();
        this.drawScore();
        this.drawTimer();
    }

    drawHiddenTiles() {
        noStroke();
        fill("gray");
        rect(this.minesLeftBoxX, this.minesLeftBoxY, this.minesLeftBox * 2, this.minesLeftBox);
        fill("red");
        textAlign(CENTER);
        textSize(24);
        if (this.currentState != this.GAME_STATE.GAME_OVER) {
            text(
                "" + this.getNumHiddenTiles(),
                this.minesLeftBoxX + this.minesLeftBox,
                this.minesLeftBoxY + this.minesLeftBox / 2 + 2
            );
        } else {
            text("X", this.minesLeftBoxX + this.minesLeftBox, this.minesLeftBoxY + this.minesLeftBox / 2 + 2);
        }
    }

    drawFlagsPlaced() {
        fill("gray");
        rect(this.flagsPlacedBoxX, this.flagsPlacedBoxY, this.minesLeftBox * 2, this.minesLeftBox);
        fill("red");
        textAlign(CENTER);
        textSize(24);
        if (this.currentState != this.GAME_STATE.GAME_OVER) {
            text(
                "" + this.MAX_MINES - this.flaggedTiles,
                this.flagsPlacedBoxX + this.minesLeftBox,
                this.flagsPlacedBoxY + this.minesLeftBox / 2 + 2
            );
        } else {
            text("X", this.flagsPlacedBoxX + this.minesLeftBox, this.flagsPlacedBoxY + this.minesLeftBox / 2 + 2);
        }
    }

    drawSquads() {
        fill("white");
        noStroke();
        textAlign(CENTER);
        textSize(24);
        text(
            "SQUADS",
            72,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.scoreboardHeight / 2 + 2 + this.BOARD_Y_OFFSET
        );
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
                this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.scoreboardHeight / 2 + this.BOARD_Y_OFFSET,
                this.BOMB_HEIGHT,
                this.BOMB_HEIGHT
            );
        }
    }

    drawScore() {
        fill("white");
        text(
            "" + this.score,
            this.width / 2,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.scoreboardHeight / 2 + 2 + this.BOARD_Y_OFFSET
        );
    }

    drawTimer() {
        fill("white");
        text(
            this.getElapsedTimeString(),
            this.width * 0.75,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.scoreboardHeight / 2 + 2 + this.BOARD_Y_OFFSET
        );
    }

    drawBoard() {
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
                    textAlign(CENTER);
                    textSize(24);
                    text(
                        this.tile.value,
                        this.BOARD_X_OFFSET + this.tileIndexX + this.HALF_TILE,
                        this.tileIndexY + this.TILE_HEIGHT * 0.6 + this.BOARD_Y_OFFSET
                    );
                    setColor("black");
                }

                if (this.tile.bomb) {
                    this.drawBomb(new Vec2(this.tileIndexX, this.tileIndexY));
                }
            } else {
                setColor("green");
                stroke("black");
                strokeWeight(1);
                rect(
                    this.BOARD_X_OFFSET + this.tileIndexX,
                    this.tileIndexY + this.BOARD_Y_OFFSET,
                    this.TILE_HEIGHT - 1,
                    this.TILE_HEIGHT - 1
                );
                if (this.tile.flagged) {
                    this.drawFlag(new Vec2(this.tileIndexX, this.tileIndexY));
                }
            }

            // when game over mark flags correct/incorrect, show bombs
            if (this.currentState == this.GAME_STATE.GAME_OVER) {
                if (this.tile.flagged === true) {
                    this.markFlag(this.tile.bomb);
                } else if (this.tile.bomb) {
                    this.drawBomb(new Vec2(this.tileIndexX, this.tileIndexY));
                }
            }
        }
    }

    drawFlag(tileIndex) {
        setColor("yellow");
        strokeWeight(1);
        ellipse(
            this.BOARD_X_OFFSET + tileIndex.x + this.HALF_TILE,
            tileIndex.y + this.HALF_TILE + this.BOARD_Y_OFFSET,
            this.BOMB_HEIGHT,
            this.BOMB_HEIGHT
        );
    }

    drawBomb(tileIndex) {
        setColor("red");
        image(
            MineSquadPlus.sprites["bomb"],
            this.BOARD_X_OFFSET + tileIndex.x + 2,
            tileIndex.y + this.BOARD_Y_OFFSET + 2,
            this.TILE_HEIGHT - 4,
            this.TILE_HEIGHT - 4
        );
    }

    markFlag(isBomb) {
        strokeWeight(5);
        isBomb ? setColor("green") : setColor("red");
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

    drawCursor() {
        const [x, y] = mousePositionToTileScreenLocation(
            [mouseX, mouseY - this.BOARD_Y_OFFSET],
            this.TILE_HEIGHT,
            this.BOARD_Y_OFFSET
        );
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
    }

    showMousePath() {
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

        stroke("magenta");
        noFill();
        strokeWeight(3);
        let lastClick = this.mouseClicks[this.mouseClicks.length - 1];
        lastClick = [lastClick[0], lastClick[1] - this.BOARD_Y_OFFSET];
        const [x, y] = mousePositionToTileScreenLocation(lastClick, this.TILE_HEIGHT, this.BOARD_Y_OFFSET);
        rect(x, y, this.TILE_HEIGHT, this.TILE_HEIGHT);
    }

    drawHelp() {
        stroke("black");
        strokeWeight(3);
        fill("gray");
        rect(this.width / 2 - 200, 30, 400, 425);
        noStroke();
        fill("black");
        text("Hold shift to use bomb squad!", this.width / 2, 70);
    }

    drawCrosshair() {
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

    uncover(tile, checked) {
        if (this.board[tile].flagged === false) {
            this.board[tile].hidden = false;
            const tileValue = this.board[tile].value;
            const tileScore = tileValue > 0 ? this.board[tile].value * 10 : 5;
            this.score += tileScore;
            const position = new Vec2(
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
                this.uncover(neighbors[n], checked);
            }
        }
    }

    addSquad() {
        if (this.squadCount < this.MAX_SQUADS) {
            this.squadCount++;

            const position = new Vec2(
                this.TILE_HEIGHT * 1.5 + (this.MAX_SQUADS - this.squadCount) * (this.TILE_HEIGHT * 2) + 120,
                this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.scoreboardHeight / 2 + this.BOARD_Y_OFFSET
            );

            this.visualEffects.add(new BonusSquadEffect(position));
        }
    }

    defuseWithinRadius(tileIndex) {
        this.board[tileIndex].hidden = false;
        const position = tileIndexToTileCenter(tileIndex, this.TILE_HEIGHT, this.TILES_PER_ROW, this.BOARD_X_OFFSET);
        if (this.board[tileIndex].bomb) {
            this.visualEffects.add(new BonusEffect(position, this.DEFUSE_BONUS));
            this.score += this.DEFUSE_BONUS;
        } else if (this.board[tileIndex].value > 0) {
            this.visualEffects.add(new BonusEffect(position, this.board[tileIndex].value * this.DEFUSE_BONUS));
            this.score += this.board[tileIndex].value * this.DEFUSE_BONUS;
        }

        const defuseArea = this.getNeighbors(tileIndex);
        defuseArea.push(tileIndex + 2);
        defuseArea.push(tileIndex - 2);
        defuseArea.push(tileIndex + this.TILES_PER_ROW * 2);
        defuseArea.push(tileIndex - this.TILES_PER_ROW * 2);

        for (let i = 0; i < defuseArea.length; i++) {
            if (defuseArea[i] > 0 && defuseArea[i] < this.TOTAL_TILES) {
                const tile = this.board[defuseArea[i]];
                if (tile.hidden) {
                    tile.hidden = false;
                    this.score += tile.value * this.TILE_BONUS;
                    if (tile.bomb) {
                        const position = tileIndexToTileCenter(
                            defuseArea[i],
                            this.TILE_HEIGHT,
                            this.TILES_PER_ROW,
                            this.BOARD_X_OFFSET
                        );
                        this.visualEffects.add(new BonusEffect(position, this.DEFUSE_BONUS));
                        this.score += this.DEFUSE_BONUS;
                    }
                }
            }
        }
    }

    useBombSquad(tileIndex) {
        this.squadCount--;
        this.defuseWithinRadius(tileIndex);
    }

    detonateBomb(x, y) {
        this.visualEffects.add(new Explosion(new Vec2(x, y)));
    }

    checkForWin() {
        let win = true;
        this.board.forEach((tile) => {
            if (!tile.bomb && tile.hidden === true) win = false;
        });

        if (win) {
            this.winner = true;
            this.endGame();
        }
    }

    endGame() {
        this.currentState = this.GAME_STATE.ENDING;
        this.calculateScore();
        if (this.winner) this.createFireworks();
    }

    gameOver() {
        this.currentState = this.GAME_STATE.GAME_OVER;
        this.highScorePanel = new HighScorePanel(
            this.width,
            this.height - this.scoreboardHeight + this.BOARD_Y_OFFSET,
            this.score,
            this.winner,
            this.getElapsedTimeString()
        );
        this.highScorePanel.showPanel();
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
        }
        if (this.winner) {
            this.score += this.squadCount * this.SQUAD_BONUS;
        }
    }

    createFireworks() {
        const numFireworks = Math.floor(this.score / 10000);
        for (let i = 0; i < numFireworks; i++) {
            this.visualEffects.add(
                new Firework(
                    new Vec2(
                        this.width / 4 + (Math.random() * this.width) / 2,
                        this.height / 4 + (Math.random() * this.height) / 2
                    )
                )
            );
        }
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
