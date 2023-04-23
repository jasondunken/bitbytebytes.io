import { GameObject } from "./gameObject.js";

class Rocket extends GameObject {
    constructor(initialPos, speed, size, imageRocket) {
        super("rocket", initialPos, speed, size);
        this.imageRocket = imageRocket;
    }

    update() {
        this.pathPos.x += this.speed;
        this.delta += this.speed / 60.0;
        this.currentPos = {
            x: this.pathPos.x,
            y: this.pathPos.y,
        };
        this.setCorners();
    }

    draw() {
        image(this.imageRocket, this.corners.a.x, this.corners.a.y, this.size, this.size);
    }
}

export { Rocket };
