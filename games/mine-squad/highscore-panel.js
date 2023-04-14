class HighScorePanel {
    MAX_NUM_HIGH_SCORES = 10;
    stats = {};
    highScores = {};
    show = false;

    constructor(width, height, score, winner, time) {
        this.width = width;
        this.height = height;
        this.score = score;
        this.winner = winner;

        this.stats = this.getGameStats(winner);
        this.highScores = this.getHighScores(score, time);
    }

    getHighScores(score, winner, time) {
        let gameScores = this.getLocalStorageItemAsObj("minesquad");
        if (!gameScores) {
            gameScores = {};
        }

        const scoreDate = Date.now();
        gameScores[scoreDate] = { score: score, winner: winner, time: time };

        let scores = Object.keys(gameScores);
        let lowestScoreKey = scores[0];
        if (scores.length > this.MAX_NUM_HIGH_SCORES) {
            let lowestScore = gameScores[lowestScoreKey];
            for (let i = 1; i < scores.length; i++) {
                if (gameScores[scores[i]].score < lowestScore.score) {
                    lowestScoreKey = scores[i];
                    lowestScore = gameScores[lowestScoreKey];
                }
            }
            delete gameScores[lowestScoreKey];
        }

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

        if (gameStats.wins <= 0) {
            gameStats.winRate = 0;
        } else if (gameStats.losses <= 0) {
            gameStats.winRate = 100;
        } else {
            gameStats.winRate = ((gameStats.wins / (gameStats.wins + gameStats.losses)) * 100).toFixed(2);
        }
        localStorage.setItem("minesquad.stats", JSON.stringify(gameStats));
        return gameStats;
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
        rect(this.width / 2 - 200, 30, 400, 425);
        noStroke();
        textSize(32);
        if (this.winner) {
            fill("green");
            text("You Win!", this.width / 2, 60);
        } else {
            fill("red");
            text("Game Over!", this.width / 2, 60);
        }
        fill("black");
        textSize(16);
        text(
            `wins ${this.stats.wins} - losses ${this.stats.losses} - win rate ${this.stats.winRate}%`,
            this.width / 2,
            85
        );
        textSize(24);
        const highScores = Object.keys(this.highScores);
        highScores.forEach((score, i) => {
            if (this.highScores[score].score == this.score && frameCount % 60 > 30) {
                fill("red");
            } else fill("black");
            text(new Date(+score).toLocaleDateString(), this.width / 2 - 130, 110 + i * 32);
            text(this.highScores[score].score, this.width / 2 + 150, 110 + i * 32);
        });
        fill("black");
        if (frameCount % 40 > 20) text("Click to restart", this.width / 2, 430);
    }
}
