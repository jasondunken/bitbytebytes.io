import { GAME_STATE } from "./modules/game-state.js";
import { Board } from "./modules/board.js";
import { UI } from "./modules/ui.js";
import { HighScorePanel } from "./modules/highscore-panel.js";
import { Vec2d } from "./modules/math.js";
import { Explosion, Firework } from "./modules/visual-effects.js";
import { setColor, getElapsedTimeString } from "./modules/utils.js";

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
    sprites["bomb_defused"] = loadImage("./mine-squad/res/img/bomb-defused.png");
    MineSquad.sprites = sprites;
}

function setup() {
    // disable context menu
    document.body.addEventListener("contextmenu", function (event) {
        event.preventDefault();
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
    if (game) game.handleKeyPress(event);
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
    FIRST_SQUAD_AWARD = 10000;
    SECOND_SQUAD_AWARD = 30000;
    MAX_SQUADS = 3;
    TILE_MULTIPLIER = 100;
    TILE_BONUS = 100;
    SQUAD_BONUS = 10000;
    DEFUSE_BONUS = 4000;
    FLAG_PENALTY = 25;

    showHighScores = false;

    level = 1;

    score = 0;
    time = 0;
    squadCount = 0;
    squadAward = 0;

    mouseClicks = [];

    visualEffects = new Set();

    currentState = GAME_STATE.STARTING;

    constructor(screenWidth, screenHeight, sprites) {
        this.width = screenWidth;
        this.height = screenHeight;
        this.sprites = sprites;

        textSize(this.TILE_HEIGHT);
        textAlign(CENTER, CENTER);
        textSize(28);

        this.board = new Board(this, MineSquad.sprites);
        this.ui = new UI(this);
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

        this.board.generateBoard(this.MAX_MINES);

        this.mouseClicks = [];
        this.layers = [];

        this.currentState = GAME_STATE.STARTING;
    }

    update() {
        const nowTime = Date.now();
        if (this.currentState === GAME_STATE.PLAYING) {
            this.gameTime += nowTime - this.lastTime;
        }
        this.lastTime = nowTime;

        let layersComplete = true;
        this.layers.forEach((layer) => {
            layer.forEach((effect) => {
                effect.update();
                if (effect.done) layer.delete(effect);
            });
            if (layer.size) layersComplete = false;
        });

        if (this.currentState === GAME_STATE.ENDING && layersComplete) {
            this.gameOver();
        }

        this.ui.update({
            level: this.level,
            score: this.score,
            squads: this.squadCount,
            time: this.gameTime,
            ...this.board.getUiData(),
        });
    }

    handleMouseClick(mouseX, mouseY) {
        const coords = new Vec2d(mouseX, mouseY);

        if (this.board.isOnBoard(coords)) {
            this.mouseClicks.push(coords);

            const tileIndex = this.board.getIndex(coords);
            let tile = this.board.getTile(tileIndex);

            if (this.currentState === GAME_STATE.STARTING) {
                while (tile.value != 0 || tile.bomb) {
                    this.board.generateBoard(this.MAX_MINES);
                    tile = this.board.getTile(tileIndex);
                }
                this.currentState = GAME_STATE.PLAYING;
            }
            if (this.currentState === GAME_STATE.PLAYING) {
                if (keyIsDown(CONTROL)) {
                    if (this.board.getFlagCount() < this.MAX_MINES) {
                        tile.flagged = true;
                    }
                    return;
                }
                if (tile.flagged) {
                    tile.flagged = false;
                    return;
                }

                if (tile.hidden) {
                    if (keyIsDown(SHIFT)) {
                        if (this.squadCount > 0) {
                            this.squadCount--;
                            this.board.defuseWithinRadius(tile, tileIndex);
                        }
                    } else {
                        this.board.checkTile(tile, tileIndex);
                    }
                }

                if (this.board.completed) this.endGame();

                if (this.score > this.FIRST_SQUAD_AWARD && this.squadAward === 0) {
                    this.squadAward = this.FIRST_SQUAD_AWARD;
                    this.addSquad();
                }
                if (this.score > this.SECOND_SQUAD_AWARD && this.squadAward === this.FIRST_SQUAD_AWARD) {
                    this.squadAward = this.SECOND_SQUAD_AWARD;
                    this.addSquad();
                }
            }
        }
        if (this.currentState === GAME_STATE.GAME_OVER) {
            this.startGame();
        }
    }

    handleKeyPress(key) {
        if (key.code === "Space") {
            if (this.currentState === GAME_STATE.GAME_OVER && this.highScorePanel) {
                this.highScorePanel.isShowing() ? this.highScorePanel.hidePanel() : this.highScorePanel.showPanel();
            }
        }
        if (key.code === "Tab") {
            key.preventDefault();
            if (this.currentState != GAME_STATE.HELP) {
                this.prevState = this.currentState;
                this.currentState = GAME_STATE.HELP;
            } else if (this.currentState === GAME_STATE.HELP) {
                if (this.prevState) this.currentState = this.prevState;
            }
        }
    }

    addToLayers(effect) {
        if (!this.layers[effect.layer]) this.layers[effect.layer] = new Set();
        this.layers[effect.layer].add(effect);
    }

    render() {
        setColor("darkgray");
        rect(0, 0, this.width, this.height);

        this.ui.draw();
        this.board.draw(this.currentState);

        this.layers.forEach((layer) => {
            layer.forEach((effect) => {
                effect.render();
            });
        });

        if (this.currentState === GAME_STATE.GAME_OVER) {
            this.board.drawMousePath(this.mouseClicks);
            if (this.highScorePanel && this.highScorePanel.isShowing()) {
                this.highScorePanel.draw();
            }
        }

        if (this.currentState === GAME_STATE.HELP) {
            this.ui.showHelp();
        }
        this.ui.drawCrosshair();
    }

    addSquad() {
        if (this.squadCount < this.MAX_SQUADS) {
            this.squadCount++;
            this.ui.addSquad(this.squadCount);
        }
    }

    endGame() {
        this.currentState = GAME_STATE.ENDING;
        this.calculateFinalScore();
        if (this.board.winner) this.createFireworks();
    }

    gameOver() {
        this.currentState = GAME_STATE.GAME_OVER;
        this.highScorePanel = new HighScorePanel(
            this.width,
            this.height - 54,
            this.score,
            this.board.winner,
            getElapsedTimeString(this.gameTime)
        );
        this.highScorePanel.showPanel();
    }

    calculateFinalScore() {
        this.score += this.board.calculateFinalScore();
        if (this.winner) {
            this.score += this.squadCount * this.SQUAD_BONUS;
        }
    }

    detonateBomb(coords) {
        this.addToLayers(new Explosion(coords));
    }

    createFireworks() {
        const numFireworks = Math.floor(this.score / 10000);
        for (let i = 0; i < numFireworks; i++) {
            this.addToLayers(
                new Firework(
                    new Vec2d(
                        this.width / 4 + (Math.random() * this.width) / 2,
                        this.height / 4 + (Math.random() * this.height) / 2
                    )
                )
            );
        }
    }
}
