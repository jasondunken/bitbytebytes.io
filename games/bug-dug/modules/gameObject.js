import { Vec } from "../../modules/math/vec.js";

class GameObject {
    constructor(type, position) {
        this.type = type || "default";
        this.position = position || new Vec();
        this.remove = false;
    }

    update() {
        console.log("gameObj.update()");
    }

    render() {
        console.log("gameObj.render()");
    }

    setPosition(position) {
        this.position = position;
    }
}

export { GameObject };
