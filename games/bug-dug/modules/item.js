import { GameObject } from "../../modules/gameObject.js";
import { Animation } from "../../modules/graphics/animation.js";
import { Collider } from "../../modules/collisions/collider.js";

import { Vec } from "../../modules/math/vec.js";
import { LevelArchitect } from "./levelArchitect.js";

class Item extends GameObject {
    static SIZE = 16;
    collected = false;
    itemType = "";
    grounded = false;

    launchVelocity = Vec.ZERO;
    velocity = Vec.ZERO;
    gravityVector = new Vec(0, LevelArchitect.GRAVITY);

    constructor(position, spriteSheet, itemType) {
        super(itemType, position);
        this.collider = new Collider(position, this.width, this.height);
        this.animation = new Animation(spriteSheet, 45, true);
        this.animation.time = Math.random() * this.animation.duration;
    }

    launch() {
        this.launchVelocity = new Vec(Math.random() * 2 - 1, -1).normalize();
    }

    update(delta) {
        if (!this.grounded) {
            this.position.add(this.gravityVector);
        }
        this.collider.update(this.position);
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

class Coin extends Item {
    static SIZE = 16;
    collected = false;

    collider = {
        a: new Vec(),
        b: new Vec(),
        c: new Vec(),
        d: new Vec(),
    };
    constructor(position, spriteSheet) {
        super(position, spriteSheet, "coin");
        const colliderPos = new Vec(position.x, position.y);
        this.width = Coin.SIZE;
        this.height = Coin.SIZE;
        this.collider = new Collider(colliderPos, Coin.SIZE, Coin.SIZE);
        this.animation = new Animation(spriteSheet, 45, true);
        this.animation.time = Math.random() * this.animation.duration;
    }

    render() {
        if (this.animation) {
            this.animation.update();
            image(
                this.animation.currentFrame,
                this.position.x - Coin.SIZE / 2,
                this.position.y - Coin.SIZE / 2,
                Coin.SIZE,
                Coin.SIZE
            );
        }
    }

    renderDebug() {
        this.collider.render("orange", 2);
    }
}

const TOOL_TYPES = Object.freeze({
    STONE_PICK: { name: "stone Pick", damage: 10, durability: 100 },
    IRON_PICK: { name: "iron pick", damage: 25, durability: 200 },
    STEEL_PICK: { name: "steel pick", damage: 50, durability: 500 },
    DIAMOND_PICK: { name: "diamond pick", damage: 100, durability: 1000 },
});

class Tool extends GameObject {
    constructor(toolType) {
        super("tool");
        this.properties = TOOL_TYPES[toolType];
    }
}

class Key extends Item {
    static SIZE = 16;
    collected = false;

    constructor(position, spriteSheet) {
        super(position, spriteSheet, "key");
        const colliderPos = new Vec(position.x, position.y);
        this.width = Key.SIZE;
        this.height = Key.SIZE;
        this.collider = new Collider(colliderPos, Key.SIZE, Key.SIZE);
        this.animation = new Animation(spriteSheet, 45, true);
        this.animation.time = Math.random() * this.animation.duration;
    }

    render() {
        if (this.animation) {
            this.animation.update();
            image(
                this.animation.currentFrame,
                this.position.x - Key.SIZE / 2,
                this.position.y - Key.SIZE / 2,
                Key.SIZE,
                Key.SIZE
            );
        }
    }
}

export { Item, Chest, Coin, Tool, TOOL_TYPES, Key };
