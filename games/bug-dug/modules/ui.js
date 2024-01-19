export class UI {
    BORDER_COLOR = "brown";
    BORDER_SIZE = 8;
    BACKGROUND_COLOR = "gray";

    constructor(position, width, height) {
        this.position = position;
        this.width = width;
        this.height = height;
    }

    update() {}

    render(currentData) {
        stroke(this.BORDER_COLOR);
        strokeWeight(this.BORDER_SIZE);
        fill(this.BACKGROUND_COLOR);
        rect(this.position.x, this.position.y, this.width, this.height);

        fill("blue");
        noStroke();
        textSize(16);
        text("Level " + (currentData?.currentLevel + 1), 24, 40);
        text("Score " + currentData?.score, 24, 70);
        if (currentData?.hasKey) {
            image(
                currentData?.keyIcon,
                this.width - 80,
                68,
                32,
                32,
                0,
                0,
                16,
                16
            );
        }
        for (let i = 0; i < currentData?.lives; i++) {
            image(
                currentData?.playerIcon,
                this.width - 48 - 48 * i,
                0,
                64,
                64,
                0,
                0,
                32,
                32
            );
        }
    }
}
