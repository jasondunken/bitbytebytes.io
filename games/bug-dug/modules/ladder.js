import { GameObject } from "../../modules/gameObject.js";
import { Collider } from "../../modules/collisions/collider.js";
import { Vec } from "../../modules/math/vec.js";

class Ladder extends GameObject {
    solid = true;
    sprite;
    animation;

    MAX_HEALTH = 120;
    health;
    destroyed = false;
    constructor(position, sprite) {
        super("ladder", position);
        this.sprite = sprite;
        const colliderPos = new Vec(
            position.x + width / 2,
            position.y + height / 2
        );
        this.collider = new Collider(colliderPos, 32, 32);
        this.health = this.MAX_HEALTH;
    }

    takeDamage(dmg) {}

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
