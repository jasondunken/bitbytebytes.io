import { Resources } from "./resource-manager.js";
import { Entity } from "./game-object.js";

class AmmoCrate extends Entity {
    GRAVITY = 2;
    constructor(position) {
        super("ammo", position);
        this.sprite = Resources.getSprite("ammo-crate-500");
        this.width = this.sprite.width;
        this.height = this.sprite.height;
    }

    update(bounds, gameObjects) {
        this.checkGround(bounds);
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
