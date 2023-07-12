import { Player, DemoPlayer } from "./modules/player.js";
import { Enemy } from "./modules/enemies.js";
import { LEVELS } from "./modules/levels.js";
import { LevelArchitect } from "./modules/levelArchitect.js";
import { Animation } from "../modules/graphics/animation.js";
import {
    clearForegroundAround,
    getGridIndex,
    getBlockAbove,
    calculateAABBCollision,
    getAdjacentBlocks,
} from "./modules/utils.js";

import { KEY_CODES } from "../modules/input/keys.js";
import { LayerManager } from "../modules/graphics/layer-manager.js";

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
// window.mousePressed = mousePressed;

const GAME_WIDTH = 512;
const GAME_HEIGHT = 768;

let game = null;

function keyPressed(key) {
    if (KEY_CODES.contains(key.code)) {
        key.preventDefault();
    }
}

// p5.js functions ------------------------>
function preload() {
    let blockSprites = LevelArchitect.loadSprites();
    let playerSprites = Player.loadSpriteSheets();
    let enemySprites = Enemy.loadSpriteSheets();

    let font = loadFont("./bug-dug/res/font/PressStart2P.ttf");

    game = new BugDug(
        GAME_WIDTH,
        GAME_HEIGHT,
        blockSprites,
        playerSprites,
        enemySprites,
        font
    );
}

