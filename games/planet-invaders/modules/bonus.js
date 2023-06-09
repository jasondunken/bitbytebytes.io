import { GameObject } from "./game-object.js";

class Bonus extends GameObject {
    constructor(position, sprite, size, colliderSize, speed, direction) {
        super("bonus", position, size, colliderSize);
        this.sprite = sprite;
        this.moveSpeed = speed;
        this.direction = direction;
        this.colliders = [position.copy()];
        this.remove = false;
    }

    update() {
        this.position.x += this.moveSpeed * this.direction.x;
        this.colliders[0] = this.position.copy();
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
