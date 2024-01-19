import { Vec } from "../math/vec.js";
import { GameObject } from "../gameObject.js";

export class Particle {
    constructor(position, direction, life, size) {
        this.position = position || new Vec();
        this.direction = direction || new Vec();
        this.life = life || 1;
        this.size = size || 8;
    }

    update() {
        this.life--;
        this.position.add(this.velocity);
    }
}

export class ParticleEmitter extends GameObject {
    particles = new Set();
    constructor(position, numParticles, loopInterval, updateFunction) {
        super("particle-emitter", position);
        this.numParticles = numParticles;
        this.loopInterval = loopInterval;
        this.loopTime = loopInterval;
        this.update = updateFunction;

        this.spawnParticles(numParticles);
    }

    update() {}

    setPosition(position) {
        this.position.set(position);
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
}
