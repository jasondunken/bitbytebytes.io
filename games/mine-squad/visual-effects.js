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
    constructor(position, score) {
        super(position);
        this.score = score;
        this.color = color(255, 0, 0);
    }

    update() {
        this.position.x += Math.random() * 4 - 2;
        this.position.y -= 5;
        this.opacity -= 10;
        this.color.setAlpha(this.opacity);
        if (this.opacity <= 0) this.done = true;
    }

    render() {
        noStroke();
        fill(this.color);
        text(this.score, this.position.x, this.position.y);
    }
}
