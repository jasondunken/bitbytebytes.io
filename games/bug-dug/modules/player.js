import { Entity } from "./entity.js";
import { Collider } from "../../modules/collisions/collider.js";
import { Animation } from "../../modules/graphics/animation.js";
import { ParticleEmitter } from "./particle.js";
import { Vec } from "../../modules/math/vec.js";

class Player extends Entity {
    WALK_SPEED = 1.5;
    CLIMB_SPEED = 2;
    MINING_TIME = 60;
    mining = 0;
    pickaxeStrength = 30;
    canDamageBlock = false;

    // relative to player position
    particleEmitterOffset = new Vec(0, 16);
    numParticles = 10;
    particleLoopInterval = 10;
    colliderPosition = new Vec(0, 8);
    colliderWith = 16;
    colliderHeight = 16;

    hasKey = false;

    static STATE = Object.freeze({
        IDLE: "idle",
        WALKING_LEFT: "walk-left",
        WALKING_RIGHT: "walk-right",
        JUMPING: "jump",
        CLIMBING: "climb",
        ATTACKING: "attack",
        MINING_LEFT: "mine-left",
        MINING_RIGHT: "mine-right",
        MINING_DOWN: "mine-down",
        HURT: "hurt",
        DEAD: "dead",
    });

    constructor(world, spriteSheets) {
        super("player");
        this.world = world;
        this.state = Player.STATE.IDLE;
        this.animations = {
            idle: new Animation(spriteSheets["idle"], 240, true),
            "walk-left": new Animation(spriteSheets["walk-left"], 60, true),
            "walk-right": new Animation(spriteSheets["walk-right"], 60, true),
            climb: new Animation(spriteSheets["climb"], 60, true),
            "mine-down": new Animation(spriteSheets["mine_down"], 60, true),
            "mine-left": new Animation(spriteSheets["mine_left"], 60, true),
            "mine-right": new Animation(spriteSheets["mine_right"], 60, true),
            dead: new Animation(spriteSheets["dead"], 20, false),
        };
        this.currentAnimation = this.animations["idle"];

        this.particleEmitter = new ParticleEmitter(
            Vec.add2(this.position, this.particleEmitterOffset),
            this.numParticles,
            this.particleLoopInterval,
            ParticleEmitter.RadialBurst
        );

        this.collider = new Collider(
            Vec.add2(this.position, this.colliderPosition),
            this.colliderWidth,
            this.colliderHeight
        );
    }

    update(dt) {
        this.getInput();

        this.currentAnimation = this.animations[this.state];

        if (this.currentAnimation) {
            this.currentAnimation.update();
        }

        if (!this.grounded) {
            this.position.y = this.position.y + 3; // terrain.gravity;
        }

        this.collider.update(Vec.add2(this.position, this.colliderPosition));
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

    getInput() {
        const inputList = [
            keyIsDown(87),
            keyIsDown(83),
            keyIsDown(65),
            keyIsDown(68),
            keyIsDown(38),
            keyIsDown(40),
            keyIsDown(37),
            keyIsDown(39),
        ];

        inputList[0] && this.inputFunctions[0](this);
        inputList[1] && this.inputFunctions[1](this);
        inputList[2] && this.inputFunctions[2](this);
        inputList[3] && this.inputFunctions[3](this);
        inputList[4] && this.inputFunctions[4](this);
        inputList[5] && this.inputFunctions[5](this);
        inputList[6] && this.inputFunctions[6](this);
        inputList[7] && this.inputFunctions[7](this);

        !inputList[0] &&
            !inputList[1] &&
            !inputList[2] &&
            !inputList[3] &&
            !inputList[4] &&
            !inputList[5] &&
            !inputList[6] &&
            !inputList[7] &&
            (this.state = Entity.STATE.IDLE);
    }

    inputFunctions = [
        this.climbUp,
        this.climbDown,
        this.moveLeft,
        this.moveRight,

        this.digUp,
        this.digDown,
        this.digLeft,
        this.digRight,
    ];

    climbUp(player) {
        const block = player.world.getBlock(player.position);
        if (block.blockType === "ladder") {
            player.onLadder = true;
            player.position.y -= player.CLIMB_SPEED;
            player.grounded = false;
        }
    }

    climbDown(player) {
        const block = player.world.getBlockBelow(player.position);
        console.log("block: ", block);
        if (block.blockType === "ladder") {
            player.onLadder = true;
            player.position.y += player.CLIMB_SPEED;
            player.grounded = false;
        }
    }

    moveLeft(player) {
        player.position.x -= player.WALK_SPEED;
        player.state = Entity.STATE.WALKING_LEFT;
    }

    moveRight(player) {
        player.position.x += player.WALK_SPEED;
        player.state = Entity.STATE.WALKING_RIGHT;
    }

    digUp(player) {
        player.dig("up");
    }
    digDown(player) {
        player.dig("down");
    }
    digRight(player) {
        player.dig("right");
    }
    digLeft(player) {
        player.dig("left");
    }

    dig(direction) {
        if (this.mining <= 0) {
            this.mining = this.MINING_TIME;
            this.canDamageBlock = true;
        }

        if (this.mining > 0) {
            this.mining--;
            const blocks = this.world.getBlocks(this.position);
            let block = null;
            switch (direction) {
                case "up":
                    block = blocks.above;
                    // probably not going to alow mining up but this is here for now
                    this.state = Player.STATE.MINING_DOWN;
                    break;
                case "down":
                    block = blocks.below;
                    this.state = Player.STATE.MINING_DOWN;
                    break;
                case "left":
                    block = blocks.left;
                    this.state = Player.STATE.MINING_LEFT;
                    break;
                case "right":
                    block = blocks.right;
                    this.state = Player.STATE.MINING_RIGHT;
                    break;
            }
            if (block && block.solid && this.canDamageBlock) {
                block.takeDamage(this.pickaxeStrength);
                this.canDamageBlock = false;
            }

            if (this.mining <= 0) {
                this.state = Player.STATE.IDLE;
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
            "./bug-dug/res/img/animations/player_idle.png"
        );
        spriteSheets["walk-left"] = loadImage(
            "./bug-dug/res/img/animations/player_walk_left.png"
        );
        spriteSheets["walk-right"] = loadImage(
            "./bug-dug/res/img/animations/player_walk_right.png"
        );
        spriteSheets["climb"] = loadImage(
            "./bug-dug/res/img/animations/player_climb.png"
        );
        spriteSheets["mine_down"] = loadImage(
            "./bug-dug/res/img/animations/player_pick_down.png"
        );
        spriteSheets["mine_left"] = loadImage(
            "./bug-dug/res/img/animations/player_pick_left.png"
        );
        spriteSheets["mine_right"] = loadImage(
            "./bug-dug/res/img/animations/player_pick_right.png"
        );
        spriteSheets["dead"] = loadImage(
            "./bug-dug/res/img/animations/player_dead.png"
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
