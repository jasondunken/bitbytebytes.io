class GameObject {
    currentPos; // the current position of the sprite, including any offset
    pathPos; // the path position, currentPos is pathPos plus an offset
    corners; // a collision box?
    size; // in pixels
    speed; // pixels / tick
    delta; // lifetime

    constructor(initialPos, speed, size) {
        this.currentPos = initialPos;
        this.pathPos = initialPos;
        this.speed = speed;
        this.size = size;
        this.halfSize = size / 2;
        this.delta = 0;
    }

    update() {}
    draw() {}
}
