import { GameObject } from "./gameObject.js";
import { SpriteStripAnimation } from "./animation.js";

import { Vec } from "../../modules/math/vec.js";

class Alien extends GameObject {
    static SIZE = 32;
    static COLLIDER_SIZE = 24;
    static SPEED = 3;

    constructor(position, spriteSheet) {
        super("alien", position, Alien.SIZE, Alien.COLLIDER_SIZE, Alien.SPEED);
        this.animation = new SpriteStripAnimation(spriteSheet, 20, true);
        this.direction = Vec.LEFT;
        this.delta = 0;
    }

    update() {
        this.delta += 0.03;
        if (this.delta >= 2 * PI) this.delta = 0;
        this.position.x = this.position.x + this.direction.x * this.speed;
        this.position.y = this.position.y + Math.sin(this.delta);
        this.updateColliders();
        this.animation.update();
    }
    draw() {
        image(
            this.animation.currentFrame,
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );
    }
}

export { Alien };
