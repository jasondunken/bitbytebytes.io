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
class ExpeditionLuna {
    PLAYER_1_START_BUTTON = document.getElementById("start-1p").addEventListener("click", () => {
        this.start1Player();
    });

    PIXELS_PER_METER = 4;
    TERRAIN_POINTS = 24;
    TERRAIN_MAX_HEIGHT = 400;
    TERRAIN_MIN_HEIGHT = 100;
    LANDING_AREAS = 4;

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
        this.terrain = [];
        for (let i = 0; i <= this.TERRAIN_POINTS + this.LANDING_AREAS; i++) {
            this.terrain.push([
                Math.floor((i * this.width) / this.TERRAIN_POINTS),
                this.height -
                    (Math.floor(Math.random() * (this.TERRAIN_MAX_HEIGHT - this.TERRAIN_MIN_HEIGHT)) +
                        this.TERRAIN_MIN_HEIGHT),
            ]);
            if (i % (this.TERRAIN_POINTS / this.LANDING_AREAS) == 2) {
                this.terrain.push([Math.floor(((i + 1) * this.width) / this.TERRAIN_POINTS), this.terrain[i][1]]);
                i++;
            }
        }
        this.player.spawn(this);
    }

    update() {
        console.log("lander.y: ", this.player.position.y);
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
        if (this.player.mainThrusterOn) {
            this.player.landed = false;
        }
        if (this.player.fuelLevel < 0) this.player.fuelLevel = 0;
        this.player.oxygenLevel -= 0.1;
        if (this.player.oxygenLevel < 0) this.player.oxygenLevel = 0;
        if (!this.player.landed) {
            this.player.velocity = this.player.velocity.add(this.gravity);
        }
        this.player.position = this.player.position.add(this.player.velocity);
        if (this.player.position.y >= this.height) {
            this.player.position.y = this.height;
            this.player.land();
        }
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
                this.player.land();
            }
        }
    }

    handleInput() {}

    render() {
        background("black");
        noFill();
        for (let i = 0; i < this.terrain.length - 1; i++) {
            if (i % (this.TERRAIN_POINTS / this.LANDING_AREAS) == 2) {
                stroke("green");
                strokeWeight(3);
                line(this.terrain[i][0], this.terrain[i][1], this.terrain[i + 1][0], this.terrain[i + 1][1]);
            } else {
                stroke("white");
                strokeWeight(1);
                line(this.terrain[i][0], this.terrain[i][1], this.terrain[i + 1][0], this.terrain[i + 1][1]);
            }
        }
        strokeWeight(1);
        stroke("white");
        this.player.polygon.forEach((point, i) => {
            line(
                this.player.position.x + point[0],
                this.player.position.y + point[1],
                this.player.position.x + this.player.polygon[(i + 1) % this.player.polygon.length][0],
                this.player.position.y + this.player.polygon[(i + 1) % this.player.polygon.length][1]
            );
        });
        this.thrusterParticles.forEach((particle) => {
            particle.render();
            if (particle.life <= 0) this.thrusterParticles.delete(particle);
        });

        textFont(this.font);
        textSize(10);
        noStroke();
        fill("white");
        text("RP-1 ", 20, 32);
        text("O2 ", 20, 48);
        text("Altitude ", 240, 32);
        text(((this.height - this.player.position.y) / this.PIXELS_PER_METER).toFixed(2) + " m", 380, 32);
        text("V-Velocity ", 240, 48);
        text(((this.player.velocity.y / this.PIXELS_PER_METER) * 60).toFixed(2) + " m/s", 380, 48);

        stroke("white");
        noFill();
        rect(70, 21, 100, 10);
        rect(70, 37, 100, 10);

        fill("white");
        const fuelBar = (this.player.fuelLevel / this.player.STARTING_FUEL) * 100;
        rect(70, 21, fuelBar, 10);
        const o2Bar = (this.player.oxygenLevel / this.player.STARTING_OXYGEN) * 100;
        rect(70, 37, o2Bar, 10);
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
    STARTING_OXYGEN = 1000;
    fuelLevel = 0;
    oxygenLevel = 0;
    position = Vec2.ZEROS();
    velocity = Vec2.ZEROS();

    mainThrusterOn = false;
    rightRCSOn = false;
    leftRCSOn = false;

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

    constructor() {}

    spawn(planet) {
        this.fuelLevel = this.STARTING_FUEL;
        this.oxygenLevel = this.STARTING_OXYGEN;
        this.setPosition(new Vec2(planet.width / 2, 64));
    }

    setPosition(position) {
        this.position = position;
    }

    land() {
        this.landed = true;
        this.velocity = Vec2.ZEROS();
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
