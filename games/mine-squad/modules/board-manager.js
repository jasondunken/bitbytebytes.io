import { BoardBuilder } from "./board-builder.js";
import * as utils from "./utils.js";
import { Vec } from "../../modules/math/vec.js";
import { GAME_STATE } from "./game-state.js";
import { ScoreEffect, BonusEffect, Explosion } from "./visual-effects.js";
import { LayerManager } from "../../modules/graphics/layer-manager.js";

class BoardManager {
    TILE_HEIGHT = 30;
    HALF_TILE = Math.floor(this.TILE_HEIGHT / 2);
    BOMB_HEIGHT = this.TILE_HEIGHT * 0.7;

    constructor(mineSquad, sprites) {
        this.mineSquad = mineSquad;
        this.bounds = mineSquad.boardBounds;
        this.sprites = sprites;
        this.boardBuilder = new BoardBuilder(this.bounds);
    }

    generateBoard(config) {
        this.completed = false;
        this.winner = false;
        this.board = this.boardBuilder.generateBoard(config);
        const width = config.wTiles * this.TILE_HEIGHT;
        const height = config.hTiles * this.TILE_HEIGHT;
        this.boardBounds = {
            pos: new Vec(
                this.bounds.pos.x + (this.bounds.width / 2 - width / 2),
                this.bounds.pos.y + (this.bounds.height / 2 - height / 2)
            ),
            width,
            height,
        };
    }

    isOnBoard(coords) {
        if (
            coords.x > this.boardBounds.pos.x &&
            coords.x < this.boardBounds.pos.x + this.boardBounds.width &&
            coords.y > this.boardBounds.pos.y &&
            coords.y < this.boardBounds.pos.y + this.boardBounds.height
        ) {
            return true;
        }
        return false;
    }

    getTile(coords) {
        const index = this.getIndex(coords);
        return this.getTileByIndex(index);
    }

    getIndex(coords) {
        if (this.isOnBoard(coords)) {
            return utils.screenPositionToTileIndex(
                coords,
                this.TILE_HEIGHT,
                this.boardBounds
            );
        }
        return null;
    }

    getTileByIndex(index) {
        if (index >= 0 && index < this.board.tiles.length) {
            return this.board.tiles[index];
        }
        return null;
    }

