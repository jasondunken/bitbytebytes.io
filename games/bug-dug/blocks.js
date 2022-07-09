class Block extends GameObject {
    solid = true;
    sprite;
    animation;
    constructor(position, width, height, blockType) {
        super("block", position);
        this.width = width;
        this.height = height;
        this.blockType = blockType;
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

    render() {
        if (this.sprite) {
            image(this.sprite, this.position.x, this.position.y, this.width, this.height);
        } else {
            fill(Terrain.getColor(this.blockType));
            rect(this.position.x, this.position.y, this.width, this.height);
        }
    }
}
