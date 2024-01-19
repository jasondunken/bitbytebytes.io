import { GameObject } from "../../modules/gameObject.js";
import { Collider } from "../../modules/collisions/collider.js";
import { Vec } from "../../modules/math/vec.js";

class Block extends GameObject {
    solid = true;
    sprite;
    animation;

    max_health = 120;
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
        if (blockType === "sand") this.max_health = 30;
        if (
            blockType === "dirt" ||
            blockType === "clay" ||
            blockType === "grass"
        )
            this.max_health = 60;
        if (blockType === "stone") this.max_health = 120;
        this.health = this.max_health;
    }

    update() {
        if (this.animation) {
            this.animation.update();
        }
    }

    takeDamage(dmg) {
        if (
            this.blockType == "grass" ||
            this.blockType == "sand" ||
            this.blockType == "clay" ||
            this.blockType == "dirt" ||
            this.blockType == "stone"
        ) {
            this.health -= dmg;
            if (this.health <= 0) {
                this.destroyed = true;
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
            }
        }
    }

    renderDebug() {
        if (this.sprite) {
            if (this.blockType) {
                this.collider.render("magenta", 3);
            }
            textSize(10);
            noStroke();
            fill("white");
            text(`${this.blockType}`, this.position.x, this.position.y + 12);
        } else {
            this.collider.render("green", 1);
        }
    }
}

class Ladder extends Block {
    constructor(position, sprite) {
        super(position, 32, 32, "ladder", sprite);
        this.solid = false;
    }
}

class Door extends Block {
    health = 500;

    open = false;
    locked = true;

    constructor(position, locked_sprite, unlocked_sprite) {
        super(position, 32, 32, "door", locked_sprite);
        this.unlocked_sprite = unlocked_sprite;
    }

    unlock() {
        this.solid = false;
        this.locked = false;
        this.sprite = this.unlocked_sprite;
    }

    render() {
        if (this.sprite) {
            image(
                this.sprite,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );
        }
    }
}

export { Block, Door, Ladder };
