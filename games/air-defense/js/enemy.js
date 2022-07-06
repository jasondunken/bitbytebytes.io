class EnemyAircraft extends GameObject {
    MAX_HEALTH = 10;
    MOVE_SPEED = 5;

    health;

    constructor(position, spriteL, spriteR) {
        super("enemy", position);
        this.spriteL = spriteL;
        this.spriteR = spriteR;
        this.health = this.MAX_HEALTH;
    }

    update() {
        this.position.x += this.position.z;
    }

    render() {
        // since this is a 2d game, x & y will be screen pos, z will be used to indicate direction;
        // z === -1: left | z === 0: not moving | z === 1: right
        if (this.position.z < 0) {
            image(this.spriteL, this.position.x, this.position.y, 32, 16);
        } else {
            image(this.spriteR, this.position.x, this.position.y, 32, 16);
        }
    }

    hit(dmg) {
        this.health -= dmg;
        if (this.health <= 0) {
            this.dead = true;
        }
    }
}
