class Vec2d {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    add(vec2d) {
        return new Vec2d(this.x + vec2d.x, this.y + vec2d.y);
    }
}

class Vec3d {
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    add(vec3d) {
        return new Vec3d(this.x + vec3d.x, this.y + vec3d.y, this.z + vec3d.z);
    }
}

export { Vec2d, Vec3d };
