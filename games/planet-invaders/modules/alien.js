import { GameObject } from "./game-object.js";

import { Vec } from "../../modules/math/vec.js";

class Alien extends GameObject {
    delta = 0;
    yRange = 2;
    constructor(position, sprite, size, colliderSize, speed) {
        super("alien", position, size, colliderSize);
        this.direction = Vec.RIGHT;
        this.moveSpeed = speed;
        this.sprite = sprite;
        this.colliders = [position.copy()];
        this.delta = Math.random() * 2 * PI;
        this.yRange = Math.random() * this.yRange + this.yRange;
    }

    update() {
        this.delta += 0.08;
        if (this.delta >= 2 * PI) this.delta = 0;
        this.position.x = this.position.x + this.moveSpeed * this.direction.x;
        this.position.y = this.position.y + Math.sin(this.delta);
        this.colliders[0] = this.position.copy();
    }

    render(debug) {
        if (this.sprite) {
            image(
                this.sprite,
                this.position.x - this.size / 2,
                this.position.y - this.size / 2,
                this.size,
                this.size
            );
        }

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

export { Alien };
