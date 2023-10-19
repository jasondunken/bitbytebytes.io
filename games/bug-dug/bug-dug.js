import { Player, DemoPlayer } from "./modules/player.js";
import { Enemy } from "./modules/enemies.js";
import { Block, Ladder } from "./modules/blocks.js";
import { LEVELS } from "./modules/levels.js";
import { LevelArchitect } from "./modules/levelArchitect.js";
import { Animation } from "../modules/graphics/animation.js";
import { Coin, Key } from "./modules/item.js";
import {
    clearForegroundAround,
    getGridIndex,
    calculateAABBCollision,
    getAdjacentBlocks,
    getBlockAtPosition,
    getBlockBelowPosition,
} from "./modules/utils.js";

import { KEY_CODES, KEY_NAMES } from "../modules/input/keys.js";

import { UI } from "./modules/ui.js";
import { Vec } from "../modules/math/vec.js";

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
// window.mousePressed = mousePressed;

const GAME_WIDTH = 512;
const GAME_HEIGHT = 768;

let game = null;

function keyPressed(key) {
    if (KEY_CODES.contains(key.keyCode)) {
        key.preventDefault();
    }
}

document.onkeydown = (key) => {
    if (KEY_NAMES.contains(key.code)) {
        key.preventDefault();
    }
};

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

