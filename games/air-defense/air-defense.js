import { Turret } from "./modules/turret.js";
import { EnemyAircraft, AirborneTransport, Paratrooper, Bomb } from "./modules/enemies.js";
import { Explosion, Splatter } from "./modules/particles.js";
import { setColor } from "./modules/utils.js";

window.preload = preload;
window.setup = setup;
window.draw = draw;

let WIDTH = 600;
let HEIGHT = 400;

let game = null;

const GAME_STATE = Object.freeze({
    HIGH_SCORE: 0,
    DEMO: 1,
    PLAY: 2,
});

function preload() {
    const sprites = [];
    const turretBlocks = [];
    sprites["paratrooper"] = loadImage("./air-defense/res/img/paratrooper.png");
    sprites["background"] = loadImage("./air-defense/res/img/background.png");
    sprites["foreground"] = loadImage("./air-defense/res/img/foreground.png");
    sprites["blue_1_1_L"] = loadImage("./air-defense/res/img/blue_1_1_L.png");
    sprites["blue_1_2_L"] = loadImage("./air-defense/res/img/blue_1_2_L.png");
    sprites["blue_1_1_R"] = loadImage("./air-defense/res/img/blue_1_1_R.png");
    sprites["blue_1_2_R"] = loadImage("./air-defense/res/img/blue_1_2_R.png");
    sprites["airborne_left"] = loadImage("./air-defense/res/img/airborne_left.png");
    sprites["airborne_right"] = loadImage("./air-defense/res/img/airborne_right.png");
    turretBlocks["red-block"] = loadImage("./air-defense/res/img/redblock.png");
    turretBlocks["green-block"] = loadImage("./air-defense/res/img/greenblock.png");
    turretBlocks["generator"] = loadImage("./air-defense/res/img/generator.png");
    turretBlocks["ammo-crate-500"] = loadImage("./air-defense/res/img/ammo_crate_500.png");

    let font = loadFont("./air-defense/res/font/PressStart2P.ttf");

    game = new AirDefense(WIDTH, HEIGHT, sprites, turretBlocks, font);
}

function setup() {
    const canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent("game");
    frameRate(60);
    noSmooth();
    game.start1Player();
}

function draw() {
    game.update();
    game.render();
}

class AirDefense {
    PARATROOPER_MIN_ALT = 350;
    BOMBER_MIN_ALT = 200;
    BOMBER_MAX_ALT = 325;
    GROUND_HEIGHT = 16;

    width = 0;
    height = 0;
    sprites = [];
    font = null;

    gameState = GAME_STATE.DEMO;
    gameObjects = [];
    score = 0;

    constructor(width, height, sprites, turretBlocks, font) {
        this.width = width;
        this.height = height;
        this.sprites = sprites;
        this.turretBlocks = turretBlocks;
        this.font = font;
    }

    initGame() {}

    startDemo() {
        this.inDemo = true;
        this.turret = new DemoTurret(
            this,
            { x: this.width / 2, y: this.height - this.GROUND_HEIGHT },
            this.turretBlocks
        );
        this.gameState = GAME_STATE.DEMO;
        this.startGame();
    }

    start1Player() {
        this.inDemo = false;
        this.turret = new Turret(this, { x: this.width / 2, y: this.height - this.GROUND_HEIGHT }, this.turretBlocks);
        this.gameState = GAME_STATE.PLAY;
        this.startGame();
    }

    startGame() {
        this.score = 0;
        this.gameObjects = new Set();
    }

