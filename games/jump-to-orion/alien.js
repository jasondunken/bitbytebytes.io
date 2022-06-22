class Alien extends GameObject {
    imageAlien;

    constructor(initialPos, speed, size, imageAlien) {
        super("alien", initialPos, speed, size);
        this.imageAlien = imageAlien;
    }

    update() {
        this.pathPos.x = this.pathPos.x + this.speed;
        this.delta += this.speed / 60.0;
        this.currentPos = {
            x: this.pathPos.x,
            y: this.pathPos.y + Math.cos(this.delta % 360) * this.size,
        };
        this.setCorners();
    }

    draw() {
        image(this.imageAlien, this.corners.a.x, this.corners.a.y, this.size, this.size);
    }
}
