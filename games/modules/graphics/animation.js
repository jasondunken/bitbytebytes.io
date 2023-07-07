class Animation {
    constructor(spriteSheet, duration, loop) {
        this.keyFrames = this.createKeyFrames(spriteSheet);
        this.duration = duration;
        this.loop = loop;
        this.currentFrame = this.keyFrames[0];
        this.timePerFrame = duration / this.keyFrames.length;
        this.time = 0;
        this.finished = false;
    }

    update() {
        this.time += 1;
        if (this.time > this.duration && !this.loop) {
            this.finished = true;
            return;
        }
        this.currentFrame = this.keyFrames[Math.floor(this.time / this.timePerFrame) % this.keyFrames.length];
    }

    // assumes a square sprite
    createKeyFrames(spriteSheet) {
        let keyFrames = [];
        const spriteSize = spriteSheet.height;
        let numSprites = spriteSheet.width / spriteSize;
        for (let i = 0; i < numSprites; i++) {
            let sprite = createImage(spriteSize, spriteSize);
            sprite.copy(spriteSheet, spriteSize * i, 0, spriteSize, spriteSize, 0, 0, spriteSize, spriteSize);
            keyFrames.push(sprite);
        }
        return keyFrames;
    }
}

export { Animation };
