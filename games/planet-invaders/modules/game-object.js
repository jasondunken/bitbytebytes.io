class GameObject {
    constructor(type, position, size) {
        this.type = type ? type : "none";
        this.position = position ? position : new Vec2(0, 0);
        this.size = size ? size : 1;
        this.remove = false;
    }
}

export { GameObject };
