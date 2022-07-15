class Player extends Entity {
    static STATE = {
        IDLE: "idle",
        WALKING: { LEFT: "walk-left", RIGHT: "walk-right" },
        JUMPING: "jump",
        CLIMBING: "climb",
        ATTACKING: "attack",
        MINING: "mining",
        HURT: "hurt",
        DEAD: "dead",
    };

    MINING_TIME = 30;
    mining = 0;
    pickaxeStrength = 33;

    constructor(spriteSheets) {
        super("player");
        this.state = Player.STATE.IDLE;
        this.animations = {
            idle: new Animation(spriteSheets["idle"], 240, true),
            "walk-left": new Animation(spriteSheets["walk-left"], 60, true),
            "walk-right": new Animation(spriteSheets["walk-right"], 60, true),
        };
    }

    getInput(terrain) {
        if (this.mining) this.mining--;
        if (getBlockAtPosition(this.position, terrain.blocks, terrain.BLOCK_SIZE).destroyed) {
            if (keyIsDown(87)) this.climbUp();
        }
        if (keyIsDown(83)) this.climbDown();
        if (keyIsDown(65)) this.moveLeft();
        if (keyIsDown(68)) this.moveRight();

        if (!keyIsDown(87) && !keyIsDown(83) && !keyIsDown(65) && !keyIsDown(68) && !keyIsDown(32) && !this.mining) {
            this.state = Player.STATE.IDLE;
        }

        if (keyIsDown(38)) this.dig("up");
        if (keyIsDown(40)) this.dig("down");
        if (keyIsDown(37)) this.dig("left");
        if (keyIsDown(39)) this.dig("right");
    }

    climbUp() {
        console.log("climbUp");
        this.position.y -= 4;
        this.grounded = false;
    }
    climbDown() {
        console.log("climbDown");
        this.position.y += 2;
        this.grounded = false;
    }
    moveLeft() {
        this.position.x -= this.speed;
        this.state = Player.STATE.WALKING.LEFT;
    }
    moveRight() {
        this.position.x += this.speed;
        this.state = Player.STATE.WALKING.RIGHT;
    }
    dig(direction) {
        if (!this.mining) {
            this.mining = this.MINING_TIME;
            switch (direction) {
                case "up":
                    this.blocks.above.takeDamage(this.pickaxeStrength);
                    break;
                case "down":
                    this.blocks.below.takeDamage(this.pickaxeStrength);
                    break;
                case "left":
                    this.blocks.left.takeDamage(this.pickaxeStrength);
                    break;
                case "right":
                    this.blocks.right.takeDamage(this.pickaxeStrength);
                    break;
            }
        }
    }

    static loadSpriteSheets() {
        let spriteSheets = {};
        spriteSheets["idle"] = loadImage("./bug-dug/img/animations/big_mushroom_idle.png");
        spriteSheets["walk-left"] = loadImage("./bug-dug/img/animations/big_mushroom_walk_left.png");
        spriteSheets["walk-right"] = loadImage("./bug-dug/img/animations/big_mushroom_walk_right.png");
        return spriteSheets;
    }
}

class DemoPlayer extends Player {
    constructor(spriteSheets) {
        super(spriteSheets);
    }
}
