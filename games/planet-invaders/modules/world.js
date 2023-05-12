import { BackgroundLoader } from "./background-loader.js";
import { SpriteLoader } from "./sprite-loader.js";
import { Player, DemoPlayer } from "./player.js";

class World {
    PLAYER_SIZE = 16;
    PLAYER_SPEED = 2;
    ALIEN_SIZE = 16;
    ALIEN_SPEED = 0.25;
    BARRIER_SIZE = 24;
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
        spriteSheetPath: "./planet-invaders/res/img/sprite_sheet.png",
        color: "0x00ff00ff",
    };

    static resources = {
        backgrounds: [],
        sprites: [],
    };

    static async loadResources() {
        World.resources.backgrounds = BackgroundLoader.loadBackgrounds(World.backgroundImages);
        World.resources.sprites = await SpriteLoader.loadSprites(World.spriteMetadata);
    }

    gameObjects = {
        player: null,
        aliens: null,
        visualEffects: null,
    };

    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.currentLevel = 0;
    }

    start(lives, isDemo) {
        this.lives = lives;
        this.player = isDemo ? new Player(this) : new DemoPlayer(this);
        //this.loadLevel(this.currentLevel);
    }

    loadLevel(level) {
        this.gameObjects = this.levelLoader.loadLevel(level);
        this.levelTime = 0;
    }

    update() {
        this.gameObjects.forEach((gameObj) => {
            gameObj.update();
        });
        this.player.update();
    }

    render() {
        background(World.resources.backgrounds[2]);
        if (World.resources.sprites["alien_1"]) {
            image(
                World.resources.sprites["alien_1"],
                this.width / 2,
                this.height / 2,
                this.ALIEN_SIZE * 2,
                this.ALIEN_SIZE * 2
            );
        }

        this.gameObjects.forEach((gameObj) => {
            gameObj.render();
        });
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
