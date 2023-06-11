import { GameObject } from "./gameObject.js";

import { Vec } from "../../modules/math/vec.js";

class Rocket extends GameObject {
    static SIZE = 32;
    static COLLIDER_SIZE = 24;
    static SPEED = 4;

    constructor(position, sprite) {
        super(
            "rocket",
            position,
            Rocket.SIZE,
            Rocket.COLLIDER_SIZE,
            Rocket.SPEED
        );
        this.direction = Vec.RIGHT;
        this.sprite = sprite;
    }

    update() {
        this.position.x += this.direction.x * this.speed;
        this.updateColliders();
    }
}

export { Rocket };
