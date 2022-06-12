class Item {
    pos;
    type;
    value;
    image;
    size;
    speed;

    constructor(pos, type, value, image, size, speed) {
        this.pos = pos;
        this.type = type;
        this.value = value;
        this.image = image;
        this.size = size;
        this.speed = speed;
    }

    update() {
        this.pos.x += this.speed;
    }

    draw() {
        drawingContext.image(this.image, this.pos.x, this.pos.y, this.size, this.size);
    }
}
