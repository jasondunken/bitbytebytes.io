class Alien {
    delta = 0;
    yRange = 5;
    constructor(size, position, speed, sprite) {
        this.size = size;
        this.pos = position;
        this.speed = speed;
        this.dead = false;
        this.sprite = sprite;
        this.delta = Math.random() * 2 * PI;
        this.yRange = Math.random() * this.yRange + this.yRange;
    }

    update() {
        this.delta += 0.08;
        if (this.delta >= 2 * PI) this.delta = 0;
        this.pos.x = this.pos.x + this.speed;
    }

    moveDown() {
        this.pos.y += this.size / 2;
    }

    render() {
        image(
            this.sprite,
            this.pos.x - this.size,
            this.pos.y - this.size + this.yRange * Math.sin(this.delta),
            this.size * 2,
            this.size * 2
        );
    }
}
