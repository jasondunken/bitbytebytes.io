class Explosion extends GameObject {
    animation;
    life = 0;
    constructor(initialPos, speed, size, animation) {
        super("explosion", initialPos, speed, size);
        this.animation = animation;
    }

    update() {
        this.life++;
        if (this.life >= this.animation.duration && this.animation.loop) this.life = 0;
        if (this.life >= this.animation.duration) {
            this.remove = true;
        }
        this.pathPos.x += this.speed;
        this.setCorners();
    }

    draw() {
        const frameIndex = Math.floor(this.life / Math.floor(this.animation.duration / this.animation.frames.length));
        const frame = this.animation.frames[frameIndex];
        image(frame, this.corners.a.x, this.corners.a.y, this.size, this.size);
    }
}
