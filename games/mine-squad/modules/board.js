import { BoardBuilder } from "./board-builder.js";

class Board {
    config = {
        TILES_PER_COLUMN: 16,
        TILES_PER_ROW: 30,
        TILE_HEIGHT: 30,
        HALF_TILE: Math.floor(TILE_HEIGHT / 2),
        BOARD_X_OFFSET: 30,
        BOARD_Y_OFFSET: 4,
        BOMB_HEIGHT: TILE_HEIGHT * 0.7,
        TOTAL_TILES: TILES_PER_COLUMN * TILES_PER_ROW,
    };

    constructor(maxMines, sprites) {
        this.maxMines = maxMines;
        this.sprites = sprites;
        this.boardBuilder = new BoardBuilder(this.config);
    }

    generateBoard(numMines) {
        this.board = this.boardBuilder.generateBoard(numMines);
    }

    update() {}

    draw() {
        this.drawBoard();
        //this.drawCursor();
    }

    drawBoard() {
        for (let i = 0; i < this.config.totalTiles; i++) {
            this.tileIndexX = (i % this.config.tilesPerRow) * this.config.tileHeight;
            this.tileIndexY = Math.floor(i / this.config.tilesPerRow) * this.config.tileHeight;
            this.tile = this.board[i];

            if (this.tile.hidden === false) {
                setColor("gray");
                stroke("darkgray");
                strokeWeight(1);
                rect(
                    this.BOARD_X_OFFSET + this.tileIndexX,
                    this.tileIndexY + this.BOARD_Y_OFFSET,
                    this.config.tileHeight,
                    this.config.tileHeight
                );
                if (!this.tile.bomb && this.tile.value !== 0) {
                    setColor(valueToColor(this.tile.value));
                    textAlign(CENTER);
                    textSize(24);
                    text(
                        this.tile.value,
                        this.BOARD_X_OFFSET + this.tileIndexX + this.HALF_TILE,
                        this.tileIndexY + this.config.tileHeight * 0.6 + this.BOARD_Y_OFFSET
                    );
                    setColor("black");
                }

                if (this.tile.bomb) {
                    this.drawBomb(new Vec2(this.tileIndexX, this.tileIndexY));
                }
            } else {
                setColor("green");
                stroke("black");
                strokeWeight(1);
                rect(
                    this.BOARD_X_OFFSET + this.tileIndexX,
                    this.tileIndexY + this.BOARD_Y_OFFSET,
                    this.config.tileHeight - 1,
                    this.config.tileHeight - 1
                );
                if (this.tile.flagged) {
                    this.drawFlag(new Vec2(this.tileIndexX, this.tileIndexY));
                }
            }

            // when game over mark flags correct/incorrect, show bombs
            if (this.currentState == this.GAME_STATE.GAME_OVER) {
                if (this.tile.flagged === true) {
                    this.markFlag(this.tile.bomb);
                } else if (this.tile.bomb) {
                    this.drawBomb(new Vec2(this.tileIndexX, this.tileIndexY));
                }
            }
        }
    }

    drawFlag(tileIndex) {
        setColor("yellow");
        strokeWeight(1);
        ellipse(
            this.BOARD_X_OFFSET + tileIndex.x + this.HALF_TILE,
            tileIndex.y + this.HALF_TILE + this.BOARD_Y_OFFSET,
            this.BOMB_HEIGHT,
            this.BOMB_HEIGHT
        );
    }

    drawBomb(tileIndex) {
        setColor("red");
        image(
            MineSquadPlus.sprites["bomb"],
            this.BOARD_X_OFFSET + tileIndex.x + 2,
            tileIndex.y + this.BOARD_Y_OFFSET + 2,
            this.config.tileHeight - 4,
            this.config.tileHeight - 4
        );
    }

    markFlag(isBomb) {
        strokeWeight(5);
        isBomb ? setColor("green") : setColor("red");
        line(
            this.BOARD_X_OFFSET + this.tileIndexX,
            this.tileIndexY + this.BOARD_Y_OFFSET,
            this.BOARD_X_OFFSET + this.tileIndexX + this.config.tileHeight,
            this.tileIndexY + this.BOARD_Y_OFFSET + this.config.tileHeight
        );
        line(
            this.BOARD_X_OFFSET + this.tileIndexX + this.config.tileHeight,
            this.tileIndexY + this.BOARD_Y_OFFSET,
            this.tileIndexX + this.config.tileHeight,
            this.tileIndexY + this.config.tileHeight + this.BOARD_Y_OFFSET
        );
    }

    drawCursor() {
        const tile = mousePositionToTileScreenLocation(mouseX, mouseY, this.config.tileHeight);
        if (
            tile.x >= this.BOARD_X_OFFSET &&
            tile.x < this.config.tilesPerRow * this.config.tileHeight + this.BOARD_X_OFFSET &&
            tile.y >= 0 &&
            tile.y < this.TILES_PER_COLUMN * this.config.tileHeight
        ) {
            setColor("red");
            strokeWeight(3);
            noFill();
            rect(tile.x, tile.y, this.config.tileHeight, this.config.tileHeight);
        }
    }

    showMousePath() {
        stroke("orange");
        strokeWeight(2);
        for (let i = 0; i < this.mouseClicks.length - 1; i++) {
            line(
                this.mouseClicks[i][0],
                this.mouseClicks[i][1],
                this.mouseClicks[i + 1][0],
                this.mouseClicks[i + 1][1]
            );
        }

        stroke("magenta");
        noFill();
        strokeWeight(3);
        let lastClick = this.mouseClicks[this.mouseClicks.length - 1];
        lastClick = [lastClick[0], lastClick[1] - this.BOARD_Y_OFFSET];
        const [x, y] = mousePositionToTileScreenLocation(lastClick, this.config.tileHeight, this.BOARD_Y_OFFSET);
        rect(x, y, this.config.tileHeight, this.config.tileHeight);
    }
}

export { Board };
