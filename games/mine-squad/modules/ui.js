import { Vec } from "../../modules/math/vec.js";
import { TextEffect } from "./visual-effects.js";
import { GAME_STATE } from "./game-state.js";
import { getElapsedTimeString } from "./utils.js";

import { LayerManager, LAYERS } from "../../modules/graphics/layer-manager.js";

class UI {
    P5_TEXT_ISNT_REALLY_CENTERED = 5;
    LABEL_SIZE = 12;
    VALUE_SIZE = 18;

    UI_HEIGHT = 50;
    UI_WIDTH = 952;

    UI_MARGIN = 4;

    UI_BOX_Y = 18;

    UI_BOX_HEIGHT = 28;

    UI_LABEL_MARGIN_TOP = 4;
    UI_LABEL_MARGIN_LEFT = 4;

    UI_VALUE_CENTER_Y = 16;

    LEVEL_BOX_WIDTH = 64;
    TIME_BOX_WIDTH = 96;
    SCORE_BOX_WIDTH = 96;
    SQUADS_BOX_WIDTH = 128;
    NEXT_BONUS_BOX_WIDTH = 96;
    HIDDEN_NEIGHBORS_BOX_WIDTH = 80;
    MINES_BOX_WIDTH = 64;
    HIDDEN_BOX_WIDTH = 64;
    FLAGS_BOX_WIDTH = 64;

    LEVEL_BOX_X = 4;
    TIME_BOX_X = 72;
    SCORE_BOX_X = 312;
    SQUADS_BOX_X = 412;
    NEXT_BONUS_BOX_X = 544;
    HIDDEN_NEIGHBORS_BOX_X = 664;
    MINES_BOX_X = 748;
    HIDDEN_BOX_X = 816;
    FLAGS_BOX_X = 884;

    SQUADS_SPACING = 36;

    CROSSHAIR_DIAMETER = 10;

    constructor(mineSquad, position) {
        this.mineSquad = mineSquad;
        this.position = position || new Vec(4, 487);
    }

    addSquad(squadCount, denied) {
        let message = "Squad Up!";
        let messageColor = "blue";
        if (denied) {
            message = "Squad Limit Reached!";
            messageColor = "red";
        }
        const position = new Vec(
            this.position.x +
                this.SQUADS_BOX_X +
                this.SQUADS_BOX_WIDTH / 2 +
                this.SQUADS_SPACING -
                (squadCount - 1) * this.SQUADS_SPACING,
            this.position.y + this.UI_BOX_Y + this.UI_VALUE_CENTER_Y
        );
        LayerManager.AddObject(
            new TextEffect(position, message, messageColor),
            LAYERS.UI
        );
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
        this.drawNextBonus();
        this.drawTimerBox();
        this.drawHiddenNeighborsBox();
        this.drawMinesBox();
        this.drawHiddenBox();
        this.drawFlagsBox();
    }

    drawLevelBox() {
        this.drawBox(
            this.LEVEL_BOX_X,
            this.LEVEL_BOX_WIDTH,
            "LEVEL",
            this.gameData.level,
            "white"
        );
    }

    drawTimerBox() {
        this.drawBox(
            this.TIME_BOX_X,
            this.TIME_BOX_WIDTH,
            "LEVEL TIME",
            getElapsedTimeString(this.gameData.time),
            "white"
        );
    }

    drawScoreBox() {
        this.drawIndicatorBox(
            this.SCORE_BOX_X,
            this.SCORE_BOX_WIDTH,
            "SCORE",
            this.gameData.score,
            "white"
        );
    }

    drawSquadsBox() {
        noStroke();
        fill("white");
        textSize(this.LABEL_SIZE);
        textAlign(LEFT, BOTTOM);
        text(
            "SQUADS",
            this.position.x + this.SQUADS_BOX_X,
            this.position.y + this.UI_BOX_Y
        );
        fill(color(44, 44, 44));
        rect(
            this.position.x + this.SQUADS_BOX_X,
            this.position.y + this.UI_BOX_Y,
            this.SQUADS_BOX_WIDTH,
            this.UI_BOX_HEIGHT
        );
        fill("gray");
        for (let i = 0; i < this.mineSquad.MAX_SQUADS; i++) {
            const xOff = this.SQUADS_SPACING * (i - 1);
            if (this.mineSquad.currentState != GAME_STATE.GAME_OVER) {
                if (i + 1 > this.mineSquad.MAX_SQUADS - this.gameData.squads) {
                    fill("SpringGreen");
                }
                if (i === this.mineSquad.MAX_SQUADS - this.gameData.squads) {
                    let fillColor = "green";
                    if (this.gameData.squads === this.mineSquad.MAX_SQUADS) {
                        if (
                            this.gameData.score >
                            this.gameData.nextBonus * 0.8
                        ) {
                            fillColor = "orange";
                        }
                        if (
                            this.gameData.score >
                            this.gameData.nextBonus * 0.9
                        ) {
                            fillColor = "red";
                        }
                    }
                    if (keyIsDown(SHIFT) && frameCount % 30 > 15) {
                        fill(fillColor);
                    } else if (!keyIsDown(SHIFT) && frameCount % 60 > 30) {
                        fill(fillColor);
                    }
                }
                ellipse(
                    this.position.x +
                        this.SQUADS_BOX_X +
                        this.SQUADS_BOX_WIDTH / 2 +
                        xOff,
                    this.position.y + this.UI_BOX_Y + this.UI_VALUE_CENTER_Y,
                    12,
                    12
                );
            } else {
                textSize(18);
                textAlign(CENTER, CENTER);
                fill("black");
                text(
                    "X",
                    this.position.x +
                        this.SQUADS_BOX_X +
                        this.SQUADS_BOX_WIDTH / 2 +
                        xOff,
                    this.position.y + this.UI_BOX_Y + this.UI_VALUE_CENTER_Y
                );
            }
        }
    }

