import { pointOnLine } from "./modules/utils.js";
import { Vec } from "../modules/math/vec.js";

window.preload = preload;
window.setup = setup;
window.draw = draw;

const GAME_WIDTH = 512;
const GAME_HEIGHT = 768;

let game = null;

// p5.js functions ------------------------>
function preload() {
    let font = loadFont("./expedition-luna/res/font/PressStart2P.ttf");
    game = new ExpeditionLuna(GAME_WIDTH, GAME_HEIGHT, font);
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
// end of p5.js functions ------------------------>
class ExpeditionLuna {
    PLAYER_1_START_BUTTON = document
        .getElementById("start-1p")
        .addEventListener("click", () => {
            this.start1Player();
        });

    GAME_STATE = {
        STARTING: "STARTING",
        DEMO: "DEMO",
        PLAYING: "PLAYING",
        GAME_OVER: "GAME_OVER",
    };
    currentState = this.GAME_STATE.STARTING;

    KEYS = {
        THRUSTER_RIGHT: 68, // d
        THRUSTER_LEFT: 65, // a
        THRUSTER_MAIN: 32, // space
    };

    PIXELS_PER_METER = 4;
    TERRAIN_POINTS = 24;
    TERRAIN_MAX_HEIGHT = 400;
    TERRAIN_MIN_HEIGHT = 100;
    LANDING_AREAS = 4;

    OXYGEN_DEPLETION_RATE = 0.1;

    gravity = new Vec(0, 0.02);
    atmosphericDrag = 0.5;
    surfaceFriction = 5;
    player = null;
    terrain = null;

    constructor(width, height, font) {
        this.width = width;
        this.height = height;
        this.font = font;
    }

    startDemo() {
        this.currentState = this.GAME_STATE.DEMO;
        this.player = new DemoLander();
        this.startGame();
    }

    start1Player() {
        this.currentState = this.GAME_STATE.PLAYING;
        this.player = new Lander();
        this.startGame();
    }

    startGame() {
        this.terrain = [];
        for (let i = 0; i <= this.TERRAIN_POINTS + this.LANDING_AREAS; i++) {
            this.terrain.push([
                Math.floor((i * this.width) / this.TERRAIN_POINTS),
                this.height -
                    (Math.floor(
                        Math.random() *
                            (this.TERRAIN_MAX_HEIGHT - this.TERRAIN_MIN_HEIGHT)
                    ) +
                        this.TERRAIN_MIN_HEIGHT),
            ]);
            if (i % (this.TERRAIN_POINTS / this.LANDING_AREAS) == 2) {
                this.terrain.push([
                    Math.floor(((i + 1) * this.width) / this.TERRAIN_POINTS),
                    this.terrain[i][1],
                ]);
                i++;
            }
        }
        this.player.spawn(this);
    }

    update() {
        this.player.consumeOxygen(this.OXYGEN_DEPLETION_RATE);
        this.player.consumeFuel();

        this.handleInput();

        this.checkTerrain();
        this.applyPhysics(this.gravity);
    }

    handleInput() {
        if (this.player.fuelLevel > 0) {
            this.player.mainThrusterOn = keyIsDown(this.KEYS.THRUSTER_MAIN);
            this.player.rightRCSOn = keyIsDown(this.KEYS.THRUSTER_RIGHT);
            this.player.leftRCSOn = keyIsDown(this.KEYS.THRUSTER_LEFT);
        } else {
            this.player.shutdownThrusters();
        }
    }

    checkTerrain() {
        for (let i = 0; i < this.terrain.length - 1; i++) {
            let touchL = pointOnLine(
                [this.player.position.x - 8, this.player.position.y + 8],
                [this.terrain[i], this.terrain[i + 1]]
            );
            let touchR = pointOnLine(
                [this.player.position.x + 8, this.player.position.y + 8],
                [this.terrain[i], this.terrain[i + 1]]
            );
            if (touchL || touchR) {
                this.player.velocity.y + Math.abs(this.player.velocity.x) >
                this.player.MAX_LANDING_VELOCITY
                    ? this.player.crash()
                    : this.player.land();
            }
        }
        if (this.player.position.y >= this.height) {
            this.player.position.y = this.height;
            this.player.land();
        }
    }

    applyPhysics(gravity) {
        this.player.applyPhysics(gravity);
    }

    render() {
        background("black");
        noFill();
        for (let i = 0; i < this.terrain.length - 1; i++) {
            if (i % (this.TERRAIN_POINTS / this.LANDING_AREAS) == 2) {
                stroke("green");
                strokeWeight(3);
                line(
                    this.terrain[i][0],
                    this.terrain[i][1],
                    this.terrain[i + 1][0],
                    this.terrain[i + 1][1]
                );
            } else {
                stroke("white");
                strokeWeight(1);
                line(
                    this.terrain[i][0],
                    this.terrain[i][1],
                    this.terrain[i + 1][0],
                    this.terrain[i + 1][1]
                );
            }
        }

        this.player.render();

        textFont(this.font);
        textSize(10);
        noStroke();
        fill("white");
        text("RP-1 ", 20, 32);
        text("O2 ", 20, 48);
        text("Altitude ", 240, 32);
        text(
            (
                (this.height - this.player.position.y) /
                this.PIXELS_PER_METER
            ).toFixed(2) + " m",
            380,
            32
        );
        text("V-Velocity ", 240, 48);
        text(
            ((this.player.velocity.y / this.PIXELS_PER_METER) * 60).toFixed(2) +
                " m/s",
            380,
            48
        );

        stroke("white");
        noFill();
        rect(70, 21, 100, 10);
        rect(70, 37, 100, 10);

        noStroke();
        if (
            this.player.fuelLevel < this.player.STARTING_FUEL * 0.5 &&
            frameCount % 45 < 15
        ) {
            fill("gray");
        } else {
            fill("white");
        }
        const fuelBar =
            (this.player.fuelLevel / this.player.STARTING_FUEL) * 100;
        rect(70, 21, fuelBar, 10);

        if (
            this.player.oxygenLevel < this.player.STARTING_OXYGEN * 0.3 &&
            frameCount % 45 < 15
        ) {
            fill("gray");
        } else {
            fill("white");
        }
        const o2Bar =
            (this.player.oxygenLevel / this.player.STARTING_OXYGEN) * 100;
        rect(70, 37, o2Bar, 10);
    }
}

class Lander {
    MAX_LANDING_VELOCITY = 0.5; // m/s
    STARTING_FUEL = 100;
    STARTING_OXYGEN = 1000;
    fuelLevel = 0;
    oxygenLevel = 0;

    mainThrusterOn = false;
    rightRCSOn = false;
    leftRCSOn = false;

    thrusterParticles = new Set();

    landed = false;

    polygon = [
        [-6, 0],
        [-8, -2],
        [-8, -6],
        [-6, -8],
        [6, -8],
        [8, -6],
        [8, -2],
        [6, 0],
        [8, 0],
        [8, 4],
        [7, 4],
        [8, 8],
        [5, 4],
        [2, 4],
        [3, 8],
        [-3, 8],
        [-2, 4],
        [-5, 4],
        [-8, 8],
        [-7, 4],
        [-8, 4],
        [-8, 0],
    ];

    constructor() {
        this.position = new Vec();
        this.velocity = new Vec();
        console.log("this: ", this);
    }

    spawn(planet) {
        this.fuelLevel = this.STARTING_FUEL;
        this.oxygenLevel = this.STARTING_OXYGEN;
        this.position.set(new Vec(planet.width / 2, 64));
    }

    render() {
        strokeWeight(1);
        stroke("white");
        this.polygon.forEach((point, i) => {
            line(
                this.position.x + point[0],
                this.position.y + point[1],
                this.position.x +
                    this.polygon[(i + 1) % this.polygon.length][0],
                this.position.y + this.polygon[(i + 1) % this.polygon.length][1]
            );
        });
        this.thrusterParticles.forEach((particle) => {
            particle.render();
            if (particle.life <= 0) this.thrusterParticles.delete(particle);
        });
    }

    consumeOxygen(rate) {
        this.oxygenLevel -= rate;
        if (this.oxygenLevel < 0) this.oxygenLevel = 0;
    }

    consumeFuel() {
        if (this.mainThrusterOn) {
            this.fuelLevel -= 0.2;
            this.addParticles("main");
        }

        if (this.rightRCSOn) {
            this.fuelLevel -= 0.1;
            this.addParticles("right");
        }

        if (this.leftRCSOn) {
            this.fuelLevel -= 0.1;
            this.addParticles("left");
        }
        if (this.fuelLevel < 0) this.fuelLevel = 0;
    }

    shutdownThrusters() {
        this.mainThrusterOn = false;
        this.rightRCSOn = false;
        this.leftRCSOn = false;
    }

    applyPhysics(gravity) {
        if (this.mainThrusterOn) {
            this.landed = false;
            this.velocity.y -= 0.08;
        }

        if (this.rightRCSOn) {
            this.velocity.x -= 0.01;
        }

        if (this.leftRCSOn) {
            this.velocity.x += 0.01;
        }

        if (!this.landed) {
            this.velocity.add(gravity);
        }
        this.position.add(this.velocity);
    }

    land() {
        this.shutdownThrusters();
        this.landed = true;
        this.velocity = new Vec();
    }

    crash() {
        this.land();
        console.log("CRASH!!!");
    }

    addParticles(thruster) {
        const particlesPerPulse = 5;
        let maxSize = 8;
        let minSize = 2;
        let maxLife = 30;
        let position = new Vec();
        let velocity = new Vec();

        switch (thruster) {
            case "main":
                position = new Vec(this.position.x, this.position.y + 8);
                break;
            case "left":
                position = new Vec(this.position.x - 8, this.position.y);
                maxSize = 4;
                maxLife = 15;
                break;
            case "right":
                maxSize = 4;
                maxLife = 15;
                position = new Vec(this.position.x + 8, this.position.y);
                break;
        }

        for (let i = 0; i < particlesPerPulse; i++) {
            switch (thruster) {
                case "main":
                    velocity = new Vec(Math.random() - 0.5, 2);
                    break;
                case "left":
                    velocity = new Vec(-2, Math.random() * 0.5 - 0.25);
                    break;
                case "right":
                    velocity = new Vec(2, Math.random() * 0.5 - 0.25);
                    break;
            }
            let size = Math.random() * maxSize - minSize + minSize;
            let life = Math.random() * maxLife;
            this.thrusterParticles.add(
                new Particle(position, velocity, size, life)
            );
        }
    }
}

class DemoLander extends Lander {
    constructor() {
        super();
    }
}

class Particle {
    constructor(position, velocity, size, life) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.life = life;
    }

    render() {
        this.life--;
        this.position.add(this.velocity);
        noFill();
        stroke("gray");
        ellipse(this.position.x, this.position.y, this.size, this.size);
        this.size -= 0.01;
        if (this.size === 0) this.life = 0;
    }
}
