import { valueToColor, Vec2 } from "./utils.js";

class VisualEffect {
    done = false;

    constructor(position) {
        this.position = position;
    }

    update() {}
    render() {}
}

class BonusEffect extends VisualEffect {
    vSpeed = Math.floor(Math.random() * 3 + 2);
    constructor(position, score) {
        super(position);
        this.score = score;
        this.color = color("red");
    }

    update() {
        this.position.x += Math.random() * 4 - 2;
        this.position.y -= this.vSpeed;
        if (this.position.y < -64) this.done = true;
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

class BonusSquadEffect extends VisualEffect {
    size = 32;
    MAX_SIZE = 64;

    color = "red";

    repetitions = 4;

    constructor(position) {
        super(position);
    }

    update() {
        this.size += 5;
        if (this.size >= this.MAX_SIZE) {
            this.repetitions--;
            if (this.repetitions > 0) {
                this.size = 32;
            } else {
                this.done = true;
            }
        }
    }

    render() {
        stroke(this.color);
        strokeWeight(3);
        noFill();
        ellipse(this.position.x, this.position.y, this.size, this.size);
    }
}

class ScoreEffect extends VisualEffect {
    opacity = 255;
    vSpeed = Math.floor(Math.random() * 3 + 2);
    constructor(position, score, value) {
        super(position);
        this.score = score;
        this.color = color(valueToColor(value));
        this.outlineColor = color("white");
    }

    update() {
        this.position.x += Math.random() * 4 - 2;
        this.position.y -= this.vSpeed;
        this.opacity -= 5;
        this.color.setAlpha(this.opacity);
        this.outlineColor.setAlpha(this.opacity);
        if (this.opacity <= 0) this.done = true;
    }

    render() {
        strokeWeight(2);
        stroke(this.outlineColor);
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
            const b = Math.floor(Math.random() * 256);
            this.explosion.add({
                position: {
                    x: Math.random() * this.CONCENTRATION * 2 - this.CONCENTRATION + position.x,
                    y: Math.random() * this.CONCENTRATION * 2 - this.CONCENTRATION + position.y,
                },
                life: Math.floor((Math.random() * this.MAX_LIFE) / 2 + this.MAX_LIFE / 2),
                speed: Math.floor(Math.random() * 4 + 4),
                size: 4,
                brightness: b,
                color: this.setBrightnessAlpha(b, 255),
                alpha: Math.floor(Math.random() * 56 + 200),
            });
        }
    }

    update() {
        for (let particle of this.explosion) {
            particle.size += particle.speed;
            particle.life -= 1;
            if (particle.life <= 0) this.explosion.delete(particle);
            else {
                particle.alpha = particle.alpha -= particle.speed * 5;
                if (particle.alpha < 0) particle.alpha = 0;
                particle.color = this.setBrightnessAlpha(particle.brightness, particle.alpha);
            }
        }
        if (this.explosion.size < 1) this.done = true;
    }

    setBrightnessAlpha(b, a) {
        return color(`rgba(255, ${b}, ${b}, ${a})`);
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

class Firework extends VisualEffect {
    fireworkColors = [
        "lightsalmon",
        "teal",
        "yellowgreen",
        "antiquewhite",
        "cornflowerblue",
        "dimgrey",
        "deeppink",
        "lavenderblush",
        "mediumturquoise",
        "midnightblue",
        "chocolate",
        "coral",
    ];

    constructor(position, numParticles, volleyTime, expansionTime, volleys, volleyRate, startDelay) {
        super(position);
        numParticles ? (this.numParticles = numParticles) : (this.numParticles = 20);
        volleyTime ? (this.volleyTime = volleyTime) : (this.volleyTime = 50);
        expansionTime ? (this.expansionTime = expansionTime) : (this.expansionTime = 25);
        volleys ? (this.volleys = volleys) : (this.volleys = 4);
        volleyRate ? (this.volleyRate = volleyRate) : (this.volleyRate = 20);
        startDelay ? (this.startDelay = startDelay) : (this.startDelay = 0);
        this.particles = new Set();
        this.expansionSpeed = 5;
    }

    update() {
        if (this.startDelay > 0) this.startDelay--;
        if (this.startDelay <= 0 && this.volleys > 0) {
            this.fireVolley();
            this.volleys--;
            if (this.volleys > 0) this.startDelay = this.volleyRate;
        }
        this.particles.forEach((particle) => {
            if (particle.expansionTime > 0) {
                particle.expansionTime--;
                particle.position = particle.position.add(particle.direction);
            } else {
                particle.color.setAlpha(particle.alpha);
                particle.alpha -= 10;
                if (particle.alpha <= 0) particle.alpha = 0;
                particle.position = particle.position.add(new Vec2(0, 0.5));
            }
            particle.volleyTime--;
            if (particle.volleyTime <= 0) {
                this.particles.delete(particle);
            }
        });
        if (this.particles.size <= 0 && this.volleys <= 0) this.done = true;
    }

    fireVolley() {
        const volleyPosition = new Vec2(
            this.position.x + Math.random() * 64 - 32,
            this.position.y + Math.random() * 64 - 32
        );
        const pColor = color(this.fireworkColors[Math.floor(Math.random() * this.fireworkColors.length)]);
        for (let i = 0; i < this.numParticles; i++) {
            const angle = (i * 2 * PI) / this.numParticles;
            this.particles.add({
                position: volleyPosition,
                direction: new Vec2(Math.cos(angle) * this.expansionSpeed, Math.sin(angle) * this.expansionSpeed),
                volleyTime: this.volleyTime,
                expansionTime: this.expansionTime,
                size: 8,
                color: pColor,
                alpha: 255,
            });
        }
    }

    render() {
        noStroke();
        this.particles.forEach((particle) => {
            fill(particle.color);
            ellipse(particle.position.x, particle.position.y, particle.size, particle.size);
        });
    }
}

export { BonusEffect, BonusSquadEffect, Explosion, Firework, ScoreEffect };
