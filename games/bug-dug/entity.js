class Entity extends GameObject {
    width = 32;
    height = 32;
    grounded = false;
    speed = 1;

    blocks = [];

    state;
    animations;
    currentAnimation = null;
    walkDirection = "right";

    particleEmitter = null;

    collider = {
        a: Vec2.ZEROS(),
        b: Vec2.ZEROS(),
        c: Vec2.ZEROS(),
        d: Vec2.ZEROS(),
    };

    constructor(type, position) {
        super(type, position);
    }

    update(terrain) {
        this.currentAnimation = this.animations[this.state];
        this.currentAnimation.update();

        if (!this.grounded) {
            this.position.y += terrain.gravity;
        }
        this.getInput(terrain);

        // constrain x
        if (this.position.x < this.width / 2) this.setPosition({ x: this.width / 2, y: this.position.y });
        if (this.position.x > terrain.width - this.width / 2)
            this.setPosition({ x: terrain.width - this.width / 2, y: this.position.y });
        // constrain y
        if (this.position.y < this.height / 2) this.setPosition({ x: this.position.x, y: this.height / 2 });
        if (this.position.y > terrain.height - this.height / 2)
            this.setPosition({ x: this.position.x, y: terrain.height - this.height / 2 });

        // check blocks around enemy
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
        if (this.particleEmitter) {
            this.updateParticleEmitter();
        }
    }

    getInput() {
        // console.log("this: ", this);
    }

    updateCollider() {
        this.collider = {
            a: { x: this.position.x - this.width / 2, y: this.position.y - this.height / 2 },
            b: { x: this.position.x + this.width / 2, y: this.position.y - this.height / 2 },
            c: { x: this.position.x + this.width / 2, y: this.position.y + this.height / 2 },
            d: { x: this.position.x - this.width / 2, y: this.position.y + this.height / 2 },
        };
    }

    updateParticleEmitter() {}

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
        if (this.particleEmitter) {
            this.particleEmitter.render();
        }
    }
}
