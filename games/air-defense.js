let WIDTH = 600;
let HEIGHT = 400;

let game = null;

const GameState = {
    HIGH_SCORE: 0,
    DEMO: 1,
    PLAY: 2,
};

function preload() {
    const sprites = [];
    sprites["blue_1_1_L"] = loadImage("./air-defense/img/blue_1_1_L.png");
    sprites["blue_1_2_L"] = loadImage("./air-defense/img/blue_1_2_L.png");
    sprites["blue_1_1_R"] = loadImage("./air-defense/img/blue_1_1_R.png");
    sprites["blue_1_2_R"] = loadImage("./air-defense/img/blue_1_2_R.png");

    game = new AirDefense(WIDTH, HEIGHT, sprites);
}

function setup() {
    const canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent("game");
    game.startDemo();
}

function draw() {
    game.update();
    game.render();
}

class AirDefense {
    GROUND_HEIGHT = 16;

    width = 0;
    height = 0;
    sprites = [];

    gameState = GameState.DEMO;
    gameObjects = [];
    score = 0;

    constructor(width, height, sprites) {
        this.width = width;
        this.height = height;
        this.sprites = sprites;
    }

    initGame() {}

    startDemo() {
        this.inDemo = true;
        this.turret = new DemoTurret(this, { x: this.width / 2, y: this.height - this.GROUND_HEIGHT });
        this.gameState = GameState.DEMO;
        this.startGame();
    }

    startDemo() {
        this.inDemo = false;
        this.turret = new Turret(this, { x: this.width / 2, y: this.height - this.GROUND_HEIGHT });
        this.gameState = GameState.PLAY;
        this.startGame();
    }

    startGame() {
        this.score = 0;
        this.gameObjects = [];
    }

    update() {
        this.turret.update();

        for (let gameObj of this.gameObjects) {
            gameObj.update();
        }

        if (frameCount % 60 === 0) {
            this.gameObjects.push(
                new EnemyAircraft(this.getEnemySpawnPos(), this.sprites["blue_1_1_L"], this.sprites["blue_1_1_R"])
            );
        }
    }

    render() {
        background(color("#9EF6FF"));
        strokeWeight(1);

        for (let gameObj of this.gameObjects) {
            gameObj.render();
        }

        this.turret.render();

        setColor("green");
        rect(0, this.height - this.GROUND_HEIGHT, this.width, this.GROUND_HEIGHT);

        // UI --------------------------------------------------------------------
        // // draw ammo reserve
        // setColor("green");
        // text(ammo, WIDTH - 55, 20);

        // // draw score
        // setColor("blue");
        // text(score, 20, 20);

        // // draw score
        // setColor("green");
        // text("Wave " + wave, 20, HEIGHT - 20);
    }

    checkForHit(bullet) {
        for (let e in enemy) {
            if (!enemy[e].dead) {
                const enemy = enemy[e];
                if (dist(bullet.pos.x, bullet.pos.y, enemy._pos.x, enemy._pos.y) <= enemy.diameter + bulletDiameter) {
                    enemy.hit(bullet.damage);
                    explode(new p5.Vector(bullet.pos.x, bullet.pos.y), new p5.Vector(bullet.dir.x, bullet.dir.y));
                    score++;
                }
            }
        }
    }

    getEnemySpawnPos() {
        let x = Math.random() < 0.5 ? -32 : this.width + 32;
        let y = (Math.random() * this.height) / 2;
        let z = x < 0 ? 1 : -1;
        return { x, y, z };
    }
}

class GameObject {
    constructor(type, position) {
        this.type = type;
        this.position = position;
        this.dead = false;
    }

    update() {}
    render() {}
}
