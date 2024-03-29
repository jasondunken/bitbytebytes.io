import { Vec } from "../../modules/math/vec.js";

function getGridIndex(position, blockSize) {
    return new Vec(
        Math.floor(position.x / blockSize),
        Math.floor(position.y / blockSize)
    );
}

function getBlockAtPosition(position, blocks, blockSize) {
    const index = getGridIndex(position, blockSize);
    return getBlock(index, blocks);
}

function getBlockBelowPosition(position, blocks, blockSize) {
    const index = getGridIndex(position, blockSize);
    return getBlockBelow(index, blocks);
}

function getAdjacentBlocks(position, blocks, blockSize) {
    const index = getGridIndex(position, blockSize);
    return {
        below: getBlockBelow(index, blocks),
        above: getBlockAbove(index, blocks),
        left: getBlockLeft(index, blocks),
        right: getBlockRight(index, blocks),
    };
}

function getBlockBelow(index, blocks) {
    return getBlock(new Vec(index.x, index.y + 1), blocks);
}

function getBlockAbove(index, blocks) {
    return getBlock(new Vec(index.x, index.y - 1), blocks);
}

function getBlockLeft(index, blocks) {
    return getBlock(new Vec(index.x - 1, index.y), blocks);
}

function getBlockRight(index, blocks) {
    return getBlock(new Vec(index.x + 1, index.y), blocks);
}

function getBlock(index, blocks) {
    if (index.x < 0 || index.x >= blocks.length) {
        return null;
    }
    if (index.y < 0 || index.y >= blocks[index.x].length) {
        return null;
    }
    return blocks[index.x][index.y];
}

function clearForegroundAround(index, foreground, radius = 2.5) {
    foreground.forEach((column, i) => {
        column.forEach((tile, j) => {
            let a = (i - index.x) ** 2;
            let b = (j - index.y) ** 2;
            let ab = a + b;
            if (ab < radius ** 2) {
                foreground[i][j] = "none";
            }
        });
    });
}

function calculateAABBCollision(obj1, obj2) {
    const collider1 = obj1.collider;
    const collider2 = obj2.collider;
    let collision = {
        obj1: {
            top: false,
            bottom: false,
            left: false,
            right: false,
        },
        obj2: {
            top: false,
            bottom: false,
            left: false,
            right: false,
        },
    };
    if (
        collider1.a.x < collider2.b.x &&
        collider1.b.x > collider2.a.x &&
        collider1.a.y < collider2.d.y &&
        collider1.d.y > collider2.a.y
    ) {
        if (collider1.a.x > collider2.a.x && collider1.b.x > collider2.b.x) {
            collision.obj1.left = true;
            collision.obj2.right = true;
        }
        if (collider1.a.x < collider2.a.x && collider1.b.x < collider2.b.x) {
            collision.obj1.right = true;
            collision.obj2.left = true;
        }
        if (collider1.a.y > collider2.a.y && collider1.d.y > collider2.d.y) {
            collision.obj1.top = true;
            collision.obj2.bottom = true;
        }
        if (collider1.a.y < collider2.a.y && collider1.d.y < collider2.d.y) {
            collision.obj1.bottom = true;
            collision.obj2.top = true;
        }
        return collision;
    }
    return null;
}

export {
    getGridIndex,
    getBlockAtPosition,
    getBlockBelowPosition,
    getAdjacentBlocks,
    getBlockAbove,
    clearForegroundAround,
    calculateAABBCollision,
};
