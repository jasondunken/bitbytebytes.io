import { Vec } from "../../modules/math/vec.js";

class GameObject {
    constructor(type, position, size, colliderSize) {
        this.type = type ? type : "none";
        this.position = position ? position : new Vec();
        this.size = size ? size : 1;
        this.colliderSize = colliderSize ? colliderSize : 1;
        this.remove = false;
    }
}

class DefaultObject extends GameObject {
    constructor(position) {
        super("defaultObj", position, 4, 4);
    }

    render() {
        stroke("magenta");
        strokeWeight(this.size);
        noFill();
        point(this.position.x, this.position.y);
    }
}

export { GameObject, DefaultObject };
