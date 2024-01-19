class Vec {
    constructor(x, y, z) {
        if (x instanceof Vec) {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
            return this;
        }
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        return this;
    }

    static ZERO = new Vec(0, 0);
    static UP = new Vec(0, -1);
    static DOWN = new Vec(0, 1);
    static LEFT = new Vec(-1, 0);
    static RIGHT = new Vec(1, 0);

    static GRAVITY = new Vec(0, 9.8);

    set(x, y, z) {
        if (x instanceof Vec) {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
            return this;
        }
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        return this;
    }

    add(x, y, z) {
        if (x instanceof Vec) {
            this.x += x.x;
            this.y += x.y;
            this.z += x.z;
            return this;
        }
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }

    sub(x, y, z) {
        if (x instanceof Vec) {
            this.x -= x.x;
            this.y -= x.y;
            this.z -= x.z;
            return this;
        }
        this.x -= x;
        this.y -= y;
        this.z -= z;
        return this;
    }

    mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    div(scalar) {
        if (scalar != 0) {
            this.x /= scalar;
            this.y /= scalar;
            this.z /= scalar;
        } else {
            console.assert(
                scalar,
                `divide by zero error:  ${scalar} - ${this.toString()}`
            );
        }
        return this;
    }

    mag() {
        return Math.sqrt(this.magSq());
    }

    magSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    rotateZ(radians) {
        const x = this.x;
        const y = this.y;
        this.x = x * Math.cos(radians) - y * Math.sin(radians);
        this.y = x * Math.sin(radians) + y * Math.cos(radians);
        return this;
    }

    normalize() {
        const d = this.mag();
        if (d === 0) return new Vec();
        this.x = this.x / d;
        this.y = this.y / d;
        this.z = this.z / d;
        return this;
    }

    dot(x, y, z) {
        if (x instanceof Vec) {
            return this.dot(x.x, x.y, x.z);
        }
        return this.x * (x || 0) + this.y * (y || 0) + this.z * (z || 0);
    }

    static add2(vec1, vec2) {
        return new Vec(vec1.x + vec2.x, vec1.y + vec2.y, vec1.z + vec2.z);
    }

    static sub2(vec1, vec2) {
        return new Vec(vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z);
    }

    static mult2(vec1, vec2) {
        return new Vec(vec1.x * vec2.x, vec1.y * vec2.y, vec1.z * vec2.z);
    }

    static div2(vec1, vec2) {
        return new Vec(vec1.x / vec2.x, vec1.y / vec2.y, vec1.z / vec2.z);
    }

    static Random() {
        return new Vec(Math.random() * 2 - 1, Math.random() * 2 - 1);
    }

    static UnitRandom2d() {
        const vec = new Vec(Math.random() * 2 - 1, Math.random() * 2 - 1);
        return vec.normalize();
    }

    static dist(v1, v2) {
        return Vec.sub2(v1, v2).mag();
    }

    copy() {
        return new Vec(this.x, this.y, this.z);
    }

    toString() {
        return `bbbg.Vec Object : [${this.x}, ${this.y}, ${this.z}]`;
    }
}

export { Vec };
