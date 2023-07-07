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

        this.lastTime = 0;
        this.dt = 0;

        this.demo = true;
        this.gameOver = true;
        this.score = 0;
    }

    startDemo() {
        this.demo = true;
        this.player = new DemoPlayer(this.playerSprites);
        this.startGame();
    }

    start1Player() {
        this.demo = false;
        this.player = new Player(this.playerSprites);
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
        // update entity positions
        for (let gameObjs of this.gameObjects.values()) {
            for (let obj of gameObjs.values()) {
                obj.update(this.dt);
                // check entity/terrain collisions
                this.validatePosition(obj);
                if (obj.remove) {
                    gameObjs.delete(obj);
                }
            }
        }
        this.player.update(this.dt);

        // check player/enemy collisions

        // check player/item collisions

        this.gameObjects.forEach((gameObj) => {
            if (gameObj.type === "block") {
                gameObj.update();
                if (gameObj.destroyed) {
                    clearForegroundAround(
                        getGridIndex(gameObj.position, this.level.BLOCK_SIZE),
                        this.foregroundLayer
                    );
                }
            }
            if (gameObj.type === "enemy") gameObj.update(this.level);
            if (gameObj.type === "coin") {
                if (calculateAABBCollision(gameObj, this.player)) {
                    this.gameObjects.delete(gameObj);
                    gameObj.collected = true;
                    this.collectCoin();
                }
            }
        });
    }

    validatePosition(obj) {
        // constrain x
        if (obj.position.x < obj.width / 2)
            obj.setPosition({ x: obj.width / 2, y: obj.position.y });
        if (obj.position.x > terrain.width - obj.width / 2)
            obj.setPosition({
                x: terrain.width - obj.width / 2,
                y: obj.position.y,
            });
        // constrain y
        if (obj.position.y < obj.height / 2)
            obj.setPosition({ x: obj.position.x, y: obj.height / 2 });
        if (obj.position.y > terrain.height - obj.height / 2)
            obj.setPosition({
                x: obj.position.x,
                y: terrain.height - obj.height / 2,
            });

        // check blocks around enemy
        this.blocks = getAdjacentBlocks(
            obj.position,
            terrain.blocks,
            terrain.BLOCK_SIZE
        );
        let block = this.blocks.above;
        if (block && block.solid) {
            if (obj.position.y - obj.height / 2 <= block.collider.d.y) {
                obj.position.y = block.collider.d.y + obj.height / 2;
            }
        }
        block = this.blocks.below;
        if (block && block.solid) {
            if (this.position.y + this.height / 2 >= block.collider.a.y) {
                this.position.y = block.collider.a.y - this.height / 2;
                this.grounded = true;
            }
        }
        if (
            block &&
            !block.solid &&
            this.position.x - (this.width / 2) * 0.8 > block.collider.a.x &&
            this.position.x + (this.width / 2) * 0.8 < block.collider.b.x
        ) {
            this.grounded = false;
        }
        block = this.blocks.left;
        if (block && block.solid) {
            if (this.position.x - this.width / 2 <= block.collider.b.x) {
                this.position.x = block.collider.b.x + this.width / 2;
            }
        }
        block = this.blocks.right;
        if (block && block.solid) {
            if (this.position.x + this.width / 2 >= block.collider.a.x) {
                this.position.x = block.collider.a.x - this.width / 2;
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
        });

        this.player.render();

        this.gameObjects.get("items").forEach((item) => {
            item.render();
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
        // p5 text font
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
        console.log("player: ", this.player);
        console.log("gObjs: ", this.gameObjects);

        this.backgroundLayer = this.level.backgroundLayer;
        this.foregroundLayer = this.level.foregroundLayer;

        this.player.setPosition(this.level.playerSpawn);

        this.mineBlockAnimation = new Animation(
            this.blockSprites["block-damage"],
            60,
            false
        );
    }
}
