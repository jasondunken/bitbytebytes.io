class Alien {
    delta = 0;
    constructor(size, position, speed) {
        this.size = size;
        this.pos = position;
        this.speed = speed;
        this.dead = false;
    }

    update() {
        this.pos.y = this.pos.y + Math.sin(this.delta);
        this.delta += 0.25;
        // if (this.delta >= 360) this.delta = 0;
        this.pos.x = this.pos.x + this.speed;
    }

    render() {
        noStroke();
        // fill("WHITE");
        // ellipse(this.pos.x, this.pos.y, this.size, this.size);
        let alienSprite = loader.getSprite("alien");
        if (alienSprite) {
            image(alienSprite, this.pos.x - this.size, this.pos.y - this.size, this.size * 2, this.size * 2);
        }
    }
}
