import { GAME_STATE } from "./modules/game-state.js";
import { BoardManager } from "./modules/board-manager.js";
import { UI } from "./modules/ui.js";
import { HighScorePanel } from "./modules/highscore-panel.js";
import { Vec } from "../modules/math/vec.js";
import { Explosion, Fireworks } from "./modules/visual-effects.js";
import { setColor, getElapsedTimeString } from "./modules/utils.js";

import { LayerManager } from "../modules/graphics/layer-manager.js";

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
//window.mousePressed = mousePressed;
window.addEventListener("mouseup", mousePressed);

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

let game = null;

function preload() {
    let sprites = {};
    sprites["flag"] = loadImage("./mine-squad/res/img/flag.png");
    sprites["bomb"] = loadImage("./mine-squad/res/img/bomb.png");
    sprites["bomb_defused"] = loadImage(
        "./mine-squad/res/img/bomb-defused.png"
    );
    sprites["background"] = loadImage("./mine-squad/res/img/grass.png");
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
        game.handleMouseClick();
    }
}

class MineSquad {
    PLAYER_1_START_BUTTON = document
        .getElementById("start-1p")
        .addEventListener("click", () => {
            this.start1Player();
        });

    static sprites;

    MAX_TILES_WIDTH = 31;
    MAX_TILES_HEIGHT = 16;
    MAX_MINES = 99;
    STARTING_SQUADS = 0;
    FIRST_SQUAD_AWARD = 20000;
    MAX_SQUADS = 3;
    TILE_MULTIPLIER = 100;
    TILE_BONUS = 100;
    SQUAD_BONUS = 10000;
    DEFUSE_BONUS = 4000;
    BASE_CLICK_BONUS = 10000;
    FLAG_COST = 100;

    DEFAULT_BOARD_CONFIG = {
        wTiles: 10,
        hTiles: 10,
        mines: 10,
    };

    showHighScores = false;

    level = 1;

    score = 0;
    time = 0;
    squadCount = 0;
    squad_bonus_threshold;

    flagsUsed = 0;

    mouseClicks = [];
    clicksThisLevel = 0;

    cursorScreenPos = new Vec();

    visualEffects = new Set();
    tilesToScore = [];

    currentState = GAME_STATE.STARTING;

    BOARD_MARGIN = 4;
    UI_HEIGHT = 52;

    constructor(screenWidth, screenHeight, sprites) {
        this.width = screenWidth;
        this.height = screenHeight;
        this.sprites = sprites;

        textSize(this.TILE_HEIGHT);
        textAlign(CENTER, CENTER);
        textSize(28);

        this.boardBounds = {
            pos: new Vec(this.BOARD_MARGIN, this.BOARD_MARGIN, 0),
            width: this.width - this.BOARD_MARGIN * 2,
            height: this.height - (this.BOARD_MARGIN * 2 + this.UI_HEIGHT),
        };

        this.boardManager = new BoardManager(this, MineSquad.sprites);
        this.ui = new UI(this);

        const snd1 = new Audio();
        snd1.src = "./mine-squad/res/snd/points_low.wav";
        const snd2 = new Audio();
        snd2.src = "./mine-squad/res/snd/points.wav";
        const snd3 = new Audio();
        snd3.src = "./mine-squad/res/snd/points_high.wav";

        this.pointsSounds = [snd1, snd2, snd3];
    }

    startDemo() {
        this.startGame();
    }

    start1Player() {
        this.startGame();
    }

    startGame() {
        this.lastTime = Date.now();
        this.dt = 0;
        this.gameTime = 0;

        this.level = 1;
        this.score = 0;
        this.squadCount = this.STARTING_SQUADS;
        this.squad_bonus_threshold = this.FIRST_SQUAD_AWARD;
        this.flagsUsed = 0;

        this.mouseClicks = [];
        this.clicksThisLevel = 0;

        this.boardConfig = {
            wTiles: this.DEFAULT_BOARD_CONFIG.wTiles,
            hTiles: this.DEFAULT_BOARD_CONFIG.hTiles,
            mines: this.DEFAULT_BOARD_CONFIG.mines,
        };

        this.boardManager.generateBoard(this.boardConfig);
        this.layers = [];

        this.tilesToScore = [];

        this.currentState = GAME_STATE.STARTING;
    }

