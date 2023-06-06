import { BackgroundLoader } from "./background-loader.js";
import { SpriteLoader } from "./sprite-loader.js";
import { Player, DemoPlayer } from "./player.js";
import { Barrier } from "./barrier.js";
import { LevelLoader } from "./level-loader.js";

import { Vec2 } from "./vec2d.js";
import { LEVELS } from "./levels.js";

class World {
    static PLAYER_SPEED = 2;
    static ALIEN_SIZE = 32;
    static ALIEN_SPEED = 0.25;

    PLAYER_SIZE = 24;
    BARRIER_SIZE = 48;
    BARRIER_COUNT = 3;
    GUTTER_WIDTH = 32;
    BONUS_SIZE = 16;
    BONUS_SPEED = 1;
    BONUS_INTERVAL = 1000;

    static backgroundImages = [
        "./planet-invaders/res/img/bg_1.png",
        "./planet-invaders/res/img/bg_2.png",
        "./planet-invaders/res/img/bg_3.png",
    ];
    static spriteMetadata = {
        names: ["alien_1", "alien_2", "alien_3", "alien_4", "alien_5", "barrier", "ship", "bonus"],
        alienNames: ["alien_1", "alien_2", "alien_3", "alien_4", "alien_5"],
        spriteSheetPath: "./planet-invaders/res/img/sprite_sheet.png",
        color: "0x00ff00ff",
    };

    static resources = {
        backgrounds: [],
        sprites: [],
    };

    static async loadResources() {
        World.resources.backgrounds = BackgroundLoader.LoadBackgrounds(World.backgroundImages);
        World.resources.sprites = await SpriteLoader.LoadSprites(World.spriteMetadata);
    }

    gameObjects = {
        player: null,
        aliens: null,
        visualEffects: null,
    };

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.spawnArea = {
            tl: new Vec2(20, 20),
            br: new Vec2(width - 20, this.height - 120),
        };
        this.barrierY = this.height - 60;
        this.barriers = [];
        this.playerSpawn = new Vec2(this.width / 2, this.height - this.PLAYER_SIZE);
        this.currentLevel = 3;
    }

    start(lives, isDemo) {
        this.lives = lives;
        this.player = isDemo
            ? new Player(this, this.playerSpawn, World.resources.sprites["ship"], this.PLAYER_SIZE)
            : new DemoPlayer(this, this.playerSpawn, World.resources.sprites["ship"], this.PLAYER_SIZE);
        this.loadLevel(this.currentLevel);
    }

    loadLevel(level) {
        this.currentLevel = level % LEVELS.length;
        this.gameObjects = LevelLoader.LoadLevel(level, World.spriteMetadata, this.spawnArea);
        this.resetBarriers();
        this.levelTime = 0;
    }

    resetBarriers() {
        this.barriers = [
            new Barrier(
                new Vec2(this.width * 0.25, this.barrierY),
                World.resources.sprites["barrier"],
                this.BARRIER_SIZE
            ),
            new Barrier(
                new Vec2(this.width * 0.5, this.barrierY),
                World.resources.sprites["barrier"],
                this.BARRIER_SIZE
            ),
            new Barrier(
                new Vec2(this.width * 0.75, this.barrierY),
                World.resources.sprites["barrier"],
                this.BARRIER_SIZE
            ),
        ];
    }

    update() {
        this.gameObjects.forEach((gameObj) => {
            gameObj.update();
        });
        this.player.update();
    }

    render() {
        background(World.resources.backgrounds[2]);

        for (let gameObj of this.gameObjects) {
            gameObj.render();
        }
        for (let barrier of this.barriers) {
            barrier.render();
        }
        this.player.render();
    }

    outOfBounds(gameObj, width, height) {
        if (
            gameObj.position.x < 0 - gameObj.size ||
            gameObj.position.y < 0 - gameObj.size ||
            gameObj.position.x > width + gameObj.size ||
            gameObj.position.y > height + gameObj.size
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
