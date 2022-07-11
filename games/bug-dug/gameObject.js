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
    constructor(position, sprite) {
        super("item", position);
        this.sprite = sprite;
    }

    render() {
        if (this.sprite) {
            image(
                this.sprite,
                this.position.x + this.sprite.width / 2,
                this.position.y + this.sprite.height,
                this.sprite.width,
                this.sprite.height
            );
        }
    }
}
