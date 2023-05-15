import { Vec2d } from "./math.js";
import { BonusSquadEffect } from "./visual-effects.js";
import { GAME_STATE } from "./game-state.js";
import { getElapsedTimeString } from "./utils.js";

class UI {
    P5_TEXT_ISNT_REALLY_CENTERED = 5;
    UI_HEIGHT = 50;
    UI_WIDTH = 952;

    UI_MARGIN = 4;

    UI_BOX_Y = 18;

    UI_BOX_HEIGHT = 28;

    UI_LABEL_MARGIN_TOP = 4;
    UI_LABEL_MARGIN_LEFT = 4;

    UI_VALUE_CENTER_Y = 16;

    LEVEL_BOX_WIDTH = 64;
    SCORE_BOX_WIDTH = 128;
    SQUADS_BOX_WIDTH = 128;
    TIME_BOX_WIDTH = 96;
    HIDDEN_BOX_WIDTH = 96;
    FLAGS_BOX_WIDTH = 96;

    LEVEL_BOX_X = 4;
    SCORE_BOX_X = 72;
    SQUADS_BOX_X = 412;
    TIME_BOX_X = 652;
    HIDDEN_BOX_X = 752;
    FLAGS_BOX_X = 852;

    SQUADS_SPACING = 36;

    constructor(mineSquad, position) {
        this.mineSquad = mineSquad;
        this.position = position || new Vec2d(4, 487);
    }

    addSquad() {
        const position = new Vec2d(
            this.TILE_HEIGHT * 1.5 +
                (this.mineSquad.MAX_SQUADS - this.gameData.squadCount) * (this.TILE_HEIGHT * 2) +
                120,
            this.TILES_PER_COLUMN * this.TILE_HEIGHT + this.scoreboardHeight / 2 + this.BOARD_Y_OFFSET
        );
        this.mineSquad.visualEffects.add(new BonusSquadEffect(position));
    }

    update(gameData) {
        this.gameData = gameData;
        //console.log(gameData);
    }

    draw() {
        stroke("black");
        strokeWeight(1);
        fill("black");
        rect(this.position.x, this.position.y, this.UI_WIDTH, this.UI_HEIGHT);
        this.drawLevelBox();
        this.drawScoreBox();
        this.drawSquadsBox();
        this.drawTimerBox();
        this.drawFlagsBox();
        this.drawTilesBox();
    }

    drawLevelBox() {
        noStroke();
        fill("white");
        textSize(14);
        textAlign(LEFT, BOTTOM);
        text("LEVEL", this.position.x + this.LEVEL_BOX_X, this.position.y + this.UI_BOX_Y);
        fill(color(44, 44, 44));
        rect(
            this.position.x + this.LEVEL_BOX_X,
            this.position.y + this.UI_BOX_Y,
            this.LEVEL_BOX_WIDTH,
            this.UI_BOX_HEIGHT
        );
        fill("white");
        textSize(18);
        textAlign(CENTER, CENTER);
        text(
            "" + this.gameData.level,
            this.LEVEL_BOX_X + this.LEVEL_BOX_WIDTH / 2 + this.P5_TEXT_ISNT_REALLY_CENTERED,
            this.position.y + this.UI_BOX_Y + this.UI_VALUE_CENTER_Y
        );
    }

    drawScoreBox() {
        noStroke();
        fill("white");
        textSize(14);
        textAlign(LEFT, BOTTOM);
        text("SCORE", this.position.x + this.SCORE_BOX_X, this.position.y + this.UI_BOX_Y);
        fill(color(44, 44, 44));
        rect(
            this.position.x + this.SCORE_BOX_X,
            this.position.y + this.UI_BOX_Y,
            this.SCORE_BOX_WIDTH,
            this.UI_BOX_HEIGHT
        );
        fill("white");
        textSize(18);
        textAlign(CENTER, CENTER);
        text(
            "" + this.gameData.score,
            this.SCORE_BOX_X + this.SCORE_BOX_WIDTH / 2 + this.P5_TEXT_ISNT_REALLY_CENTERED,
            this.position.y + this.UI_BOX_Y + this.UI_VALUE_CENTER_Y
        );
    }

