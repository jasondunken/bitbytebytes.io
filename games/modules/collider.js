import { Vec } from "./math/vec.js";

export class Collider {
    a = new Vec();
    b = new Vec();
    c = new Vec();
    d = new Vec();
    constructor(position, size) {
        this.position = position || new Vec();
        this.size = size || 1;
        this.updateBounds();
    }

    update(position) {
        this.position = position;
        this.updateBounds();
    }

    updateBounds() {
        this.a.set(
            this.position.x - this.size / 2,
            this.position.y - this.size / 2
        );
        this.b.set(
            this.position.x + this.size / 2,
            this.position.y - this.size / 2
        );
        this.c.set(
            this.position.x + this.size / 2,
            this.position.y + this.size / 2
        );
        this.d.set(
            this.position.x - this.size / 2,
            this.position.y + this.size / 2
        );
    }
}
