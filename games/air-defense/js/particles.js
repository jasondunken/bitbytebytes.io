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
        this.pos.x = this.pos.x + this.dir.x / (bulletSpeed * 2);
        this.pos.y = this.pos.y + this.dir.y / (bulletSpeed * 2);
    }

    render() {
        setColor("red");
        point(this.pos.x, this.pos.y);
    }
}
