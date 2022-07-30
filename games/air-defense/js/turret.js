class Turret {
    MAX_AMMO = 10000;
    MAX_HEALTH = 5000;
    BASE_WIDTH = 80;
    BASE_HEIGHT = 40;
    TURRET_DIAMETER = 60;
    TURRET_BARREL_LENGTH = 50;
    TURRET_ROTATION_SPEED = 0.01;

    RELOAD_TIME = 5;

    turretCenter;
    endOfBarrel;
    barrelAngle = -Math.PI / 2;
    cooldownTimer = 0;

    health = 0;
    ammo = 0;

    constructor(game, position) {
        this.game = game;
        this.position = position;
        this.turretCenter = { x: position.x, y: position.y - this.BASE_HEIGHT };
        this.endOfBarrel = { x: position.x, y: position.y - this.BASE_HEIGHT - this.TURRET_BARREL_LENGTH };
        this.health = this.MAX_HEALTH;
        this.ammo = this.MAX_AMMO;
    }

    update() {
        if (keyIsDown(RIGHT_ARROW)) {
            this.move(this.TURRET_ROTATION_SPEED);
        }
        if (keyIsDown(LEFT_ARROW)) {
            this.move(-this.TURRET_ROTATION_SPEED);
        }
        if (keyIsDown(DOWN_ARROW)) {
        }
        if (keyIsDown(32)) {
            this.fire();
        }

        if (this.cooldownTimer > 0) {
            this.cooldownTimer--;
        }
    }

    move(amount) {
        let barrelAngle = this.barrelAngle + amount;
        if (barrelAngle >= 0) barrelAngle = 0;
        if (barrelAngle <= -Math.PI) barrelAngle = -Math.PI;
        this.barrelAngle = barrelAngle;
        this.endOfBarrel = {
            x: this.turretCenter.x + this.TURRET_BARREL_LENGTH * Math.cos(barrelAngle),
            y: this.turretCenter.y + this.TURRET_BARREL_LENGTH * Math.sin(barrelAngle),
        };
    }

    fire() {
        if (this.cooldownTimer <= 0) {
            this.cooldownTimer = this.RELOAD_TIME;
            this.ammo--;
            this.game.gameObjects.add(
                new Bullet(
                    new p5.Vector(this.endOfBarrel.x, this.endOfBarrel.y),
                    new p5.Vector(this.endOfBarrel.x - this.turretCenter.x, this.endOfBarrel.y - this.turretCenter.y)
                )
            );
        }
    }

    render() {
        setColor("gray");
        strokeWeight(5);
        line(this.turretCenter.x, this.turretCenter.y, this.endOfBarrel.x, this.endOfBarrel.y);
        strokeWeight(1);
        setColor("silver");
        ellipse(this.turretCenter.x, this.turretCenter.y, this.TURRET_DIAMETER, this.TURRET_DIAMETER);

        // draw stationary part of base
        setColor("brown");
        rect(
            this.position.x - this.BASE_WIDTH / 2,
            this.position.y - this.BASE_HEIGHT,
            this.BASE_WIDTH,
            this.BASE_HEIGHT
        );
    }
}

class Bullet extends GameObject {
    BULLET_DIAMETER = 2;
    BULLET_SPEED = 10;
    constructor(position, direction) {
        super("bullet", position);
        this.damage = 10;
        this.direction = direction;
    }

    update() {
        this.position = new p5.Vector(
            this.position.x + this.direction.x / this.BULLET_SPEED,
            this.position.y + this.direction.y / this.BULLET_SPEED
        );
    }

    render() {
        setColor("black");
        ellipse(this.position.x, this.position.y, this.BULLET_DIAMETER, this.BULLET_DIAMETER);
    }
}
