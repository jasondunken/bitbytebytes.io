import { BoardBuilder } from "./board-builder.js";
import * as utils from "./utils.js";
import { GAME_STATE } from "./game-state.js";
import { ScoreEffect, BonusEffect } from "./visual-effects.js";

class Board {
    TILES_PER_COLUMN = 16;
    TILES_PER_ROW = 30;
    TILE_HEIGHT = 30;
    HALF_TILE = Math.floor(this.TILE_HEIGHT / 2);

    BOARD_X_OFFSET = 30;
    BOARD_Y_OFFSET = 4;
    BOMB_HEIGHT = this.TILE_HEIGHT * 0.7;
    TOTAL_TILES = this.TILES_PER_COLUMN * this.TILES_PER_ROW;

    MAX_MINES = 99;

    config = {
        totalTiles: this.TOTAL_TILES,
        tilesPerRow: this.TILES_PER_ROW,
        maxMines: this.MAX_MINES,
    };

    constructor(mineSquad, sprites) {
        this.mineSquad = mineSquad;
        this.sprites = sprites;
        this.boardBuilder = new BoardBuilder(this.config);
        this.bounds = {
            top: this.BOARD_Y_OFFSET,
            right: this.BOARD_X_OFFSET + this.TILES_PER_ROW * this.TILE_HEIGHT,
            bottom: this.BOARD_Y_OFFSET + this.TILES_PER_COLUMN * this.TILE_HEIGHT,
            left: this.BOARD_X_OFFSET,
        };
    }

    generateBoard(numMines) {
        this.board = this.boardBuilder.generateBoard(numMines);
    }

    isOnBoard(coords) {
        if (
            coords.x > this.bounds.left &&
            coords.x < this.bounds.right &&
            coords.y > this.bounds.top &&
            coords.y < this.bounds.bottom
        ) {
            return true;
        }
        return false;
    }

    getIndex(coords) {
        return utils.mousePositionToTileIndex(
            coords,
            this.TILE_HEIGHT,
            this.TILES_PER_ROW,
            this.BOARD_X_OFFSET,
            this.BOARD_Y_OFFSET
        );
    }

    getTile(index) {
        return this.board[index];
    }

    getUiData() {
        let tiles = 0;
        let hidden = 0;
        let mines = 0;
        let flags = 0;
        let totalTileValue = 0;
        this.board.forEach((tile) => {
            tiles++;
            tile.hidden ? hidden++ : hidden;
            tile.bomb ? mines++ : mines;
            tile.flagged ? flags++ : flags;
            totalTileValue += tile.value;
        });
        return { tiles, hidden, mines, flags, totalTileValue };
    }

    getFlagCount() {
        let count = 0;
        this.board.forEach((tile) => {
            if (tile.flagged) count++;
        });
        return count;
    }

    update() {}

    isWinner() {
        let winner = true;
        this.board.forEach((tile) => {
            if (!tile.bomb && tile.hidden === true) winner = false;
        });
        return winner;
    }

    uncover(tileIndex, checkedTiles) {
        const tile = this.getTile(tileIndex);
        if (tile.flagged === false) {
            tile.hidden = false;
            const tileScore = tile.value * 10;
            this.score += tileScore;
            const position = utils.tileIndexToTileCenter(
                tileIndex,
                this.TILE_HEIGHT,
                this.TILES_PER_ROW,
                this.BOARD_X_OFFSET,
                this.BOARD_Y_OFFSET
            );
            if (tile.value > 0) {
                this.mineSquad.visualEffects.add(new ScoreEffect(position, tileScore, tile.value));
            }
        }
        // if tile.value is zero, uncover all the tiles around it
        // if one of the ones uncovered is a zero uncover all the ones around it and so on
        // checked is a blank list to track zeros already checked
        if (tile.value === 0 && !checkedTiles.includes(tileIndex)) {
            checkedTiles.push(tileIndex);
            // a list of the valid neighbors
            let neighbors = this.boardBuilder.getNeighbors(tileIndex);
            for (let i = 0; i < neighbors.length; i++) {
                this.uncover(neighbors[i], checkedTiles);
            }
        }
    }

