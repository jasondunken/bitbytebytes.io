import { Vec } from "../math/vec.js";

export class Particle {
    constructor(position, direction, life, size) {
        this.position = position || new Vec();
        this.direction = direction || new Vec();
        this.life = life || 1;
        this.size = size || 8;
        this.alphaRate = Math.random() * 0.25 + 0.5;
    }
}
