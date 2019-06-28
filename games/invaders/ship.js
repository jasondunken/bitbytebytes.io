function Ship() {
    this.r = 20;
    this.posx = width / 2;
    this.posy = height - 30;
    this.shots = [];
    this.cooldown = 60;
    this.weaponReady = true;
}

Ship.prototype.render = function () {
    noStroke();
    fill("RED");
    ellipse(this.posx, this.posy, this.r, this.r);
    for (let i = 0; i < this.shots.length; i++) {
        if (!this.shots[i].dead) {
            this.shots[i].render();
        }
    }
};

Ship.prototype.update = function () {
    for (let shot in this.shots) {
        if (shot.dead) {
            this.reload();
            this.shots.splice(i, 0);
        }
    }

    if (!this.weaponReady) {
        this.cooldown--;
        if (this.cooldown <= 0) {
            this.reload();
        }
    }
};

Ship.prototype.fire = function () {
    if (this.weaponReady) {
        this.shots.push(new Shot(new p5.Vector(this.posx, this.posy)));
        this.weaponReady = false;
    }
};

Ship.prototype.reload = function () {
    this.cooldown = 60;
    this.weaponReady = true;
};

function Shot(vec2D) {
    this.r = 10;
    this.posx = vec2D.x;
    this.posy = vec2D.y;
    this.moveSpeed = 3;
    this.dead = false;
}

Shot.prototype.render = function () {
    if (this.posy >= 0) {
        let r = random(0, 255);
        let g = random(0, 255);
        let b = random(0, 255);
        let a = random(0, 255);
        noStroke();
        fill(r, g, b, a);
        ellipse(this.posx, this.posy, this.r, this.r);
        this.posy -= this.moveSpeed;
    } else {
        this.dead = true;
    }
};
