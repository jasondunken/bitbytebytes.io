class BoardBuilder {
    generateBoard(config) {
        const tiles = [];
        this.wTiles = config.wTiles;
        for (let i = 0; i < config.wTiles * config.hTiles; i++) {
            tiles[i] = new Tile();
        }
        this.placeMines(tiles, config.mines);
        this.calculateValues(tiles);
        this.placeBonusTiles(tiles, config.bonusTiles);
        return {
            wTiles: config.wTiles,
            tiles,
        };
    }

    placeMines(newBoard, numMines) {
        let placedMines = 0;
        while (placedMines < numMines) {
            const tileIndex = Math.floor(Math.random() * newBoard.length);
            if (!newBoard[tileIndex].bomb) {
                newBoard[tileIndex].bomb = new Bomb();
                placedMines++;
            }
        }
    }

    calculateValues(newBoard) {
        for (let i = 0; i < newBoard.length; i++) {
            newBoard[i].value = this.countNeighbors(newBoard, i);
        }
    }

    placeBonusTiles(newBoard, bonusTiles) {
        for (let bonus of bonusTiles) {
            const rndIndex = Math.floor(Math.random() * newBoard.length);
            const tile = newBoard[rndIndex];
            if (!tile.bomb && tile.value === 0) {
                tile.bonus = new BonusTile(bonus.type, bonus.score);
            }
        }
    }

    countNeighbors(newBoard, tileIndex) {
        let value = 0;
        const neighbors = this.getNeighbors(tileIndex);
        for (let i = 0; i < neighbors.length; i++) {
            const tile = this.getTile(newBoard, neighbors[i]);
            if (tile != null && tile.bomb.live) {
                value++;
            }
        }
        return value;
    }

    getNeighbors(tileIndex) {
        let neighbors = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                if (i === -1) {
                    const index = tileIndex - this.wTiles + j;
                    if (this.isValidNeighbor(tileIndex, index)) {
                        neighbors.push(index);
                    }
                }
                if (i === 0) {
                    const index = tileIndex + j;
                    if (this.isValidNeighbor(tileIndex, index)) {
                        neighbors.push(index);
                    }
                }
                if (i === 1) {
                    const index = tileIndex + this.wTiles + j;
                    if (this.isValidNeighbor(tileIndex, index)) {
                        neighbors.push(index);
                    }
                }
            }
        }
        return neighbors;
    }

    // checks that the neighbor isn't across an edge
    isValidNeighbor(tile1, tile2) {
        if (tile2 < 0 || tile2 >= this.totalTiles) return false;
        const tile1X = Math.floor(tile1 % this.wTiles);
        const tile2X = Math.floor(tile2 % this.wTiles);
        const distanceApart = Math.abs(tile1X - tile2X);
        if (distanceApart < this.wTiles - 2) {
            return true;
        }
        return false;
    }

    getTile(board, index) {
        return board[index];
    }
}

class Tile {
    constructor() {
        this.hidden = true;
        this.bomb = false;
        this.flagged = false;
        this.value = 0;
    }
}

class BonusTile extends Tile {
    constructor(type, score) {
        super();
        this.type = type;
        this.score = score;
    }
}

class Bomb {
    constructor() {
        this.live = true;
    }
}

export { BoardBuilder };
