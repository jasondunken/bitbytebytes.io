import { GameObject } from "./gameObject.js";

import { Vec } from "../../modules/math/vec.js";

class Item extends GameObject {
    static SIZE = 32;
    static COLLIDER_SIZE = 32;
    static SPEED = 2;

    values = {
        healthSML: 10,
        healthMED: 25,
        healthLRG: 50,
        ammo: 10,
        shield: 250,
    };

    constructor(position, sprite, item) {
        super("item", position, Item.SIZE, Item.COLLIDER_SIZE, Item.SPEED);
        this.sprite = sprite;
        this.name = item;
        this.value = this.values[item];
        this.direction = Vec.LEFT;
    }

    update() {
        this.position.add(this.direction);
        this.updateColliders();
    }
}

export { Item };
