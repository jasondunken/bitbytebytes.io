class Bonus {
    constructor(size, position, speed, sprite) {
        this.size = size;
        this.pos = position;
        this.speed = speed;
        this.dead = false;
        this.sprite = sprite;
    }

    update() {
        this.pos.x = this.pos.x + this.speed;
    }

    render() {
        image(this.sprite, this.pos.x - this.size, this.pos.y - this.size, this.size * 2, this.size * 2);
    }
}
