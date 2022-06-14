class Alien {
    img;
    currentPos; // the current position of the sprite, including any offset
    pathPos; // the path position, currentPos is pathPos plus an offset
    speed;
    size;
    corners; // a collision box?

    constructor(initialPos, img, size, speed) {
        this.img = img;
        this.currentPos = initialPos;
        this.pathPos = initialPos;
        this.speed = speed;
        this.size = size;
        this.halfSize = size / 2;
    }

    update() {
        this.pathPos.x = this.pathPos.x + this.speed;
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
        console.log("pathPos: ", this.pathPos);
        console.log("currentPos: ", this.currentPos);
    }

    draw() {
        image(this.img, this.corners.a.x, this.corners.a.y, this.size, this.size);
    }
}
