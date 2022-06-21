class Explosion extends GameObject {
    animation;
    life = 0;
    constructor(initialPos, speed, size, animation) {
        super(initialPos, speed, size);
        this.animation = animation;
    }

    update() {
        this.life++;
        if (this.life >= this.animation.duration && this.animation.loop) this.life = 0;
        this.pathPos.x += this.speed;
        this.setCorners();
    }

    draw() {
        const frameIndex = Math.floor(this.life / Math.floor(this.animation.duration / this.animation.frames.length));
        const frame = this.animation.frames[frameIndex];
        image(frame, this.corners.a.x, this.corners.a.y, this.size, this.size);
    }
}

class ExplosionManager {
    explosions = [];

    add(explosion) {
        this.explosions.push(explosion);
    }

    update() {
        if (this.explosions.length > 0) {
            for (let i = this.explosions.length - 1; i >= 0; i--) {
                this.explosions[i].update();
                if (this.explosions[i].life >= this.explosions[i].animation.duration) {
                    this.explosions.splice(i, 1);
                }
            }
        }
    }

    draw() {
        for (let explosion of this.explosions) explosion.draw();
    }
}
