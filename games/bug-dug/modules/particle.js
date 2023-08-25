import { GameObject } from "../../modules/gameObject.js";
import { Vec } from "../../modules/math/vec.js";

class Particle {
    constructor(position, velocity, size, life) {
        this.position = position.copy();
        this.velocity = velocity;
        this.size = size;
        this.life = life;
    }

    update() {
        this.life--;
        this.position.add(this.velocity);
    }
}

class ParticleEmitter extends GameObject {
    particles = new Set();
    constructor(position, numParticles, loopInterval, updateFunction) {
        super("particle-emitter", position);
        this.numParticles = numParticles;
        this.loopInterval = loopInterval;
        this.loopTime = loopInterval;
        this.update = updateFunction;

        this.spawnParticles(numParticles);
    }

    setPosition(position) {
        this.position.set(position.x, position.y + 16);
    }

    emit() {
        this.spawnParticles(this.numParticles);
    }

    start() {
        this.stopped = false;
    }

    stop() {
        this.stopped = true;
    }

    spawnParticles(numParticles) {
        for (let i = 0; i < numParticles; i++) {
            this.particles.add(
                new Particle(
                    this.position.copy(),
                    new Vec(Math.random() * 2 - 1, Math.random() * -0.25),
                    5,
                    60
                )
            );
        }
    }

    render() {
        this.particles.forEach((particle) => {
            if (particle.life > 0) {
                let alpha = map(particle.life, 0, 60, 0, 1);
                let color = `rgba(255, 0, 0, ${alpha})`;
                fill(color);
                noStroke();
                ellipse(
                    particle.position.x,
                    particle.position.y,
                    particle.size,
                    particle.size
                );
            }
        });
    }

    static RadialBurst() {
        if (!this.stopped && this.loopInterval) {
            if (this.loopTime > 0) {
                this.loopTime--;
            }
            if (this.loopTime <= 0) {
                this.loopTime = this.loopInterval;
                this.spawnParticles(this.numParticles);
            }
        }
        this.particles.forEach((particle) => {
            particle.update();
            if (particle.life <= 0) {
                this.particles.delete(particle);
            }
        });
    }
}

export { ParticleEmitter };
