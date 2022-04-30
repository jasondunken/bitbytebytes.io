let game = null;
let loader = null;

function setup() {
    let canvas = createCanvas(400, 300);
    canvas.parent("game");

    loader = new SpriteLoader();

    frameRate(60);
    initGame();
}

function initGame() {
    game = new PlanetInvaders();
    game.initializeGame();
}

function draw() {
    game.update();
    game.render();
}

// PlanetInvaders
const STARTING_LIVES = 3;
const SCOREBOARD_HEIGHT = 48;

class PlanetInvaders {
    currentLives = 0;
    score = 0;
    gameOver = false;

    level = null;
    player = null;
    aliens = [];

    startDelay = 60;

    constructor() {}

    initializeGame() {
        this.currentLives = STARTING_LIVES;
        this.loadLevel(new Level(width, height, SCOREBOARD_HEIGHT));
    }

    update() {
        this.startDelay--;
        if (this.startDelay > 0) return;

        this.player.update();

        // check player bounds
        if (this.player.pos.x < 0 + this.player.size / 2) this.player.pos.x = this.player.size / 2;
        if (this.player.pos.x > width - this.player.size / 2) this.player.pos.x = width - this.player.size / 2;

        for (let row of this.aliens) {
            for (let alien of row) {
                alien.update();
            }
        }

        // check for alien/bounds and alien/alien collision
        for (let row of this.aliens) {
            let changeRowDirection = false;
            for (let alien of row) {
                if (alien.pos.x <= 0 + alien.size / 2 || alien.pos.x > width - alien.size / 2) {
                    changeRowDirection = true;
                    break;
                }
            }
            if (changeRowDirection) {
                for (let alien of row) {
                    alien.speed = -alien.speed;
                }
            }
        }

        //check for alien/shot collision
        for (let i = this.player.shots.length - 1; i >= 0; i--) {
            for (let row of this.aliens) {
                for (let j = row.length - 1; j >= 0; j--) {
                    let d = dist(this.player.shots[i].pos.x, this.player.shots[i].pos.y, row[j].pos.x, row[j].pos.y);
                    if (d <= this.player.shots[i].size / 2 + row[j].size / 2) {
                        this.player.shots[i].dead = true;
                        row.splice(j, 1);

                        this.score += 10;
                        break;
                    }
                }
            }
        }

        // //check for alien/player collision
        // for (let i = 0; i < this.aliens.length; i++) {
        //     let d = dist(this.player.pos.x, this.player.pos.y, this.aliens[i].pos.x, this.aliens[i].pos.y);
        //     if (d < this.player.size / 2 + this.aliens[i].size / 2) {
        //         this.gameOver = true;
        //     }
        // }

        // //Check if aliens have reached bottom
        // for (let i = 0; i < this.aliens.length; i++) {
        //     if (this.aliens[i].pos.y >= height) {
        //         this.gameOver = true;
        //     }
        // }
        // //check if all the aliens are dead
        // if (this.aliens.length < 1) {
        //     // loadLevel(level);
        // }

        //exit render loop if game over
        if (this.gameOver) {
            noLoop();
        }
    }

    render() {
        background(this.level.backgroundImage);
        noSmooth();
        this.renderUI();
        this.player.render();
        for (let row of this.aliens) {
            for (let alien of row) {
                alien.render();
            }
        }
    }

    renderUI() {
        fill("blue");
        textSize(18);
        text(`SCORE ${this.score}`, 24, 22);

        noStroke();
        fill("green");
        for (let i = 0; i < this.currentLives; i++) {
            ellipse(width - 32 - i * 32, 16, 16, 16);
        }
    }

    loadLevel(level) {
        this.level = level;
        this.player = level.getPlayer();
        this.aliens = level.getAliens();
    }
}
