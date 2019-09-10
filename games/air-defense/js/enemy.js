function Enemy(x, y, z) {
    this._maxHealth = 10;
    this._moveSpeed = 5;

    this.diameter = 5;

    this._health;
    this._pos = new p5.Vector();

    this.falling = true;
    this.dead = false;
    // since this is a 2d game, x & y will be screen pos, z will be used to indicate direction;
    // z === -1: left | z === 0: not moving | z === 1: right
    this._pos = new p5.Vector(x, y, z);
    this.health = maxHealth;
}

Enemy.prototype.jump = function () {
    this._pos.z = 1;
}

Enemy.prototype.update = function (tick) {
    if (isNaN(this._health)) {
        this._health = this._maxHealth;
    }
    let _x = this._pos.x;
    let _y = this._pos.y;
    let _z = this._pos.z;
    _x += _z;
    this._pos = new p5.Vector(_x, _y, _z);
    if (_x < 0 || _x > width || this.health <= 0) {
        this.dead = true;
    }
}

Enemy.prototype.render = function () {
    setColor('white');
    ellipse(this._pos.x, this._pos.y, this.diameter, this.diameter);
}

Enemy.prototype.getHealth = function () {
    return this._health;
}

Enemy.prototype.hit = function (dmg) {
    this._health -= dmg;
    if (this._health <= 0) {
        this.kill();
    }
}

Enemy.prototype.kill = function () {
    this.dead = true;
}