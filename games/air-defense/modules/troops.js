import { Entity } from "./game-object.js";
import { Animation } from "./animation.js";
import { Splatter, Explosion } from "./particles.js";

import { Resources } from "./resource-manager.js";

import { isParatrooperBlockCollision } from "./utils.js";
import { Vec } from "../../modules/math/vec.js";

class Paratrooper extends Entity {
    static WIDTH = 16;
    static HEIGHT = 16;

    FALLING_SPEED = 3;
    MOVE_SPEED = 0.25;

    DAMAGE = 50;

    CHUTE_OPEN_DELAY = 16;
    parachute;

    MAX_HEALTH = 10;
    health;

    constructor(position, target) {
        super("paratrooper", position, Paratrooper.WIDTH, Paratrooper.HEIGHT);
        this.animations = new Map();
        this.createSprites(Resources.getSprite("paratrooper"));

        this.target = target;
        const direction = this.target.x - this.position.x > 0 ? 0.01 : -0.01;
        this.direction = new Vec(direction, this.FALLING_SPEED);
        this.chuteOpenTimer = this.CHUTE_OPEN_DELAY;
        this.chuteOpen = false;
        this.health = this.MAX_HEALTH;
    }

    update(bounds, gameObjects) {
        this.checkGround(bounds);
        if (this.isOnGround) {
            if (this.currentAnimation === this.animations.get("parachuting")) {
                this.direction.y = 0;
                this.chuteOpen = false;
                if (this.direction.x < 0) {
                    this.direction.x = -this.MOVE_SPEED;
                    this.currentAnimation = this.animations.get("walk-left");
                }
                if (this.direction.x > 0) {
                    this.direction.x = this.MOVE_SPEED;
                    this.currentAnimation = this.animations.get("walk-right");
                }
            }
            gameObjects.turretBlocks.forEach((block) => {
                if (isParatrooperBlockCollision(this, block)) {
                    this.dead = true;
                    gameObjects.visualEffects.add(
                        new Explosion(this.position, this.direction)
                    );
                    gameObjects.visualEffects.add(
                        new Splatter(this.position, this.direction)
                    );
                    block.takeDamage(this.DAMAGE);
                }
            });
            gameObjects.crates.forEach((crate) => {
                if (isParatrooperBlockCollision(this, crate)) {
                    this.dead = true;
                    gameObjects.visualEffects.add(
                        new Explosion(this.position, this.direction)
                    );
                    gameObjects.visualEffects.add(
                        new Splatter(this.position, this.direction)
                    );
                    crate.takeDamage(this.DAMAGE);
                }
            });
        } else {
            this.chuteOpenTimer--;
            if (this.chuteOpenTimer <= 0 && !this.chuteOpen) {
                this.direction.y = this.FALLING_SPEED / 5;
                this.chuteOpen = true;
            }
        }
        this.position.add(this.direction);
        this.currentAnimation.update();
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) this.dead = true;
    }

    render() {
        image(
            this.currentAnimation.currentFrame,
            this.position.x - this.width / 2,
            this.position.y - this.height / 2,
            this.width,
            this.height
        );
        if (this.chuteOpen) {
            image(
                this.parachute,
                this.position.x - this.width / 2,
                this.position.y - 24,
                this.width,
                this.height
            );
        }
    }

    createSprites(spriteSheet) {
        const cellHeight = spriteSheet.height;
        const cells = spriteSheet.width / cellHeight;
        const cellWidth = spriteSheet.width / cells;

        const walkingLeftCells = createImage(cellWidth * 4, cellHeight);
        walkingLeftCells.copy(
            spriteSheet,
            0,
            0,
            cellWidth * 4,
            cellHeight,
            0,
            0,
            cellWidth * 4,
            cellHeight
        );
        this.animations.set(
            "walk-left",
            new Animation(walkingLeftCells, 30, true)
        );
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
        this.animations.set(
            "walk-right",
            new Animation(walkingRightCells, 30, true)
        );

        const parachuteCells = createImage(cellWidth, cellHeight);
        parachuteCells.copy(
            spriteSheet,
            cellWidth * 10,
            0,
            cellWidth,
            cellHeight,
            0,
            0,
            cellWidth,
            cellHeight
        );
        this.parachute = parachuteCells;
        const parachutingCells = createImage(cellWidth, cellHeight);
        parachutingCells.copy(
            spriteSheet,
            cellWidth * 5,
            0,
            cellWidth,
            cellHeight,
            0,
            0,
            cellWidth,
            cellHeight
        );
        this.animations.set(
            "parachuting",
            new Animation(parachutingCells, 60, true)
        );

        this.currentAnimation = this.animations.get("parachuting");
    }
}

export { Paratrooper };
