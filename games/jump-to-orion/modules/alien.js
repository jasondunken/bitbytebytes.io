import { GameObject } from "./gameObject.js";
import { SpriteStripAnimation } from "./animation.js";

class Alien extends GameObject {
    imageAlien;

    constructor(initialPos, speed, size, imageAlien, spriteSheet) {
        super("alien", initialPos, speed, size);
        this.imageAlien = imageAlien;
        this.animation = new SpriteStripAnimation(spriteSheet, 20, true);
    }

    update() {
        this.pathPos.x = this.pathPos.x + this.speed;
        this.delta += this.speed / 60.0;
        this.currentPos = {
            x: this.pathPos.x,
            y: this.pathPos.y + Math.cos(this.delta % 360) * this.size,
        };
        this.setCorners();
        this.animation.update();
    }

    draw() {
        image(this.animation.currentFrame, this.corners.a.x, this.corners.a.y, this.size, this.size);
    }
}

export { Alien };
