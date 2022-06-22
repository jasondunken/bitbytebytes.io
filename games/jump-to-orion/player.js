class Player extends GameObject {
    imagePlayer;
    imageRocket;

    fireReady = 0;
    loadSpeed = 30;
    rockets = [];

    STARTING_HEALTH = 100;
    health = this.STARTING_HEALTH;

    MIN_SHIELD_RADIUS = 50;
    MAX_SHIELD_RADIUS = 100;
    STARTING_SHIELD = 200;
    shield = this.STARTING_SHIELD;
    shieldRadius = this.MAX_SHIELD_RADIUS;
    shieldsRaised = false;

    STARTING_AMMO = 20;
    ammo = this.STARTING_AMMO;

    constructor(initialPos, speed, size, imagePlayer, imageRocket) {
        super("player", initialPos, speed, size);
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

        if (this.shieldsRaised) {
            this.shieldRadius = this.shield;
            if (this.shieldRadius > this.MAX_SHIELD_RADIUS) this.shieldRadius = this.MAX_SHIELD_RADIUS;
            if (this.shieldRadius < this.MIN_SHIELD_RADIUS) this.shieldRadius = this.MIN_SHIELD_RADIUS;
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
            ellipse(this.currentPos.x, this.currentPos.y, this.shieldRadius, this.shieldRadius);
        }
        for (let rocket of this.rockets) {
            rocket.draw();
        }
    }

    fire() {
        if (this.ammo > 0) {
            this.ammo--;
            this.fireReady = this.loadSpeed;
            this.rockets.push(new Rocket({ x: this.currentPos.x, y: this.currentPos.y }, 5, 32, this.imageRocket));
        }
    }

    raiseShield() {
        if (this.shield > 0) {
            this.shield--;
            this.shieldsRaised = true;
        } else {
            this.shieldsRaised = false;
        }
    }

    addHealth(health) {
        this.health += health;
        if (this.health > this.STARTING_HEALTH) this.health = this.STARTING_HEALTH;
    }

    getHealth() {
        return this.health;
    }

    addAmmo(ammo) {
        this.ammo += ammo;
        if (this.ammo > this.STARTING_AMMO) this.ammo = this.STARTING_AMMO;
    }

    getAmmo() {
        return this.ammo;
    }

    addShield(shield) {
        this.shield += shield;
        if (this.shield > this.STARTING_SHIELD) this.shield = this.STARTING_SHIELD;
    }

    getShield() {
        return this.shield;
    }

    checkForCollision(entity) {
        let size = this.size;
        if (this.shieldsRaised) {
            size = this.shieldRadius;
        }
        let isCollision =
            dist(entity.currentPos.x, entity.currentPos.y, this.currentPos.x, this.currentPos.y) <
            (size + entity.size) / 2;
        if (isCollision && !this.shieldsRaised) this.health -= 10;
        if (this.health < 0) this.health = 0;
        return isCollision;
    }
}

class DemoPlayer extends Player {
    constructor(initialPos, speed, size, imagePlayer, imageRocket) {
        super(initialPos, speed, size, imagePlayer, imageRocket);
    }

    update() {
        // move demo player
        this.delta += this.speed / 60.0;
        this.currentPos = {
            x: this.pathPos.x,
            y: this.health > 30 ? this.pathPos.y : this.pathPos.y + Math.cos(this.delta % 360) * this.size,
        };

        this.setCorners();
    }
}
