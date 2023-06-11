import { BackgroundLoader } from "./background-loader.js";
import { SpriteLoader } from "./sprite-loader.js";
import { LevelLoader } from "./level-loader.js";
import { LEVELS } from "./levels.js";

import { Shot } from "./shot.js";
import { Barrier } from "./barrier.js";
import { Bonus } from "./bonus.js";

import { PixelExplosion } from "./visual-effects.js";

import { Vec } from "../../modules/math/vec.js";

class World {
    static ALIEN_SIZE = 32;
    static ALIEN_COLLIDER_SIZE = 16;
    static ALIEN_SPEED = 0.25;

    PLAYER_SIZE = 24;
    PLAYER_COLLIDER_SIZE = 16;
    PLAYER_SPEED = 2;
    BARRIER_SIZE = 48;
    BARRIER_COUNT = 3;
    GUTTER_WIDTH = 32;
    OUT_OF_BOUNDS_BUFFER = 64;
    SPAWN_MAX_Y = 280;
    SPAWN_MIN_Y = 64;
    BONUS_Y = 32;
    BONUS_SIZE = 32;
    BONUS_COLLIDER_SIZE = 14;
    BONUS_SPEED = 1;
    BONUS_INTERVAL = 1000;

    ALIEN_SHIFT_VECTOR = Vec.DOWN.copy().mult(10);

    static backgroundImages = [
        "./planet-invaders/res/img/bg_1.png",
        "./planet-invaders/res/img/bg_2.png",
        "./planet-invaders/res/img/bg_3.png",
    ];
    static spriteMetadata = {
        names: [
            "alien_1",
            "alien_2",
            "alien_3",
            "alien_4",
            "alien_5",
            "barrier",
            "ship",
            "ship-destroyedL",
            "ship-destroyedC",
            "ship-destroyedR",
            "bonus",
        ],
        alienNames: ["alien_1", "alien_2", "alien_3", "alien_4", "alien_5"],
        spriteSheetPath: "./planet-invaders/res/img/sprite_sheet.png",
        color: "0x00ff00ff",
    };

    static resources = {
        backgrounds: [],
        sprites: [],
        font: null,
    };

    static resourcesLoaded = false;

    static async loadResources() {
        World.resources.backgrounds = BackgroundLoader.LoadBackgrounds(
            World.backgroundImages
        );
        World.resources.sprites = await SpriteLoader.LoadSprites(
            World.spriteMetadata
        );
        World.resources.font = await loadFont(
            "./planet-invaders/res/font/PressStart2P.ttf"
        );
        this.resourcesLoaded = true;
    }

    gameObjects;

