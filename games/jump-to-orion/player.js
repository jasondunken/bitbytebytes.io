class Player {
    img_player;
    pos;
    img_rocket;
    fireReady = 0;
    cooldown = 30;
    rockets = [];

    constructor(img_player, pos, img_rocket) {
        this.img_player = img_player;
        this.pos = pos;
        this.img_rocket = img_rocket;
    }

    update() {
        if (keyIsDown(87)) this.pos.y -= 1;
        if (keyIsDown(83)) this.pos.y += 1;
        if (keyIsDown(32) && this.fireReady === 0) {
            this.fireReady = this.cooldown;
            this.rockets.push({ x: this.pos.x, y: this.pos.y, s: 5 });
        } else {
            this.fireReady -= 1;
            if (this.fireReady < 0) this.fireReady = 0;
        }

        for (let rocket of this.rockets) {
            rocket.x += rocket.s;
        }
    }

    draw() {
        drawingContext.drawImage(this.img_player, this.pos.x, this.pos.y);
        for (let rocket of this.rockets) {
            drawingContext.drawImage(img_rocket, rocket.x, rocket.y);
        }
    }
}
