class GameObject {
    type;
    position;
    collider;
    remove = false;
    width;
    height;

    constructor(type, position = { x: 0, y: 0 }) {
        this.type = type;
        this.position = position;
    }

    update() {
        console.log("gameObj.update()");
    }

    render() {
        console.log("gameObj.render()");
    }

    updateCollider() {
        console.log("gameObj.updateCollider()");
    }

    setPosition(position) {
        this.position = position;
        this.updateCollider();
    }
}

export { GameObject };
