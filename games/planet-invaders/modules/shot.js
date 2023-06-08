import { GameObject } from "./game-object.js";

import { Vec } from "./math/vec.js";

class Shot extends GameObject {
    static WIDTH = 4;
    static LENGTH = 8;
    MOVE_SPEED = 3;
    constructor(position, direction) {
        super("shot", position, Shot.WIDTH, Shot.WIDTH);
        this.direction = direction;
    }

    update() {
        this.position.y += this.MOVE_SPEED * this.direction.y;
    }

    render() {
        let r = random(0, 255);
        let g = random(0, 255);
        let b = random(0, 255);
        let a = random(0, 255);
        stroke(r, g, b, a);
        strokeWeight(Shot.WIDTH);
        noFill();
        line(
            this.position.x,
            this.position.y,
            this.position.x,
            this.position.y + Shot.LENGTH
        );

        noStroke();
        if (this.direction === Vec.UP) {
            fill("yellow");
            ellipse(this.position.x, this.position.y, this.size, this.size);
        } else {
            fill("red");
            ellipse(
                this.position.x,
                this.position.y + Shot.LENGTH,
                this.size,
                this.size
            );
        }
    }
}

export { Shot };
