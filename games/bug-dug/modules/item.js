import { GameObject } from "./gameObject.js";
import { Animation } from "./animation.js";

import { Vec } from "../../modules/math/vec.js";

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
            image(
                this.animation.currentFrame,
                this.position.x,
                this.position.y,
                Item.SIZE,
                Item.SIZE
            );
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
            image(
                this.sprite,
                this.position.x,
                this.position.y,
                Chest.SIZE,
                Chest.SIZE
            );
        }
    }
}

class Coin extends GameObject {
    static SIZE = 16;
    collected = false;

    collider = {
        a: new Vec(),
        b: new Vec(),
        c: new Vec(),
        d: new Vec(),
    };
    constructor(position, spriteSheet) {
        super("coin", position);
        this.animation = new Animation(spriteSheet, 45, true);
        this.animation.time = Math.random() * this.animation.duration;
        this.updateCollider();
    }

    updateCollider() {
        this.collider = {
            a: {
                x: this.position.x - Coin.SIZE / 2,
                y: this.position.y - Coin.SIZE / 2,
            },
            b: {
                x: this.position.x + Coin.SIZE / 2,
                y: this.position.y - Coin.SIZE / 2,
            },
            c: {
                x: this.position.x + Coin.SIZE / 2,
                y: this.position.y + Coin.SIZE / 2,
            },
            d: {
                x: this.position.x - Coin.SIZE / 2,
                y: this.position.y + Coin.SIZE / 2,
            },
        };
    }

    render() {
        if (this.animation) {
            this.animation.update();
            image(
                this.animation.currentFrame,
                this.position.x,
                this.position.y,
                Item.SIZE,
                Item.SIZE
            );
        }
    }
}

class Key extends GameObject {
    constructor(position, sprite) {
        super("key", position);
        this.sprite = sprite;
    }
}

class Door extends GameObject {
    constructor(position, sprite) {
        super("door", position);
        this.sprite = sprite;
    }
}

export { Item, Chest, Coin, Key, Door };
