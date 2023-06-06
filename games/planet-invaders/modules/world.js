import { BackgroundLoader } from "./background-loader.js";
import { SpriteLoader } from "./sprite-loader.js";
import { Barrier } from "./barrier.js";
import { LevelLoader } from "./level-loader.js";

import { Vec } from "./math/vec.js";
import { LEVELS } from "./levels.js";

class World {
    static ALIEN_SIZE = 32;
    static ALIEN_SPEED = 0.25;

    PLAYER_SIZE = 24;
    PLAYER_SPEED = 2;
    BARRIER_SIZE = 48;
    BARRIER_COUNT = 3;
    GUTTER_WIDTH = 32;
    SPAWN_MAX_Y = 280;
    SPAWN_MIN_Y = 64;
    BONUS_SIZE = 16;
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
        for (let group of Object.keys(this.gameObjects)) {
            const objs = this.gameObjects[group];
            for (let obj of objs) {
                obj.update();
                if (obj.type === "alien") {
                    for (let shot of this.gameObjects["shots"]) {
                        if (this.shotCollision(shot, obj)) {
                            obj.remove = true;
                            this.gameObjects["shots"].delete(shot);
                            this.game.addScore("alien");
                            // add visual effect
                        }
                    }
                    if (this.hitWall(obj)) this.shiftAliens(obj);
                }
                if (this.outOfBounds(obj)) obj.remove = true;
                if (obj.remove) this.gameObjects["aliens"].delete(obj);
            }
        }
        if (this.gameObjects.aliens.size <= 0) {
            this.game.levelCompleted();
        }
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

    hitWall(obj) {}

    shiftAliens(obj) {
        const direction = obj.direction === Vec.RIGHT ? Vec.LEFT : Vec.RIGHT;
        for (let alien of this.gameObjects.aliens) {
        }
    }

    outOfBounds(gameObj) {
        if (
            gameObj.position.x < 0 - gameObj.size ||
            gameObj.position.y < 0 - gameObj.size ||
            gameObj.position.x > this.width + gameObj.size ||
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
}

export { World };
