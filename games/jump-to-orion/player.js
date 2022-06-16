class Player extends GameObject {
    imagePlayer;
    imageRocket;

    fireReady = 0;
    cooldown = 30;
    rockets = [];

    health = 100;

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
            y: this.health > 30 ? this.pathPos.y : this.pathPos.y + Math.cos(this.delta % 360) * this.size,
        };

        this.setCorners();

        if (keyIsDown(32) && this.fireReady === 0) {
            this.fireReady = this.cooldown;
            this.rockets.push(new Rocket({ x: this.currentPos.x, y: this.currentPos.y }, 5, 32, this.imageRocket));
        } else {
            this.fireReady -= 1;
            if (this.fireReady < 0) this.fireReady = 0;
        }

        for (let rocket of this.rockets) {
            rocket.update();
        }
    }

    draw() {
        image(this.imagePlayer, this.corners.a.x, this.corners.a.y, this.size, this.size);
        for (let rocket of this.rockets) {
            rocket.draw();
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
