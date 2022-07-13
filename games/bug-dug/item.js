class Item extends GameObject {
    collected = false;
    constructor(position, spriteSheet) {
        super("item", position);
        this.animation = new Animation(spriteSheet, 90, true);
        this.animation.time = Math.random() * this.animation.duration;
    }

    render() {
        if (this.animation) {
            this.animation.update();
            image(this.animation.currentFrame, this.position.x + 8, this.position.y + 16, 16, 16);
        }
    }
}
