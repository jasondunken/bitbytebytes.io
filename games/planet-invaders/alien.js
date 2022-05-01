class Alien {
    delta = 0;
    constructor(size, position, speed, sprite) {
        this.size = size;
        this.pos = position;
        this.speed = speed;
        this.dead = false;
        this.sprite = sprite;
    }

    update() {
        this.pos.y = this.pos.y + Math.sin(this.delta);
        this.delta += 0.025;
        if (this.delta >= 360) this.delta = 0;
        this.pos.x = this.pos.x + this.speed;
    }

    render() {
        if (this.sprite) {
            image(this.sprite, this.pos.x - this.size, this.pos.y - this.size, this.size * 2, this.size * 2);
        }
    }
}
