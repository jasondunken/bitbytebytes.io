class Rocket extends GameObject {
    constructor(initialPos, speed, size, imageRocket) {
        super(initialPos, speed, size);
        this.imageRocket = imageRocket;
    }

    update() {
        this.pathPos.x += this.speed;
        this.delta += this.speed / 60.0;
        this.currentPos = {
            x: this.pathPos.x,
            y: this.pathPos.y,
        };
        this.corners = {
            a: {
                x: this.currentPos.x - this.halfSize,
                y: this.currentPos.y - this.halfSize,
            },
            b: {
                x: this.currentPos.x + this.halfSize,
                y: this.currentPos.y - this.halfSize,
            },
            c: {
                x: this.currentPos.x + this.halfSize,
                y: this.currentPos.y + this.halfSize,
            },
            d: {
                x: this.currentPos.x - this.halfSize,
                y: this.currentPos.y + this.halfSize,
            },
        };
    }

    draw() {
        image(this.imageRocket, this.corners.a.x, this.corners.a.y, this.size, this.size);
        ellipse(this.corners.a.x, this.corners.a.y, 5, 5);
    }
}
