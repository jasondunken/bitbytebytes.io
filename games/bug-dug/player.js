class Player extends GameObject {
    width = 24;
    height = 24;
    grounded = false;
    speed = 2;

    collider = {
        a: { x: 0, y: 0 },
        b: { x: 0, y: 0 },
        c: { x: 0, y: 0 },
        d: { x: 0, y: 0 },
    };

    constructor(sprite) {
        super("player");
        this.sprite = sprite;
    }

    update() {
        if (keyIsDown(65)) this.position.x -= this.speed;
        if (keyIsDown(68)) this.position.x += this.speed;

        // if (keyIsDown(87)) this.climb();
        if (keyIsDown(87)) this.position.y -= 1;
        if (keyIsDown(83)) this.position.y += 1;

        if (keyIsDown(32)) this.jump();

        if (keyIsDown(38)) this.digUp();
        if (keyIsDown(39)) this.digRight();
        if (keyIsDown(40)) this.digDown();
        if (keyIsDown(37)) this.digLeft();

        this.updateCollider();
    }

    updateCollider() {
        this.collider = {
            a: { x: this.position.x - this.width / 2, y: this.position.y - this.height },
            b: { x: this.position.x + this.width / 2, y: this.position.y - this.height },
            c: { x: this.position.x + this.width / 2, y: this.position.y },
            d: { x: this.position.x - this.width / 2, y: this.position.y },
        };
    }

    climb() {
        console.log("climb");
    }
    jump() {
        console.log("jump");
    }
    digUp() {
        console.log("digUp");
    }
    digRight() {
        console.log("digRight");
    }
    digDown() {
        console.log("digDown");
    }
    digLeft() {
        console.log("digLeft");
    }

    render() {
        fill("blue");
        rect(this.collider.a.x, this.collider.a.y, this.width, this.height);
    }
}

class DemoPlayer extends Player {
    constructor(sprite) {
        super(sprite);
    }
}
