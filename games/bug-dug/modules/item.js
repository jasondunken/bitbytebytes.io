import { GameObject } from "../../modules/gameObject.js";
import { Animation } from "../../modules/graphics/animation.js";
import { Collider } from "../../modules/collisions/collider.js";

import { Vec } from "../../modules/math/vec.js";

class Item extends GameObject {
    static SIZE = 16;
    collected = false;
    itemType = "";
    constructor(position, spriteSheet, itemType) {
        super("item", position);
        this.collider = new Collider(position, this.width, this.height);
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

    renderDebug() {
        this.collider.render("orange");
    }
}

class Chest extends GameObject {
    static SIZE = 16;
    opened = false;
    constructor(position, sprite, contents) {
        super("chest", position);
        const colliderPos = new Vec(
            position.x + Coin.SIZE / 2,
            position.y + Coin.SIZE / 2
        );
        this.collider = new Collider(colliderPos, Coin.SIZE, Coin.SIZE);
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

    renderDebug() {
        this.collider.render("green", 2);
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
        const colliderPos = new Vec(
            position.x + Coin.SIZE / 2,
            position.y + Coin.SIZE / 2
        );
        this.collider = new Collider(colliderPos, Coin.SIZE, Coin.SIZE);
        this.animation = new Animation(spriteSheet, 45, true);
        this.animation.time = Math.random() * this.animation.duration;
    }

    render() {
        if (this.animation) {
            this.animation.update();
            image(
                this.animation.currentFrame,
                this.position.x,
                this.position.y,
                Coin.SIZE,
                Coin.SIZE
            );
        }
    }

    renderDebug() {
        this.collider.render("orange", 2);
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