    drawSquadsBox() {
        noStroke();
        fill("white");
        textSize(14);
        textAlign(LEFT, BOTTOM);
        text("SQUADS", this.position.x + this.SQUADS_BOX_X, this.position.y + this.UI_BOX_Y);
        fill(color(44, 44, 44));
        rect(
            this.position.x + this.SQUADS_BOX_X,
            this.position.y + this.UI_BOX_Y,
            this.SQUADS_BOX_WIDTH,
            this.UI_BOX_HEIGHT
        );
        fill("gray");
        for (let i = 0; i < this.mineSquad.MAX_SQUADS; i++) {
            if (i + 1 > this.mineSquad.MAX_SQUADS - this.gameData.squads) {
                fill("SpringGreen");
            }
            if (i === this.mineSquad.MAX_SQUADS - this.gameData.squads) {
                if (keyIsDown(SHIFT) && frameCount % 30 > 15) {
                    fill("Green");
                } else if (!keyIsDown(SHIFT) && frameCount % 60 > 30) {
                    fill("Green");
                }
            }
            const xOff = this.SQUADS_SPACING * (i - 1);
            ellipse(
                this.position.x + this.SQUADS_BOX_X + this.SCORE_BOX_WIDTH / 2 + xOff,
                this.position.y + this.UI_BOX_Y + this.UI_VALUE_CENTER_Y,
                12,
                12
            );
        }
    }

    drawTimerBox() {
        noStroke();
        fill("white");
        textSize(14);
        textAlign(LEFT, BOTTOM);
        text("TIME", this.position.x + this.TIME_BOX_X, this.position.y + this.UI_BOX_Y);
        fill(color(44, 44, 44));
        rect(
            this.position.x + this.TIME_BOX_X,
            this.position.y + this.UI_BOX_Y,
            this.TIME_BOX_WIDTH,
            this.UI_BOX_HEIGHT
        );
        fill("white");
        textSize(18);
        textAlign(CENTER, CENTER);
        text(
            "" + getElapsedTimeString(this.gameData.time),
            this.TIME_BOX_X + this.TIME_BOX_WIDTH / 2 + this.P5_TEXT_ISNT_REALLY_CENTERED,
            this.position.y + this.UI_BOX_Y + this.UI_VALUE_CENTER_Y
        );
    }

    drawTilesBox() {
        noStroke();
        fill("white");
        textSize(14);
        textAlign(LEFT, BOTTOM);
        text("HIDDEN", this.position.x + this.HIDDEN_BOX_X, this.position.y + this.UI_BOX_Y);
        fill(color(44, 44, 44));
        rect(
            this.position.x + this.HIDDEN_BOX_X,
            this.position.y + this.UI_BOX_Y,
            this.HIDDEN_BOX_WIDTH,
            this.UI_BOX_HEIGHT
        );
        textSize(18);
        textAlign(CENTER, CENTER);
        if (this.mineSquad.currentState != GAME_STATE.GAME_OVER) {
            fill("red");
            text(
                "" + this.gameData.hidden,
                this.HIDDEN_BOX_X + this.HIDDEN_BOX_WIDTH / 2 + this.P5_TEXT_ISNT_REALLY_CENTERED,
                this.position.y + this.UI_BOX_Y + this.UI_VALUE_CENTER_Y
            );
        } else {
            fill("black");
            text(
                "X",
                this.HIDDEN_BOX_X + this.HIDDEN_BOX_WIDTH / 2 + this.P5_TEXT_ISNT_REALLY_CENTERED,
                this.position.y + this.UI_BOX_Y + this.UI_VALUE_CENTER_Y
            );
        }
    }

    drawFlagsBox() {
        noStroke();
        fill("white");
        textSize(14);
        textAlign(LEFT, BOTTOM);
        text("FLAGS", this.position.x + this.FLAGS_BOX_X, this.position.y + this.UI_BOX_Y);
        fill(color(44, 44, 44));
        rect(
            this.position.x + this.FLAGS_BOX_X,
            this.position.y + this.UI_BOX_Y,
            this.HIDDEN_BOX_WIDTH,
            this.UI_BOX_HEIGHT
        );
        textSize(18);
        textAlign(CENTER, CENTER);
        if (this.mineSquad.currentState != GAME_STATE.GAME_OVER) {
            fill("yellow");
            text(
                "" + this.gameData.flags,
                this.FLAGS_BOX_X + this.FLAGS_BOX_WIDTH / 2 + this.P5_TEXT_ISNT_REALLY_CENTERED,
                this.position.y + this.UI_BOX_Y + this.UI_VALUE_CENTER_Y
            );
        } else {
            fill("black");
            text(
                "X",
                this.FLAGS_BOX_X + this.FLAGS_BOX_WIDTH / 2 + this.P5_TEXT_ISNT_REALLY_CENTERED,
                this.position.y + this.UI_BOX_Y + this.UI_VALUE_CENTER_Y
            );
        }
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
        stroke("red");
        strokeWeight(1);
        noFill();
        let crosshairDiameter = 10;
        if (keyIsDown(SHIFT)) crosshairDiameter *= 10;
        ellipse(mouseX, mouseY, crosshairDiameter, crosshairDiameter);
        stroke("black");
        line(mouseX - 10, mouseY, mouseX + 10, mouseY);
        line(mouseX, mouseY - 10, mouseX, mouseY + 10);
    }
}

export { UI };
