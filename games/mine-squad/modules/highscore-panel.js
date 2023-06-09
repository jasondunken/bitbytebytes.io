import { Vec } from "./vec.js";

class HighScorePanel {
    WIDTH = 400;
    HEIGHT = 425;
    position = new Vec();
    MAX_SCORES = 10;
    stats = {};
    highScores = [];
    show = false;

    constructor(width, height, score, winner, time) {
        this.position.x = width / 2 - this.WIDTH / 2;
        this.position.y = height / 2 - this.HEIGHT / 2;
        this.score = score;
        this.winner = winner;

        this.stats = this.getGameStats(winner);
        this.highScores = this.getHighScores(score, time);
    }

    getHighScores(score, winner, time) {
        let gameScores = this.getLocalStorageItemAsObj("minesquad");
        if (!gameScores) {
            gameScores = [];
        }

        const scoreDate = Date.now();
        gameScores.push({
            scoreDate,
            score: score,
            winner: winner,
            time: time,
        });

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
        localStorage.setItem("minesquad", JSON.stringify(gameScores));
        return gameScores;
    }

    getGameStats(winner) {
        let gameStats = this.getLocalStorageItemAsObj("minesquad.stats");
        if (!gameStats) {
            gameStats = { wins: 0, losses: 0 };
        }

        if (winner) {
            gameStats.wins++;
        } else {
            gameStats.losses++;
        }
        localStorage.setItem("minesquad.stats", JSON.stringify(gameStats));
        return gameStats;
    }

    getWinRate() {
        if (this.stats) {
            if (this.stats.wins <= 0) {
                return 0;
            } else if (this.stats.losses <= 0) {
                return 100;
            } else {
                return (
                    (this.stats.wins / (this.stats.wins + this.stats.losses)) *
                    100
                ).toFixed(2);
            }
        } else return 0;
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
        textSize(32);
        textAlign(CENTER);
        if (this.winner) {
            fill("green");
            text("You Win!", this.position.x + this.WIDTH / 2, 60);
        } else {
            fill("red");
            text("Game Over!", this.position.x + this.WIDTH / 2, 60);
        }

        fill("black");
        textSize(16);
        text(
            `wins ${this.stats.wins} - losses ${
                this.stats.losses
            } - win rate ${this.getWinRate()}%`,
            this.position.x + this.WIDTH / 2,
            100
        );

        textSize(18);
        this.highScores.forEach((score, i) => {
            if (i < this.MAX_SCORES) {
                if (score.score == this.score && frameCount % 60 > 30) {
                    fill("red");
                } else fill("black");
                textAlign(LEFT);
                text(
                    new Date(+score.scoreDate).toLocaleDateString(),
                    this.position.x + 32,
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

        fill("black");
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
