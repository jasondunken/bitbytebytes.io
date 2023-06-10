import { Resources } from "./modules/resource-manager.js";
import { Turret } from "./modules/turret.js";
import { AmmoCrate } from "./modules/ammo-crate.js";
import { AirTrafficControl } from "./modules/aircraft.js";
import { Explosion, Splatter } from "./modules/particles.js";
import { setColor } from "./modules/utils.js";
import { Vec } from "../modules/math/vec.js";

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
    SIDE_IN_BOUNDS_BUFFER = 256;

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
        turretBlocks: new Set(),
        crates: new Set(),
        aircraft: new Set(),
        paratroopers: new Set(),
        bullets: new Set(),
        bombs: new Set(),
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
            ground: height - this.GROUND_HEIGHT,
        };
        this.sprites = resources.sprites;
        this.resources = resources;
        this.font = resources.font;
    }

    initGame() {}

    startDemo() {
        this.inDemo = true;
        this.turret = new DemoTurret(
            this,
            new Vec(this.width / 2, this.height - this.GROUND_HEIGHT),
            this.resources.turretBlocks,
            this.STARTING_AMMO
        );
        this.startGame();
    }

    start1Player() {
        this.inDemo = false;
        this.turret = new Turret(
            this,
            new Vec(this.width / 2, this.height - this.GROUND_HEIGHT),
            this.resources.turretBlocks,
            this.STARTING_AMMO
        );
        this.startGame();
    }

    startGame() {
        this.initGameObjects();

        this.score = 0;
        this.wave = this.randomWave();
        this.waves = [];
        // for (let i = 0; i < 20; i++) {
        //     this.gameObjects.crates.add(
        //         new AmmoCrate(
        //             new Vec(Math.random() * this.width, this.height - this.GROUND_HEIGHT - 20),
        //             this.sprites["ammo-crate-500"]
        //         )
        //     );
        // }
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
        let count =
            type == "airborne-transport"
                ? 1
                : Math.floor(Math.random() * 3 + 1);
        count = type == "airborne-cargo" ? 1 : count;
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
        text(
            this.turret.ammo,
            WIDTH - textWidth("" + this.turret.ammo) - 10,
            30
        );

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
                        rect(
                            obj.position.x - obj.SIZE / 2,
                            obj.position.y - obj.SIZE / 2,
                            obj.SIZE,
                            obj.SIZE
                        );
                    } else if (obj.width && obj.height) {
                        stroke("red");
                        rect(
                            obj.position.x - obj.width / 2,
                            obj.position.y - obj.height / 2,
                            obj.width,
                            obj.height
                        );
                    } else {
                        stroke("magenta");
                        rect(obj.position.x - 4, obj.position.y - 4, 8, 8);
                    }
                }
            }

            setColor("red");
            line(
                0,
                this.height - this.GROUND_HEIGHT,
                this.width,
                this.height - this.GROUND_HEIGHT
            );
        }
    }

    initGameObjects() {
        this.gameObjects = {
            turretBlocks: this.turret.blocks,
            crates: new Set(),
            aircraft: new Set(),
            paratroopers: new Set(),
            bullets: new Set(),
            bombs: new Set(),
            visualEffects: new Set(),
        };
    }

    addGameObject(obj) {
        switch (obj.type) {
            case "light-bomber":
            case "airborne-transport":
            case "airborne-cargo":
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
            case "visual-effect":
                this.gameObjects.visualEffects.add(obj);
                break;
            default:
                console.log(`unknown game object type ${obj.type}`);
        }
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
            this.gameObjects.crates.size,
            " | visual: ",
            this.gameObjects.visualEffects.size
        );
    }
}
