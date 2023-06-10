import { GameObject } from "./game-object.js";
import { Shot } from "./shot.js";

import { Vec } from "../../modules/math/vec.js";

class Player extends GameObject {
    COLLIDER_OFFSET_X = 0.4;
    COLLIDER_OFFSET_Y = 0.25;

    BASE_COOL_DOWN = 15;
    coolDown = 0;
    weaponReady = true;

    constructor(world, position, sprite, size, colliderSize, speed) {
        super("player", position, size, colliderSize);
        this.world = world;
        this.sprite = sprite;
        this.moveSpeed = speed;
        this.colliders = [new Vec(), new Vec(), new Vec()];
        this.updateColliders();
    }

    update() {
        if (keyIsDown(RIGHT_ARROW)) this.position.x += this.moveSpeed;
        if (keyIsDown(LEFT_ARROW)) this.position.x -= this.moveSpeed;

        if (this.position.x < 0 + this.size / 2)
            this.position.x = this.size / 2;
        if (this.position.x > this.world.width - this.size / 2)
            this.position.x = this.world.width - this.size / 2;

        this.updateColliders();

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

    updateColliders() {
        this.colliders[0].set(
            this.position.x - this.size * this.COLLIDER_OFFSET_X,
            this.position.y + this.size * this.COLLIDER_OFFSET_Y
        );
        this.colliders[1].set(this.position);
        this.colliders[2].set(
            this.position.x + this.size * this.COLLIDER_OFFSET_X,
            this.position.y + this.size * this.COLLIDER_OFFSET_Y
        );
    }

    render(debug) {
        if (this.sprite) {
            image(
                this.sprite,
                this.position.x - this.size,
                this.position.y - this.size,
                this.size * 2,
                this.size * 2
            );

            if (debug) {
                for (let collider of this.colliders) {
                    stroke("red");
                    strokeWeight(1);
                    noFill();
                    ellipse(
                        collider.x,
                        collider.y,
                        this.colliderSize,
                        this.colliderSize
                    );
                }
            }
        }
    }

    fire() {
        if (this.weaponReady) {
            this.world.addGameObject(
                new Shot(
                    new Vec(this.position.x, this.position.y - this.size / 2),
                    Vec.UP
                )
            );
            this.coolDown = this.BASE_COOL_DOWN;
            this.weaponReady = false;
        }
    }

    setPosition(position) {
        this.position = position;
    }
}

class DemoPlayer extends Player {
    constructor(world, position, sprite, size, colliderSize, speed) {
        super(world, position, sprite, size, colliderSize, speed);
        this.direction = Math.random() < 5.0 ? Vec.LEFT : Vec.RIGHT;
        this.lastPosition = position.copy();
    }

    update() {
        if (frameCount % 30 === 0) {
            this.fire();
        }
        if (frameCount % 120 === 0 && Math.random() < 0.25) {
            this.changeDirection();
        }
        this.position.x += this.moveSpeed * this.direction.x;

        this.updateColliders();

        if (
            this.position.x < this.size ||
            this.position.x > this.world.width - this.size
        ) {
            this.changeDirection();
        }

        if (!this.weaponReady) {
            this.coolDown--;
            if (this.coolDown <= 0) {
                this.coolDown = this.BASE_COOL_DOWN;
                this.weaponReady = true;
            }
        }

        this.lastPosition.set(this.position);
    }

    changeDirection() {
        this.direction = this.direction === Vec.LEFT ? Vec.RIGHT : Vec.LEFT;
    }
}

export { Player, DemoPlayer };
