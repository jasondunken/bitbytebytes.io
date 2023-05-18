import { BoardBuilder } from "./board-builder.js";
import * as utils from "./utils.js";
import { Vec2d } from "./math.js";
import { GAME_STATE } from "./game-state.js";
import { ScoreEffect, BonusEffect, Explosion } from "./visual-effects.js";

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
        this.boardConfig = {
            tileSize: this.TILE_HEIGHT,
            tilesPerRow: this.TILES_PER_ROW,
            xOffset: this.BOARD_X_OFFSET,
            yOffset: this.BOARD_Y_OFFSET,
        };
    }

    generateBoard(numMines) {
        this.completed = false;
        this.winner = false;
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
        return utils.screenPositionToTileIndex(coords, this.boardConfig);
    }

    getTile(index) {
        return this.board[index];
    }

    getUiData() {
        let totalTiles = 0;
        let hidden = 0;
        let mines = 0;
        let flags = 0;
        let totalTileValue = 0;
        this.board.forEach((tile) => {
            totalTiles++;
            if (tile.hidden) hidden++;
            if (tile.bomb && tile.bomb.live === false) hidden++;
            if (tile.bomb) mines++;
            if (tile.flagged) flags++;
            totalTileValue += tile.value;
        });
        return { totalTiles, hidden, mines, flags, totalTileValue };
    }

    getFlagCount() {
        let count = 0;
        this.board.forEach((tile) => {
            if (tile.flagged) count++;
        });
        return count;
    }

    update() {}

    checkTile(tile, tileIndex) {
        if (tile.bomb?.live) {
            tile.hidden = false;
            const position = utils.tileIndexToTileCenter(tileIndex, this.boardConfig);
            this.mineSquad.addToLayers(new Explosion(position));
            this.completed = true;
            this.winner = false;
        } else {
            this.uncover(tileIndex, []);
            this.checkForWin();
        }
    }

    uncover(tileIndex, checkedTiles) {
        const tile = this.getTile(tileIndex);
        tile.hidden = false;
        const tileScore = tile.value * 10;
        this.mineSquad.score += tileScore;
        if (tile.value > 0) {
            const position = utils.tileIndexToTileCenter(tileIndex, this.boardConfig);
            this.mineSquad.addToLayers(new ScoreEffect(position, tileScore, tile.value));
        }
        // if tile.value is zero and not already checked, uncover all the tiles around it
        if (tile.value === 0 && !checkedTiles.includes(tileIndex)) {
            checkedTiles.push(tileIndex);
            let neighbors = this.boardBuilder.getNeighbors(tileIndex);
            for (let i = 0; i < neighbors.length; i++) {
                this.uncover(neighbors[i], checkedTiles);
            }
        }
    }

    defuseWithinRadius(tile, tileIndex) {
        tile.hidden = false;
        const position = utils.tileIndexToTileCenter(tileIndex, this.boardConfig);
        if (tile.bomb) {
            tile.bomb.live = false;
            this.mineSquad.score += this.mineSquad.DEFUSE_BONUS;
            this.mineSquad.addToLayers(new BonusEffect(position, this.mineSquad.DEFUSE_BONUS, "green", 2));
        } else if (tile.value > 0) {
            this.mineSquad.score += tile.value * this.mineSquad.DEFUSE_BONUS;
            this.mineSquad.addToLayers(new BonusEffect(position, tile.value * this.mineSquad.DEFUSE_BONUS, "blue", 2));
        }

        const defuseArea = this.boardBuilder.getNeighbors(tileIndex);
        this.boardBuilder.isValidNeighbor(tileIndex, tileIndex + 2) ? defuseArea.push(tileIndex + 2) : undefined;
        this.boardBuilder.isValidNeighbor(tileIndex, tileIndex - 2) ? defuseArea.push(tileIndex - 2) : undefined;
        defuseArea.push(tileIndex + this.TILES_PER_ROW * 2);
        defuseArea.push(tileIndex - this.TILES_PER_ROW * 2);

        for (let i = 0; i < defuseArea.length; i++) {
            const tile = this.getTile(defuseArea[i]);
            if (tile && tile.hidden) {
                tile.hidden = false;
                this.mineSquad.score += tile.value * this.mineSquad.TILE_BONUS;
                if (tile.bomb) {
                    tile.bomb.live = false;
                    this.mineSquad.score += this.mineSquad.DEFUSE_BONUS;
                    const position = utils.tileIndexToTileCenter(defuseArea[i], this.boardConfig);
                    this.mineSquad.addToLayers(new BonusEffect(position, this.mineSquad.DEFUSE_BONUS));
                }
            }
        }
        this.checkForWin();
    }

    checkForWin() {
        let isWinner = true;
        this.board.forEach((tile) => {
            if (tile.hidden && !tile.bomb) isWinner = false;
        });
        this.completed = isWinner;
        this.winner = isWinner;
    }

    calculateFinalScore(tileBonus, flagPenalty) {
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
            const tile = this.board[i];
            const position = utils.tileIndexToTileTopLeft(i, this.boardConfig);

            if (tile.hidden === false) {
                utils.setColor("gray");
                stroke("darkgray");
                strokeWeight(1);
                rect(position.x, position.y, this.TILE_HEIGHT, this.TILE_HEIGHT);
                if (!tile.bomb && tile.value !== 0) {
                    utils.setColor(utils.valueToColor(tile.value));
                    textAlign(CENTER, CENTER);
                    textSize(24);
                    text(tile.value, position.x + this.HALF_TILE, position.y + this.TILE_HEIGHT * 0.6);
                    utils.setColor("black");
                }

                if (tile.bomb) {
                    this.drawBomb(tile.bomb, position);
                }
            } else {
                utils.setColor("green");
                stroke("black");
                strokeWeight(1);
                rect(position.x, position.y, this.TILE_HEIGHT - 1, this.TILE_HEIGHT - 1);
                if (tile.flagged) {
                    this.drawFlag(position);
                }
            }

            // when game over mark flags correct/incorrect, show bombs
            if (gameState === GAME_STATE.GAME_OVER) {
                if (tile.flagged === true) {
                    this.markFlag(tile.bomb);
                } else if (this.tile.bomb) {
                    this.drawBomb(new Vec2d(this.tileIndexX, this.tileIndexY));
                }
            }
        }
    }

    drawFlag(position) {
        utils.setColor("yellow");
        strokeWeight(1);
        ellipse(position.x + this.HALF_TILE, position.y + this.HALF_TILE, this.BOMB_HEIGHT, this.BOMB_HEIGHT);
    }

    drawBomb(bomb, position) {
        const sprite = bomb.live ? this.sprites["bomb"] : this.sprites["bomb_defused"];
        image(sprite, position.x + 2, position.y + 2, this.TILE_HEIGHT - 4, this.TILE_HEIGHT - 4);
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
        const coords = new Vec2d(mouseX, mouseY);
        if (this.isOnBoard(coords)) {
            const tileCenter = utils.screenPositionToTileCenter(coords, this.boardConfig);
            utils.setColor("yellow");
            strokeWeight(4);
            noFill();
            rect(
                tileCenter.x - this.TILE_HEIGHT / 2 - 1,
                tileCenter.y - this.TILE_HEIGHT / 2 - 1,
                this.TILE_HEIGHT + 2,
                this.TILE_HEIGHT + 2
            );
        }
    }

    drawMousePath(mouseClickCoords) {
        stroke("orange");
        strokeWeight(2);
        for (let i = 0; i < mouseClickCoords.length - 1; i++) {
            line(mouseClickCoords[i].x, mouseClickCoords[i].y, mouseClickCoords[i + 1].x, mouseClickCoords[i + 1].y);
        }

        stroke("green");
        noFill();
        strokeWeight(3);
        let firstClick = mouseClickCoords[0];
        const firstClickCenter = utils.screenPositionToTileTopLeft(firstClick, this.boardConfig);
        rect(firstClickCenter.x, firstClickCenter.y, this.TILE_HEIGHT, this.TILE_HEIGHT);

        stroke("magenta");
        noFill();
        strokeWeight(3);
        let lastClick = mouseClickCoords[mouseClickCoords.length - 1];
        const lastClickCenter = utils.screenPositionToTileTopLeft(lastClick, this.boardConfig);
        rect(lastClickCenter.x, lastClickCenter.y, this.TILE_HEIGHT, this.TILE_HEIGHT);
    }
}

export { Board };
