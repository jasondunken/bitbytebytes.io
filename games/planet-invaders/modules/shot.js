import { GameObject } from "./game-object.js";

class Shot extends GameObject {
    static WIDTH = 4;
    static LENGTH = 8;
    MOVE_SPEED = 3;
    constructor(position, direction) {
        super("shot", position, Shot.LENGTH);
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
        line(
            this.position.x,
            this.position.y,
            this.position.x,
            this.position.y + this.size
        );
    }
}

export { Shot };
