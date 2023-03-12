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

class Explosion extends VisualEffect {
    DENSITY = 40;
    CONCENTRATION = 20;
    MAX_LIFE = 30;

    explosion = new Set();

    constructor(position) {
        super(position);
        for (let i = 0; i < this.DENSITY; i++) {
            const life = Math.floor((Math.random() * this.MAX_LIFE) / 2 + this.MAX_LIFE / 2);
            const speed = Math.floor(Math.random() * 2 + 2);
            const size = 4;
            const gray = Math.floor(Math.random() * 256);
            const pColor = color(`rgba(255, ${gray}, ${gray}, 255)`);
            this.explosion.add({
                position: {
                    x: Math.random() * this.CONCENTRATION * 2 - this.CONCENTRATION + position.x,
                    y: Math.random() * this.CONCENTRATION * 2 - this.CONCENTRATION + position.y,
                },
                life,
                speed,
                size,
                color: pColor,
            });
        }
    }

    update() {
        for (let particle of this.explosion) {
            particle.size += particle.speed;
            particle.life -= 1;
            if (particle.life <= 0) this.explosion.delete(particle);
        }
    }

    render() {
        noStroke();
        ellipseMode(CENTER);
        for (let particle of this.explosion) {
            fill(particle.color);
            ellipse(particle.position.x, particle.position.y, particle.size, particle.size);
        }
    }
}