    getUiData() {
        let totalTiles = 0;
        let hidden = 0;
        let mines = 0;
        let flags = 0;
        let totalTileValue = 0;
        this.board.tiles.forEach((tile) => {
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
        this.board.tiles.forEach((tile) => {
            if (tile.flagged) count++;
        });
        return count;
    }

    update() {}

    checkTile(tile, tileIndex) {
        if (tile.bomb?.live) {
            tile.hidden = false;
            const position = utils.tileIndexToTileCenter(
                tileIndex,
                this.TILE_HEIGHT,
                this.boardBounds
            );
            const explosionSound = new Audio();
            explosionSound.src = "./mine-squad/res/snd/explosion.wav";
            explosionSound.play();
            LayerManager.AddObject(new Explosion(position));
            this.completed = true;
            this.winner = false;
        } else {
            this.uncover(tileIndex, []);
            this.checkForWin();
        }
    }

    uncover(tileIndex, checkedTiles) {
        const tile = this.getTileByIndex(tileIndex);
        if (!tile) return;

        tile.hidden = false;
        const tileScore = tile.value * this.mineSquad.TILE_MULTIPLIER;
        this.mineSquad.score += tileScore;
        if (tile.value > 0) {
            this.addScoreEffect(tile, tileScore);
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
        if (tile.bomb) {
            tile.bomb.live = false;
            this.mineSquad.score += this.mineSquad.DEFUSE_BONUS;
            this.addBonusEffect(tile, "green");
        } else if (tile.value > 0) {
            this.mineSquad.score += tile.value * this.mineSquad.DEFUSE_BONUS;
            this.addBonusEffect(tile, "blue");
        }

        const defuseArea = this.getDefuseAreaTiles(tileIndex);

        for (let i = 0; i < defuseArea.length; i++) {
            const tile = this.getTileByIndex(defuseArea[i]);
            if (tile && tile.hidden) {
                tile.hidden = false;
                this.mineSquad.score +=
                    tile.value * this.mineSquad.DEFUSE_BONUS;
                if (tile.bomb) {
                    tile.bomb.live = false;
                    this.mineSquad.score += this.mineSquad.DEFUSE_BONUS;
                    this.addBonusEffect(tile, "blue");
                }
            }
        }
        this.checkForWin();
    }

    addScoreEffect(tile, score) {
        const tileIndex = this.board.tiles.indexOf(tile);
        const position = utils.tileIndexToTileCenter(
            tileIndex,
            this.TILE_HEIGHT,
            this.boardBounds
        );
        LayerManager.AddObject(new ScoreEffect(position, score, tile.value));
    }

    addBonusEffect(tile, color) {
        const tileIndex = this.board.tiles.indexOf(tile);
        const position = utils.tileIndexToTileCenter(
            tileIndex,
            this.TILE_HEIGHT,
            this.boardBounds
        );
        LayerManager.AddObject(
            new BonusEffect(position, this.mineSquad.DEFUSE_BONUS, color)
        );
    }

    getDefuseAreaTiles(tileIndex) {
        let defuseArea = this.boardBuilder.getNeighbors(tileIndex);
        this.boardBuilder.isValidNeighbor(tileIndex, tileIndex + 2)
            ? defuseArea.push(tileIndex + 2)
            : undefined;
        this.boardBuilder.isValidNeighbor(tileIndex, tileIndex - 2)
            ? defuseArea.push(tileIndex - 2)
            : undefined;
        defuseArea.push(tileIndex + this.board.wTiles * 2);
        defuseArea.push(tileIndex - this.board.wTiles * 2);
        return defuseArea;
    }

    checkForWin() {
        let isWinner = true;
        this.board.tiles.forEach((tile) => {
            if (tile.hidden && !tile.bomb) isWinner = false;
        });
        this.completed = isWinner;
        this.winner = isWinner;
    }

    calculateLevelScore(level, tileBonus) {
        let score = 0;
        for (let i = 0; i < this.board.tiles.length; i++) {
            const tile = this.board.tiles[i];
            if (tile.hidden === true && tile.bomb) {
                score += tileBonus * tile.value * level;
            }
        }
        return score;
    }

    calculateFinalScore(level, tileBonus) {
        let score = 0;
        for (let i = 0; i < this.board.tiles.length; i++) {
            const tile = this.board.tiles[i];
            if (tile.hidden === false) {
                score += tileBonus * tile.value * level;
            }
        }
        return score;
    }

    draw(cursorPos) {
        this.drawBoard();
        if (this.isOnBoard(cursorPos) && keyIsDown(SHIFT)) {
            this.drawDefuseArea();
        }
        this.drawCursor();
    }

    drawBoard(gameState) {
        for (let i = 0; i < this.board.tiles.length; i++) {
            const tile = this.board.tiles[i];
            const position = utils.tileIndexToTileTopLeft(
                i,
                this.TILE_HEIGHT,
                this.boardBounds
            );

            if (tile.hidden === false) {
                utils.setColor("gray");
                stroke("darkgray");
                strokeWeight(1);
                rect(
                    position.x,
                    position.y,
                    this.TILE_HEIGHT,
                    this.TILE_HEIGHT
                );
                if (!tile.bomb && tile.value !== 0) {
                    utils.setColor(utils.valueToColor(tile.value));
                    textAlign(CENTER, CENTER);
                    textSize(24);
                    text(
                        tile.value,
                        position.x + this.HALF_TILE,
                        position.y + this.TILE_HEIGHT * 0.6
                    );
                    utils.setColor("black");
                }

                if (tile.bomb) {
                    this.drawBomb(tile.bomb, position);
                }
            } else {
                utils.setColor("green");
                stroke("black");
                strokeWeight(1);
                rect(
                    position.x,
                    position.y,
                    this.TILE_HEIGHT - 1,
                    this.TILE_HEIGHT - 1
                );
                if (tile.flagged) {
                    this.drawFlag(position);
                }
            }

            // when game over mark flags correct/incorrect, show bombs
            if (gameState === GAME_STATE.GAME_OVER) {
                if (tile.flagged === true) {
                    this.markFlag(tile.bomb);
                } else if (this.tile.bomb) {
                    this.drawBomb(new Vec(this.tileIndexX, this.tileIndexY));
                }
            }
        }
    }

    drawFlag(position) {
        const flag = this.sprites["flag"];
        image(flag, position.x, position.y, 30, 30);
    }

    drawBomb(bomb, position) {
        const sprite = bomb.live
            ? this.sprites["bomb"]
            : this.sprites["bomb_defused"];
        image(
            sprite,
            position.x + 2,
            position.y + 2,
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
        const coords = new Vec(mouseX, mouseY);
        if (this.isOnBoard(coords)) {
            const tileCenter = utils.screenPositionToTileCenter(
                coords,
                this.TILE_HEIGHT,
                this.boardBounds
            );
            stroke("yellow");
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

    drawDefuseArea() {
        const pos = new Vec(mouseX, mouseY);
        const tileIndex = this.getIndex(pos);
        const area = this.getDefuseAreaTiles(tileIndex);
        stroke("blue");
        strokeWeight(3);
        noFill();
        for (const tile of area) {
            if (this.getTileByIndex(tile)?.hidden) {
                const tl = utils.tileIndexToTileTopLeft(
                    tile,
                    this.TILE_HEIGHT,
                    this.boardBounds
                );
                rect(tl.x, tl.y, 30, 30);
            }
        }
    }

    drawMousePath(mouseClickCoords) {
        stroke("orange");
        strokeWeight(2);
        for (let i = 0; i < mouseClickCoords.length - 1; i++) {
            line(
                mouseClickCoords[i].x,
                mouseClickCoords[i].y,
                mouseClickCoords[i + 1].x,
                mouseClickCoords[i + 1].y
            );
        }

        stroke("green");
        noFill();
        strokeWeight(3);
        let firstClick = mouseClickCoords[0];
        const firstClickCenter = utils.screenPositionToTileTopLeft(
            firstClick,
            this.TILE_HEIGHT,
            this.boardBounds
        );
        rect(
            firstClickCenter.x,
            firstClickCenter.y,
            this.TILE_HEIGHT,
            this.TILE_HEIGHT
        );

        stroke("magenta");
        noFill();
        strokeWeight(3);
        let lastClick = mouseClickCoords[mouseClickCoords.length - 1];
        const lastClickCenter = utils.screenPositionToTileTopLeft(
            lastClick,
            this.TILE_HEIGHT,
            this.boardBounds
        );
        rect(
            lastClickCenter.x,
            lastClickCenter.y,
            this.TILE_HEIGHT,
            this.TILE_HEIGHT
        );
    }
}

export { BoardManager };
