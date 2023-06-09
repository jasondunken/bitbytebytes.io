import { GameObject } from "./game-object.js";

import { Vec } from "./math/vec.js";

class PixelExplosion extends GameObject {
    size = 4;
    pixelCount = 32;
    maxPixelLife = 60;
    pixels = new Set();
    constructor(position) {
        super("visual-effect");
        for (let i = 0; i < this.pixelCount; i++) {
            const pixel = new Vec(position);
            pixel.velocity = Vec.UnitRandom2d();
            pixel.life = Math.random() * this.maxPixelLife;

            this.pixels.add(pixel);
        }
    }

    update() {
        for (let pixel of this.pixels) {
            pixel.x += pixel.velocity.x;
            pixel.y += pixel.velocity.y;

            pixel.life--;
            if (pixel.life <= 0) {
                this.pixels.delete(pixel);
            }
        }
        if (this.pixels.size < 1) {
            this.remove = true;
        }
    }

    renders = 0;
    render() {
        this.renders++;
        for (let pixel of this.pixels) {
            let r = random(0, 255);
            let g = random(0, 255);
            let b = random(0, 255);
            let a = random(0, 255);
            stroke(r, g, b, a);
            strokeWeight(this.size);
            rect(pixel.x, pixel.y, this.size, this.size);
        }
    }
}

export { PixelExplosion };
