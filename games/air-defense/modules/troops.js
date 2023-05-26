import { Entity } from "./game-object.js";
import { Animation } from "./animation.js";

import { Resources } from "./resource-manager.js";

class Paratrooper extends Entity {
    SIZE = 16;
    FALLING_SPEED = 3;
    MOVE_SPEED = 0.25;

    animations = null;
    parachute = null;
    parachuting = null;
    CHUTE_OPEN_DELAY = 40;
    chuteOpenHeight;
    chuteOpen = false;

    MAX_HEALTH = 10;
    health;

    constructor(position) {
        super("paratrooper", position);
        this.animations = new Map();
        this.createSprites(Resources.getSprite("paratrooper"));
        this.chuteOpenHeight = position.y + this.CHUTE_OPEN_DELAY;
        this.health = this.MAX_HEALTH;
    }

    update() {
        if (!this.isOnGround) {
            this.position.y += this.FALLING_SPEED;
            if (this.position.y > this.chuteOpenHeight && !this.chuteOpen) {
                this.FALLING_SPEED = this.FALLING_SPEED / 5;
                this.chuteOpen = true;
            }
        } else {
            if (this.currentAnimation === this.animations.get("parachuting")) {
                this.parachute = false;
                if (this.position.z < 0) {
                    this.currentAnimation = this.animations.get("walk-left");
                }
                if (this.position.z > 0) {
                    this.currentAnimation = this.animations.get("walk-right");
                }
            }
            this.position.x += this.MOVE_SPEED * this.position.z;
        }
        if (!this.animations) {
            this.animations = new Map();
            this.createSprites();
        }
        this.currentAnimation.update();
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) this.dead = true;
    }

    render() {
        image(
            this.currentAnimation.currentFrame,
            this.position.x - this.SIZE / 2,
            this.position.y - this.SIZE / 2,
            this.SIZE,
            this.SIZE
        );
        if (this.parachute && this.position.y > this.chuteOpenHeight) {
            image(this.parachute, this.position.x - this.SIZE / 2, this.position.y - 24, this.SIZE, this.SIZE);
        }
    }

    createSprites(spriteSheet) {
        const cellHeight = spriteSheet.height;
        const cells = spriteSheet.width / cellHeight;
        const cellWidth = spriteSheet.width / cells;

        const walkingLeftCells = createImage(cellWidth * 4, cellHeight);
        walkingLeftCells.copy(spriteSheet, 0, 0, cellWidth * 4, cellHeight, 0, 0, cellWidth * 4, cellHeight);
        this.animations.set("walk-left", new Animation(walkingLeftCells, 30, true));
        const walkingRightCells = createImage(cellWidth * 4, cellHeight);
        walkingRightCells.copy(
            spriteSheet,
            cellWidth * 6,
            0,
            cellWidth * 4,
            cellHeight,
            0,
            0,
            cellWidth * 4,
            cellHeight
        );
        this.animations.set("walk-right", new Animation(walkingRightCells, 30, true));

        const parachuteCells = createImage(cellWidth, cellHeight);
        parachuteCells.copy(spriteSheet, cellWidth * 10, 0, cellWidth, cellHeight, 0, 0, cellWidth, cellHeight);
        this.parachute = parachuteCells;
        const parachutingCells = createImage(cellWidth, cellHeight);
        parachutingCells.copy(spriteSheet, cellWidth * 5, 0, cellWidth, cellHeight, 0, 0, cellWidth, cellHeight);
        this.animations.set("parachuting", new Animation(parachutingCells, 60, true));

        this.currentAnimation = this.animations.get("parachuting");
    }
}

export { Paratrooper };
