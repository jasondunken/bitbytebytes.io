class Bonus {
    constructor(position, size, speed, interval, sprite) {
        this.position = position;
        this.size = size;
        this.moveSpeed = speed;
        this.interval = interval;
        this.sprite = sprite;
        this.active = false;
    }

    reset(positionX) {
        this.position.x = positionX;
        this.speed = this.moveSpeed * positionX < 0 ? 1 : -1;
        this.active = true;
    }

    update() {
        if (this.active) {
            this.position.x = this.position.x + this.speed;
        }
    }

    render() {
        if (this.active) {
            image(this.sprite, this.position.x - this.size, this.position.y - this.size, this.size * 2, this.size * 2);
        }
    }
}

export { Bonus };
