import { GameObject } from "../../modules/gameObject.js";

class Ladder extends GameObject {
    constructor(position, sprite) {
        super("ladder", position);
        this.sprite = sprite;
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