    nextLevel() {
        this.level++;
        if (
            this.level % 2 == 1 &&
            this.boardConfig.hTiles < this.MAX_TILES_HEIGHT
        ) {
            this.boardConfig.hTiles++;
            if (this.boardConfig.hTiles > this.MAX_TILES_HEIGHT) {
                this.boardConfig.hTiles = this.MAX_TILES_HEIGHT;
            }
        } else {
            this.boardConfig.wTiles++;
            if (this.boardConfig.wTiles > this.MAX_TILES_WIDTH) {
                this.boardConfig.wTiles = this.MAX_TILES_WIDTH;
            }
        }
        this.boardConfig.mines = Math.floor(
            this.boardConfig.wTiles * this.boardConfig.hTiles * 0.25
        );
        if (this.boardConfig.mines > this.MAX_MINES)
            this.boardConfig.mines = this.MAX_MINES;
        this.boardManager.generateBoard(this.boardConfig);
        this.currentState = GAME_STATE.STARTING;
        this.mouseClicks = [];
    }

    pointSoundIndex = 0;
    scoringTime = 0;
    update() {
        this.cursorScreenPos.set(mouseX, mouseY);
        const nowTime = Date.now();
        this.dt = nowTime - this.lastTime;
        this.lastTime = nowTime;

        switch (this.currentState) {
            case GAME_STATE.STARTING:
                break;
            case GAME_STATE.PLAYING:
                this.gameTime += this.dt;
                if (this.boardManager.completed) {
                    this.tilesToScore = this.boardManager.getScoreableTiles();
                    this.currentState = GAME_STATE.LEVEL_SCORING;
                }
                break;
            case GAME_STATE.LEVEL_SCORING:
                if (this.boardManager.winner && this.tilesToScore.length) {
                    this.scoringTime += this.dt;
                    if (this.scoringTime > 125) {
                        this.scoringTime = 0;
                        const tile = this.tilesToScore.pop();
                        this.pointSoundIndex =
                            (this.pointSoundIndex + 1) %
                            this.pointsSounds.length;
                        const pointsSound =
                            this.pointsSounds[this.pointSoundIndex];
                        pointsSound.play();
                        const score = this.TILE_BONUS * tile.value * this.level;
                        this.score += score;
                        this.boardManager.addScoreEffect(tile, score);
                        this.checkSquadBonus();
                    }
                } else if (
                    !this.boardManager.winner &&
                    this.tilesToScore.length
                ) {
                    this.scoringTime += this.dt;
                    if (this.scoringTime > 250) {
                        this.scoringTime = 0;
                        const tile = this.tilesToScore.pop();
                        tile.hidden = false;
                        this.boardManager.addExplosion(tile);
                    }
                } else if (LayerManager.LayersComplete()) {
                    this.calculateLevelScore();
                    if (this.boardManager.winner) {
                        this.createFireworks();
                    }
                    this.currentState = GAME_STATE.LEVEL_ENDING;
                }
                break;
            case GAME_STATE.LEVEL_ENDING:
                if (LayerManager.LayersComplete()) {
                    if (this.boardManager.winner) {
                        const winSound = new Audio();
                        winSound.src = "./mine-squad/res/snd/fanfare.wav";
                        winSound.play();
                        this.nextLevel();
                        this.currentState = GAME_STATE.STARTING;
                    } else {
                        this.calculateFinalScore();
                        this.gameOver();
                    }
                }
                break;
            case GAME_STATE.GAME_OVER:
                break;
            default:
                console.error(`invalid game state: ${this.currentState}`);
        }

        LayerManager.Update(this.dt);

        this.ui.update({
            level: this.level,
            score: this.score,
            nextBonus: this.squad_bonus_threshold,
            squads: this.squadCount,
            time: this.gameTime,
            ...this.boardManager.getUiData(),
        });
    }

    handleMouseClick() {
        if (this.boardManager.isOnBoard(this.cursorScreenPos)) {
            this.mouseClicks.push(this.cursorScreenPos.copy());
            this.clicksThisLevel++;

            const tileIndex = this.boardManager.getIndex(this.cursorScreenPos);
            let tile = this.boardManager.getTileByIndex(tileIndex);

            if (this.currentState === GAME_STATE.STARTING) {
                while (tile.value != 0 || tile.bomb) {
                    this.boardManager.generateBoard(this.boardConfig);
                    tile = this.boardManager.getTileByIndex(tileIndex);
                }
                this.currentState = GAME_STATE.PLAYING;
            }
            if (this.currentState === GAME_STATE.PLAYING) {
                if (keyIsDown(CONTROL)) {
                    this.addFlag(tile);
                    return;
                }
                if (tile.flagged) {
                    tile.flagged = false;
                    const removeFlagSound = new Audio();
                    removeFlagSound.src =
                        "./mine-squad/res/snd/remove-flag.wav";
                    removeFlagSound.play();
                    return;
                }

                if (tile.hidden) {
                    if (keyIsDown(SHIFT)) {
                        this.useSquad(tile, tileIndex);
                    } else {
                        const selectSound = new Audio();
                        selectSound.src = "./mine-squad/res/snd/select.wav";
                        selectSound.play();
                        this.boardManager.checkTile(tile, tileIndex);
                    }
                }
                this.checkSquadBonus();
            }
        }
        if (this.currentState === GAME_STATE.GAME_OVER) {
            this.startGame();
        }
    }