let times = 0;
function draw() {
    // if (times < 10) {
    //     noFill();
    //     stroke("blue");
    //     rect(240, 368, 32, 32);
    //     let pos = new Vec(256, 400);
    //     point(pos.x, pos.y);
    //     let rndX = Math.random() * 0.5 + 0.5;
    //     rndX = Math.random() > 0.5 ? rndX : -rndX;
    //     let velocity = new Vec(rndX, -1).normalize().mult(15);
    //     for (let i = 0; i < 320; i++) {
    //         velocity = Vec.add2(velocity, new Vec(0, 3));
    //         const prev = new Vec(pos.x, pos.y);
    //         pos.add(velocity);
    //         stroke("red");
    //         point(pos.x, pos.y);
    //         line(prev.x, prev.y, pos.x, pos.y);
    //     }
    //     times++;
    // }
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
    blockDamageSprites = null;

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

        this.ui = new UI(new Vec(10, 10), this.width - 20, 96);
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

        clearForegroundAround(
            getGridIndex(this.player.position, this.level.BLOCK_SIZE),
            this.level.foregroundLayer,
            1.75
        );

        this.level.enemies.forEach((enemy) => {
            enemy.update(this.dt);
            this.constrainPosition(enemy);
        });

        this.level.items.forEach((item) => {
            item.update(this.dt);
            if (item.type != "chest") {
                this.constrainPosition(item);
            }
            if (item.type === "coin" && item.grounded) {
                if (calculateAABBCollision(item, this.player)) {
                    this.level.items.delete(item);
                    this.collectCoin();
                }
            }
            if (item.type === "chest") {
                if (calculateAABBCollision(item, this.player)) {
                    let contents = item.open();
                    // console.log("contents: ", contents);
                    for (let item of contents) {
                        let new_item = null;
                        switch (item.type) {
                            case "coin":
                                new_item = new Coin(
                                    item.position.copy(),
                                    this.blockSprites["coin-gold"]
                                );
                                break;
                            case "key":
                                new_item = new Key(
                                    item.position.copy(),
                                    this.blockSprites["white-key"]
                                );
                                break;
                        }
                        if (new_item) {
                            new_item.launch();
                            this.level.items.add(new_item);
                        }
                    }
                    this.level.items.delete(item);
                }
            }
            if (item.type === "key" && item.grounded) {
                if (calculateAABBCollision(item, this.player)) {
                    this.level.items.delete(item);
                    this.player.hasKey = true;
                }
            }
        });

        for (let i = 0; i < this.level.blocks.length; i++) {
            for (let j = 0; j < this.level.blocks[i].length; j++) {
                const block = this.level.blocks[i][j];
                block.update(this.dt);
                if (block.blockType === "door") {
                    if (calculateAABBCollision(block, this.player)) {
                        block.unlock();
                        this.player.hasKey = false;
                    }
                }
                if (block.destroyed) {
                    clearForegroundAround(
                        getGridIndex(block.position, this.level.BLOCK_SIZE),
                        this.level.foregroundLayer
                    );
                    const blocks = this.getBlocks(block.position);
                    if (
                        blocks.above.blockType === "air" ||
                        blocks.above.blockType === "ladder"
                    ) {
                        this.level.blocks[i][j] = new Ladder(
                            block.position,
                            this.blockSprites["background-ladder"]
                        );
                    } else {
                        this.level.blocks[i][j] = new Block(
                            block.position,
                            32,
                            32,
                            "air",
                            this.blockSprites["background-wall"]
                        );
                    }
                }
            }
        }
    }

    constrainPosition(obj) {
        const collider = obj.collider;
        const { x, y } = obj.position;
        // constrain x
        if (x < collider.width / 2) obj.position.x = collider.width / 2;
        if (x > this.width - collider.width / 2)
            obj.position.x = this.width - collider.width / 2;
        // constrain y
        if (y < collider.height / 2) obj.position.y = collider.height / 2;
        if (y > this.height - collider.height / 2)
            obj.position.y = this.height - collider.height / 2;

        // check for block collisions
        const blocks = this.getBlocks(obj.position);
        let block = blocks.above;
        if (block && block.solid) {
            if (y - collider.height / 2 <= block.collider.d.y) {
                obj.position.y = block.collider.d.y + obj.height / 2;
            }
        }
        block = blocks.below;
        if (block && block.solid) {
            if (y + collider.height / 2 >= block.collider.a.y) {
                obj.position.y = block.collider.a.y - obj.height / 2;
                obj.grounded = true;
            }
        }
        if (
            block &&
            !block.solid &&
            x - collider.width / 2 >= block.collider.a.x &&
            x + collider.width / 2 <= block.collider.b.x
        ) {
            obj.grounded = false;
        }
        block = blocks.left;
        if (block && block.solid) {
            if (x - collider.width / 2 <= block.collider.b.x) {
                obj.position.x = block.collider.b.x + collider.width / 2;
            }
        }
        block = blocks.right;
        if (block && block.solid) {
            if (x + collider.width / 2 >= block.collider.a.x) {
                obj.position.x = block.collider.a.x - collider.width / 2;
            }
        }

        if (obj.type === "player" && obj.grounded) {
            obj.onLadder = false;
        }
    }

    seeIfLadder(position) {
        const blocks = this.getBlocks(position);
        if (blocks.above.blockType === "air") {
            const ladder = new Ladder(
                position,
                this.blockSprites["background-ladder"]
            );
            const idx = getGridIndex(position, this.level.BLOCK_SIZE);
            this.level.blocks[idx.x][idx.y] = ladder;
        }
    }

    getBlocks(position) {
        return getAdjacentBlocks(
            position,
            this.level.blocks,
            this.level.blockSize
        );
    }

    getBlock(position) {
        return getBlockAtPosition(
            position,
            this.level.blocks,
            this.level.blockSize
        );
    }

    getBlockBelow(position) {
        return getBlockBelowPosition(
            position,
            this.level.blocks,
            this.level.blockSize
        );
    }

    getBlockLeft(position) {
        return getAdjacentBlocks(
            position,
            this.level.blocks,
            this.level.blockSize
        ).left;
    }

    getBlockRight(position) {
        return getAdjacentBlocks(
            position,
            this.level.blocks,
            this.level.blockSize
        ).right;
    }

    mineBlock(blockIndex) {}

    collectCoin() {
        this.score += 100;
    }

    render() {
        background(color(this.level.skyColor));
        noStroke();
        // draw background
        this.level.renderBackground();

        for (let i = 0; i < this.level.blocks.length; i++) {
            for (let j = 0; j < this.level.blocks[i].length; j++) {
                const block = this.level.blocks[i][j];
                block.render();
                if (
                    block.blockType != "door" &&
                    block.health < block.max_health
                ) {
                    let damageSpriteIndex = Math.floor(
                        map(
                            block.health,
                            0,
                            block.max_health,
                            this.blockDamageSprites.keyFrames.length - 1,
                            0
                        )
                    );
                    image(
                        this.blockDamageSprites.keyFrames[damageSpriteIndex],
                        block.position.x,
                        block.position.y,
                        block.width,
                        block.height
                    );
                }
                if (this.DEBUG) {
                    block.renderDebug();
                }
            }
        }

        this.level.enemies.forEach((enemy) => {
            enemy.render();
            if (this.DEBUG) {
                enemy.renderDebug();
            }
        });

        this.player.render();
        if (this.DEBUG) {
            this.player.renderDebug();
        }

        this.level.items.forEach((item) => {
            item.render();
            if (this.DEBUG) {
                item.renderDebug();
            }
        });

        // draw foreground
        // this.level.renderForeground();

        //draw UI
        textFont(this.font);
        this.ui.render({
            currentLevel: this.currentLevel,
            hasKey: this.player.hasKey,
            keyIcon: this.blockSprites["white-key"],
            playerIcon: this.playerSprites["idle"],
            lives: this.lives,
            score: this.score,
        });
    }

    loadLevel() {
        this.level = LevelArchitect.createLevel(
            this.width,
            this.height,
            LEVELS[this.currentLevel],
            this.blockSprites,
            this.enemySprites
        );
        // console.log("level: ", this.level);

        this.player.setPosition(
            new Vec(this.level.playerSpawn.x, this.level.playerSpawn.y)
        );

        this.blockDamageSprites = new Animation(
            this.blockSprites["block-damage"],
            60,
            false
        );
    }
}
