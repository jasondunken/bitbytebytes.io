class Explosion extends GameObject {
    duration = 30;
    MAX_RADIUS = 25;
    constructor(position) {
        super("explosion", position);
        const sound = new Audio();
        sound.src = "./air-defense/snd/explosion_1.wav";
        sound.play();
    }

    update() {
        this.duration--;
        if (this.duration <= 0) this.dead = true;
    }

    render() {
        const radius = Math.random() * this.MAX_RADIUS;
        const color = `rgba(${Math.floor(Math.random() * 128) + 128}, 0, 0, ${Math.floor(Math.random() * 256)})`;
        setColor(color);
        ellipse(this.position.x, this.position.y, radius, radius);
    }
}

class Splatter extends GameObject {
    MAX_DURATION = 100;
    MAX_PARTICLES = 5;
    MAX_RADIUS = 3;
    SPLAT_GRAVITY = 3;
    particles = new Set();
    constructor(position, direction) {
        super("splatter", position);
        for (let i = 0; i < this.MAX_PARTICLES; i++) {
            this.particles.add({
                id: i,
                position: {
                    x: position.x + Math.random() * 10 - 5,
                    y: position.y + Math.random() * 10 - 5,
                },
                direction: {
                    x: (direction.x + Math.random() * 5 - 2.5) / 10,
                    y: (direction.y + Math.random() * 5 - 2.5) / 10,
                },
                radius: Math.random() * this.MAX_RADIUS + 1,
                life: Math.random() * (this.MAX_DURATION / 2) + this.MAX_DURATION / 2,
            });
        }
    }

    update() {
        this.particles.forEach((particle) => {
            particle.position.x = particle.position.x + particle.direction.x;
            particle.position.y = particle.position.y + particle.direction.y + this.SPLAT_GRAVITY;
            particle.life--;
            if (particle.life <= 0) this.particles.delete(particle);
        });
        if (this.particles.size === 0) this.dead = true;
    }

    render() {
        this.particles.forEach((particle) => {
            const color = `rgba(${Math.floor(Math.random() * 128) + 128}, 0, 0, ${Math.floor(Math.random() * 256)})`;
            setColor(color);
            ellipse(particle.position.x, particle.position.y, particle.radius, particle.radius);
        });
    }
}

class ParticleEmitter {
    constructor(pos, dir, amount) {
        this.particles = [];
        for (let i = 0; i < amount; i++) {
            this.particles.push(new Particle(pos, dir));
        }
    }

    update() {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update();
        }
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].dead) {
                this.particles.splice(i, 1);
            }
        }
    }

    render() {
        for (p of this.particles) {
            p.render();
        }
    }
}

class Particle {
    constructor(pos, dir) {
        this.life = Math.random() * 30 + 30;
        this.dead = false;

        this.pos = new p5.Vector(pos.x + Math.random() * 10 - 5, pos.y + Math.random() * 10 - 5);
        this.dir = new p5.Vector(dir.x + Math.random() * 10 - 5, dir.y + Math.random() * 10 - 5);
    }

    update() {
        this.life--;
        if (this.life <= 0) {
            this.dead = true;
        }
        console.log("bulletSpeed: ", bulletSpeed);
        this.pos.x = this.pos.x + this.dir.x / (bulletSpeed * 2);
        this.pos.y = this.pos.y + this.dir.y / (bulletSpeed * 2);
    }

    render() {
        setColor("red");
        point(this.pos.x, this.pos.y);
    }
}
