import { GameObject } from "../../modules/gameObject.js";
import { Collider } from "../../modules/collisions/collider.js";

class Ladder extends GameObject {
    constructor(position, sprite) {
        super("ladder", position);
        this.sprite = sprite;
        this.collider = new Collider(position, 32, 32);
    }

    render() {
        if (this.sprite) {
            image(this.sprite, this.position.x, this.position.y, 32, 32);
        } else {
            noStroke();
            fill("magenta");
            rect(this.position.x, this.position.y, 32, 32);
        }
    }
}

export { Ladder };
