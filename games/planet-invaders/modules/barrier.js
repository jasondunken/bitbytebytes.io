import { GameObject } from "./game-object.js";

class Barrier extends GameObject {
    BLOCK_SIZE = 4;
    BLOCK_MAP = [
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    blocks = new Set();

    constructor(position, sprite, size) {
        super("barrier", position, size);
        this.sprite = sprite;
    }

    update() {}

    render() {
        image(this.sprite, this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size);
    }

    getBlocks() {
        return this.blocks;
    }
}

class BarrierBlock {
    constructor(blockSize, position) {
        this.blockSize = blockSize;
        this.position = position;
    }
}

export { Barrier };
