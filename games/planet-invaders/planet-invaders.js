import { World } from "./modules/world.js";
import { Scoreboard } from "./modules/scoreboard.js";

window.preload = preload;
window.setup = setup;
window.draw = draw;

const GAME_WIDTH = 512; // 32 x 16px
const GAME_HEIGHT = 400; // 25 x 16px

let game = null;

async function preload() {
    await World.loadResources();
    loadFont("./planet-invaders/res/font/PressStart2P.ttf", (font) => {
        game = new PlanetInvaders(GAME_WIDTH, GAME_HEIGHT, font);
    });
}

function setup() {
    let canvas = createCanvas(GAME_WIDTH, GAME_HEIGHT);
    canvas.parent("game");

    textFont(game.font);

    frameRate(60);
    noSmooth();
    initGame();
}

function initGame() {
    game.startDemo();
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

    world = null;

    constructor(width, height, font) {
        this.width = width;
        this.height = height;
        this.font = font;
        this.scoreboard = new Scoreboard(width, this.SCOREBOARD_HEIGHT);
        this.world = new World(width, height);
    }

    startDemo() {
        this.currentState = this.GAME_STATE.STARTING;
        this.world.start(this.DEMO_STARTING_LIVES, true);
    }

    start1Player() {
        this.currentState = this.GAME_STATE.STARTING;
        this.world.start(this.STARTING_LIVES, false);
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
            this.world.update();
            if (this.world.lives <= 0) this.endGame();
        }
    }

    render() {
        this.world.render();
        this.scoreboard.render(this.world.score, this.world.wave, this.world.lives);

        textAlign(CENTER);
        textSize(24);
        stroke("red");
        strokeWeight(1);
        text("Planet Invaders", this.width / 2, this.height / 2);

        if (this.currentState === this.GAME_STATE.GAME_OVER) {
            stroke("white");
            strokeWeight(4);
            fill("blue");
            textAlign(CENTER);
            textSize(32);
            text(`GAME OVER`, this.width / 2, this.height / 2);
        }
    }
}
