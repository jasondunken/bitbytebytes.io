class Player extends GameObject {
    width = 32;
    height = 32;
    grounded = false;
    speed = 2;

    constructor(sprite) {
        super("player");
        this.sprite = sprite;
    }

    update() {
        if (keyIsDown(65)) this.position.x -= this.speed;
        if (keyIsDown(68)) this.position.x += this.speed;

        if (keyIsDown(87)) this.climb();

        if (keyIsDown(32)) this.jump();

        if (keyIsDown(38)) this.digUp();
        if (keyIsDown(39)) this.digRight();
        if (keyIsDown(40)) this.digDown();
        if (keyIsDown(37)) this.digLeft();
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
        rect(this.position.x - this.width / 2, this.position.y + this.height, this.width, this.height);
    }
}

class DemoPlayer extends Player {
    constructor(sprite) {
        super(sprite);
    }
}