    drawNextBonus() {
        this.drawIndicatorBox(
            this.NEXT_BONUS_BOX_X,
            this.NEXT_BONUS_BOX_WIDTH,
            "NEXT SQUAD",
            this.gameData.nextBonus,
            "white"
        );
    }

    drawHiddenNeighborsBox() {
        this.drawBox(
            this.HIDDEN_NEIGHBORS_BOX_X,
            this.HIDDEN_NEIGHBORS_BOX_WIDTH,
            "NEIGHBORS",
            this.gameData.totalHiddenNeighborCount,
            "white"
        );
    }

    drawMinesBox() {
        this.drawBox(
            this.MINES_BOX_X,
            this.MINES_BOX_WIDTH,
            "MINES",
            this.gameData.mines,
            "white"
        );
    }

    drawHiddenBox() {
        this.drawBox(
            this.HIDDEN_BOX_X,
            this.HIDDEN_BOX_WIDTH,
            "HIDDEN T",
            this.gameData.hidden,
            "red"
        );
    }

    drawFlagsBox() {
        this.drawBox(
            this.FLAGS_BOX_X,
            this.FLAGS_BOX_WIDTH,
            "FLAGS",
            this.gameData.flags,
            "yellow"
        );
    }

    drawIndicatorBox(offsetX, width, label, value, valueColor) {
        let fillColor = valueColor;
        if (
            this.gameData.squads === this.mineSquad.MAX_SQUADS &&
            frameCount % 60 > 30
        ) {
            if (this.gameData.score > this.gameData.nextBonus * 0.8) {
                fillColor = "orange";
            }
            if (this.gameData.score > this.gameData.nextBonus * 0.9) {
                fillColor = "red";
            }
        }
        this.drawBox(offsetX, width, label, value, fillColor);
    }

    drawBox(offsetX, width, label, value, valueColor) {
        noStroke();
        fill("white");
        textSize(this.LABEL_SIZE);
        textAlign(LEFT, BOTTOM);
        text(label, this.position.x + offsetX, this.position.y + this.UI_BOX_Y);
        fill(color(44, 44, 44));
        rect(
            this.position.x + offsetX,
            this.position.y + this.UI_BOX_Y,
            width,
            this.UI_BOX_HEIGHT
        );
        textSize(this.VALUE_SIZE);
        textAlign(CENTER, CENTER);
        if (this.mineSquad.currentState != GAME_STATE.GAME_OVER) {
            fill(valueColor);
            text(
                "" + value,
                offsetX + width / 2 + this.P5_TEXT_ISNT_REALLY_CENTERED,
                this.position.y + this.UI_BOX_Y + this.UI_VALUE_CENTER_Y
            );
        } else {
            fill("black");
            text(
                "X",
                offsetX + width / 2 + this.P5_TEXT_ISNT_REALLY_CENTERED,
                this.position.y + this.UI_BOX_Y + this.UI_VALUE_CENTER_Y
            );
        }
    }

    showHelp() {
        stroke("black");
        strokeWeight(3);
        fill("gray");
        rect(this.mineSquad.width / 2 - 200, 30, 400, 425);
        noStroke();
        fill("black");
        text("Hold shift to use bomb squad!", this.mineSquad.width / 2, 70);
    }

    drawCrosshair() {
        stroke("red");
        strokeWeight(1);
        noFill();
        ellipse(
            mouseX,
            mouseY,
            this.CROSSHAIR_DIAMETER,
            this.CROSSHAIR_DIAMETER
        );
        stroke("black");
        line(mouseX - 10, mouseY, mouseX + 10, mouseY);
        line(mouseX, mouseY - 10, mouseX, mouseY + 10);
    }
}

export { UI };
