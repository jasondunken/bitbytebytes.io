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
    sprites["background"] = loadImage("./air-defense/img/background.png");
    sprites["foreground"] = loadImage("./air-defense/img/foreground.png");
    sprites["blue_1_1_L"] = loadImage("./air-defense/img/blue_1_1_L.png");
    sprites["blue_1_2_L"] = loadImage("./air-defense/img/blue_1_2_L.png");
    sprites["blue_1_1_R"] = loadImage("./air-defense/img/blue_1_1_R.png");
    sprites["blue_1_2_R"] = loadImage("./air-defense/img/blue_1_2_R.png");
    sprites["airborne_left"] = loadImage("./air-defense/img/airborne_left.png");
    sprites["airborne_right"] = loadImage("./air-defense/img/airborne_right.png");
    sprites["paratrooper"] = loadImage("./air-defense/img/paratrooper.png");

    game = new AirDefense(WIDTH, HEIGHT, sprites);
}

function setup() {
    const canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent("game");
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

    start1Player() {
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
            if (gameObj.type === "bomber") {
                if (
                    (gameObj.position.x <= -32 && gameObj.position.z === -1) ||
                    (gameObj.position.x >= this.width + 32 && gameObj.position.z === 1)
                ) {
                    gameObj.dead = true;
                }
                if (
                    !gameObj.dead &&
                    gameObj.position.x < this.turret.position.x + this.turret.BASE_WIDTH &&
                    gameObj.position.x > this.turret.position.x - this.turret.BASE_WIDTH
                ) {
                    if (gameObj.dropBomb()) {
                        this.gameObjects.push(
                            new Bomb({ x: gameObj.position.x, y: gameObj.position.y }, { x: gameObj.position.z, y: 0 })
                        );
                    }
                }
            }
            if (gameObj.type === "bomb" && gameObj.position.y > this.height) gameObj.dead = true;
        }

        for (let i = this.gameObjects.length - 1; i >= 0; i--) {
            if (this.gameObjects[i].dead) {
                this.gameObjects.splice(i, 1);
            }
        }

        if (frameCount % 320 === 0) {
            for (let i = 0; i < 3; i++) {
                let spawnPos = this.getEnemySpawnPos(
                    this.height - this.BOMBER_MIN_ALT,
                    this.height - this.BOMBER_MAX_ALT
                );
                spawnPos.x = spawnPos.x - spawnPos.z * i * 64;
                this.gameObjects.push(
                    new EnemyAircraft(spawnPos, this.sprites["blue_1_1_L"], this.sprites["blue_1_1_R"])
                );
            }
        }
        if (frameCount % 1200 === 0) {
            this.gameObjects.push(
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

        for (let gameObj of this.gameObjects) {
            gameObj.render();
        }

        this.turret.render();

        image(
            this.sprites["foreground"],
            0,
            this.height - this.sprites["foreground"].height,
            this.sprites["foreground"].width,
            this.sprites["foreground"].height
        );

        // UI --------------------------------------------------------------------
        setColor("white");
        noStroke();
        textSize(16);
        text(this.turret.ammo, WIDTH - 55, 20);

        setColor("white");
        noStroke();
        textSize(16);
        text(this.score, 10, 20);
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

    getEnemySpawnPos(min, max) {
        let x = Math.random() < 0.5 ? -32 : this.width + 32;
        let y = Math.random() * (max - min) + min;
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
