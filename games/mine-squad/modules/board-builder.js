class BoardBuilder {
    constructor(config) {
        this.totalTiles = config.totalTiles;
        this.tilesPerRow = config.tilesPerRow;
        this.maxMines = config.maxMines;
    }

    generateBoard(numMines) {
        const newBoard = [];
        for (let i = 0; i < this.totalTiles; i++) {
            newBoard[i] = new Tile();
        }
        this.placeMines(newBoard, numMines);
        this.calculateValues(newBoard);
        return newBoard;
    }

    placeMines(newBoard, numMines) {
        let minesToPlace = numMines < this.maxMines ? numMines : this.maxMines;
        let placedMines = 0;
        while (placedMines < minesToPlace) {
            const tileIndex = Math.floor(Math.random() * this.totalTiles);
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
                    const index = tileIndex - this.tilesPerRow + j;
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
                    const index = tileIndex + this.tilesPerRow + j;
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
        const tile1X = Math.floor(tile1 % this.tilesPerRow);
        const tile2X = Math.floor(tile2 % this.tilesPerRow);
        const distanceApart = Math.abs(tile1X - tile2X);
        if (distanceApart < this.tilesPerRow - 2) {
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

class Bomb {
    constructor() {
        this.live = true;
    }
}

export { BoardBuilder };
