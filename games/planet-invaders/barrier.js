class Barrier {
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

    constructor(size, position, sprite) {
        this.size = size;
        this.pos = position;
        this.sprite = sprite;
    }

    update() {}

    render() {
        image(this.sprite, this.pos.x - this.size, this.pos.y - this.size, this.size * 2, this.size * 2);
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
