import { Vec } from "../../modules/math/vec.js";

class GameObject {
    type;
    position;
    size;
    speed;
    remove;

    colliders = [new Vec()];

    constructor(type, position, size, colliderSize, speed) {
        this.type = type;
        this.position = position;
        this.size = size;
        this.colliderSize = colliderSize;
        this.speed = speed;
        this.remove = false;
        this.updateColliders();
    }

    update() {}
    draw() {
        image(
            this.sprite,
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );
    }

    updateColliders() {
        this.colliders[0] = this.position.copy();
    }
}

export { GameObject };
