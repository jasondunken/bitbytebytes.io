class Player extends GameObject {
    width = 24;
    height = 24;
    grounded = false;
    speed = 2;

    collider = {
        a: { x: 0, y: 0 },
        b: { x: 0, y: 0 },
        c: { x: 0, y: 0 },
        d: { x: 0, y: 0 },
    };

    constructor(sprite) {
        super("player");
        this.sprite = sprite;
    }

    update(terrain) {
        if (!this.grounded) {
            this.position.y += terrain.gravity;
        }
        if (keyIsDown(65)) this.position.x -= this.speed;
        if (keyIsDown(68)) this.position.x += this.speed;

        if (keyIsDown(87)) this.climbUp();
        if (keyIsDown(83)) this.climbDown();

        if (keyIsDown(32)) this.jump();

        if (keyIsDown(38)) this.digUp(this.getBlockAbove(terrain.blocks, terrain.BLOCK_SIZE));
        if (keyIsDown(40)) this.digDown(this.getBlockBelow(terrain.blocks, terrain.BLOCK_SIZE));
        if (keyIsDown(37)) this.digLeft(this.getBlockLeft(terrain.blocks, terrain.BLOCK_SIZE));
        if (keyIsDown(39)) this.digRight(this.getBlockRight(terrain.blocks, terrain.BLOCK_SIZE));

        // constrain x
        if (this.position.x < this.width / 2) this.setPosition({ x: this.width / 2, y: this.position.y });
        if (this.position.x > terrain.width - this.width / 2)
            this.setPosition({ x: terrain.width - this.width / 2, y: this.position.y });
        // constrain y
        if (this.position.y < this.height / 2) this.setPosition({ x: this.position.x, y: this.height / 2 });
        if (this.position.y > terrain.height - this.height / 2)
            this.setPosition({ x: this.position.x, y: terrain.height - this.height / 2 });

        // look for blocks around player, check if solid
        let block = this.getBlockBelow(terrain.blocks, terrain.BLOCK_SIZE);
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
        block = this.getBlockAbove(terrain.blocks, terrain.BLOCK_SIZE);
        if (block && block.solid) {
            if (this.position.y - this.height / 2 <= block.collider.d.y) {
                this.position.y = block.collider.d.y + this.height / 2;
            }
        }
        block = this.getBlockLeft(terrain.blocks, terrain.BLOCK_SIZE);
        if (block && block.solid) {
            if (this.position.x - this.width / 2 <= block.collider.b.x) {
                this.position.x = block.collider.b.x + this.width / 2;
            }
        }
        block = this.getBlockRight(terrain.blocks, terrain.BLOCK_SIZE);
        if (block && block.solid) {
            if (this.position.x + this.width / 2 >= block.collider.a.x) {
                this.position.x = block.collider.a.x - this.width / 2;
            }
        }

        this.updateCollider();
    }

    getBlockBelow(blocks, blockSize) {
        const index = getGridIndex(this.position, blockSize);
        if (index + 1 > blocks[index.x].length - 1) {
            return null;
        }
        return blocks[index.x][index.y + 1];
    }

    getBlockAbove(blocks, blockSize) {
        const index = getGridIndex(this.position, blockSize);
        if (index.y < 1) {
            return null;
        }
        return blocks[index.x][index.y - 1];
    }

    getBlockLeft(blocks, blockSize) {
        const index = getGridIndex(this.position, blockSize);
        if (index.x < 1) {
            return null;
        }
        return blocks[index.x - 1][index.y];
    }

    getBlockRight(blocks, blockSize) {
        const index = getGridIndex(this.position, blockSize);
        if (index.x + 1 > blocks.length - 1) {
            return null;
        }
        return blocks[index.x + 1][index.y];
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
    jump() {
        if (this.grounded) {
            console.log("jump");
            this.position.y -= 30;
            this.grounded = false;
        } else {
            console.log("can't jump!");
        }
    }
    digUp(block) {
        console.log("digUp");
        block.solid = false;
    }
    digDown(block) {
        console.log("digDown");
        block.solid = false;
    }
    digLeft(block) {
        console.log("digLeft");
        block.solid = false;
    }
    digRight(block) {
        console.log("digRight");
        block.solid = false;
    }

    render() {
        if (this.sprite) {
            image(this.sprite, this.position.x - this.width / 2, this.position.y - this.height / 2);
        } else {
            fill("magenta");
            rect(this.collider.a.x, this.collider.a.y, this.width, this.height);
        }
    }
}

class DemoPlayer extends Player {
    constructor(sprite) {
        super(sprite);
    }
}
