import { Entity } from "./game-object.js";
import { Splatter, Explosion } from "./particles.js";
import { setColor, isBulletCollision, isBombCollision } from "./utils.js";
import { Vec } from "./math/vec.js";

class Bullet extends Entity {
    DIAMETER = 2;
    SPEED = 10;

    DAMAGE = 10;

    constructor(position, direction) {
        super("bullet", position);
        this.direction = direction;
        this.width = this.DIAMETER;
        this.height = this.DIAMETER;
    }

    update(worldBounds, gameObjects) {
        const dir = this.direction.copy();
        dir.div(this.SPEED);
        this.position.add(dir);

        gameObjects.bombs.forEach((bomb) => {
            if (isBulletCollision(bomb, this)) {
                this.dead = true;
                gameObjects.visualEffects.add(new Explosion(this.position, this.direction));
                bomb.takeDamage(this.DAMAGE);
            }
        });
        gameObjects.aircraft.forEach((aircraft) => {
            if (isBulletCollision(aircraft, this)) {
                this.dead = true;
                gameObjects.visualEffects.add(new Explosion(this.position, this.direction));
                aircraft.takeDamage(this.DAMAGE);
            }
        });
        gameObjects.paratroopers.forEach((paratrooper) => {
            if (isBulletCollision(paratrooper, this)) {
                this.dead = true;
                gameObjects.visualEffects.add(new Splatter(this.position, this.direction));
                paratrooper.takeDamage(this.DAMAGE);
            }
        });
    }

    render() {
        setColor("black");
        ellipse(this.position.x, this.position.y, this.width, this.height);
    }
}

class Bomb extends Entity {
    DIAMETER = 5;
    MAX_HEALTH = 15;

    MAX_Y_VELOCITY = 3;
    Y_GRAVITY = 0.1;

    DAMAGE = 100;

    constructor(position, direction) {
        super("bomb", position);
        this.direction = direction;
        this.width = this.DIAMETER;
        this.height = this.DIAMETER;
        this.health = this.MAX_HEALTH;
    }

    update(bounds, gameObjects) {
        let yVel = (this.direction.y += this.Y_GRAVITY);
        if (yVel > this.MAX_Y_VELOCITY) yVel = this.MAX_Y_VELOCITY;
        this.direction.set(this.direction.x, yVel);
        this.position.add(this.direction);

        gameObjects.paratroopers.forEach((paratrooper) => {
            if (paratrooper.onGround() && isBombCollision(paratrooper, this)) {
                this.dead = true;
                gameObjects.visualEffects.add(new Explosion(this.position, this.direction));
                paratrooper.takeDamage(this.DAMAGE);
            }
        });
        gameObjects.crates.forEach((crate) => {
            if (isBombCollision(crate, this)) {
                this.dead = true;
                gameObjects.visualEffects.add(new Explosion(this.position, this.direction));
                crate.takeDamage(this.DAMAGE);
            }
        });
        this.checkGround(bounds);
        if (this.isOnGround) {
            this.dead = true;
            gameObjects.visualEffects.add(new Explosion(this.position, this.direction));
        }
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
