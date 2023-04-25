class GameObject {
    constructor(type, position) {
        this.type = type;
        this.position = position;
        this.dead = false;
    }

    update() {}
    render() {}
}

export { GameObject };
