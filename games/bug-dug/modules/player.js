import { Entity } from "./entity.js";
import { Animation } from "../../modules/graphics/animation.js";
import { ParticleEmitter } from "./particle.js";
import { Vec } from "../../modules/math/vec.js";

class Player extends Entity {
    WALK_SPEED = 1.5;
    CLIMB_SPEED = 2;
    MINING_TIME = 30;
    mining = 0;
    pickaxeStrength = 5;

    particleEmitterOffset = new Vec(0, 16);

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
            Vec.add2(this.position, this.particleEmitterOffset),
            10,
            10,
            ParticleEmitter.RadialBurst
        );
    }

    getInput() {
        if (keyIsDown(87)) this.climbUp();
        if (keyIsDown(83)) this.climbDown();
        if (keyIsDown(65)) this.moveLeft();
        if (keyIsDown(68)) this.moveRight();

        if (keyIsDown(38)) this.dig("up");
        if (keyIsDown(40)) this.dig("down");
        if (keyIsDown(37)) this.dig("left");
        if (keyIsDown(39)) this.dig("right");

        if (
            this.state != Entity.STATE.WALKING_LEFT &&
            this.state != Entity.STATE.WALKING_RIGHT &&
            this.state != Entity.STATE.MINING
        ) {
            this.state = Entity.STATE.IDLE;
        }
    }

    climbUp() {
        const block = this.world.getBlock(this.position);
        if (block.type === "ladder") {
            this.onLadder = true;
            this.position.y -= this.CLIMB_SPEED;
            this.grounded = false;
        }
    }

    climbDown() {
        const block = this.world.getBlockBelow(this.position);
        if (block.type === "ladder") {
            this.onLadder = true;
            this.position.y += this.CLIMB_SPEED;
            this.grounded = false;
        }
    }

    moveLeft() {
        this.position.x -= this.WALK_SPEED;
        this.state = Entity.STATE.WALKING_LEFT;
    }

    moveRight() {
        this.position.x += this.WALK_SPEED;
        this.state = Entity.STATE.WALKING_RIGHT;
    }

    dig(direction) {
        if (this.state != Entity.STATE.MINING) {
            this.mining = this.MINING_TIME;
            this.state = Entity.STATE.MINING;
            this.currentAnimation = this.animations["mining"];
        }
        if (this.state === Entity.STATE.MINING) {
            const blocks = this.world.getBlocks(this.position);
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
            if (block && block.solid) {
                this.mining--;
                block.takeDamage(this.pickaxeStrength);
                console.log("block.health: ", block.health);
            }

            if (this.mining <= 0) {
                this.state = Entity.STATE.IDLE;
            }
        }
    }

    render() {
        if (this.particleEmitter) {
            this.particleEmitter.render();
        }
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
