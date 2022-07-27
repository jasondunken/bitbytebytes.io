class EnemyAircraft extends GameObject {
    MAX_HEALTH = 10;
    MOVE_SPEED = 5;
    MAX_BOMBS = 2;
    BOMB_RELOAD_TIME = 20;

    health;
    bombs;
    cooldownTimer = 0;

    constructor(position, spriteL, spriteR) {
        super("bomber", position);
        this.spriteL = spriteL;
        this.spriteR = spriteR;
        this.health = this.MAX_HEALTH;
        this.bombs = this.MAX_BOMBS;
        this.cooldownTimer = this.BOMB_RELOAD_TIME;
    }

    update() {
        this.position.x += this.position.z;
        if (this.cooldownTimer > 0) {
            this.cooldownTimer--;
        }
    }

    render() {
        // since this is a 2d game, x & y will be screen pos, z will be used to indicate direction;
        // z === -1: left | z === 0: not moving | z === 1: right
        if (this.position.z < 0) {
            image(this.spriteL, this.position.x - 16, this.position.y - 8, 32, 16);
        } else {
            image(this.spriteR, this.position.x - 16, this.position.y - 8, 32, 16);
        }
    }

    dropBomb() {
        if (this.cooldownTimer <= 0 && this.bombs > 0) {
            this.cooldownTimer = this.BOMB_RELOAD_TIME;
            this.bombs--;
            return true;
        }
        return false;
    }

    hit(dmg) {
        this.health -= dmg;
        if (this.health <= 0) {
            this.dead = true;
        }
    }
}

class Bomb extends GameObject {
    FALLING_SPEED = 3;
    constructor(position, direction) {
        super("bomb", position);
        this.direction = direction;
    }

    update() {
        this.position.x += this.direction.x;
        this.position.y += this.FALLING_SPEED;
    }

    render() {
        setColor("brown");
        ellipse(this.position.x, this.position.y, 5, 5);
    }
}

class AirborneTransport extends GameObject {
    MAX_HEALTH = 100;
    MOVE_SPEED = 5;
    PARATROOPER_COUNT = 20;

    health;
    paratroopers;

    constructor(position, spriteL, spriteR) {
        super("airborne", position);
        this.spriteL = spriteL;
        this.spriteR = spriteR;
        this.health = this.MAX_HEALTH;
        this.paratroopers = this.PARATROOPER_COUNT;
    }

    update() {
        this.position.x += this.position.z;
    }

    render() {
        // since this is a 2d game, x & y will be screen pos, z will be used to indicate direction;
        // z === -1: left | z === 0: not moving | z === 1: right
        if (this.position.z < 0) {
            image(this.spriteL, this.position.x - 48, this.position.y - 16, 96, 32);
        } else {
            image(this.spriteR, this.position.x - 48, this.position.y - 16, 96, 32);
        }
    }
}
