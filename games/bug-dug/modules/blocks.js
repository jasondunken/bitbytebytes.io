import { GameObject } from "../../modules/gameObject.js";
import { LevelArchitect } from "./levelArchitect.js";
import { Collider } from "../../modules/collisions/collider.js";
import { Vec } from "../../modules/math/vec.js";

class Block extends GameObject {
    solid = true;
    sprite;
    animation;

    MAX_HEALTH = 120;
    health;
    destroyed = false;
    constructor(position, width, height, blockType, sprite) {
        super("block", position);
        this.width = width;
        this.height = height;
        this.blockType = blockType;
        this.sprite = sprite;
        const colliderPos = new Vec(
            position.x + width / 2,
            position.y + height / 2
        );
        this.collider = new Collider(colliderPos, this.width, this.height);

        if (blockType === "air" || blockType === "water") {
            this.solid = false;
        }
        if (blockType === "sand" || blockType === "grass") this.MAX_HEALTH = 50;
        if (blockType === "dirt" || blockType === "clay") this.MAX_HEALTH = 75;
        if (blockType === "stone") this.MAX_HEALTH = 120;
        this.health = this.MAX_HEALTH;
    }

    update() {
        if (this.animation) {
            this.animation.update();
        }
    }

    takeDamage(dmg) {
        if (
            this.blockType !== "bedrock" &&
            this.blockType !== "air" &&
            this.blockType !== "exit" &&
            this.blockType !== "none"
        ) {
            this.health -= dmg;
            if (this.health <= 0) {
                this.destroyed = true;
                this.solid = false;
            }
        }
    }

    render() {
        if (!this.destroyed) {
            if (this.sprite) {
                image(
                    this.sprite,
                    this.position.x,
                    this.position.y,
                    this.width,
                    this.height
                );
                this.collider.render("magenta");
            } else {
                fill(LevelArchitect.getColor(this.blockType));
                rect(this.position.x, this.position.y, this.width, this.height);
                this.collider.render();
            }
        }
    }
}

export { Block };
