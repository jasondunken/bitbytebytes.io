import { Resources } from "./modules/resource-manager.js";
import { Turret } from "./modules/turret.js";
import { AmmoCrate } from "./modules/ammo-crate.js";
import { AirTrafficControl } from "./modules/aircraft.js";
import { Explosion, Splatter } from "./modules/particles.js";
import { setColor } from "./modules/utils.js";
import { Vec } from "./modules/math/vec.js";

window.preload = preload;
window.setup = setup;
window.draw = draw;

let WIDTH = 600;
let HEIGHT = 400;

let game = null;

function preload() {
    const resources = Resources.load();
    game = new AirDefense(WIDTH, HEIGHT, resources);
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
    DEBUG = false;
    SIDE_IN_BOUNDS_BUFFER = 128;

    PARATROOPER_MIN_ALT = 350;
    BOMBER_MIN_ALT = 200;
    BOMBER_MAX_ALT = 325;
    GROUND_HEIGHT = 16;

    STARTING_AMMO = 1000;

    width = 0;
    height = 0;
    sprites = [];
    font = null;

    gameObjects = {
        aircraft: new Set(),
        paratroopers: new Set(),
        bullets: new Set(),
        bombs: new Set(),
        crates: new Set(),
        visualEffects: new Set(),
    };

    score = 0;
    wave;
    waves = [];

    constructor(width, height, resources) {
        this.width = width;
        this.height = height;
        this.worldBounds = {
            x: 0,
            y: 0,
            width: width,
            height: height,
            floor: height - this.GROUND_HEIGHT,
        };
        this.sprites = resources.sprites;
        this.turretBlocks = resources.turretBlocks;
        this.font = resources.font;
    }

    initGame() {}

    startDemo() {
        this.inDemo = true;
        this.turret = new DemoTurret(
            this,
            new Vec(this.width / 2, this.height - this.GROUND_HEIGHT),
            this.turretBlocks,
            this.STARTING_AMMO
        );
        this.startGame();
    }

    start1Player() {
        this.inDemo = false;
        this.turret = new Turret(
            this,
            new Vec(this.width / 2, this.height - this.GROUND_HEIGHT),
            this.turretBlocks,
            this.STARTING_AMMO
        );
        this.startGame();
    }

    startGame() {
        this.initGameObjects();

        this.score = 0;
        this.wave = this.randomWave();
        this.waves = [];
        for (let i = 0; i < 20; i++) {
            this.gameObjects.crates.add(
                new AmmoCrate(
                    new Vec(Math.random() * this.width, this.height - this.GROUND_HEIGHT - 20),
                    this.sprites["ammo-crate-500"]
                )
            );
        }
    }

    update() {
        this.turret.update();

        // update pass
        for (let key of Object.keys(this.gameObjects)) {
            for (let obj of this.gameObjects[key]) {
                obj.update(this.worldBounds, this.gameObjects);
                if (this.outOfBounds(obj)) obj.dead = true;
            }
        }

        // cleanup pass
        let numObjs = 0;
        for (let key of Object.keys(this.gameObjects)) {
            for (let obj of this.gameObjects[key]) {
                if (obj.dead) this.gameObjects[key].delete(obj);
                else numObjs++;
            }
        }
        if (this.DEBUG) this.logObjs(numObjs);

        //     if (gameObj.type === "bullet") continue;
        //     if (
        //         gameObj.type === "bomber" ||
        //         gameObj.type === "airborne" ||
        //         gameObj.type === "paratrooper" ||
        //         gameObj.type === "bomb"
        //     ) {
        //         bullets.forEach((bullet) => {
        //             if (!bullet.dead && this.isBulletCollision(gameObj, bullet)) {
        //                 bullet.dead = true;
        //                 gameObj.takeDamage(5);
        //                 if (gameObj.type === "paratrooper") {
        //                     this.gameObjects.add(new Splatter(gameObj.position, bullet.direction));
        //                 } else {
        //                     this.gameObjects.add(new Explosion(bullet.position));
        //                 }
        //                 if (gameObj.dead) {
        //                     switch (gameObj.type) {
        //                         case "bomber":
        //                             this.gameObjects.add(new Explosion(gameObj.position));
        //                             this.score += 20;
        //                             break;
        //                         case "airborne":
        //                             this.gameObjects.add(new Explosion(gameObj.position));
        //                             this.score += 100;
        //                             break;
        //                         case "paratrooper":
        //                             this.gameObjects.add(new Splatter(gameObj.position, bullet.direction));
        //                             this.score += 10;
        //                             break;
        //                         case "bomb":
        //                             this.gameObjects.add(new Explosion(gameObj.position));
        //                             this.score += 5;
        //                             break;
        //                     }
        //                 }
        //             }
        //         });
        //     }

        //     if (gameObj.type === "bomber" && this.isOverTarget(gameObj)) {
        //         if (gameObj.dropBomb()) {
        //             this.gameObjects.add(
        //                 new Bomb({ x: gameObj.position.x, y: gameObj.position.y }, { x: gameObj.position.z, y: 0 })
        //             );
        //         }
        //     }

        //     if (gameObj.type === "bomb") {
        //         this.turret.blocks.forEach((block) => {
        //             if (this.isBlockCollision(gameObj, block)) {
        //                 gameObj.dead = true;
        //                 block.takeDamage(gameObj.DAMAGE);
        //                 if (block.dead) {
        //                     this.turret.blocks.delete(block);
        //                     this.gameObjects.add(new Explosion(block.position));
        //                 }
        //             }
        //         });
        //         if (gameObj.position.y >= this.height - this.GROUND_HEIGHT * 1.5) {
        //             gameObj.dead = true;
        //         }
        //         if (gameObj.dead) {
        //             this.gameObjects.add(new Explosion(gameObj.position));
        //         }
        //     }

        //     if (gameObj.type === "airborne" && this.isOverTarget(gameObj)) {
        //         if (gameObj.canDeploy()) {
        //             this.gameObjects.add(
        //                 new Paratrooper(
        //                     {
        //                         x: gameObj.position.x + 16 * -gameObj.position.z,
        //                         y: gameObj.position.y,
        //                         z: gameObj.position.z,
        //                     },
        //                     this.sprites["paratrooper"],
        //                     this.sprites["paratrooper"]
        //                 )
        //             );
        //         }
        //     }

        //     if (gameObj.type === "paratrooper") {
        //         if (gameObj.grounded) {
        //             for (let bomb of bombs) {
        //                 if (this.isBombCollision(gameObj, bomb)) {
        //                     bomb.dead = true;
        //                     gameObj.dead = true;
        //                     this.gameObjects.add(new Explosion(bomb.position));
        //                 }
        //             }
        //         }
        //     }
        // }

        // advance the level
        this.wave.time--;
        if (this.wave.time <= 0) {
            this.wave = this.randomWave();
        }
    }

    randomWave() {
        const waveNum = this.waves.length + 1;
        const time = Math.floor(Math.random() * 200 + 201);
        const type = AirTrafficControl.getRandomAircraft();
        const count = type == "airborne-transport" ? 1 : Math.floor(Math.random() * 3 + 1);
        const approach = Math.random() > 0.5 ? -1 : 1;

        const wave = { waveNum, time, type, count, approach };

        this.waves.push(wave);
        AirTrafficControl.spawn(this, wave);
        return wave;
    }

    render() {
        image(this.sprites["background"], 0, 0, this.width, this.height);

        strokeWeight(1);
        this.turret.render();

        for (let key of Object.keys(this.gameObjects)) {
            for (let obj of this.gameObjects[key]) {
                obj.render();
            }
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

        if (this.DEBUG) {
            for (let key of Object.keys(this.gameObjects)) {
                for (let obj of this.gameObjects[key]) {
                    stroke("yellow");
                    noFill();
                    if (obj.SIZE) {
                        stroke("yellow");
                        rect(obj.position.x - obj.SIZE / 2, obj.position.y - obj.SIZE / 2, obj.SIZE, obj.SIZE);
                    } else if (obj.width && obj.height) {
                        stroke("red");
                        rect(obj.position.x - obj.width / 2, obj.position.y - obj.height / 2, obj.width, obj.height);
                    } else {
                        stroke("magenta");
                        rect(obj.position.x - 4, obj.position.y - 4, 8, 8);
                    }
                }
            }

            setColor("red");
            line(0, this.height - this.GROUND_HEIGHT, this.width, this.height - this.GROUND_HEIGHT);
        }
    }

    initGameObjects() {
        this.gameObjects = {
            aircraft: new Set(),
            paratroopers: new Set(),
            bullets: new Set(),
            bombs: new Set(),
            crates: new Set(),
        };
    }

    addGameObject(obj) {
        switch (obj.type) {
            case "light-bomber":
            case "airborne":
                this.gameObjects.aircraft.add(obj);
                break;
            case "paratrooper":
                this.gameObjects.paratroopers.add(obj);
                break;
            case "bomb":
                this.gameObjects.bombs.add(obj);
                break;
            case "bullet":
                this.gameObjects.bullets.add(obj);
                break;
            case "crate":
                this.gameObjects.crates.add(obj);
                break;
            default:
                console.log(`unknown game object type ${obj.type}`);
        }
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

    isCrateCollision(paratrooper, crate) {
        if (
            dist(paratrooper.position.x, paratrooper.position.y, crate.center.x, crate.center.y) <=
            paratrooper.DIAMETER / 2 + crate.width / 2
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

    outOfBounds(gameObj) {
        return (
            gameObj.position.x <= -this.SIDE_IN_BOUNDS_BUFFER ||
            gameObj.position.x >= this.width + this.SIDE_IN_BOUNDS_BUFFER ||
            gameObj.position.y > this.height + gameObj.height ||
            gameObj.position.y < -gameObj.height
        );
    }

    logObjs(numObjs) {
        console.log(
            "objs: ",
            numObjs,
            " | airc: ",
            this.gameObjects.aircraft.size,
            " | para: ",
            this.gameObjects.paratroopers.size,
            " | bull: ",
            this.gameObjects.bullets.size,
            " | bomb: ",
            this.gameObjects.bombs.size,
            " | crat: ",
            this.gameObjects.crates.size
        );
    }
}
