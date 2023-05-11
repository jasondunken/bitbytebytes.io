import { HighScorePanel } from "./modules/highscore-panel.js";
import { BonusEffect, BonusSquadEffect, Explosion, Firework, ScoreEffect } from "./modules/visual-effects.js";
import {
    setColor,
    Vec2,
    mousePositionToTileScreenLocation,
    mousePositionToTileIndex,
    valueToColor,
    tileIndexToTileCenter,
} from "./modules/utils.js";

import { Board } from "./modules/board.js";
import { UI } from "./modules/ui.js";

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
    MineSquad.sprites = sprites;
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
    game = new MineSquad(GAME_WIDTH, GAME_HEIGHT, null);
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

class MineSquad {
    PLAYER_1_START_BUTTON = document.getElementById("start-1p").addEventListener("click", () => {
        this.start1Player();
    });

    static sprites;

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

    constructor(screenWidth, screenHeight, sprites) {
        this.sprites = sprites;

        textSize(this.TILE_HEIGHT);
        textAlign(CENTER, CENTER);
        textSize(28);

        this.board = new Board(this.MAX_MINES, MineSquad.sprites);
        this.ui = new UI(screenWidth, screenHeight, this.board.height);
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

        this.board.generateBoard(this.MAX_MINES);
        console.log(this.board);

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

        //console.log(`mX: ${mouseX} | mY: ${mouseY}`);
    }

    handleMouseClick(mouseX, mouseY) {
        const mousePos = clickToBoardCoords(mouseX, mouseY);
        const tileIndex = mousePositionToTileIndex(
            mouseX,
            mouseY,
            this.TILE_HEIGHT,
            this.BOARD_X_OFFSET,
            this.BOARD_Y_OFFSET,
            this.TILES_PER_ROW
        );
        console.log("tileIndexTest: ", tileIndex);
        let tile = this.getTile(this.board, tileIndex);
        if (this.currentState === this.GAME_STATE.STARTING) {
            while (tile.value != 0 || tile.bomb) {
                this.board.generateBoard(this.MAX_MINES);
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
        setColor("darkgray");
        rect(0, 0, this.width, this.height);

        //this.ui.draw();
        this.board.draw();

        this.visualEffects.forEach((effect) => {
            effect.render();
        });

        if (this.currentState === this.GAME_STATE.GAME_OVER) {
            this.board.showMousePath();
            if (this.highScorePanel && this.highScorePanel.isShowing()) {
                this.highScorePanel.draw();
            }
        }

        if (this.currentState === this.GAME_STATE.HELP) {
            this.ui.showHelp();
        }
        //this.ui.drawCrosshair();
    }

    getNumHiddenTiles() {
        let result = this.TOTAL_TILES;
        for (let i = 0; i < this.TOTAL_TILES; i++) {
            if (!this.board[i].hidden && !this.board[i].bomb) result--;
        }
        return result;
    }

    uncover(tileIndex, checkedTiles) {
        const tile = this.getTile(this.board, tileIndex);
        if (tile) {
            if (tile.flagged === false) {
                tile.hidden = false;
                const tileValue = tile.value;
                const tileScore = tileValue > 0 ? this.board[tileIndex].value * 10 : 5;
                this.score += tileScore;
                const position = new Vec2(
                    (tileIndex % this.TILES_PER_ROW) * this.TILE_HEIGHT + this.BOARD_X_OFFSET + this.TILE_HEIGHT / 2,
                    Math.floor(tileIndex / this.TILES_PER_ROW) * this.TILE_HEIGHT
                );
                if (tileValue > 0) {
                    this.visualEffects.add(new ScoreEffect(position, tileScore, tileValue));
                }
            }
            // if tile.value is zero, uncover all the tiles around it
            // if one of the ones uncovered is a zero uncover all the ones around it and so on
            // checked is a blank list to track zeros already checked
            if (tile.value === 0 && !checkedTiles.includes(tileIndex)) {
                checkedTiles.push(tileIndex);
                // a list of the valid neighbors
                let neighbors = this.getNeighbors(tileIndex);
                for (let i = 0; i < neighbors.length; i++) {
                    this.uncover(neighbors[i], checkedTiles);
                }
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
            this.visualEffects.add(new BonusEffect(position, this.board[tileIndex].value * this.DEFUSE_BONUS, "blue"));
            this.score += this.board[tileIndex].value * this.DEFUSE_BONUS;
        }

        const defuseArea = this.getNeighbors(tileIndex);
        this.isValidNeighbor(tileIndex, tileIndex + 2) ? defuseArea.push(tileIndex + 2) : undefined;
        this.isValidNeighbor(tileIndex, tileIndex - 2) ? defuseArea.push(tileIndex - 2) : undefined;
        defuseArea.push(tileIndex + this.TILES_PER_ROW * 2);
        defuseArea.push(tileIndex - this.TILES_PER_ROW * 2);

        for (let i = 0; i < defuseArea.length; i++) {
            if (defuseArea[i] >= 0 && defuseArea[i] < this.TOTAL_TILES) {
                const tile = this.getTile(this.board, defuseArea[i]);
                if (tile && tile.hidden) {
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
        if (this.isWinner()) {
            this.endGame();
        }
    }

    isWinner() {
        let winner = true;
        this.board.forEach((tile) => {
            if (!tile.bomb && tile.hidden === true) win = false;
        });
        return winner;
    }

    endGame() {
        this.currentState = this.GAME_STATE.ENDING;
        this.calculateScore();
        if (this.isWinner()) this.createFireworks();
    }

    gameOver() {
        this.currentState = this.GAME_STATE.GAME_OVER;
        this.highScorePanel = new HighScorePanel(
            this.width,
            this.height - this.scoreboardHeight + this.BOARD_Y_OFFSET,
            this.score,
            this.isWinner(),
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
