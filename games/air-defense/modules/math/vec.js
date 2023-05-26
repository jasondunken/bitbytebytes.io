class Vec {
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    set(x, y, z) {
        if (x instanceof Vec) {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
            return;
        }
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    add(x, y, z) {
        if (x instanceof Vec) {
            this.x += x.x;
            this.y += x.y;
            this.z += x.z;
            return;
        }
        this.x += x;
        this.y += y;
        this.z += z;
    }

    sub(x, y, z) {
        if (x instanceof Vec) {
            this.x -= x.x;
            this.y -= x.y;
            this.z -= x.z;
            return;
        }
        this.x -= x;
        this.y -= y;
        this.z -= z;
    }

    mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
    }

    div(scalar) {
        if (scalar != 0) {
            this.x /= scalar;
            this.y /= scalar;
            this.z /= scalar;
        } else {
            console.warn(`divide by zero error:  ${scalar} - ${this.toString()}`);
        }
    }

    mag() {
        return Math.sqrt(this.magSq());
    }

    magSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
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

    copy() {
        return new Vec(this.x, this.y, this.z);
    }

    toString() {
        return `bbbg.Vec Object : [${this.x}, ${this.y}, ${this.z}]`;
    }
}

export { Vec };
