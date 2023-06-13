import { World } from "./world.js";

class Scoreboard {
    ICON_SIZE = 32;
    PADDING_RIGHT = 22;

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
                        this.width -
                            this.PADDING_RIGHT -
                            i * this.ICON_SIZE -
                            this.ICON_SIZE / 2,
                        this.height / 2 - this.ICON_SIZE / 2,
                        this.ICON_SIZE,
                        this.ICON_SIZE
                    );
                }
            } else {
                image(
                    sprite,
                    this.width -
                        this.PADDING_RIGHT -
                        i * this.ICON_SIZE -
                        this.ICON_SIZE / 2,
                    this.height / 2 - this.ICON_SIZE / 2,
                    this.ICON_SIZE,
                    this.ICON_SIZE
                );
            }
        }
    }
}

export { Scoreboard };
