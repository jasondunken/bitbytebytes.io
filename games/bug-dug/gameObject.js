class GameObject {
    type;
    position;
    remove = false;

    constructor(type) {
        this.type = type;
    }

    update() {
        console.log("gameObj.update()");
    }

    render() {
        console.log("gameObj.render()");
    }

    setPosition(position) {
        this.position = position;
    }
}

class Block extends GameObject {
    solid = true;
    animation;
    constructor(position, sprite) {
        super("block", position);
        this.sprite = sprite;
    }

    update() {
        if (animation) {
            this.animation.update();
        }
    }
}
