import { Vec } from "../../modules/math/vec.js";

class GameObject {
    constructor(type, position) {
        this.type = type || "game-object";
        this.position = position || new Vec();
        this.dead = false;
    }
}

class Entity extends GameObject {
    width;
    height;

    isOnGround;

    constructor(type, position, width, height) {
        super(type, position);

        this.width = width || 0;
        this.height = height || 0;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    onGround() {
        return this.isOnGround;
    }

    checkGround(bounds) {
        if (this.position.y + this.height / 2 > bounds.ground) {
            this.isOnGround = true;
        } else {
            this.isOnGround = false;
        }
    }

    update() {
        console.warn("not implemented by extending class");
    }

    render(ctx) {
        if (ctx?.debug) {
            ctx.debug.color("red");
            ctx.debug.rect(
                this.position.x - this.width / 2,
                this.position.y - this.height / 2,
                this.width,
                this.height
            );
        }
        console.warn("not implemented by extending class");
    }
}

export { GameObject, Entity };
