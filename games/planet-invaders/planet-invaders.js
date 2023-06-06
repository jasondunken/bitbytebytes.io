import { World } from "./modules/world.js";
import { Scoreboard } from "./modules/scoreboard.js";
import { Player, DemoPlayer } from "./modules/player.js";

import { Vec } from "./modules/math/vec.js";

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
    PLAYER_1_START_BUTTON = document
        .getElementById("start-1p")
        .addEventListener("click", () => {
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
    player = null;
    level = 0;
    score = 0;

    constructor(width, height, font) {
        this.width = width;
        this.height = height;
        this.font = font;
        this.scoreboard = new Scoreboard(width, this.SCOREBOARD_HEIGHT);
        this.world = new World(this, width, height);
        this.playerSpawn = new Vec(
            this.width / 2,
            this.height - this.world.PLAYER_SIZE
        );
    }

    startDemo() {
        this.currentState = this.GAME_STATE.STARTING;
        this.player = new DemoPlayer(
            this.world,
            this.playerSpawn.copy(),
            World.resources.sprites["ship"],
            this.world.PLAYER_SIZE,
            this.world.PLAYER_SPEED
        );
        this.startGame();
    }

    start1Player() {
        this.currentState = this.GAME_STATE.STARTING;
        this.player = new Player(
            this.world,
            this.playerSpawn.copy(),
            World.resources.sprites["ship"],
            this.world.PLAYER_SIZE,
            this.world.PLAYER_SPEED
        );
        this.startGame();
    }

    startGame() {
        this.lives = this.STARTING_LIVES;
        this.level = 0;
        this.score = 0;
        this.startLevel();
    }

    startLevel() {
        this.currentState = this.GAME_STATE.LEVEL_STARTING;
        this.world.start(this.level);
        this.currentState = this.GAME_STATE.PLAYING;
    }

    endGame() {
        this.currentState = this.GAME_STATE.ENDING;
        // game over animations
        this.currentState = this.GAME_STATE.GAME_OVER;
        this.gameOverTime = 0;
    }

    respawnPlayer() {
        this.player.position = this.playerSpawn.copy();
    }

    addScore(type, multi) {
        multi = multi ? multi : 1;
        switch (type) {
            case "alien":
                this.score += 100 * multi;
                break;
            case "bonus":
                this.score += 1000 * multi;
                break;
            default:
                console.log(`unknown type ${type}, can't determine score!`);
        }
    }

    levelCompleted() {
        this.level++;
        this.startLevel();
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
            this.player.update();
            if (this.player.dead) {
                this.lives--;
                if (this.lives <= 0) {
                    this.endGame();
                } else {
                    this.respawnPlayer();
                }
            }
        }
        this.scoreboard.update(this.level, this.score, this.lives);
        //this.currentState = this.GAME_STATE.GAME_OVER;
    }

    render() {
        this.world.render();
        this.player.render();
        this.scoreboard.render(this.score, this.level, this.lives);

        // textAlign(CENTER);
        // textSize(24);
        // stroke("white");
        // strokeWeight(1);
        // noFill();
        // text("Planet Invaders", this.width / 2, this.height / 2);

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
