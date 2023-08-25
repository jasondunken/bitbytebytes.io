import { Entity } from "./entity.js";
import { Animation } from "../../modules/graphics/animation.js";
import { ParticleEmitter } from "./particle.js";
import { Vec } from "../../modules/math/vec.js";

class Player extends Entity {
    MINING_TIME = 30;
    mining = 0;
    pickaxeStrength = 33;

    hasKey = false;

    constructor(world, spriteSheets) {
        super("player");
        this.world = world;
        this.state = Player.STATE.IDLE;
        this.animations = {
            idle: new Animation(spriteSheets["idle"], 240, true),
            "walk-left": new Animation(spriteSheets["walk-left"], 60, true),
            "walk-right": new Animation(spriteSheets["walk-right"], 60, true),
            mining: new Animation(spriteSheets["mining"], 60, true),
        };
        this.currentAnimation = this.animations["idle"];

        this.particleEmitter = new ParticleEmitter(
            new Vec(this.position.x, this.position.y + 16),
            10,
            10,
            ParticleEmitter.RadialBurst
        );
    }

    getInput() {
        if (this.mining) this.mining--;

        if (keyIsDown(87)) this.climbUp();
        if (keyIsDown(83)) this.climbDown();
        if (keyIsDown(65)) this.moveLeft();
        if (keyIsDown(68)) this.moveRight();

        if (
            !keyIsDown(87) &&
            !keyIsDown(83) &&
            !keyIsDown(65) &&
            !keyIsDown(68) &&
            !keyIsDown(32) &&
            !this.mining
        ) {
            this.state = Entity.STATE.IDLE;
        }

        if (keyIsDown(38)) this.dig("up");
        if (keyIsDown(40)) this.dig("down");
        if (keyIsDown(37)) this.dig("left");
        if (keyIsDown(39)) this.dig("right");
    }

    climbUp() {
        const block = this.world.getBlock(this.position);
        if (block.type === "ladder") {
            this.onLadder = true;
            this.position.y -= 4;
            this.grounded = false;
        }
    }

    climbDown() {
        const block = this.world.getBlockBelow(this.position);
        if (block.type === "ladder") {
            this.onLadder = true;
            this.position.y += 2;
            this.grounded = false;
        }
    }

    moveLeft() {
        this.position.x -= this.speed;
        this.state = Entity.STATE.WALKING_LEFT;
    }

    moveRight() {
        this.position.x += this.speed;
        this.state = Entity.STATE.WALKING_RIGHT;
    }

    dig(direction) {
        const blocks = this.world.getBlocks(this.position);
        if (!this.mining) {
            this.mining = this.MINING_TIME;
            this.state = Entity.STATE.MINING;
            let block = null;
            switch (direction) {
                case "up":
                    block = blocks.above;
                    break;
                case "down":
                    block = blocks.below;
                    break;
                case "left":
                    block = blocks.left;
                    break;
                case "right":
                    block = blocks.right;
                    break;
            }
            if (block) {
                block.takeDamage(this.pickaxeStrength);
            }
        }
    }

    render() {
        if (this.currentAnimation) {
            this.currentAnimation.update();
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

    updateParticleEmitter() {
        const emitterPos = new Vec(
            this.position.x,
            this.position.y + this.height / 2
        );
        this.particleEmitter.setPosition(emitterPos);
        if (
            this.state !== Entity.STATE.WALKING_LEFT &&
            this.state !== Entity.STATE.WALKING_RIGHT
        ) {
            this.particleEmitter.stop();
        } else {
            this.particleEmitter.start();
        }
        this.particleEmitter.update();
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
        spriteSheets["mining"] = loadImage(
            "./bug-dug/res/img/animations/big_mushroom_idle.png"
        );
        return spriteSheets;
    }
}

class DemoPlayer extends Player {
    constructor(world, spriteSheets) {
        super(world, spriteSheets);
    }
}

export { Player, DemoPlayer };
