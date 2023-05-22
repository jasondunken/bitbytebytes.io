import { Entity } from "./game-object.js";
import { Vec } from "./math/vec.js";
import { setColor } from "./utils.js";

class Bullet extends Entity {
    DIAMETER = 2;
    SPEED = 10;
    constructor(position, direction) {
        super("bullet", position);
        this.direction = direction;
        this.width = this.DIAMETER;
        this.height = this.DIAMETER;
        this.damage = 10;
    }

    update() {
        this.position = new Vec(
            this.position.x + this.direction.x / this.SPEED,
            this.position.y + this.direction.y / this.SPEED
        );
    }

    render() {
        setColor("black");
        ellipse(this.position.x, this.position.y, this.width, this.height);
    }
}

class Bomb extends Entity {
    DIAMETER = 5;
    MAX_HEALTH = 5;
    MAX_FALLING_SPEED = 3;
    Y_GRAVITY = 0.1;
    Y_VELOCITY = 0;
    DAMAGE = 100;

    health;
    constructor(position, direction) {
        super("bomb", position);
        this.direction = direction;
        this.width = this.DIAMETER;
        this.height = this.DIAMETER;
        this.health = this.MAX_HEALTH;
    }

    update() {
        this.position.x += this.direction.x;
        this.Y_VELOCITY += this.Y_GRAVITY;
        if (this.Y_VELOCITY > this.MAX_FALLING_SPEED) this.Y_VELOCITY = this.MAX_FALLING_SPEED;
        this.position.y += this.Y_VELOCITY;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) this.dead = true;
    }

    render() {
        setColor("brown");
        ellipse(this.position.x, this.position.y, this.width, this.height);
    }
}

export { Bullet, Bomb };
