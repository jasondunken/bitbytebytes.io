import { GameObject } from "./game-object.js";

import { Vec } from "./math/vec.js";

class Barrier extends GameObject {
    static BLOCK_SIZE = 4;
    static BLOCK_MAP = [
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    static getBlocks(locations, barriers) {
        for (let location of locations) {
            Barrier.buildBarrier(location, barriers);
        }
    }

    static buildBarrier(location, barriers) {
        for (let y = 0; y < Barrier.BLOCK_MAP.length; y++) {
            for (let x = 0; x < Barrier.BLOCK_MAP[y].length; x++) {
                if (Barrier.BLOCK_MAP[y][x] == 1) {
                    barriers.add(Barrier.buildBlock(location, { x, y }));
                }
            }
        }
    }

    static buildBlock(location, index) {
        return new BarrierBlock(
            new Vec(
                location.x +
                    index.x * Barrier.BLOCK_SIZE -
                    (Barrier.BLOCK_MAP[0].length * Barrier.BLOCK_SIZE) / 2,
                location.y +
                    index.y * Barrier.BLOCK_SIZE -
                    (Barrier.BLOCK_MAP.length * Barrier.BLOCK_SIZE) / 2
            ),
            Barrier.BLOCK_SIZE,
            Barrier.BLOCK_SIZE
        );
    }
}

class BarrierBlock extends GameObject {
    constructor(position, size, colliderSize) {
        super("block", position, size, colliderSize);
        this.colliders = [position.copy()];
    }

    takeDamage(damage) {
        this.health -= damage;
        if (damage <= 0) {
            this.remove = true;
        }
    }

    update() {}

    render(debug) {
        noStroke();
        fill("#00ff00ff");
        rect(
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );

        if (debug) {
            for (let collider of this.colliders) {
                stroke("red");
                strokeWeight(1);
                noFill();
                ellipse(
                    collider.x,
                    collider.y,
                    this.colliderSize,
                    this.colliderSize
                );
            }
        }
    }
}

export { Barrier };
