class Particle {
    constructor(position, velocity, size, life) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.life = life;
    }

    update() {
        this.life--;
    }
}

class ParticleEmitter extends GameObject {
    particles = new Set();
    constructor(position, numParticles, loop) {
        super("particle-emitter", position);
        for (let i = 0; i < numParticles; i++) {
            this.particles.add(new Particle(position, { x: 0, y: 0 }, 5, 1000));
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
            console.log("particle: ", particle);
            if (particle.life > 0) {
                fill("red");
                ellipse(particle.position.x, particle.position.y, particle.size, particle.size);
            }
        });
    }
}
