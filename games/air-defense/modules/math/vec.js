class Vec {
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    set(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    add(vec) {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
    }

    sub(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
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
        const x = this.x;
        const y = this.y;
        const z = this.z;
        return x * x + y * y + z * z;
    }

    dot(x, y, z) {
        if (x instanceof Vec) {
            return this.dot(x.x, x.y, x.z);
        }
        return this.x * (x || 0) + this.y * (y || 0) + this.z * (z || 0);
    }

    static add(vec1, vec2) {
        return new Vec(vec1.x + vec2.x, vec1.y + vec2.y, vec1.z + vec2.z);
    }

    static sub(vec1, vec2) {
        return new Vec(vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z);
    }

    static mult(vec1, vec2) {
        return new Vec(vec1.x * vec2.x, vec1.y * vec2.y, vec1.z * vec2.z);
    }

    static dev(vec1, vec2) {
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
