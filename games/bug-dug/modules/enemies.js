import { Entity } from "./entity.js";
import { Animation } from "../../modules/graphics/animation.js";
import { ParticleEmitter } from "./particle.js";

class Enemy extends Entity {
    attackStrength = 33;
    followRangeY = 16;
    followRangeX = 128;
    followingPlayer = false;

    walkSpeed = 1.25;

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

    lookForPlayer(player) {
        if (
            Math.abs(this.position.y - player.position.y) <=
                this.followRangeY &&
            Math.abs(this.position.x - player.position.x) <= this.followRangeX
        ) {
            this.followingPlayer = true;
        } else {
            this.followingPlayer = false;
        }
    }

    followPlayer(playerPosition) {
        if (this.position.x > playerPosition.x) {
            this.state = Entity.STATE.WALKING_LEFT;
        }
        if (this.position.x < playerPosition.x) {
            this.state = Entity.STATE.WALKING_RIGHT;
        }
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