function setup() {
    let canvas = createCanvas(GAME_WIDTH, GAME_HEIGHT);
    canvas.parent("game");

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

class BugDug {
    PLAYER_1_START_BUTTON = document
        .getElementById("start-1p")
        .addEventListener("click", () => {
            this.start1Player();
        });

    STARTING_LIVES = 3;
    lives = 0;

    level = null;
    backgroundLayer = null;
    foregroundLayer = null;
    mineBlockAnimation = null;

    player = null;
    currentLevel = 0;
    score = 0;

    gameObjects = null;

    DEBUG = false;

    constructor(
        width,
        height,
        blockSprites,
        playerSprites,
        enemySprites,
        font
    ) {
        this.width = width;
        this.height = height;
        this.blockSprites = blockSprites;
        this.playerSprites = playerSprites;
        this.enemySprites = enemySprites;
        this.font = font;

        this.lastTime = Date.now();
        this.dt = 0;

        this.demo = true;
        this.gameOver = true;
        this.score = 0;
    }

    startDemo() {
        this.demo = true;
        this.player = new DemoPlayer(this, this.playerSprites);
        this.startGame();
    }

    start1Player() {
        this.demo = false;
        this.player = new Player(this, this.playerSprites);
        this.startGame();
    }

    startGame() {
        this.gameOver = false;
        this.score = 0;
        this.currentLevel = 0;
        this.lives = this.STARTING_LIVES;

        this.loadLevel();
    }

    update() {
        const nowTime = Date.now();
        this.dt = nowTime - this.lastTime;
        this.lastTime = nowTime;

        this.player.update(this.dt);
        this.constrainPosition(this.player);

        for (let gameObjs of this.gameObjects.values()) {
            for (let obj of gameObjs.values()) {
                obj.update(this.dt);
                // check entity/terrain collisions
                if (obj.type == "enemy") {
                    this.constrainPosition(obj);
                    // check player/enemy collisions
                }
                if (obj.type === "block") {
                    if (obj.destroyed) {
                        clearForegroundAround(
                            getGridIndex(obj.position, this.level.BLOCK_SIZE),
                            this.level.foregroundLayer
                        );
                    }
                }
                if (obj.type === "coin") {
                    if (calculateAABBCollision(obj, this.player)) {
                        this.gameObjects.get("items").delete(obj);
                        this.collectCoin();
                    }
                }
                // check player/item collisions
                if (obj.remove) {
                    gameObjs.delete(obj);
                }
            }
        }
    }

    constrainPosition(obj) {
        const { x, y } = obj.position;
        // constrain x
        if (x < obj.width / 2) obj.position.x = obj.width / 2;
        if (x > this.width - obj.width / 2)
            obj.position.x = this.width - obj.width / 2;
        // constrain y
        if (y < obj.height / 2) obj.position.y = obj.height / 2;
        if (y > this.level.height - obj.height / 2)
            obj.position.y = this.level.height - obj.height / 2;

        // check blocks around enemy
        const blocks = getAdjacentBlocks(
            obj.position,
            this.level.blocks,
            this.level.BLOCK_SIZE
        );
        let block = blocks.above;
        if (block && block.solid) {
            if (y - obj.height / 2 <= block.collider.d.y) {
                obj.position.y = block.collider.d.y + obj.height / 2;
            }
        }
        block = blocks.below;
        if (block && block.solid) {
            if (y + obj.height / 2 >= block.collider.a.y) {
                obj.position.y = block.collider.a.y - obj.height / 2;
                obj.grounded = true;
            }
        }
        if (
            block &&
            !block.solid &&
            x - (obj.width / 2) * 0.8 > block.collider.a.x &&
            x + (obj.width / 2) * 0.8 < block.collider.b.x
        ) {
            obj.grounded = false;
        }
        block = blocks.left;
        if (block && block.solid) {
            if (x - obj.width / 2 <= block.collider.b.x) {
                obj.position.x = block.collider.b.x + obj.width / 2;
            }
        }
        block = blocks.right;
        if (block && block.solid) {
            if (x + obj.width / 2 >= block.collider.a.x) {
                obj.position.x = block.collider.a.x - obj.width / 2;
            }
        }
    }

    collectCoin() {
        this.score += 100;
    }

    render() {
        background(color(this.level.skyColor));
        noStroke();
        // draw background
        for (let i = 0; i < this.backgroundLayer.length; i++) {
            for (let j = 0; j < this.backgroundLayer[i].length; j++) {
                if (this.backgroundLayer[i][j] !== "none") {
                    image(
                        this.backgroundLayer[i][j],
                        i * this.level.BLOCK_SIZE,
                        j * this.level.BLOCK_SIZE,
                        this.level.BLOCK_SIZE,
                        this.level.BLOCK_SIZE
                    );
                }
            }
        }

        this.gameObjects.get("blocks").forEach((block) => {
            block.render();
            if (this.DEBUG) {
                block.renderDebug();
            }
            if (!block.destroyed && block.health < block.MAX_HEALTH) {
                let damageSpriteIndex = Math.floor(
                    map(
                        block.health,
                        0,
                        block.MAX_HEALTH,
                        this.mineBlockAnimation.keyFrames.length - 1,
                        0
                    )
                );
                image(
                    this.mineBlockAnimation.keyFrames[damageSpriteIndex],
                    block.position.x,
                    block.position.y,
                    block.width,
                    block.height
                );
            }
            if (block.destroyed) {
                const blockAbove = getBlockAbove(
                    getGridIndex(block.position, this.level.BLOCK_SIZE),
                    this.level.blocks
                );
                if (blockAbove.destroyed || blockAbove.blockType === "air") {
                    image(
                        this.blockSprites["background-ladder"],
                        block.position.x,
                        block.position.y,
                        block.width,
                        block.height
                    );
                } else {
                    image(
                        this.blockSprites["background-wall"],
                        block.position.x,
                        block.position.y,
                        block.width,
                        block.height
                    );
                }
            }
        });

        this.gameObjects.get("enemies").forEach((enemy) => {
            enemy.render();
            if (this.DEBUG) {
                enemy.renderDebug();
            }
        });

        this.player.render();
        if (this.DEBUG) {
            this.player.renderDebug();
        }

        this.gameObjects.get("items").forEach((item) => {
            item.render();
            if (this.DEBUG) {
                item.renderDebug();
            }
        });

        clearForegroundAround(
            getGridIndex(this.player.position, this.level.BLOCK_SIZE),
            this.level.foregroundLayer,
            1.75
        );

        // draw foreground
        // for (let i = 0; i < this.foregroundLayer.length; i++) {
        //     for (let j = 0; j < this.foregroundLayer[i].length; j++) {
        //         if (this.foregroundLayer[i][j] !== "none") {
        //             image(
        //                 this.foregroundLayer[i][j],
        //                 i * this.level.BLOCK_SIZE,
        //                 j * this.level.BLOCK_SIZE,
        //                 this.level.BLOCK_SIZE,
        //                 this.level.BLOCK_SIZE
        //             );
        //         }
        //     }
        // }

        //draw UI
        stroke("brown");
        strokeWeight(8);
        fill("gray");
        rect(10, 10, this.width - 20, 96);
        textFont(this.font);
        fill("blue");
        noStroke();
        textSize(16);
        text("Level " + (this.currentLevel + 1), 24, 40);
        if (this.player.hasKey) {
            image(
                this.blockSprites["white-key"],
                this.width - 80,
                54,
                32,
                32,
                0,
                0,
                16,
                16
            );
        }
        for (let i = 0; i < this.lives; i++) {
            image(
                this.playerSprites["idle"],
                this.width - 44 - 32 * i,
                20,
                24,
                24,
                0,
                0,
                32,
                32
            );
        }
    }

    loadLevel() {
        this.level = new LevelArchitect(
            this.width,
            this.height,
            LEVELS[this.currentLevel],
            this.blockSprites,
            this.enemySprites
        );
        this.gameObjects = this.level.getGameObjects();

        this.backgroundLayer = this.level.backgroundLayer;
        this.foregroundLayer = this.level.foregroundLayer;

        this.player.setPosition(this.level.playerSpawn);

        this.mineBlockAnimation = new Animation(
            this.blockSprites["block-damage"],
            60,
            false
        );

        console.log("player: ", this.player);
        console.log("gObjs: ", this.gameObjects);
    }
}
