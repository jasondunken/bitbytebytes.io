import { Level } from "./modules/level.js";
import { Scoreboard } from "./modules/scoreboard.js";

window.preload = preload;
window.setup = setup;
window.draw = draw;

const GAME_WIDTH = 512; // 32 x 16px
const GAME_HEIGHT = 400; // 25 x 16px

let game = null;

function preload() {
    SpriteLoader.loadSprites();
}

function setup() {
    let canvas = createCanvas(GAME_WIDTH, GAME_HEIGHT);
    canvas.parent("game");

    frameRate(60);
    noSmooth();
    initGame();
}

function initGame() {
    game = new PlanetInvaders(GAME_WIDTH, GAME_HEIGHT);
}

function draw() {
    game.update();
    game.render();
}

// PlanetInvaders
class PlanetInvaders {
    PLAYER_1_START_BUTTON = document.getElementById("start-1p").addEventListener("click", () => {
        this.start1Player();
    });
    SCOREBOARD_HEIGHT = 48;

    START_DELAY = 60;
    DEMO_RESTART_DELAY = 1800;

    STARTING_LIVES = 3;
    DEMO_STARTING_LIVES = 1;

    GAME_STATE = Object.freeze({
        STARTING: "STARTING",
        HELP: "HELP",
        LEVEL_STARTING: "LEVEL_STARTING",
        PLAYING: "PLAYING",
        ENDING: "ENDING",
        GAME_OVER: "GAME_OVER",
    });
    currentState = this.GAME_STATE.GAME_OVER;

    gameOverTime = 0;

    lives = 0;
    score = 0;

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.scoreboard = new Scoreboard(width, this.SCOREBOARD_HEIGHT);
        this.level = new Level(width, height);
        this.startDemo();
    }

    startDemo() {
        this.isDemo = true;
        this.lives = this.DEMO_STARTING_LIVES;
        this.startGame();
    }

    start1Player() {
        this.isDemo = false;
        this.lives = this.STARTING_LIVES;
        this.startGame();
    }

    startGame() {
        this.currentState = this.GAME_STATE.STARTING;
        this.score = 0;
        this.level.start();
        this.currentState = this.GAME_STATE.PLAYING;
    }

    endGame() {
        this.gameOverTime = 0;
        this.currentState = this.GAME_STATE.GAME_OVER;
    }

    update() {
        if (this.currentState === this.GAME_STATE.GAME_OVER) {
            this.gameOverTime++;
            if (this.gameOverTime >= this.DEMO_RESTART_DELAY) {
                this.startDemo();
            }
        }

        if (this.currentState === this.GAME_STATE.PLAYING) {
            this.level.update();
            if (this.lives <= 0) this.endGame();
        }
    }

    render() {
        this.level.render();
        this.scoreboard.render(this.score, this.lives);

        if (this.currentState === this.GAME_STATE.GAME_OVER) {
            stroke("white");
            strokeWeight(4);
            fill("blue");
            textSize(32);
            textAlign(CENTER);
            text(`GAME OVER`, this.width / 2, this.height / 2);
        }
    }
}
