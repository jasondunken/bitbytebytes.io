class Vec2 {
    static ZERO = new Vec2(0, 0);
    static UP = new Vec2(0, -1);
    static RIGHT = new Vec2(1, 0);
    static DOWN = new Vec2(0, 1);
    static LEFT = new Vec2(-1, 0);

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector2) {
        this.x += vector2.x;
        this.y += vector2.y;
    }

    sub(vector2) {
        this.x -= vector2.x;
        this.y -= vector2.y;
    }

    scale(value) {
        this.x *= value;
        this.y *= value;
    }
}

export { Vec2 };
