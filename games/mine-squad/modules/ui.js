class UI {
    constructor(width, height, boardHeight) {
        this.width = width;
        this.height = height;
        this.scoreboardHeight = this.height - (this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.BOARD_Y_OFFSET);
        this.minesLeftBox = Math.floor(this.scoreboardHeight / 2);
        this.minesLeftBoxX = this.TILES_PER_ROW * this.TILE_HEIGHT - (this.minesLeftBox + this.minesLeftBox / 2) - 64;
        this.minesLeftBoxY = this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.minesLeftBox / 2 + this.BOARD_Y_OFFSET;
        this.flagsPlacedBoxX = this.TILES_PER_ROW * this.TILE_HEIGHT - (this.minesLeftBox + this.minesLeftBox / 2);
        this.flagsPlacedBoxY = this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.minesLeftBox / 2 + this.BOARD_Y_OFFSET;
    }
    drawDashboard() {
        setColor("black");
        strokeWeight(1);
        rect(
            4,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT + 4 + this.BOARD_Y_OFFSET,
            this.width - 8,
            this.scoreboardHeight - 8
        );
        this.drawHiddenTiles();
        this.drawFlagsPlaced();
        this.drawSquads();
        this.drawScore();
        this.drawTimer();
    }

    drawHiddenTiles() {
        noStroke();
        fill("gray");
        rect(this.minesLeftBoxX, this.minesLeftBoxY, this.minesLeftBox * 2, this.minesLeftBox);
        fill("red");
        textAlign(CENTER);
        textSize(24);
        if (this.currentState != this.GAME_STATE.GAME_OVER) {
            text(
                "" + this.getNumHiddenTiles(),
                this.minesLeftBoxX + this.minesLeftBox,
                this.minesLeftBoxY + this.minesLeftBox / 2 + 2
            );
        } else {
            text("X", this.minesLeftBoxX + this.minesLeftBox, this.minesLeftBoxY + this.minesLeftBox / 2 + 2);
        }
    }

    drawFlagsPlaced() {
        fill("gray");
        rect(this.flagsPlacedBoxX, this.flagsPlacedBoxY, this.minesLeftBox * 2, this.minesLeftBox);
        fill("red");
        textAlign(CENTER);
        textSize(24);
        if (this.currentState != this.GAME_STATE.GAME_OVER) {
            text(
                "" + this.MAX_MINES - this.flaggedTiles,
                this.flagsPlacedBoxX + this.minesLeftBox,
                this.flagsPlacedBoxY + this.minesLeftBox / 2 + 2
            );
        } else {
            text("X", this.flagsPlacedBoxX + this.minesLeftBox, this.flagsPlacedBoxY + this.minesLeftBox / 2 + 2);
        }
    }

    drawSquads() {
        fill("white");
        noStroke();
        textAlign(CENTER);
        textSize(24);
        text(
            "SQUADS",
            72,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.scoreboardHeight / 2 + 2 + this.BOARD_Y_OFFSET
        );
        fill("gray");
        for (let i = 0; i < this.MAX_SQUADS; i++) {
            if (i + 1 > this.MAX_SQUADS - this.squadCount) {
                fill("SpringGreen");
            }
            if (i === this.MAX_SQUADS - this.squadCount) {
                if (keyIsDown(SHIFT) && frameCount % 30 > 15) {
                    fill("Green");
                } else if (!keyIsDown(SHIFT) && frameCount % 60 > 30) {
                    fill("Green");
                }
            }
            ellipse(
                this.TILE_HEIGHT * 1.5 + i * (this.TILE_HEIGHT * 2) + 120,
                this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.scoreboardHeight / 2 + this.BOARD_Y_OFFSET,
                this.BOMB_HEIGHT,
                this.BOMB_HEIGHT
            );
        }
    }

    drawScore() {
        fill("white");
        text(
            "" + this.score,
            this.width / 2,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.scoreboardHeight / 2 + 2 + this.BOARD_Y_OFFSET
        );
    }

    drawTimer() {
        fill("white");
        text(
            this.getElapsedTimeString(),
            this.width * 0.75,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.scoreboardHeight / 2 + 2 + this.BOARD_Y_OFFSET
        );
    }

    showHelp() {
        stroke("black");
        strokeWeight(3);
        fill("gray");
        rect(this.width / 2 - 200, 30, 400, 425);
        noStroke();
        fill("black");
        text("Hold shift to use bomb squad!", this.width / 2, 70);
    }

    drawCrosshair() {
        setColor("red");
        noFill();
        strokeWeight(1);
        let crosshairDiameter = 10;
        if (keyIsDown(SHIFT)) crosshairDiameter *= 10;
        ellipse(mouseX, mouseY, crosshairDiameter, crosshairDiameter);
        setColor("black");
        line(mouseX - 10, mouseY, mouseX + 10, mouseY);
        line(mouseX, mouseY - 10, mouseX, mouseY + 10);
    }
}

export { UI };
