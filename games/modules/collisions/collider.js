import { Vec } from "../math/vec.js";

export class Collider {
    a = new Vec();
    b = new Vec();
    c = new Vec();
    d = new Vec();
    constructor(position, width, height) {
        this.position = position || new Vec();
        this.width = width || 1;
        this.height = height || 1;
        this.updateBounds();
    }

    update(position) {
        this.position.set(position);
        this.updateBounds();
    }

    updateBounds() {
        this.a.set(
            this.position.x - this.width / 2,
            this.position.y - this.height / 2
        );
        this.b.set(
            this.position.x + this.width / 2,
            this.position.y - this.height / 2
        );
        this.c.set(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        );
        this.d.set(
            this.position.x - this.width / 2,
            this.position.y + this.height / 2
        );
    }

    render(color, strokeW) {
        color = color || "red";
        strokeW = strokeW || 1;
        fill("magenta");
        stroke(color);
        strokeWeight(strokeW);
        noFill();
        line(this.a.x, this.a.y, this.b.x, this.b.y);
        line(this.b.x, this.b.y, this.c.x, this.c.y);
        line(this.c.x, this.c.y, this.d.x, this.d.y);
        line(this.d.x, this.d.y, this.a.x, this.a.y);
    }
}
