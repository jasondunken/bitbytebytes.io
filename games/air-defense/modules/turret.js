import { GameObject } from "./game-object.js";
import { Animation } from "./animation.js";
import { setColor } from "./utils.js";

class Turret {
    MAX_AMMO = 10000;
    HALF_BASE_WIDTH = 50;
    HALF_BASE_HEIGHT = 30;
    BLOCK_SIZE = 10;
    CORE_SIZE = 30;
    TURRET_DIAMETER = 50;
    TURRET_BARREL_LENGTH = 57;
    TURRET_ROTATION_SPEED = 0.02;

    RELOAD_TIME = 5;

    turretCenter;
    endOfBarrel;
    barrelAngle = -Math.PI / 2;
    reloadTimer = 0;

    sprites = null;
    blocks = new Set();
    core = null;
    ammoStockpile = new Set();
    ammo = 0;

    constructor(game, position, turretBlocks) {
        this.game = game;
        this.position = position;
        this.turretCenter = { x: position.x, y: position.y - this.HALF_BASE_HEIGHT * 2 + this.BLOCK_SIZE };
        this.endOfBarrel = { x: position.x, y: position.y - this.HALF_BASE_HEIGHT * 2 - this.TURRET_BARREL_LENGTH };
        this.ammo = this.MAX_AMMO;
        this.sprites = turretBlocks;
        this.buildBattery();
    }

    update() {
        if (keyIsDown(RIGHT_ARROW)) {
            this.move(this.TURRET_ROTATION_SPEED);
        }
        if (keyIsDown(LEFT_ARROW)) {
            this.move(-this.TURRET_ROTATION_SPEED);
        }
        if (keyIsDown(DOWN_ARROW)) {
        }
        if (keyIsDown(32)) {
            this.fire();
        }

        if (this.reloadTimer > 0) {
            this.reloadTimer--;
        }
        this.core.update();
    }

    move(amount) {
        let barrelAngle = this.barrelAngle + amount;
        if (barrelAngle >= 0) barrelAngle = 0;
        if (barrelAngle <= -Math.PI) barrelAngle = -Math.PI;
        this.barrelAngle = barrelAngle;
        this.endOfBarrel = {
            x: this.turretCenter.x + this.TURRET_BARREL_LENGTH * Math.cos(barrelAngle),
            y: this.turretCenter.y + this.TURRET_BARREL_LENGTH * Math.sin(barrelAngle),
        };
    }

    fire() {
        if (this.reloadTimer <= 0) {
            this.reloadTimer = this.RELOAD_TIME;
            this.ammo--;
            const sound = new Audio();
            sound.src = "./air-defense/res/snd/fire_1.wav";
            sound.play();
            this.game.gameObjects.add(
                new Bullet(
                    new p5.Vector(this.endOfBarrel.x, this.endOfBarrel.y),
                    new p5.Vector(this.endOfBarrel.x - this.turretCenter.x, this.endOfBarrel.y - this.turretCenter.y)
                )
            );
        }
    }

    render() {
        setColor("gray");
        strokeWeight(10);
        line(this.turretCenter.x, this.turretCenter.y, this.endOfBarrel.x, this.endOfBarrel.y);
        strokeWeight(1);
        setColor("silver");
        ellipse(this.turretCenter.x, this.turretCenter.y, this.TURRET_DIAMETER, this.TURRET_DIAMETER);

        // draw stationary part of base
        setColor("brown");
        rect(
            this.position.x - this.HALF_BASE_WIDTH / 2,
            this.position.y - this.HALF_BASE_HEIGHT * 2,
            this.HALF_BASE_WIDTH,
            this.HALF_BASE_HEIGHT * 2
        );
        this.core.render();
        this.blocks.forEach((block) => {
            block.render();
        });
        this.ammoStockpile.forEach((crate) => {
            crate.render();
        });
    }

    buildBattery() {
        // turret position is center point of where it touches the ground
        const width = this.HALF_BASE_WIDTH * 2;
        const height = this.HALF_BASE_HEIGHT * 2;
        const topLeft = {
            x: this.position.x - this.HALF_BASE_WIDTH,
            y: this.position.y - height,
        };
        for (let x = 0; x < width / this.BLOCK_SIZE; x++) {
            for (let y = 0; y < height / this.BLOCK_SIZE; y++) {
                this.blocks.add(
                    new Block(
                        { x: x * this.BLOCK_SIZE + topLeft.x, y: y * this.BLOCK_SIZE + topLeft.y },
                        this.sprites["green-block"],
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE
                    )
                );
            }
        }
        this.core = new Core(
            { x: this.position.x - this.CORE_SIZE / 2, y: this.position.y - this.CORE_SIZE },
            this.sprites["generator"],
            this.CORE_SIZE,
            this.CORE_SIZE
        );

        // for (let i = 0; i < this.MAX_AMMO / 500; i++) {
        //     this.ammoStockpile.add(
        //         new AmmoCrate({ x: Math.random() * this.game.width, y: 400 - 32 }, this.sprites["ammo-crate-500"])
        //     );
        // }
    }
}

class Bullet extends GameObject {
    BULLET_DIAMETER = 2;
    BULLET_SPEED = 10;
    constructor(position, direction) {
        super("bullet", position);
        this.damage = 10;
        this.direction = direction;
    }

    update() {
        this.position = new p5.Vector(
            this.position.x + this.direction.x / this.BULLET_SPEED,
            this.position.y + this.direction.y / this.BULLET_SPEED
        );
    }

    render() {
        setColor("black");
        ellipse(this.position.x, this.position.y, this.BULLET_DIAMETER, this.BULLET_DIAMETER);
    }
}

class AmmoCrate extends GameObject {
    center;
    constructor(position, sprite) {
        super("ammo", position);
        this.sprite = sprite;
        this.width = sprite.width;
        this.height = sprite.height;
        this.center = {
            x: position.x + width / 2,
            y: position.y + height / 2,
        };
    }

    takeDamage(amount) {
        this.dead = true;
    }

    render() {
        image(this.sprite, this.position.x, this.position.y, this.width, this.height);
    }
}

class Block extends GameObject {
    MAX_HEALTH = 100;
    health;

    center;

    constructor(position, sprite, width, height) {
        super("block", position);
        this.sprite = sprite;
        this.width = width;
        this.height = height;
        this.health = this.MAX_HEALTH;
        this.center = {
            x: position.x + width / 2,
            y: position.y + height / 2,
        };
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) this.dead = true;
    }

    render() {
        image(this.sprite, this.position.x, this.position.y, this.width, this.height);
    }
}

class Core extends GameObject {
    MAX_HEALTH = 1000;
    health;

    center;

    animation = null;
    constructor(position, sprite, width, height) {
        super("core", position);
        this.animation = new Animation(sprite, 60, true);
        this.width = width;
        this.height = height;
        this.center = {
            x: this.position.x + width / 2,
            y: this.position.y + height / 2,
        };
        this.health = this.MAX_HEALTH;
    }

    update() {
        this.animation.update();
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) this.dead = true;
    }

    render() {
        image(this.animation.currentFrame, this.position.x, this.position.y, this.width, this.height);
    }
}

export { Turret, AmmoCrate };
