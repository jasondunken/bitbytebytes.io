import { Entity } from "./entity.js";
import { Animation } from "../../modules/graphics/animation.js";
import { ParticleEmitter } from "./particle.js";

class Enemy extends Entity {
    attackStrength = 33;

    constructor(position, spriteSheets) {
        super("enemy", position);
        this.state = Entity.STATE.IDLE;
        this.animations = {
            idle: new Animation(spriteSheets["idle"], 240, true),
            "walk-left": new Animation(spriteSheets["walk-left"], 60, true),
            "walk-right": new Animation(spriteSheets["walk-right"], 60, true),
        };
        this.currentAnimation = this.animations["idle"];
        this.currentAnimation.time =
            Math.random() * this.currentAnimation.duration;
    }

    static loadSpriteSheets() {
        let spriteSheets = {};
        spriteSheets["idle"] = loadImage(
            "./bug-dug/res/img/animations/big_mushroom_idle.png"
        );
        spriteSheets["walk-left"] = loadImage(
            "./bug-dug/res/img/animations/big_mushroom_walk_left.png"
        );
        spriteSheets["walk-right"] = loadImage(
            "./bug-dug/res/img/animations/big_mushroom_walk_right.png"
        );
        return spriteSheets;
    }
}

export { Enemy };
