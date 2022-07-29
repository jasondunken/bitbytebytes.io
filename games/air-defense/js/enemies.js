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
    JUMP_RANGE = 200;
    JUMP_INTERVAL = 20;

    health;
    paratroopers;

    jumpTimer = 0;

    constructor(position, spriteL, spriteR) {
        super("airborne", position);
        this.spriteL = spriteL;
        this.spriteR = spriteR;
        this.health = this.MAX_HEALTH;
        this.paratroopers = this.PARATROOPER_COUNT;
    }

    update() {
        this.position.x += this.position.z;
        if (this.jumpTimer > 0) this.jumpTimer--;
    }

    canDeploy() {
        if (this.jumpTimer === 0 && this.paratroopers > 0) {
            this.jumpTimer = this.JUMP_INTERVAL;
            this.paratroopers--;
            return true;
        }
        return false;
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

class Paratrooper extends GameObject {
    FALLING_SPEED = 1;
    MOVE_SPEED = 0.5;

    animations = null;
    parachute = null;
    parachuting = null;

    grounded = false;

    constructor(position, spriteSheet) {
        super("paratrooper", position);
        this.spriteSheet = spriteSheet;
    }

    update() {
        if (!this.grounded) {
            this.position.y += this.FALLING_SPEED;
        } else {
            if (this.currentAnimation === this.animations.get("parachuting")) {
                this.parachute = false;
                this.currentAnimation = this.animations.get("walk-right");
            }
            this.position.x += this.MOVE_SPEED;
        }
        if (!this.animations) {
            this.animations = new Map();
            this.createSprites();
        }
        this.currentAnimation.update();
    }

    render() {
        stroke("red");
        noFill();
        image(this.currentAnimation.currentFrame, this.position.x - 8, this.position.y - 8, 16, 16);
        if (this.parachute) {
            image(this.parachute, this.position.x - 8, this.position.y - 24, 16, 16);
        }
    }

    createSprites() {
        const cellHeight = this.spriteSheet.height;
        const cells = this.spriteSheet.width / cellHeight;
        const cellWidth = this.spriteSheet.width / cells;

        const walkingLeftCells = createImage(cellWidth * 4, cellHeight);
        walkingLeftCells.copy(this.spriteSheet, 0, 0, cellWidth * 4, cellHeight, 0, 0, cellWidth * 4, cellHeight);
        this.animations.set("walk-left", new Animation(walkingLeftCells, 60, true));
        const walkingRightCells = createImage(cellWidth * 4, cellHeight);
        walkingRightCells.copy(
            this.spriteSheet,
            cellWidth * 6,
            0,
            cellWidth * 4,
            cellHeight,
            0,
            0,
            cellWidth * 4,
            cellHeight
        );
        this.animations.set("walk-right", new Animation(walkingRightCells, 60, true));

        const parachuteCells = createImage(cellWidth, cellHeight);
        parachuteCells.copy(this.spriteSheet, cellWidth * 10, 0, cellWidth, cellHeight, 0, 0, cellWidth, cellHeight);
        this.parachute = parachuteCells;
        const parachutingCells = createImage(cellWidth, cellHeight);
        parachutingCells.copy(this.spriteSheet, cellWidth * 5, 0, cellWidth, cellHeight, 0, 0, cellWidth, cellHeight);
        this.animations.set("parachuting", new Animation(parachutingCells, 60, true));

        this.currentAnimation = this.animations.get("parachuting");
    }
}