    defuseWithinRadius(tileIndex) {
        const tile = this.getTile(tileIndex);
        tile.hidden = false;
        const position = utils.tileIndexToTileCenter(
            tileIndex,
            this.BOARD_X_OFFSET,
            this.TILE_HEIGHT,
            this.TILES_PER_ROW
        );
        if (tile.bomb) {
            this.mineSquad.visualEffects.add(new BonusEffect(position, this.DEFUSE_BONUS));
            this.score += this.DEFUSE_BONUS;
        } else if (tile.value > 0) {
            this.mineSquad.visualEffects.add(new BonusEffect(position, tile.value * this.DEFUSE_BONUS, "blue"));
            this.score += tile.value * this.DEFUSE_BONUS;
        }

        const defuseArea = this.boardBuilder.getNeighbors(tileIndex);
        this.boardBuilder.isValidNeighbor(tileIndex, tileIndex + 2) ? defuseArea.push(tileIndex + 2) : undefined;
        this.boardBuilder.isValidNeighbor(tileIndex, tileIndex - 2) ? defuseArea.push(tileIndex - 2) : undefined;
        defuseArea.push(tileIndex + this.TILES_PER_ROW * 2);
        defuseArea.push(tileIndex - this.TILES_PER_ROW * 2);

        for (let i = 0; i < defuseArea.length; i++) {
            if (defuseArea[i] >= 0 && defuseArea[i] < this.TOTAL_TILES) {
                const tile = this.getTile(defuseArea[i]);
                if (tile && tile.hidden) {
                    tile.hidden = false;
                    this.score += tile.value * this.TILE_BONUS;
                    if (tile.bomb) {
                        const position = utils.tileIndexToTileCenter(
                            defuseArea[i],
                            this.TILE_HEIGHT,
                            this.TILES_PER_ROW,
                            this.BOARD_X_OFFSET,
                            this.BOARD_Y_OFFSET
                        );
                        this.mineSquad.visualEffects.add(new BonusEffect(position, this.DEFUSE_BONUS));
                        this.score += this.mineSquad.DEFUSE_BONUS;
                    }
                }
            }
        }
    }

    calculateScore(tileBonus, flagPenalty) {
        let score = 0;
        for (let i = 0; i < this.totalTiles; i++) {
            const tile = this.board[i];
            if (tile.hidden === false && this.winner) {
                score += tileBonus;
            }
            if (tile.flagged) {
                score -= flagPenalty;
            }
        }
        return score;
    }

    draw() {
        this.drawBoard();
        this.drawCursor();
    }

    drawBoard(gameState) {
        for (let i = 0; i < this.TOTAL_TILES; i++) {
            this.tileIndexX = (i % this.config.tilesPerRow) * this.TILE_HEIGHT;
            this.tileIndexY = Math.floor(i / this.config.tilesPerRow) * this.TILE_HEIGHT;
            this.tile = this.board[i];

            if (this.tile.hidden === false) {
                utils.setColor("gray");
                stroke("darkgray");
                strokeWeight(1);
                rect(
                    this.BOARD_X_OFFSET + this.tileIndexX,
                    this.tileIndexY + this.BOARD_Y_OFFSET,
                    this.TILE_HEIGHT,
                    this.TILE_HEIGHT
                );
                if (!this.tile.bomb && this.tile.value !== 0) {
                    utils.setColor(utils.valueToColor(this.tile.value));
                    textAlign(CENTER);
                    textSize(24);
                    text(
                        this.tile.value,
                        this.BOARD_X_OFFSET + this.tileIndexX + this.HALF_TILE,
                        this.tileIndexY + this.TILE_HEIGHT * 0.6 + this.BOARD_Y_OFFSET
                    );
                    utils.setColor("black");
                }

                if (this.tile.bomb) {
                    this.drawBomb(new utils.Vec2(this.tileIndexX, this.tileIndexY));
                }
            } else {
                utils.setColor("green");
                stroke("black");
                strokeWeight(1);
                rect(
                    this.BOARD_X_OFFSET + this.tileIndexX,
                    this.tileIndexY + this.BOARD_Y_OFFSET,
                    this.TILE_HEIGHT - 1,
                    this.TILE_HEIGHT - 1
                );
                if (this.tile.flagged) {
                    this.drawFlag(new utils.Vec2(this.tileIndexX, this.tileIndexY));
                }
            }

            // when game over mark flags correct/incorrect, show bombs
            if (gameState === GAME_STATE.GAME_OVER) {
                if (this.tile.flagged === true) {
                    this.markFlag(this.tile.bomb);
                } else if (this.tile.bomb) {
                    this.drawBomb(new Vec2(this.tileIndexX, this.tileIndexY));
                }
            }
        }
    }

