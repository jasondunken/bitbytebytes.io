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

        // if (keyIsDown(87)) this.climb();
        if (keyIsDown(87)) this.position.y -= 2;
        if (keyIsDown(83)) this.position.y += 2;

        if (keyIsDown(32)) this.jump();

        if (keyIsDown(38)) this.digUp();
        if (keyIsDown(39)) this.digRight();
        if (keyIsDown(40)) this.digDown();
        if (keyIsDown(37)) this.digLeft();

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

        this.updateCollider();
    }

    getBlockBelow(blocks, blockSize) {
        const index = getGridIndex(this.position, blockSize);
        return blocks[index.x][index.y + 1];
    }

    updateCollider() {
        this.collider = {
            a: { x: this.position.x - this.width / 2, y: this.position.y - this.height / 2 },
            b: { x: this.position.x + this.width / 2, y: this.position.y - this.height / 2 },
            c: { x: this.position.x + this.width / 2, y: this.position.y + this.height / 2 },
            d: { x: this.position.x - this.width / 2, y: this.position.y + this.height / 2 },
        };
    }

    climb() {
        console.log("climb");
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
    digUp() {
        console.log("digUp");
    }
    digRight() {
        console.log("digRight");
    }
    digDown() {
        console.log("digDown");
    }
    digLeft() {
        console.log("digLeft");
    }

    render() {
        if (this.sprite) {
            image(this.sprite, this.position.x - this.width / 2, this.position.y - this.height / 2);
        } else {
            fill("blue");
            rect(this.collider.a.x, this.collider.a.y, this.width, this.height);
        }
    }
}

class DemoPlayer extends Player {
    constructor(sprite) {
        super(sprite);
    }
}
