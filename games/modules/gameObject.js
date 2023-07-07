import { Vec } from "./math/vec.js";

class GameObject {
    constructor(type, position) {
        this.type = type || "default";
        this.position = position || new Vec();
        this.remove = false;
    }

    update(delta) {}

    render() {}

    setPosition(position) {
        this.position = position;
    }
}

export { GameObject };
