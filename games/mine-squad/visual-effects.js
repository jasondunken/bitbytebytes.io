class VisualEffect {
    done = false;

    constructor(position) {
        this.position = position;
    }

    update() {}
    render() {}
}

class ScoreEffect extends VisualEffect {
    opacity = 255;
    vSpeed = Math.floor(Math.random() * 3 + 2);
    constructor(position, score, value) {
        super(position);
        this.score = score;
        this.color = color(valueToColor(value));
    }

    update() {
        this.position.x += Math.random() * 4 - 2;
        this.position.y -= this.vSpeed;
        this.opacity -= 10;
        this.color.setAlpha(this.opacity);
        if (this.opacity <= 0) this.done = true;
    }

    render() {
        strokeWeight(2);
        stroke("white");
        fill(this.color);
        textStyle(BOLD);
        text(this.score, this.position.x, this.position.y);
        textStyle(NORMAL);
    }
}
