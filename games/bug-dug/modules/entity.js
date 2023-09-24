import { Collider } from "../../modules/collisions/collider.js";
import { LevelArchitect } from "./levelArchitect.js";
import { GameObject } from "../../modules/gameObject.js";

class Entity extends GameObject {
    width = 32;
    height = 32;
    grounded = false;
    speed = 1;

    state;
    animations;
    currentAnimation = null;
    particleEmitter = null;

    static STATE = Object.freeze({
        IDLE: "idle",
        WALKING_LEFT: "walk-left",
        WALKING_RIGHT: "walk-right",
        JUMPING: "jump",
        CLIMBING: "climb",
        ATTACKING: "attack",
        MINING: "mining",
        HURT: "hurt",
        DEAD: "dead",
    });

    constructor(type, position) {
        super(type, position);
        this.collider = new Collider(this.position, this.width, this.height);
    }

    update(dt) {
        this.currentAnimation = this.animations[this.state];
        if (this.state == Entity.STATE.WALKING_LEFT) {
            this.currentAnimation = this.animations["walk-left"];
        }
        if (this.state == Entity.STATE.WALKING_RIGHT) {
            this.currentAnimation = this.animations["walk-right"];
        }
        if (this.currentAnimation) {
            this.currentAnimation.update();
        }

        if (!this.grounded) {
            this.position.y = this.position.y + LevelArchitect.GRAVITY;
        }

        this.collider.update(this.position);
        if (this.particleEmitter) {
            if (
                this.state == Entity.STATE.WALKING_LEFT ||
                this.state == Entity.STATE.WALKING_RIGHT
            ) {
                this.particleEmitter.start();
            } else {
                this.particleEmitter.stop();
            }

            this.particleEmitter.update();
            this.particleEmitter.setPosition(this.position);
        }
    }

    render() {
        if (this.currentAnimation) {
            const sprite = this.currentAnimation.currentFrame;
            image(
                sprite,
                this.position.x - sprite.width / 2,
                this.position.y - sprite.height / 2,
                sprite.width,
                sprite.height
            );
        } else {
            fill("magenta");
            rect(this.collider.a.x, this.collider.a.y, this.width, this.height);
        }
        if (this.particleEmitter) {
            this.particleEmitter.render();
        }
    }

    renderDebug() {
        this.collider.render("blue", 5);
    }
}

export { Entity };
