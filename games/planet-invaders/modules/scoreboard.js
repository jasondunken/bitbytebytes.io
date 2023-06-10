import { World } from "./world.js";

class Scoreboard {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    update(level, score, lives) {
        this.level = level;
        this.score = score;
        this.lives = lives;
    }

    render() {
        noStroke();
        fill("blue");
        textSize(16);
        textAlign(LEFT);
        text(`Level ${this.level + 1}`, 10, this.height / 2);
        textAlign(CENTER);
        text(this.score, this.width / 2, this.height / 2);
        const sprite = World.resources.sprites["ship"];
        for (let i = 0; i < this.lives; i++) {
            if (i === this.lives - 1) {
                if (frameCount % 60 > 30) {
                    image(
                        sprite,
                        this.width - 16 + -i * 32 - 24,
                        this.height / 2 - 24,
                        32,
                        32
                    );
                }
            } else {
                image(
                    sprite,
                    this.width - 16 + -i * 32 - 24,
                    this.height / 2 - 24,
                    32,
                    32
                );
            }
        }
    }
}

export { Scoreboard };
