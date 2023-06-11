import { GameObject } from "./game-object.js";

import { Vec } from "../../modules/math/vec.js";

class PixelExplosionSmall extends GameObject {
    size = 1;
    pixelCount = 64;
    maxPixelLife = 30;
    pixels = new Set();
    constructor(position) {
        super("visual-effect");
        for (let i = 0; i < this.pixelCount; i++) {
            const pixel = new Vec(position);
            pixel.velocity = Vec.UnitRandom2d().mult(Math.random() * 2);
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

    render() {
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

class PixelExplosionLarge extends GameObject {
    size = 2;
    pixelCount = 128;
    maxPixelLife = 30;
    pixels = new Set();
    constructor(position) {
        super("visual-effect");
        for (let i = 0; i < this.pixelCount; i++) {
            const pixel = new Vec(position);
            pixel.velocity = Vec.UnitRandom2d().mult(Math.random() * 2);
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

    render() {
        for (let pixel of this.pixels) {
            let r = random(0, 255);
            let g = random(0, 255);
            let b = random(0, 255);
            stroke(r, g, b, 255);
            strokeWeight(this.size);
            rect(pixel.x, pixel.y, this.size, this.size);
        }
    }
}

export { PixelExplosionSmall, PixelExplosionLarge };
