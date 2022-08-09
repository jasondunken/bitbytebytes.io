class GameObject {
    constructor(type, position, size) {
        this.type = type ? type : "none";
        this.position = position ? position : new P5.Vector(0, 0);
        this.size = size ? size : 1;
        this.remove = false;
    }
}

class Player extends GameObject {
    BASE_COOL_DOWN = 15;
    coolDown = 0;
    weaponReady = true;

    constructor(world) {
        super("player", Vec2.ZERO, WORLD.METADATA.PLAYER_SIZE);
        this.moveSpeed = WORLD.METADATA.PLAYER_SPEED;
        this.world = world;
    }

    update() {
        if (keyIsDown(RIGHT_ARROW)) this.position.x += this.moveSpeed;
        if (keyIsDown(LEFT_ARROW)) this.position.x -= this.moveSpeed;

        if (this.position.x < 0 + this.size / 2) this.position.x = this.size / 2;
        if (this.position.x > this.world.width - this.size / 2) this.position.x = this.world.width - this.size / 2;

        if (keyIsDown(32) && this.weaponReady) {
            this.fire();
        }

        if (!this.weaponReady) {
            this.coolDown--;
            if (this.coolDown === 0) {
                this.weaponReady = true;
            }
        }
    }

    render() {
        if (this.sprite) {
            image(this.sprite, this.position.x - this.size, this.position.y - this.size, this.size * 2, this.size * 2);
        }
    }

    fire() {
        if (this.weaponReady) {
            this.world.level.gameObjects.add(new Shot(new Vec2(this.position.x, this.position.y), Vec2.UP));
            this.coolDown = this.BASE_COOL_DOWN;
            this.weaponReady = false;
        }
    }

    setPosition(position) {
        this.position = position;
    }

    setSprite(sprite) {
        this.sprite = sprite;
    }
}

class DemoPlayer extends Player {
    constructor(world) {
        super(world);
        this.moveSpeed = WORLD.METADATA.PLAYER_SPEED;
    }

    update() {
        if (frameCount % 30 === 0) {
            this.fire();
        }
        this.position.x += this.moveSpeed;

        if (this.position.x < this.size || this.position.x > this.world.width - this.size) {
            this.moveSpeed *= -1;
        }

        if (!this.weaponReady) {
            this.coolDown--;
            if (this.coolDown <= 0) {
                this.coolDown = this.BASE_COOL_DOWN;
                this.weaponReady = true;
            }
        }
    }
}

class Shot extends GameObject {
    WIDTH = 4;
    static LENGTH = 8;
    MOVE_SPEED = 3;
    constructor(position, direction) {
        super("shot", position, Shot.LENGTH);
        this.direction = direction;
    }

    update() {
        this.position.y += this.MOVE_SPEED * this.direction.y;
    }

    render() {
        let r = random(0, 255);
        let g = random(0, 255);
        let b = random(0, 255);
        let a = random(0, 255);
        stroke(r, g, b, a);
        strokeWeight(this.WIDTH);
        line(this.position.x, this.position.y, this.position.x, this.position.y + this.size);
    }
}
