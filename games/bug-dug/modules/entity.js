import { Collider } from "../../modules/collisions/collider.js";
import { GameObject } from "../../modules/gameObject.js";

class Entity extends GameObject {
    width = 32;
    height = 32;
    grounded = false;
    speed = 1;

    state;
    animations;
    currentAnimation = null;
    walkDirection = "right";

    particleEmitter = null;

    constructor(type, position) {
        super(type, position);
        this.collider = new Collider(this.position, this.width, this.height);
    }

    update(dt) {
        this.currentAnimation = this.animations[this.state];
        this.currentAnimation.update();

        if (!this.grounded) {
            this.position.y = this.position.y + 3; // terrain.gravity;
        }

        this.collider.update(this.position);
        if (this.particleEmitter) {
            this.particleEmitter.update(this.position);
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
