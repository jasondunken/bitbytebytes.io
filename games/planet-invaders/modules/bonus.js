import { GameObject } from "./game-object.js";

import { Vec } from "../../modules/math/vec.js";

class Bonus extends GameObject {
    COLLIDER_OFFSET_X = 0.27;

    constructor(position, sprite, size, colliderSize, speed, direction) {
        super("bonus", position, size, colliderSize);
        this.sprite = sprite;
        this.moveSpeed = speed;
        this.direction = direction;
        this.colliders = [new Vec(), new Vec(), new Vec()];
        this.updateColliders();
        this.remove = false;
    }

    update() {
        this.position.x += this.moveSpeed * this.direction.x;
        this.updateColliders();
    }

    updateColliders() {
        this.colliders[0] = this.position
            .copy()
            .add(new Vec(-this.COLLIDER_OFFSET_X * this.size, 0));
        this.colliders[1] = this.position.copy();
        this.colliders[2] = this.position
            .copy()
            .add(new Vec(this.COLLIDER_OFFSET_X * this.size - 2, 0));
    }

    render(debug) {
        image(
            this.sprite,
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
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

export { Bonus };
