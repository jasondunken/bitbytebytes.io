class Player extends GameObject {
    imagePlayer;
    imageRocket;

    fireReady = 0;
    cooldown = 30;
    rockets = [];

    constructor(initialPos, speed, size, imagePlayer, imageRocket) {
        super(initialPos, speed, size);
        this.imagePlayer = imagePlayer;
        this.imageRocket = imageRocket;
    }

    update() {
        if (keyIsDown(87)) this.pathPos.y -= this.speed;
        if (keyIsDown(83)) this.pathPos.y += this.speed;
        this.delta += this.speed / 60.0;
        this.currentPos = {
            x: this.pathPos.x,
            y: this.pathPos.y + Math.cos(this.delta % 360) * this.size,
        };
        this.corners = {
            a: {
                x: this.currentPos.x - this.halfSize,
                y: this.currentPos.y - this.halfSize,
            },
            b: {
                x: this.currentPos.x + this.halfSize,
                y: this.currentPos.y - this.halfSize,
            },
            c: {
                x: this.currentPos.x + this.halfSize,
                y: this.currentPos.y + this.halfSize,
            },
            d: {
                x: this.currentPos.x - this.halfSize,
                y: this.currentPos.y + this.halfSize,
            },
        };

        if (keyIsDown(32) && this.fireReady === 0) {
            this.fireReady = this.cooldown;
            this.rockets.push({ x: this.currentPos.x, y: this.currentPos.y, s: 5 });
        } else {
            this.fireReady -= 1;
            if (this.fireReady < 0) this.fireReady = 0;
        }

        for (let rocket of this.rockets) {
            rocket.x += rocket.s;
        }
    }

    draw() {
        image(this.imagePlayer, this.corners.a.x, this.corners.a.y, this.size, this.size);
        for (let rocket of this.rockets) {
            image(this.imageRocket, rocket.x, rocket.y);
        }
    }
}

class DemoPlayer extends Player {
    constructor(initialPos, speed, size, imagePlayer, imageRocket) {
        super(initialPos, speed, size, imagePlayer, imageRocket);
    }

    update() {
        // move demo player
    }
}
