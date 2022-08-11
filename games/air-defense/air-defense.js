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
    const turretBlocks = [];
    sprites["paratrooper"] = loadImage("./air-defense/img/paratrooper.png");
    sprites["background"] = loadImage("./air-defense/img/background.png");
    sprites["foreground"] = loadImage("./air-defense/img/foreground.png");
    sprites["blue_1_1_L"] = loadImage("./air-defense/img/blue_1_1_L.png");
    sprites["blue_1_2_L"] = loadImage("./air-defense/img/blue_1_2_L.png");
    sprites["blue_1_1_R"] = loadImage("./air-defense/img/blue_1_1_R.png");
    sprites["blue_1_2_R"] = loadImage("./air-defense/img/blue_1_2_R.png");
    sprites["airborne_left"] = loadImage("./air-defense/img/airborne_left.png");
    sprites["airborne_right"] = loadImage("./air-defense/img/airborne_right.png");
    turretBlocks["red-block"] = loadImage("./air-defense/img/redblock.png");
    turretBlocks["green-block"] = loadImage("./air-defense/img/greenblock.png");
    turretBlocks["generator"] = loadImage("./air-defense/img/generator.png");
    turretBlocks["ammo-crate-500"] = loadImage("./air-defense/img/ammo_crate_500.png");

    game = new AirDefense(WIDTH, HEIGHT, sprites, turretBlocks);
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

    gameState = GameState.DEMO;
    gameObjects = [];
    score = 0;

    constructor(width, height, sprites, turretBlocks) {
        this.width = width;
        this.height = height;
        this.sprites = sprites;
        this.turretBlocks = turretBlocks;
    }

    initGame() {}

    startDemo() {
        this.inDemo = true;
        this.turret = new DemoTurret(
            this,
            { x: this.width / 2, y: this.height - this.GROUND_HEIGHT },
            this.turretBlocks
        );
        this.gameState = GameState.DEMO;
        this.startGame();
    }

    start1Player() {
        this.inDemo = false;
        this.turret = new Turret(this, { x: this.width / 2, y: this.height - this.GROUND_HEIGHT }, this.turretBlocks);
        this.gameState = GameState.PLAY;
        this.startGame();
    }

    startGame() {
        this.score = 0;
        this.gameObjects = new Set();
    }

    update() {
        // console.log("gameObjects.size: ", this.gameObjects.size);
        this.turret.update();

        const bullets = Array.from(this.gameObjects).filter((element) => {
            return element.type === "bullet";
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
                        }
                        this.gameObjects.add(new Explosion(gameObj.position));
                        if (block.dead) {
                            this.gameObjects.add(new Explosion(block.position));
                        }
                    }
                });
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

            if (gameObj.type === "paratrooper" && gameObj.position.y >= this.height - this.GROUND_HEIGHT - 8) {
                gameObj.grounded = true;
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
        setColor("white");
        noStroke();
        textSize(16);
        text(this.turret.ammo, WIDTH - 55, 20);

        setColor("white");
        noStroke();
        textSize(16);
        text(this.score, 10, 20);
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

class GameObject {
    constructor(type, position) {
        this.type = type;
        this.position = position;
        this.dead = false;
    }

    update() {}
    render() {}
}

class Explosion extends GameObject {
    duration = 30;
    MAX_RADIUS = 25;
    constructor(position) {
        super("explosion", position);
        const sound = new Audio();
        sound.src = "./air-defense/snd/explosion_1.wav";
        sound.play();
    }

    update() {
        this.duration--;
        if (this.duration <= 0) this.dead = true;
    }

    render() {
        const radius = Math.random() * this.MAX_RADIUS;
        const color = `rgba(${Math.floor(Math.random() * 128) + 128}, 0, 0, ${Math.floor(Math.random() * 256)})`;
        setColor(color);
        ellipse(this.position.x, this.position.y, radius, radius);
    }
}

class Splatter extends GameObject {
    MAX_DURATION = 100;
    MAX_PARTICLES = 5;
    MAX_RADIUS = 3;
    SPLAT_GRAVITY = 3;
    particles = new Set();
    constructor(position, direction) {
        super("splatter", position);
        for (let i = 0; i < this.MAX_PARTICLES; i++) {
            this.particles.add({
                id: i,
                position: {
                    x: position.x + Math.random() * 10 - 5,
                    y: position.y + Math.random() * 10 - 5,
                },
                direction: {
                    x: (direction.x + Math.random() * 5 - 2.5) / 10,
                    y: (direction.y + Math.random() * 5 - 2.5) / 10,
                },
                radius: Math.random() * this.MAX_RADIUS + 1,
                life: Math.random() * (this.MAX_DURATION / 2) + this.MAX_DURATION / 2,
            });
        }
    }

    update() {
        this.particles.forEach((particle) => {
            particle.position.x = particle.position.x + particle.direction.x;
            particle.position.y = particle.position.y + particle.direction.y + this.SPLAT_GRAVITY;
            particle.life--;
            if (particle.life <= 0) this.particles.delete(particle);
        });
        if (this.particles.size === 0) this.dead = true;
    }

    render() {
        this.particles.forEach((particle) => {
            const color = `rgba(${Math.floor(Math.random() * 128) + 128}, 0, 0, ${Math.floor(Math.random() * 256)})`;
            setColor(color);
            ellipse(particle.position.x, particle.position.y, particle.radius, particle.radius);
        });
    }
}
