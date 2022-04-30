class Ship {
    BASE_COOLDOWN = 15;
    cooldown = 0;
    weaponReady = false;
    shots = [];

    constructor(size, position, speed) {
        this.size = size;
        this.pos = position;
        this.speed = speed;
    }

    update() {
        if (keyIsDown(RIGHT_ARROW)) this.pos.x += this.speed;
        if (keyIsDown(LEFT_ARROW)) this.pos.x -= this.speed;

        if (keyIsDown(32) && this.weaponReady) {
            this.fire();
        }

        for (let i = 0; i < this.shots.length; i++) {
            if (this.shots[i].dead) {
                this.shots.splice(i - 1, 1);
            }
        }

        if (!this.weaponReady) {
            this.cooldown--;
            if (this.cooldown <= 0) {
                this.cooldown = this.BASE_COOLDOWN;
                this.weaponReady = true;
            }
        }
    }

    render() {
        noStroke();
        fill("WHITE");
        ellipse(this.pos.x, this.pos.y, this.size, this.size);
        for (let i = 0; i < this.shots.length; i++) {
            if (!this.shots[i].dead) {
                this.shots[i].render();
            }
        }
    }

    fire() {
        if (this.weaponReady) {
            this.shots.push(new Shot(new p5.Vector(this.pos.x, this.pos.y)));
            this.weaponReady = false;
        }
    }
}

class Shot {
    BASE_SIZE = 4;
    constructor(position) {
        this.size = this.BASE_SIZE;
        this.pos = position;
        this.moveSpeed = 3;
        this.dead = false;
    }

    render() {
        if (this.pos.y >= 0) {
            let r = random(0, 255);
            let g = random(0, 255);
            let b = random(0, 255);
            let a = random(0, 255);
            stroke(r, g, b, a);
            strokeWeight(this.size);
            line(this.pos.x, this.pos.y, this.pos.x, this.pos.y + 16);
            // noStroke();
            // fill(r, g, b, a);
            // ellipse(this.pos.x, this.pos.y, this.size * 2, this.size * 2);
            this.pos.y -= this.moveSpeed;
        } else {
            this.dead = true;
        }
    }
}
