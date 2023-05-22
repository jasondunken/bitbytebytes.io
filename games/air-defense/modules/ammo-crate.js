import { Entity } from "./game-object.js";

class AmmoCrate extends Entity {
    GRAVITY = 3;
    constructor(position, sprite) {
        super("ammo", position);
        this.sprite = sprite;
        this.width = sprite.width;
        this.height = sprite.height;
    }

    update() {
        if (!this.isOnGround) {
            this.position.y += this.GRAVITY;
        }
    }

    takeDamage(amount) {
        this.dead = true;
    }

    render() {
        image(
            this.sprite,
            this.position.x - this.width / 2,
            this.position.y - this.height / 2,
            this.width,
            this.height
        );
    }
}

export { AmmoCrate };
