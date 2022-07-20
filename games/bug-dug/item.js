class Item extends GameObject {
    static SIZE = 16;
    collected = false;
    itemType = "";
    constructor(position, spriteSheet, itemType) {
        super("item", position);
        this.animation = new Animation(spriteSheet, 45, true);
        this.animation.time = Math.random() * this.animation.duration;
        this.itemType = itemType;
    }

    render() {
        if (this.animation) {
            this.animation.update();
            image(this.animation.currentFrame, this.position.x, this.position.y, Item.SIZE, Item.SIZE);
        }
    }
}

class Chest extends GameObject {
    static SIZE = 16;
    opened = false;
    constructor(position, sprite, contents) {
        super("chest", position);
        this.sprite = sprite;
        this.contents = contents;
    }

    open() {
        this.opened = true;
        return this.contents;
    }

    update() {}

    render() {
        if (!this.opened) {
            image(this.sprite, this.position.x, this.position.y, Chest.SIZE, Chest.SIZE);
        }
    }
}
