import { Entity } from "./entity.js";
import { Animation } from "./animation.js";
import { ParticleEmitter } from "./particle.js";

class Enemy extends Entity {
    static STATE = {
        IDLE: "idle",
        WALKING: { LEFT: "walk-left", RIGHT: "walk-right" },
        JUMPING: "jump",
        CLIMBING: "climb",
        ATTACKING: "attack",
        MINING: "mining",
        HURT: "hurt",
        DEAD: "dead",
    };

    attackStrength = 33;

    constructor(position, spriteSheets) {
        super("enemy", position);
        this.state = Enemy.STATE.IDLE;
        this.animations = {
            idle: new Animation(spriteSheets["idle"], 240, true),
            "walk-left": new Animation(spriteSheets["walk-left"], 60, true),
            "walk-right": new Animation(spriteSheets["walk-right"], 60, true),
        };
        this.currentAnimation = this.animations["idle"];
        this.currentAnimation.time = Math.random() * this.currentAnimation.duration;
    }

    getInput() {
        // console.log("this: ", this);
    }

    static loadSpriteSheets() {
        let spriteSheets = {};
        spriteSheets["idle"] = loadImage("./bug-dug/res/img/animations/big_mushroom_idle.png");
        spriteSheets["walk-left"] = loadImage("./bug-dug/res/img/animations/big_mushroom_walk_left.png");
        spriteSheets["walk-right"] = loadImage("./bug-dug/res/img/animations/big_mushroom_walk_right.png");
        return spriteSheets;
    }
}

export { Enemy };
