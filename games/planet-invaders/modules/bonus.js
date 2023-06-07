import { GameObject } from "./game-object.js";

class Bonus extends GameObject {
    constructor(position, sprite, size, colliderSize, speed, direction) {
        super("bonus", position, size, colliderSize);
        this.sprite = sprite;
        this.moveSpeed = speed;
        this.direction = direction;
        this.remove = false;
    }

    update() {
        this.position.x += this.moveSpeed * this.direction.x;
    }

    render() {
        image(
            this.sprite,
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );
    }
}

export { Bonus };
