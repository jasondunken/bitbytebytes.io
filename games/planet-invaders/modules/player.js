import { GameObject } from "./game-object.js";
import { Vec2 } from "./vec2d.js";

class Player extends GameObject {
    BASE_COOL_DOWN = 15;
    coolDown = 0;
    weaponReady = true;

    constructor(world, position, sprite, size) {
        super("player", position, size);
        this.world = world;
        this.sprite = sprite;
        this.moveSpeed = world.PLAYER_SPEED;
    }

    update() {
        if (keyIsDown(RIGHT_ARROW)) this.position.x += this.moveSpeed;
        if (keyIsDown(LEFT_ARROW)) this.position.x -= this.moveSpeed;

        if (this.position.x < 0 + this.size / 2) this.position.x = this.size / 2;
        if (this.position.x > this.world.width - this.size / 2) this.position.x = this.world.width - this.size / 2;

        if (keyIsDown(32) && this.weaponReady) {
            this.fire();
        }

        if (!this.weaponReady) {
            this.coolDown--;
            if (this.coolDown === 0) {
                this.weaponReady = true;
            }
        }
    }

    render() {
        if (this.sprite) {
            image(this.sprite, this.position.x - this.size, this.position.y - this.size, this.size * 2, this.size * 2);
        }
    }

    fire() {
        console.log("fire!");
        if (this.weaponReady) {
            this.world.level.gameObjects.add(new Shot(new Vec2(this.position.x, this.position.y), Vec2.UP));
            this.coolDown = this.BASE_COOL_DOWN;
            this.weaponReady = false;
        }
    }

    setPosition(position) {
        this.position = position;
    }
}

class DemoPlayer extends Player {
    constructor(world) {
        super(world);
    }

    update() {
        if (frameCount % 30 === 0) {
            this.fire();
        }
        this.position.x += this.moveSpeed;

        if (this.position.x < this.size || this.position.x > this.world.width - this.size) {
            this.moveSpeed *= -1;
        }

        if (!this.weaponReady) {
            this.coolDown--;
            if (this.coolDown <= 0) {
                this.coolDown = this.BASE_COOL_DOWN;
                this.weaponReady = true;
            }
        }
    }
}

export { Player, DemoPlayer };
