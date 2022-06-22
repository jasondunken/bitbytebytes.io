class GameObject {
    type;
    currentPos; // the current position of the sprite, including any offset
    pathPos; // the path position, currentPos is pathPos plus an offset
    corners; // a collision box?
    size; // in pixels
    speed; // pixels / tick
    delta; // lifetime

    constructor(type, initialPos, speed, size) {
        this.type = type;
        this.currentPos = initialPos;
        this.pathPos = initialPos;
        this.speed = speed;
        this.size = size;
        this.halfSize = size / 2;
        this.delta = 0;
        this.setCorners();
    }

    update() {}
    draw() {}

    setCorners() {
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
}

class Collider {
    constructor(bounds) {
        this.bounds = bounds;
    }

    contains(entity) {}
}

class Animation {
    constructor(frames, duration, loop) {
        this.frames = frames;
        this.duration = duration;
        this.loop = loop;
    }
}
