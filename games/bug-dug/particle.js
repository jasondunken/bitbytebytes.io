class Particle {
    constructor(position, velocity, size, life) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.life = life;
    }

    update() {
        this.life--;
        this.position = { x: this.position.x + this.velocity.x, y: this.position.y + this.velocity.y + 1 };
    }
}

class ParticleEmitter extends GameObject {
    particles = new Set();
    constructor(position, numParticles, loop) {
        super("particle-emitter", position);
        for (let i = 0; i < numParticles; i++) {
            this.particles.add(new Particle(position, { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }, 5, 60));
        }
    }

    update() {
        this.particles.forEach((particle) => {
            particle.update();
            if (particle.life <= 0) {
                this.particles.delete(particle);
            }
        });
    }

    render() {
        this.particles.forEach((particle) => {
            if (particle.life > 0) {
                fill("red");
                ellipse(particle.position.x, particle.position.y, particle.size, particle.size);
            }
        });
    }
}
