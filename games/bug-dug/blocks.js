class Block extends GameObject {
    solid = true;
    sprite;
    animation;

    MAX_HEALTH = 99;
    health;
    destroyed = false;
    constructor(position, width, height, blockType, sprite) {
        super("block", position);
        this.width = width;
        this.height = height;
        this.blockType = blockType;
        this.sprite = sprite;
        this.health = this.MAX_HEALTH;
        this.updateCollider();
        if (blockType === "air" || blockType === "water") {
            this.solid = false;
        }
    }

    update() {
        if (this.animation) {
            this.animation.update();
        }
        this.updateCollider();
    }

    updateCollider() {
        this.collider = {
            a: { x: this.position.x, y: this.position.y },
            b: { x: this.position.x + this.width, y: this.position.y },
            c: { x: this.position.x + this.width, y: this.position.y + this.height },
            d: { x: this.position.x, y: this.position.y + this.height },
        };
    }

    takeDamage(dmg) {
        if (this.blockType !== "bedrock") {
            this.health -= dmg;
            if (this.health <= 0) {
                this.destroyed = true;
                this.solid = false;
            }
        }
    }

    render() {
        if (!this.destroyed) {
            if (this.sprite) {
                image(this.sprite, this.position.x, this.position.y, this.width, this.height);
            } else {
                fill(LevelArchitect.getColor(this.blockType));
                rect(this.position.x, this.position.y, this.width, this.height);
            }
        }
    }
}
