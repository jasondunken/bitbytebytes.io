class Player extends GameObject {
    width = 32;
    height = 32;
    grounded = false;
    speed = 2;
    blocks = [];

    MINING_TIME = 30;
    mining = 0;
    pickaxeStrength = 33;

    animations;
    currentAnimation = null;

    static STATE = {
        IDLE: "idle",
        WALKING: "walk",
        JUMPING: "jump",
        CLIMBING: "climb",
        ATTACKING: "attack",
        HURT: "hurt",
        DEAD: "dead",
    };

    collider = {
        a: { x: 0, y: 0 },
        b: { x: 0, y: 0 },
        c: { x: 0, y: 0 },
        d: { x: 0, y: 0 },
    };

    constructor(spriteSheets) {
        super("player");
        this.state = Player.STATE.IDLE;
        this.animations = {
            idle: new Animation(spriteSheets["idle"], 240, true),
            walk: new Animation(spriteSheets["walk"], 60, true),
        };
    }

    update(terrain) {
        // console.log("animation: ", this.currentAnimation);
        this.currentAnimation = this.animations[this.state];
        this.currentAnimation.update();
        if (this.mining) {
            this.mining--;
        }
        if (!this.grounded) {
            this.position.y += terrain.gravity;
        }
        this.getInput();

        // constrain x
        if (this.position.x < this.width / 2) this.setPosition({ x: this.width / 2, y: this.position.y });
        if (this.position.x > terrain.width - this.width / 2)
            this.setPosition({ x: terrain.width - this.width / 2, y: this.position.y });
        // constrain y
        if (this.position.y < this.height / 2) this.setPosition({ x: this.position.x, y: this.height / 2 });
        if (this.position.y > terrain.height - this.height / 2)
            this.setPosition({ x: this.position.x, y: terrain.height - this.height / 2 });

        // check blocks around player
        this.blocks = getAdjacentBlocks(this.position, terrain.blocks, terrain.BLOCK_SIZE);
        let block = this.blocks.above;
        if (block && block.solid) {
            if (this.position.y - this.height / 2 <= block.collider.d.y) {
                this.position.y = block.collider.d.y + this.height / 2;
            }
        }
        block = this.blocks.below;
        if (block && block.solid) {
            if (this.position.y + this.height / 2 >= block.collider.a.y) {
                this.position.y = block.collider.a.y - this.height / 2;
                this.grounded = true;
            }
        }
        if (
            block &&
            !block.solid &&
            this.position.x - (this.width / 2) * 0.8 > block.collider.a.x &&
            this.position.x + (this.width / 2) * 0.8 < block.collider.b.x
        ) {
            this.grounded = false;
        }
        block = this.blocks.left;
        if (block && block.solid) {
            if (this.position.x - this.width / 2 <= block.collider.b.x) {
                this.position.x = block.collider.b.x + this.width / 2;
            }
        }
        block = this.blocks.right;
        if (block && block.solid) {
            if (this.position.x + this.width / 2 >= block.collider.a.x) {
                this.position.x = block.collider.a.x - this.width / 2;
            }
        }

        this.updateCollider();
    }

    getInput() {
        if (keyIsDown(87)) this.climbUp();
        if (keyIsDown(83)) this.climbDown();
        if (keyIsDown(65)) this.moveLeft();
        if (keyIsDown(68)) this.moveRight();

        if (keyIsDown(32)) this.jump();

        if (keyIsDown(38)) this.dig("up");
        if (keyIsDown(40)) this.dig("down");
        if (keyIsDown(37)) this.dig("left");
        if (keyIsDown(39)) this.dig("right");
    }

    updateCollider() {
        this.collider = {
            a: { x: this.position.x - this.width / 2, y: this.position.y - this.height / 2 },
            b: { x: this.position.x + this.width / 2, y: this.position.y - this.height / 2 },
            c: { x: this.position.x + this.width / 2, y: this.position.y + this.height / 2 },
            d: { x: this.position.x - this.width / 2, y: this.position.y + this.height / 2 },
        };
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
        this.state = Player.STATE.WALKING;
    }
    moveRight() {
        this.position.x += this.speed;
        this.state = Player.STATE.WALKING;
    }
    jump() {
        if (this.grounded) {
            this.position.y -= 30;
            this.grounded = false;
        }
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
    }

    static loadSpriteSheets() {
        let spriteSheets = {};
        spriteSheets["idle"] = loadImage("./bug-dug/img/animations/big_mushroom_idle.png");
        spriteSheets["walk"] = loadImage("./bug-dug/img/animations/big_mushroom_walk.png");
        return spriteSheets;
    }
}

class DemoPlayer extends Player {
    constructor(spriteSheets) {
        super(spriteSheets);
    }
}
