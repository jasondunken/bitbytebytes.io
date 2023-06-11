import { GameObject } from "./gameObject.js";

import { Vec } from "../../modules/math/vec.js";

class Explosion extends GameObject {
    static SPEED = 1;
    static SIZE = 32;
    animation;
    life = 0;
    constructor(position, animation) {
        super(
            "explosion",
            position,
            Explosion.SIZE,
            Explosion.SIZE,
            Explosion.SPEED
        );
        this.animation = animation;
        this.direction = Vec.LEFT;
    }

    update() {
        this.life++;
        if (this.life >= this.animation.duration && this.animation.loop)
            this.life = 0;
        if (this.life >= this.animation.duration) {
            this.remove = true;
        }
        const frameIndex = Math.floor(
            this.life /
                Math.floor(
                    this.animation.duration / this.animation.frames.length
                )
        );
        this.sprite = this.animation.frames[frameIndex];
        this.position.add(this.direction.mult(this.speed));
    }
}

export { Explosion };
