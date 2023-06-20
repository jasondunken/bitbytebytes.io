import { KEY_CODES } from "../modules/input/keys.js";

import { World } from "./modules/world.js";
import { Scoreboard } from "./modules/scoreboard.js";
import { Player, DemoPlayer } from "./modules/player.js";

import { PixelExplosionLarge } from "./modules/visual-effects.js";

import { Vec } from "../modules/math/vec.js";

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;

const GAME_WIDTH = 512;
const GAME_HEIGHT = 400;

let game;

async function preload() {
    await World.loadResources();
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
    game.startDemo();
}

const DEBUG = false;
function draw() {
    game.update();
    game.render(DEBUG);
}

function keyPressed(event) {
    if (KEY_CODES.contains(event.keyCode)) {
        event.preventDefault();
    }
}

class PlanetInvaders {
    PLAYER_1_START_BUTTON = document
        .getElementById("start-1p")
        .addEventListener("click", () => {
            this.start1Player();
        });
    SCOREBOARD_HEIGHT = 36;

    LEVEL_START_DELAY = 120;
    END_GAME_TIMER = 120;
    DEMO_RESTART_DELAY = 900;

    STARTING_LIVES = 3;
    DEMO_STARTING_LIVES = 1;
    BONUS_SHIP_INTERVAL = 25000;

    GAME_STATE = Object.freeze({
        STARTING: "STARTING",
        HELP: "HELP",
        LEVEL_STARTING: "LEVEL_STARTING",
        PLAYING: "PLAYING",
        RESPAWNING: "RESPAWNING",
        ENDING: "ENDING",
        GAME_OVER: "GAME_OVER",
        CRITICAL_ERROR: "CRITICAL_ERROR",
    });
    currentState = this.GAME_STATE.GAME_OVER;

    gameOverTime = 0;

    world = null;
    player = null;
    level = 0;
    score = 0;

    constructor(width, height) {
        this.width = width;
        this.height = height;
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
            this.world.PLAYER_COLLIDER_SIZE,
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
            this.world.PLAYER_COLLIDER_SIZE,
            this.world.PLAYER_SPEED
        );
        this.startGame();
    }

    startGame() {
        this.lives = this.STARTING_LIVES;
        this.nextBonusShip = this.BONUS_SHIP_INTERVAL;
        this.level = 0;
        this.score = 0;
    }

    startLevel() {
        // can't load level until resources have finished loading!
        this.world.start(this.level);
    }

    endGame() {
        this.gameEndTimer = this.END_GAME_TIMER;
        this.currentState = this.GAME_STATE.ENDING;
    }

    aliensWon() {
        this.lives--;
        if (this.lives <= 0) {
            this.endGame();
        } else {
            this.currentState = this.GAME_STATE.RESPAWNING;
            this.player.position.set(this.playerSpawn.copy());
            this.startLevel();
        }
    }

    respawnPlayer() {
        this.respawnTimer = this.LEVEL_START_DELAY;
        this.currentState = this.GAME_STATE.RESPAWNING;
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

    addShip() {
        this.lives++;
    }

    levelCompleted() {
        this.level++;
        this.startLevel();
    }

    update() {
        if (this.currentState === this.GAME_STATE.STARTING) {
            if (World.resourcesLoaded) {
                this.currentState = this.GAME_STATE.LEVEL_STARTING;
                this.startLevel();
            }
        } else {
            this.updateGameLogic();
        }
    }

    updateGameLogic() {
        if (this.currentState === this.GAME_STATE.GAME_OVER) {
            this.gameOverTime++;
            if (this.gameOverTime >= this.DEMO_RESTART_DELAY) {
                this.startDemo();
            }
        }

        if (this.currentState === this.GAME_STATE.LEVEL_STARTING) {
            this.world.levelTime++;
            if (this.world.levelTime >= this.LEVEL_START_DELAY) {
                this.currentState = this.GAME_STATE.PLAYING;
            }
        }

        if (this.currentState === this.GAME_STATE.RESPAWNING) {
            this.respawnTimer--;
            this.world.updateVisualEffects();
            if (this.respawnTimer <= 0) {
                this.player.sprite = World.resources.sprites["ship"];
                this.player.position.set(this.playerSpawn);
                this.currentState = this.GAME_STATE.PLAYING;
            }
        }

        if (this.currentState === this.GAME_STATE.PLAYING) {
            this.player.update();
            this.world.update();
            for (let shot of this.world.gameObjects.shots) {
                const collision = this.world.shotCollision(shot, this.player);
                if (collision) {
                    this.world.deleteGameObject(shot);
                    switch (collision.colliderId) {
                        case 0:
                            this.player.sprite =
                                World.resources.sprites["ship-destroyedL"];
                            break;
                        case 1:
                            this.player.sprite =
                                World.resources.sprites["ship-destroyedC"];
                            break;
                        case 2:
                            this.player.sprite =
                                World.resources.sprites["ship-destroyedR"];
                            break;
                    }
                    this.world.addGameObject(
                        new PixelExplosionLarge(this.player.colliders[0].copy())
                    );
                    this.world.addGameObject(
                        new PixelExplosionLarge(this.player.colliders[1].copy())
                    );
                    this.world.addGameObject(
                        new PixelExplosionLarge(this.player.colliders[2].copy())
                    );
                    this.lives--;
                    if (this.lives <= 0) {
                        this.endGame();
                    } else {
                        this.respawnPlayer();
                    }
                }
            }
        }

        if (this.currentState === this.GAME_STATE.ENDING) {
            this.gameEndTimer--;
            this.world.updateVisualEffects();
            if (this.gameEndTimer <= 0) {
                this.gameOverTime = 0;
                this.currentState = this.GAME_STATE.GAME_OVER;
            }
        }

        if (this.score > this.nextBonusShip) {
            this.addShip();
            this.nextBonusShip += this.BONUS_SHIP_INTERVAL;
        }
        this.scoreboard.update(this.level, this.score, this.lives);
    }

    render(debug) {
        if (World.resourcesLoaded) {
            textFont(World.resources.font);
            this.world.render(debug);
            if (this.currentState === this.GAME_STATE.LEVEL_STARTING) {
                if (this.world.levelTime % 30 < 15) this.player.render();
            } else if (this.currentState === this.GAME_STATE.RESPAWNING) {
                if (this.respawnTimer % 30 < 15) this.player.render();
            } else {
                this.player.render(debug);
            }
            this.scoreboard.render(this.score, this.level, this.lives);
        }

        if (
            this.player instanceof DemoPlayer &&
            this.currentState != this.GAME_STATE.GAME_OVER
        ) {
            stroke("red");
            strokeWeight(1);
            noFill();
            textSize(28);
            textAlign(CENTER, CENTER);
            text("Planet Invaders", this.width / 2, this.height / 2);
            noStroke();
            fill("red");
            textSize(14);
            if (frameCount % 60 < 30) {
                text("PRESS START", this.width / 2, this.height / 2 + 32);
            }
        }

        if (this.currentState === this.GAME_STATE.GAME_OVER) {
            stroke("white");
            strokeWeight(2);
            fill("red");
            textAlign(CENTER);
            textSize(32);
            if (frameCount % 120 < 100) {
                text(`GAME OVER`, this.width / 2, this.height / 2);
            }
        }
    }
}