    constructor(game, width, height) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.spawnArea = {
            tl: new Vec(this.GUTTER_WIDTH, this.SPAWN_MIN_Y),
            br: new Vec(width - this.GUTTER_WIDTH, this.SPAWN_MAX_Y),
        };
        this.barrierY = this.height - 60;
    }

    start(level) {
        this.currentLevel = level;
        this.loadLevel(this.currentLevel);
    }

    loadLevel(level) {
        this.currentLevel = level % LEVELS.length;
        this.resetGameObjects();
        this.gameObjects.aliens = LevelLoader.LoadLevel(
            this.currentLevel,
            World.spriteMetadata,
            this.spawnArea
        );
        this.resetBarriers();
        this.levelTime = 0;
    }

    resetGameObjects() {
        this.gameObjects = {
            aliens: new Set(),
            shots: new Set(),
            blocks: new Set(),
            visualEffects: new Set(),
            bonus: new Set(),
        };
    }

    addGameObject(obj) {
        switch (obj.type) {
            case "alien":
                this.gameObjects.aliens.add(obj);
                break;
            case "shot":
                this.gameObjects.shots.add(obj);
                break;
            case "block":
                this.gameObjects.blocks.add(obj);
                break;
            case "visual-effect":
                this.gameObjects.visualEffects.add(obj);
                break;
            case "bonus":
                this.gameObjects.bonus.add(obj);
                break;
            default:
                console.log(`unknown obj type ${obj.type}`);
        }
    }

    deleteGameObject(obj) {
        //console.log(`deleting ${obj.type} object`);
        //console.log(`counting ${this.objectCount()} objects`);
        switch (obj.type) {
            case "alien":
                this.gameObjects.aliens.delete(obj);
                break;
            case "shot":
                this.gameObjects.shots.delete(obj);
                break;
            case "block":
                this.gameObjects.blocks.delete(obj);
                break;
            case "visual-effect":
                this.gameObjects.visualEffects.delete(obj);
                break;
            case "bonus":
                this.gameObjects.bonus.delete(obj);
                break;
            default:
                console.log(`unknown obj type ${obj.type}`);
        }
    }

    objectCount() {
        let count = 0;
        for (let group of Object.keys(this.gameObjects)) {
            const objs = this.gameObjects[group];
            for (let obj of objs) {
                count++;
            }
        }
        return count;
    }

    resetBarriers() {
        const locations = [
            new Vec(this.width * 0.25, this.barrierY),
            new Vec(this.width * 0.5, this.barrierY),
            new Vec(this.width * 0.75, this.barrierY),
        ];
        const blocks = new Set();
        Barrier.getBlocks(locations, blocks);
        this.gameObjects.blocks = blocks;
    }

    update() {
        this.levelTime++;
        for (let group of Object.keys(this.gameObjects)) {
            const objs = this.gameObjects[group];
            for (let obj of objs) {
                obj.update();
                if (obj.type === "alien" || obj.type === "bonus") {
                    for (let shot of this.gameObjects.shots) {
                        if (this.shotCollision(shot, obj)) {
                            obj.remove = true;
                            this.deleteGameObject(shot);
                            this.game.addScore(obj.type);
                            this.addGameObject(
                                new PixelExplosion(obj.position.copy())
                            );
                        }
                    }
                }
                if (obj.type === "alien") {
                    if (this.hitWall(obj)) this.shiftAliens(obj);
                    if (this.hasLanded(obj)) this.game.aliensWon();
                }
                if (obj.type === "block") {
                    for (let shot of this.gameObjects.shots) {
                        if (this.shotCollision(shot, obj)) {
                            obj.remove = true;
                            this.deleteGameObject(shot);
                            this.addGameObject(
                                new PixelExplosion(obj.position.copy())
                            );
                        }
                    }
                    for (let alien of this.gameObjects.aliens) {
                        if (this.shotCollision(alien, obj)) {
                            obj.remove = true;
                            this.deleteGameObject(alien);
                            this.addGameObject(
                                new PixelExplosion(alien.position.copy())
                            );
                            this.addGameObject(
                                new PixelExplosion(obj.position.copy())
                            );
                            this.game.aliensWon();
                        }
                    }
                }
                if (this.outOfBounds(obj)) obj.remove = true;
                if (obj.remove) this.deleteGameObject(obj);
            }
        }
        if (this.gameObjects.aliens.size <= 0) {
            this.game.levelCompleted();
        }
        // 1 second
        if (this.levelTime % 60 === 0) {
            this.randomAlienFire();
        }
        // 22 seconds
        //if (this.levelTime % 1320 === 0) {
        if (this.levelTime % 120 === 0) {
            this.addGameObject(this.getRandomBonus());
        }
    }

    updateVisualEffects() {
        for (let effect of this.gameObjects.visualEffects) {
            effect.update();
        }
    }

    hasLanded(obj) {
        if (obj.position.y + obj.size / 2 >= this.game.playerSpawn.y) {
            return true;
        }
        return false;
    }

    hitWall(obj) {
        if (obj.direction == Vec.LEFT) {
            return obj.position.x - obj.size / 2 <= 0;
        }
        if (obj.direction == Vec.RIGHT) {
            return obj.position.x + obj.size / 2 >= this.width;
        }
        return false;
    }

    randomAlienFire() {
        const alienIdx = Math.floor(
            Math.random() * this.gameObjects.aliens.size
        );
        let curIdx = 0;
        for (let alien of this.gameObjects.aliens) {
            if (curIdx === alienIdx) {
                this.addGameObject(new Shot(alien.position.copy(), Vec.DOWN));
                return;
            }
            curIdx++;
        }
    }

    shiftAliens(obj) {
        const direction = obj.direction === Vec.RIGHT ? Vec.LEFT : Vec.RIGHT;
        for (let alien of this.gameObjects.aliens) {
            alien.position.y += 24;
            alien.direction = direction;
            alien.colliders[0].set(alien.position);
        }
    }

    getRandomBonus() {
        const side = Math.random() < 0.5 ? "left" : "right";
        let bonus = null;
        if (side === "left") {
            bonus = new Bonus(
                new Vec(-32, this.BONUS_Y),
                World.resources.sprites["bonus"],
                this.BONUS_SIZE,
                this.BONUS_COLLIDER_SIZE,
                this.BONUS_SPEED,
                Vec.RIGHT
            );
        }
        if (side === "right") {
            bonus = new Bonus(
                new Vec(this.width + 32, this.BONUS_Y),
                World.resources.sprites["bonus"],
                this.BONUS_SIZE,
                this.BONUS_COLLIDER_SIZE,
                this.BONUS_SPEED,
                Vec.LEFT
            );
        }
        return bonus;
    }

    outOfBounds(gameObj) {
        if (
            gameObj.position.x < 0 - gameObj.size - this.OUT_OF_BOUNDS_BUFFER ||
            gameObj.position.y < 0 - gameObj.size ||
            gameObj.position.x >
                this.width + gameObj.size + this.OUT_OF_BOUNDS_BUFFER ||
            gameObj.position.y > this.height + gameObj.size
        )
            return true;
        return false;
    }

    shotCollision(shot, obj) {
        if (shot.direction === Vec.DOWN && obj.type === "alien") return;
        if (shot.direction === Vec.UP && obj.type === "player") return;

        let collision = false;
        let colliderId = 0;
        for (let i = 0; i < obj.colliders.length; i++) {
            const dist = Math.abs(
                Vec.sub2(shot.colliders[0], obj.colliders[i]).mag()
            );
            if (dist <= shot.colliderSize / 2 + obj.colliderSize / 2) {
                collision = true;
                colliderId = i;
            }
        }
        return collision ? { colliderId } : false;
    }

    render(debug) {
        background(World.resources.backgrounds[2]);

        for (let group of Object.keys(this.gameObjects)) {
            const objs = this.gameObjects[group];
            for (let obj of objs) {
                obj.render(debug);
            }
        }
    }
}

export { World };
