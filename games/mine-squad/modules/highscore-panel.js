import { Vec } from "../../modules/math/vec.js";

class HighScorePanel {
    WIDTH = 400;
    HEIGHT = 425;

    DEFAULT_TEXT_SIZE = 16;
    TITLE_SIZE = 32;
    SCORE_SIZE = 18;

    position = new Vec();
    MAX_SCORES = 200;
    MAX_DISPLAY_SCORES = 10;
    stats = {};
    highScores = [];
    show = false;

    score = null;

    constructor(width, height, score, level, time) {
        this.position.x = width / 2 - this.WIDTH / 2;
        this.position.y = height / 2 - this.HEIGHT / 2;
        this.highScores = this.getHighScores(score, level, time);
    }

    getHighScores(score, level, time) {
        let gameScores = this.getLocalStorageItemAsObj("minesquad");
        if (!gameScores) {
            gameScores = [];
        }

        const scoreDate = Date.now();
        this.score = {
            scoreDate,
            score,
            level,
            time,
        };
        gameScores.push(this.score);

        if (gameScores.length > this.MAX_SCORES) {
            let lowestScore = gameScores[0];
            for (let i = 1; i < gameScores.length; i++) {
                if (gameScores[i].score < lowestScore.score) {
                    lowestScore = gameScores[i];
                }
            }
            gameScores.splice(gameScores.indexOf(lowestScore), 1);
        }
        gameScores = gameScores.sort((a, b) => b.score - a.score);

        const rank = gameScores.indexOf(this.score) + 1;
        this.score.num = rank ? rank : `>${this.MAX_SCORES}`;

        localStorage.setItem("minesquad", JSON.stringify(gameScores));
        return gameScores;
    }

    getLocalStorageItemAsObj(item) {
        const itemJson = localStorage.getItem(item);
        if (itemJson) {
            return JSON.parse(itemJson);
        } else {
            return undefined;
        }
    }

    isShowing() {
        return this.show;
    }

    showPanel() {
        this.show = true;
    }

    hidePanel() {
        this.show = false;
    }

    draw() {
        stroke("black");
        strokeWeight(3);
        fill("gray");
        rect(this.position.x, this.position.y, this.WIDTH, this.HEIGHT);

        noStroke();
        textSize(this.TITLE_SIZE);
        textAlign(CENTER);

        fill("red");
        text("Game Over!", this.position.x + this.WIDTH / 2, 60);

        fill("black");
        textSize(this.DEFAULT_TEXT_SIZE);
        text("High Scores", this.position.x + this.WIDTH / 2, 100);

        textSize(this.SCORE_SIZE);
        this.highScores.forEach((score, i) => {
            if (i < this.MAX_DISPLAY_SCORES) {
                if (score.score == this.score.score && frameCount % 40 < 30) {
                    fill("green");
                } else fill("black");
                textAlign(LEFT);
                text(
                    new Date(+score.scoreDate).toLocaleDateString(),
                    this.position.x + 32,
                    135 + i * 24
                );
                textAlign(CENTER);
                text(
                    `Level ${score.level}`,
                    this.position.x + this.WIDTH / 2,
                    135 + i * 24
                );
                textAlign(RIGHT);
                text(
                    score.score,
                    this.position.x + this.WIDTH - 32,
                    135 + i * 24
                );
            }
        });

        if (frameCount % 40 < 30) {
            fill("red");
            textSize(this.SCORE_SIZE);
            textAlign(LEFT);
            text(this.score.num, this.position.x + 32, 380);
            textAlign(CENTER);
            text(
                `Level ${this.score.level}`,
                this.position.x + this.WIDTH / 2,
                380
            );
            textAlign(RIGHT);
            text(this.score.score, this.position.x + this.WIDTH - 32, 380);
        }

        fill("black");
        noStroke();
        textSize(this.DEFAULT_TEXT_SIZE);
        textAlign(CENTER);
        if (frameCount % 120 > 60) {
            text("Click to restart", this.position.x + this.WIDTH / 2, 430);
        } else {
            text(
                "Space to hide high scores",
                this.position.x + this.WIDTH / 2,
                430
            );
        }
    }
}

export { HighScorePanel };
