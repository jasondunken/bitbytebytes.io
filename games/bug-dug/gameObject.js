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

class Item extends GameObject {
    collected = false;
    constructor(position, spriteSheet) {
        super("item", position);
        this.animation = new Animation(spriteSheet, 90, true);
    }

    render() {
        if (this.animation) {
            this.animation.update();
            image(this.animation.currentFrame, this.position.x + 8, this.position.y + 16, 16, 16);
        }
    }
}
