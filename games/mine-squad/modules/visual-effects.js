import { valueToColor } from "./utils.js";
import { Vec } from "../../modules/math/vec.js";
import { Particle } from "../../modules/graphics/particle.js";

class VisualEffect {
    remove = false;
    layer = 0;

    constructor(position, layer) {
        this.position = position;
        this.layer = layer || 0;
    }

    update() {}
    render() {}
}

class ScoreEffect extends VisualEffect {
    opacity = 255;
    vSpeed = Math.floor(Math.random() * 3 + 2);
    constructor(position, score, value, layer) {
        super(position, layer);
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
        if (this.opacity <= 0) this.remove = true;
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

class BonusEffect extends VisualEffect {
    vSpeed = Math.floor(Math.random() * 3 + 2);
    constructor(position, score, color, layer) {
        super(position, layer);
        this.score = score;
        this.color = color || "red";
    }

    update() {
        this.position.x += Math.random() * 4 - 2;
        this.position.y -= this.vSpeed;
        if (this.position.y < -64) this.remove = true;
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

    constructor(position, layer) {
        super(position, layer);
    }

    update() {
        this.size += 5;
        if (this.size >= this.MAX_SIZE) {
            this.repetitions--;
            if (this.repetitions > 0) {
                this.size = 32;
            } else {
                this.remove = true;
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

class Explosion extends VisualEffect {
    DENSITY = 40;
    CONCENTRATION = 20;
    MAX_LIFE = 30;

    explosion = new Set();

    constructor(position, layer) {
        super(position, layer);
        for (let i = 0; i < this.DENSITY; i++) {
            const b = Math.floor(Math.random() * 256);
            this.explosion.add({
                position: {
                    x:
                        Math.random() * this.CONCENTRATION * 2 -
                        this.CONCENTRATION +
                        position.x,
                    y:
                        Math.random() * this.CONCENTRATION * 2 -
                        this.CONCENTRATION +
                        position.y,
                },
                life: Math.floor(
                    (Math.random() * this.MAX_LIFE) / 2 + this.MAX_LIFE / 2
                ),
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
                particle.color = this.setBrightnessAlpha(
                    particle.brightness,
                    particle.alpha
                );
            }
        }
        if (this.explosion.size < 1) this.remove = true;
    }

    setBrightnessAlpha(b, a) {
        return color(`rgba(255, ${b}, ${b}, ${a})`);
    }

    render() {
        noStroke();
        ellipseMode(CENTER);
        for (let particle of this.explosion) {
            fill(particle.color);
            ellipse(
                particle.position.x,
                particle.position.y,
                particle.size,
                particle.size
            );
        }
    }
}

class Fireworks extends VisualEffect {
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
        "red",
        "blue",
        "green",
    ];

    constructor(position, config) {
        super(position);
        this.config = config;
        this.startDelay = config?.startDelay || Math.random() * 100;
        this.numVolleys = config?.numVolleys || 4;
        this.volleyRate = config?.volleyRate || 20;
        this.shells = new Set();
    }

    update(delta) {
        if (this.startDelay > 0) this.startDelay--;
        if (this.startDelay <= 0 && this.numVolleys > 0) {
            this.fireShell();
            this.numVolleys--;
            if (this.numVolleys > 0) this.startDelay = this.volleyRate;
        }
        this.shells.forEach((shell) => {
            shell.update(delta / 100);
            if (shell.remove) {
                this.shells.delete(shell);
            }
        });
        if (this.numVolleys === 0 && this.shells.size === 0) {
            this.remove = true;
        }
    }

    fireShell() {
        const volleyPosition = new Vec(
            this.position.x + Math.random() * 64 - 32,
            this.position.y + Math.random() * 64 - 32
        );
        const starColor = color(
            this.fireworkColors[
                Math.floor(Math.random() * this.fireworkColors.length)
            ]
        );
        this.shells.add(
            new FireworkShell(volleyPosition, { ...this.config, starColor })
        );
        const explosionSound = new Audio();
        explosionSound.src = "./mine-squad/res/snd/explosion.wav";
        explosionSound.play();
    }

    render() {
        this.shells.forEach((volley) => {
            volley.render();
        });
    }
}

class FireworkShell {
    constructor(position, config) {
        this.position = position || new Vec();
        this.burstRadius = config?.burstRadius || 128;
        this.numStars = config?.numStars || 20;
        this.color = config?.starColor || "white";

        this.remove = false;
        this.life = 150;
        this.burstSpeed = 25;
        this.alpha = 255;

        this.fallVec = Vec.DOWN.copy().mult(0.125);

        this.particles = new Set();
        for (let i = 0; i < this.numStars; i++) {
            const angle = (i * 2 * PI) / this.numStars;
            this.particles.add(
                new Particle(
                    position.copy(),
                    new Vec(Math.cos(angle), Math.sin(angle)),
                    this.life - Math.random() * 50,
                    config.starSize
                )
            );
        }
    }

    update(delta) {
        this.particles.forEach((particle) => {
            if (
                Vec.dist(this.position, particle.position) >= this.burstRadius
            ) {
                this.alpha -= particle.life / 1000;
                this.color.setAlpha(this.alpha);
                particle.direction = this.fallVec;
            }
            const step = particle.direction
                .copy()
                .mult(delta * this.burstSpeed);
            particle.position.add(step);

            particle.life--;
            if (particle.life <= 0) {
                this.particles.delete(particle);
            }
        });
        if (this.particles.size <= 0 || this.alpha <= 100) {
            this.remove = true;
        }
    }

    render() {
        this.particles.forEach((particle) => {
            noStroke();
            fill(this.color);
            ellipse(
                particle.position.x,
                particle.position.y,
                particle.size,
                particle.size
            );
        });
    }
}

export { BonusEffect, BonusSquadEffect, Explosion, Fireworks, ScoreEffect };
