class Player extends GameObject {
    imagePlayer;
    imageRocket;

    fireReady = 0;
    cooldown = 30;
    rockets = [];

    STARTING_HEALTH = 100;
    health = this.STARTING_HEALTH;

    STARTING_SHIELD = 100;
    shield = this.STARTING_SHIELD;
    MIN_SHIELD_DISTANCE = 20;

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
            this.fire();
        } else {
            this.fireReady -= 1;
            if (this.fireReady < 0) this.fireReady = 0;
        }

        if (keyIsDown(67)) {
            this.raiseShield();
        } else {
            this.shieldsRaised = false;
        }

        for (let rocket of this.rockets) {
            rocket.update();
        }
    }

    draw() {
        image(this.imagePlayer, this.corners.a.x, this.corners.a.y, this.size, this.size);
        if (this.shieldsRaised) {
            stroke("red");
            noFill();
            ellipse(
                this.currentPos.x,
                this.currentPos.y,
                this.shield + this.MIN_SHIELD_DISTANCE,
                this.shield + this.MIN_SHIELD_DISTANCE
            );
        }
        for (let rocket of this.rockets) {
            rocket.draw();
        }
    }

    fire() {
        this.fireReady = this.cooldown;
        this.rockets.push(new Rocket({ x: this.currentPos.x, y: this.currentPos.y }, 5, 32, this.imageRocket));
    }

    raiseShield() {
        this.shield--;
        if (this.shield > 0) {
            this.shieldsRaised = true;
            console.log("shields up: ", this.shield);
        } else {
            this.shieldsRaised = false;
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
