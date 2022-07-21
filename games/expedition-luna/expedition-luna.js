const GAME_WIDTH = 512;
const GAME_HEIGHT = 768;

let game = null;

// p5.js functions ------------------------>
function preload() {
    let font = loadFont("./expedition-luna/font/PressStart2P.ttf");
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

const PIXELS_PER_METER = 4;

class ExpeditionLuna {
    PLAYER_1_START_BUTTON = document.getElementById("start-1p").addEventListener("click", () => {
        this.start1Player();
    });

    PIXELS_PER_METER = 4;
    gravity = new Vec2(0, 0.02);
    atmosphericDrag = 0.5;
    surfaceFriction = 5;
    player = null;
    terrain = null;

    thrusterParticles = new Set();

    constructor(width, height, font) {
        this.width = width;
        this.height = height;
        this.font = font;
    }

    startDemo() {
        this.player = new DemoLander();
        this.startGame();
    }

    start1Player() {
        this.player = new Lander();
        this.startGame();
    }

    startGame() {
        const TERRAIN_POINTS = 24;
        const TERRAIN_MAX_HEIGHT = 400;
        const TERRAIN_MIN_HEIGHT = 100;
        const LANDING_AREAS = 4;
        this.terrain = [];
        for (let i = 0; i <= TERRAIN_POINTS + LANDING_AREAS; i++) {
            this.terrain.push([
                Math.floor((i * this.width) / TERRAIN_POINTS),
                this.height -
                    (Math.floor(Math.random() * (TERRAIN_MAX_HEIGHT - TERRAIN_MIN_HEIGHT)) + TERRAIN_MIN_HEIGHT),
            ]);
            if (i % (TERRAIN_POINTS / LANDING_AREAS) == 2) {
                this.terrain.push([Math.floor(((i + 1) * this.width) / TERRAIN_POINTS), this.terrain[i][1]]);
                i++;
            }
        }
        this.player.reset(this);
    }

    update() {
        if (this.player.fuelLevel > 0) {
            if (keyIsDown(87)) {
                this.player.velocity.y -= 0.08;
                this.player.fuelLevel -= 0.2;
                this.player.mainThrusterOn = true;
                this.addParticles("main");
            } else this.player.mainThrusterOn = false;
            if (keyIsDown(65)) {
                this.player.velocity.x -= 0.01;
                this.player.fuelLevel -= 0.1;
                this.player.rightRCSOn = true;
                this.addParticles("right");
            } else this.player.rightRCSOn = false;
            if (keyIsDown(68)) {
                this.player.velocity.x += 0.01;
                this.player.fuelLevel -= 0.1;
                this.player.leftRCSOn = true;
                this.addParticles("left");
            } else this.player.leftRCSOn = false;
        }
        if (this.player.fuelLevel < 0) this.player.fuelLevel = 0;
        this.player.velocity = this.player.velocity.add(this.gravity);
        this.player.position = this.player.position.add(this.player.velocity);
        if (this.player.position.y >= this.height) {
            this.player.position.y = this.height;
            this.player.velocity.y = 0;
        }
    }

    render() {
        const TERRAIN_POINTS = 24;
        const TERRAIN_MAX_HEIGHT = 400;
        const TERRAIN_MIN_HEIGHT = 100;
        const LANDING_AREAS = 4;
        background("black");
        noFill();
        for (let i = 0; i < this.terrain.length - 1; i++) {
            if (i % (TERRAIN_POINTS / LANDING_AREAS) == 2) {
                stroke("green");
                strokeWeight(3);
                line(this.terrain[i][0], this.terrain[i][1], this.terrain[i + 1][0], this.terrain[i + 1][1]);
            } else {
                stroke("white");
                strokeWeight(1);
                line(this.terrain[i][0], this.terrain[i][1], this.terrain[i + 1][0], this.terrain[i + 1][1]);
            }
        }
        stroke("white");
        rect(this.player.position.x - 8, this.player.position.y - 8, 16, 16);
        this.thrusterParticles.forEach((particle) => {
            particle.render();
            if (particle.life <= 0) this.thrusterParticles.delete(particle);
        });

        textFont(this.font);
        textSize(14);
        noStroke();
        fill("white");
        text("Fuel " + this.player.fuelLevel.toFixed(1), 20, 32);
        text("Altitude " + ((this.height - this.player.position.y) / PIXELS_PER_METER).toFixed(2), 240, 32);
        text("VertVelocity " + ((this.player.velocity.y / PIXELS_PER_METER) * 60).toFixed(2) + " m/s", 20, 64);
    }

    addParticles(thruster) {
        const particlesPerPulse = 5;
        let maxSize = 8;
        let minSize = 2;
        let maxLife = 30;
        let position = Vec2.ZEROS();
        let velocity = Vec2.ZEROS();

        switch (thruster) {
            case "main":
                position = new Vec2(this.player.position.x, this.player.position.y + 8);
                break;
            case "left":
                position = new Vec2(this.player.position.x - 8, this.player.position.y);
                maxSize = 4;
                maxLife = 15;
                break;
            case "right":
                maxSize = 4;
                maxLife = 15;
                position = new Vec2(this.player.position.x + 8, this.player.position.y);
                break;
        }
        new Vec2(-0.5, -0.01);

        for (let i = 0; i < particlesPerPulse; i++) {
            switch (thruster) {
                case "main":
                    velocity = new Vec2(Math.random() - 0.5, 2);
                    break;
                case "left":
                    velocity = new Vec2(-2, Math.random() * 0.5 - 0.25);
                    break;
                case "right":
                    velocity = new Vec2(2, Math.random() * 0.5 - 0.25);
                    break;
            }
            let size = Math.random() * maxSize - minSize + minSize;
            let life = Math.random() * maxLife;
            this.thrusterParticles.add(new Particle(position, velocity, size, life));
        }
    }
}

class Lander {
    STARTING_FUEL = 100;
    fuelLevel = 0;
    position = Vec2.ZEROS();
    velocity = Vec2.ZEROS();

    mainThrusterOn = false;
    rightRCSOn = false;
    leftRCSOn = false;

    constructor() {}

    reset(planet) {
        this.fuelLevel = this.STARTING_FUEL;
        this.position = new Vec2(Math.floor(Math.random() * (planet.width - 64)) + 32, 64);
    }

    setPosition(position) {
        this.position = position;
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
        this.position = this.position.add(this.velocity);
        noFill();
        stroke("gray");
        ellipse(this.position.x, this.position.y, this.size, this.size);
        this.size -= 0.01;
        if (this.size === 0) this.life = 0;
    }
}
