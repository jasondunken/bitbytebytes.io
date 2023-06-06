import { BackgroundLoader } from "./background-loader.js";
import { SpriteLoader } from "./sprite-loader.js";
import { LevelLoader } from "./level-loader.js";
import { LEVELS } from "./levels.js";

import { Barrier } from "./barrier.js";
import { Bonus } from "./bonus.js";

import { Vec } from "./math/vec.js";

class World {
    static ALIEN_SIZE = 32;
    static ALIEN_SPEED = 0.25;

    PLAYER_SIZE = 24;
    PLAYER_SPEED = 2;
    BARRIER_SIZE = 48;
    BARRIER_COUNT = 3;
    GUTTER_WIDTH = 32;
    OUT_OF_BOUNDS_BUFFER = 64;
    SPAWN_MAX_Y = 280;
    SPAWN_MIN_Y = 64;
    BONUS_Y = 32;
    BONUS_SIZE = 32;
    BONUS_SPEED = 1;
    BONUS_INTERVAL = 1000;

    ALIEN_SHIFT_VECTOR = Vec.DOWN.mult(10);

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
            "bonus",
        ],
        alienNames: ["alien_1", "alien_2", "alien_3", "alien_4", "alien_5"],
        spriteSheetPath: "./planet-invaders/res/img/sprite_sheet.png",
        color: "0x00ff00ff",
    };

    static resources = {
        backgrounds: [],
        sprites: [],
    };

    static async loadResources() {
        World.resources.backgrounds = BackgroundLoader.LoadBackgrounds(
            World.backgroundImages
        );
        World.resources.sprites = await SpriteLoader.LoadSprites(
            World.spriteMetadata
        );
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
        this.barriers = [];
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
            barriers: new Set(),
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
            case "barrier":
                this.gameObjects.barriers.add(obj);
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
        switch (obj.type) {
            case "alien":
                this.gameObjects.aliens.delete(obj);
                break;
            case "shot":
                this.gameObjects.shots.delete(obj);
                break;
            case "barrier":
                this.gameObjects.barriers.delete(obj);
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

    resetBarriers() {
        this.addGameObject(
            new Barrier(
                new Vec(this.width * 0.25, this.barrierY),
                World.resources.sprites["barrier"],
                this.BARRIER_SIZE
            )
        );
        this.addGameObject(
            new Barrier(
                new Vec(this.width * 0.5, this.barrierY),
                World.resources.sprites["barrier"],
                this.BARRIER_SIZE
            )
        );
        this.addGameObject(
            new Barrier(
                new Vec(this.width * 0.75, this.barrierY),
                World.resources.sprites["barrier"],
                this.BARRIER_SIZE
            )
        );
    }

    update() {
        this.levelTime++;
        for (let group of Object.keys(this.gameObjects)) {
            const objs = this.gameObjects[group];
            for (let obj of objs) {
                obj.update();
                if (obj.type === "alien" || obj.type === "bonus") {
                    for (let shot of this.gameObjects["shots"]) {
                        if (this.shotCollision(shot, obj)) {
                            obj.remove = true;
                            this.deleteGameObject(shot);
                            this.game.addScore(obj.type);
                            // add visual effect
                        }
                    }
                }
                if (obj.type === "alien") {
                    const hitWall = this.hitWall(obj);
                    if (hitWall) this.shiftAliens(obj);
                }
                if (this.outOfBounds(obj)) obj.remove = true;
                if (obj.remove) this.deleteGameObject(obj);
            }
        }
        if (this.gameObjects.aliens.size <= 0) {
            this.game.levelCompleted();
        }
        if (this.levelTime % 240 === 0) {
            this.addGameObject(this.getRandomBonus());
        }
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

    shiftAliens(obj) {
        const direction = obj.direction === Vec.RIGHT ? Vec.LEFT : Vec.RIGHT;
        for (let alien of this.gameObjects.aliens) {
            alien.position.y += 24;
            alien.direction = direction;
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
                this.BONUS_SPEED,
                Vec.RIGHT
            );
        }
        if (side === "right") {
            bonus = new Bonus(
                new Vec(this.width + 32, this.BONUS_Y),
                World.resources.sprites["bonus"],
                this.BONUS_SIZE,
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

    shotCollision(shot, gameObj) {
        if (shot.direction.y > 0 && gameObj.type === "alien") return;
        if (shot.direction.y < 0 && gameObj.type === "player") return;

        return (
            shot.position.x > gameObj.position.x - gameObj.size / 2 &&
            shot.position.x < gameObj.position.x + gameObj.size / 2 &&
            shot.position.y > gameObj.position.y - gameObj.size / 2 &&
            shot.position.y < gameObj.position.y + gameObj.size / 2
        );
    }

    render() {
        background(World.resources.backgrounds[2]);

        for (let group of Object.keys(this.gameObjects)) {
            const objs = this.gameObjects[group];
            for (let obj of objs) {
                obj.render();
            }
        }
    }
}

export { World };
