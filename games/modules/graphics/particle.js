import { Vec } from "../math/vec.js";

export class Particle {
    constructor(position, direction, size) {
        this.position = position || new Vec();
        this.direction = direction || new Vec();
        this.size = size || 1;
    }

    update(delta) {
        delta = delta || 1;
        const step = this.direction.copy().mult(delta * 10);
        this.position.add(step);
    }
}