    update() {
        this.turret.update();

        const bullets = Array.from(this.gameObjects).filter((element) => {
            return element.type === "bullet";
        });

        const bombs = Array.from(this.gameObjects).filter((element) => {
            return element.type === "bomb";
        });

        for (let gameObj of this.gameObjects) {
            gameObj.update();

            if (this.outOfBounds(gameObj) || gameObj.dead) {
                this.gameObjects.delete(gameObj);
                continue;
            }

            if (gameObj.type === "bullet") continue;
            if (
                gameObj.type === "bomber" ||
                gameObj.type === "airborne" ||
                gameObj.type === "paratrooper" ||
                gameObj.type === "bomb"
            ) {
                bullets.forEach((bullet) => {
                    if (!bullet.dead && this.isBulletCollision(gameObj, bullet)) {
                        bullet.dead = true;
                        gameObj.takeDamage(5);
                        if (gameObj.type === "paratrooper") {
                            this.gameObjects.add(new Splatter(gameObj.position, bullet.direction));
                        } else {
                            this.gameObjects.add(new Explosion(bullet.position));
                        }
                        if (gameObj.dead) {
                            switch (gameObj.type) {
                                case "bomber":
                                    this.gameObjects.add(new Explosion(gameObj.position));
                                    this.score += 20;
                                    break;
                                case "airborne":
                                    this.gameObjects.add(new Explosion(gameObj.position));
                                    this.score += 100;
                                    break;
                                case "paratrooper":
                                    this.gameObjects.add(new Splatter(gameObj.position, bullet.direction));
                                    this.score += 10;
                                    break;
                                case "bomb":
                                    this.gameObjects.add(new Explosion(gameObj.position));
                                    this.score += 5;
                                    break;
                            }
                        }
                    }
                });
            }

            if (gameObj.type === "bomber" && this.isOverTarget(gameObj)) {
                if (gameObj.dropBomb()) {
                    this.gameObjects.add(
                        new Bomb({ x: gameObj.position.x, y: gameObj.position.y }, { x: gameObj.position.z, y: 0 })
                    );
                }
            }

            if (gameObj.type === "bomb") {
                this.turret.blocks.forEach((block) => {
                    if (this.isBlockCollision(gameObj, block)) {
                        gameObj.dead = true;
                        block.takeDamage(gameObj.DAMAGE);
                        if (block.dead) {
                            this.turret.blocks.delete(block);
                            this.gameObjects.add(new Explosion(block.position));
                        }
                    }
                });
                if (gameObj.position.y >= this.height - this.GROUND_HEIGHT * 1.5) {
                    gameObj.dead = true;
                }
                if (gameObj.dead) {
                    this.gameObjects.add(new Explosion(gameObj.position));
                }
            }

            if (gameObj.type === "airborne" && this.isOverTarget(gameObj)) {
                if (gameObj.canDeploy()) {
                    this.gameObjects.add(
                        new Paratrooper(
                            {
                                x: gameObj.position.x + 16 * -gameObj.position.z,
                                y: gameObj.position.y,
                                z: gameObj.position.z,
                            },
                            this.sprites["paratrooper"],
                            this.sprites["paratrooper"]
                        )
                    );
                }
            }

            if (gameObj.type === "paratrooper") {
                if (gameObj.position.y >= this.height - this.GROUND_HEIGHT - 8) {
                    gameObj.grounded = true;
                }
                if (gameObj.grounded) {
                    for (let bomb of bombs) {
                        if (this.isBombCollision(gameObj, bomb)) {
                            bomb.dead = true;
                            gameObj.dead = true;
                            this.gameObjects.add(new Explosion(bomb.position));
                        }
                    }
                }
            }
        }

        if (frameCount % 320 === 0) {
            for (let i = 0; i < 3; i++) {
                let spawnPos = this.getEnemySpawnPos(
                    this.height - this.BOMBER_MIN_ALT,
                    this.height - this.BOMBER_MAX_ALT
                );
                spawnPos.x = spawnPos.x - spawnPos.z * i * 64;
                this.gameObjects.add(
                    new EnemyAircraft(spawnPos, this.sprites["blue_1_1_L"], this.sprites["blue_1_1_R"])
                );
            }
        }
        if (frameCount % 1200 === 0) {
            this.gameObjects.add(
                new AirborneTransport(
                    this.getEnemySpawnPos(this.height - this.PARATROOPER_MIN_ALT, 15),
                    this.sprites["airborne_left"],
                    this.sprites["airborne_right"]
                )
            );
        }
    }

    render() {
        image(this.sprites["background"], 0, 0, this.width, this.height);

        strokeWeight(1);
        this.turret.render();

        for (let gameObj of this.gameObjects) {
            gameObj.render();
        }

        image(
            this.sprites["foreground"],
            0,
            this.height - this.sprites["foreground"].height,
            this.sprites["foreground"].width,
            this.sprites["foreground"].height
        );

        // UI --------------------------------------------------------------------
        textFont(this.font);
        setColor("white");
        noStroke();
        textSize(16);
        text(this.turret.ammo, WIDTH - textWidth("" + this.turret.ammo) - 10, 30);

        setColor("white");
        noStroke();
        textSize(16);
        text(this.score, 10, 30);
    }

    isBulletCollision(gameObj, bullet) {
        if (
            dist(gameObj.position.x, gameObj.position.y, bullet.position.x, bullet.position.y) <=
            16 + bullet.BULLET_DIAMETER
        ) {
            return true;
        }
        return false;
    }

    isBombCollision(gameObj, bomb) {
        if (dist(gameObj.position.x, gameObj.position.y, bomb.position.x, bomb.position.y) <= 8 + bomb.DIAMETER) {
            return true;
        }
        return false;
    }

    isBlockCollision(bomb, block) {
        if (
            dist(bomb.position.x, bomb.position.y, block.center.x, block.center.y) <=
            bomb.DIAMETER / 2 + block.width / 2
        ) {
            return true;
        }
        return false;
    }

    getEnemySpawnPos(min, max) {
        let x = Math.random() < 0.5 ? -32 : this.width + 32;
        let y = Math.random() * (max - min) + min;
        let z = x < 0 ? 1 : -1;
        return { x, y, z };
    }

    isOverTarget(gameObj) {
        return Math.abs(this.turret.position.x - gameObj.position.x) < gameObj.DROP_RANGE;
    }

    outOfBounds(gameObj) {
        return (
            (gameObj.position.x <= -32 && gameObj.position.z === -1) ||
            (gameObj.position.x >= this.width + 32 && gameObj.position.z === 1) ||
            gameObj.position.y > this.height + 32 ||
            gameObj.position.y < -32
        );
    }
}
