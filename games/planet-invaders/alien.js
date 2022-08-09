class Alien extends GameObject {
    delta = 0;
    yRange = 5;
    constructor(position, sprite) {
        super("alien", position, WORLD.METADATA.ALIEN_SIZE);
        this.moveSpeed = WORLD.METADATA.ALIEN_SPEED;
        this.sprite = sprite;
        this.delta = Math.random() * 2 * PI;
        this.yRange = Math.random() * this.yRange + this.yRange;
    }

    update() {
        this.delta += 0.08;
        if (this.delta >= 2 * PI) this.delta = 0;
        this.position.x = this.position.x + this.moveSpeed;
    }

    moveDown() {
        this.moveSpeed *= -1;
        this.position.y += this.size / 2;
    }

    render() {
        if (this.sprite) {
            image(
                this.sprite,
                this.position.x - this.size,
                this.position.y - this.size + this.yRange * Math.sin(this.delta),
                this.size * 2,
                this.size * 2
            );
        }
    }
}