    handleKeyPress(key) {
        if (key.code === "Space") {
            if (
                this.currentState === GAME_STATE.GAME_OVER &&
                this.highScorePanel
            ) {
                this.highScorePanel.isShowing()
                    ? this.highScorePanel.hidePanel()
                    : this.highScorePanel.showPanel();
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

    render() {
        setColor("darkgray");
        rect(0, 0, this.width, this.height);

        image(MineSquad.sprites["background"], 0, 0, this.width, this.height);

        this.boardManager.draw(this.cursorScreenPos);

        LayerManager.Render();

        if (this.currentState === GAME_STATE.GAME_OVER) {
            this.boardManager.drawMousePath(this.mouseClicks);
            if (this.highScorePanel && this.highScorePanel.isShowing()) {
                this.highScorePanel.draw();
            }
        }

        if (this.currentState === GAME_STATE.HELP) {
            this.ui.showHelp();
        }
        this.ui.draw();
        this.ui.drawCrosshair();
    }

    checkSquadBonus() {
        if (this.score > this.squad_bonus_threshold) {
            this.squad_bonus_threshold = this.squad_bonus_threshold * 2;
            this.addSquad();
            this.checkSquadBonus();
        }
    }

    useSquad(tile, tileIndex) {
        if (this.squadCount > 0) {
            this.squadCount--;
            this.boardManager.defuseWithinRadius(tile, tileIndex);
            const defuseSound = new Audio();
            defuseSound.src = "./mine-squad/res/snd/defuse.wav";
            defuseSound.play();
        } else {
            const deniedSound = new Audio();
            deniedSound.src = "./mine-squad/res/snd/denied.wav";
            deniedSound.play();
        }
    }

    addFlag(tile) {
        if (
            this.score >= this.FLAG_COST &&
            this.boardManager.getFlagCount() < this.boardConfig.mines
        ) {
            tile.flagged = true;
            this.flagsUsed++;
            this.score -= this.FLAG_COST;
            this.boardManager.addScoreEffect(tile, -this.FLAG_COST);
            const placeFlagSound = new Audio();
            placeFlagSound.src = "./mine-squad/res/snd/place-flag.wav";
            placeFlagSound.play();
        } else {
            const flagDeniedSound = new Audio();
            flagDeniedSound.src = "./mine-squad/res/snd/denied.wav";
            flagDeniedSound.play();
        }
    }

    addSquad() {
        if (this.squadCount < this.MAX_SQUADS) {
            const powerupSound = new Audio();
            powerupSound.src = "./mine-squad/res/snd/powerup.wav";
            powerupSound.play();
            this.squadCount++;
            this.ui.addSquad(this.squadCount);
        } else {
            const deniedSound = new Audio();
            deniedSound.src = "./mine-squad/res/snd/denied.wav";
            deniedSound.play();
            this.ui.addSquad(this.squadCount, true);
        }
    }

    gameOver() {
        this.currentState = GAME_STATE.GAME_OVER;
        this.highScorePanel = new HighScorePanel(
            this.width,
            this.height - 54,
            this.score,
            this.level,
            getElapsedTimeString(this.gameTime)
        );
        this.highScorePanel.showPanel();
        this.level = 1;

        this.boardConfig = {
            wTiles: this.DEFAULT_BOARD_CONFIG.wTiles,
            hTiles: this.DEFAULT_BOARD_CONFIG.hTiles,
            mines: this.DEFAULT_BOARD_CONFIG.mines,
        };
    }

    calculateLevelScore() {
        this.score += this.getClickBonus();
    }

    calculateFinalScore() {
        this.score += this.boardManager.calculateFinalScore(
            this.level,
            this.TILE_BONUS
        );
        if (this.winner) {
            this.score += this.squadCount * this.SQUAD_BONUS;
        }
        this.score += this.getClickBonus();
    }

    getClickBonus() {
        return Math.floor(
            this.level * this.BASE_CLICK_BONUS * (1 / this.clicksThisLevel)
        );
    }

    detonateBomb(coords) {
        const explosionSound = new Audio();
        explosionSound.src = "./mine-squad/res/snd/explosion.wav";
        explosionSound.play();
        LayerManager.AddObject(new Explosion(coords));
    }

    createFireworks(num) {
        const numFireworks = num || this.level;
        for (let i = 0; i < numFireworks; i++) {
            LayerManager.AddObject(
                new Fireworks(
                    new Vec(
                        this.width / 4 + (Math.random() * this.width) / 2,
                        this.height / 4 + (Math.random() * this.height) / 2
                    ),
                    {
                        numStars: 20,
                        starSize: 8,
                    }
                )
            );
        }
    }
}