    drawFlag(tileIndex) {
        utils.setColor("yellow");
        strokeWeight(1);
        ellipse(
            this.BOARD_X_OFFSET + tileIndex.x + this.HALF_TILE,
            tileIndex.y + this.HALF_TILE + this.BOARD_Y_OFFSET,
            this.BOMB_HEIGHT,
            this.BOMB_HEIGHT
        );
    }

    drawBomb(tileIndex) {
        utils.setColor("red");
        image(
            this.sprites["bomb"],
            this.BOARD_X_OFFSET + tileIndex.x + 2,
            tileIndex.y + this.BOARD_Y_OFFSET + 2,
            this.TILE_HEIGHT - 4,
            this.TILE_HEIGHT - 4
        );
    }

    markFlag(isBomb) {
        strokeWeight(5);
        isBomb ? setColor("green") : setColor("red");
        line(
            this.BOARD_X_OFFSET + this.tileIndexX,
            this.tileIndexY + this.BOARD_Y_OFFSET,
            this.BOARD_X_OFFSET + this.tileIndexX + this.TILE_HEIGHT,
            this.tileIndexY + this.BOARD_Y_OFFSET + this.TILE_HEIGHT
        );
        line(
            this.BOARD_X_OFFSET + this.tileIndexX + this.TILE_HEIGHT,
            this.tileIndexY + this.BOARD_Y_OFFSET,
            this.tileIndexX + this.TILE_HEIGHT,
            this.tileIndexY + this.TILE_HEIGHT + this.BOARD_Y_OFFSET
        );
    }

    drawCursor() {
        const coords = new utils.Vec2(mouseX, mouseY);
        if (this.isOnBoard(coords)) {
            const tileCenter = utils.mousePositionToTileCenter(
                coords,
                this.TILE_HEIGHT,
                this.TILES_PER_ROW,
                this.BOARD_X_OFFSET,
                this.BOARD_Y_OFFSET
            );
            utils.setColor("red");
            strokeWeight(1);
            noFill();
            rect(
                tileCenter.x - this.TILE_HEIGHT / 2,
                tileCenter.y - this.TILE_HEIGHT / 2,
                this.TILE_HEIGHT,
                this.TILE_HEIGHT
            );
        }
    }

    showMousePath(mouseClicks) {
        stroke("orange");
        strokeWeight(2);
        for (let i = 0; i < mouseClicks.length - 1; i++) {
            line(mouseClicks[i][0], mouseClicks[i][1], mouseClicks[i + 1][0], mouseClicks[i + 1][1]);
        }

        stroke("magenta");
        noFill();
        strokeWeight(3);
        let lastClick = mouseClicks[mouseClicks.length - 1];
        lastClick = [lastClick[0], lastClick[1] - BOARD_Y_OFFSET];
        const [x, y] = mousePositionToTileScreenLocation(lastClick, TILE_HEIGHT, BOARD_Y_OFFSET);
        rect(x, y, TILE_HEIGHT, TILE_HEIGHT);
    }
}

export { Board };
