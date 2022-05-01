let game = null;

function setup() {
    let canvas = createCanvas(400, 300);
    canvas.parent("game");

    frameRate(60);
    noSmooth();
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
    levelManager = new LevelManager();
    currentLives = 0;
    score = 0;
    gameOver = false;

    level = null;

    startDelay = 60;

    constructor() {}

    initializeGame() {
        this.currentLives = STARTING_LIVES;
        this.loadLevel("level_1");
    }

    update() {
        if (this.level) {
            this.startDelay--;
            if (this.startDelay > 0) return;

            this.level.player.update();

            // check player bounds
            if (this.level.player.pos.x < 0 + this.level.player.size / 2)
                this.level.player.pos.x = this.level.player.size / 2;
            if (this.level.player.pos.x > width - this.level.player.size / 2)
                this.level.player.pos.x = width - this.level.player.size / 2;

            for (let row of this.level.aliens) {
                for (let alien of row) {
                    alien.update();
                }
            }

            // check for alien/bounds and alien/alien collision
            for (let row of this.level.aliens) {
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
            for (let i = this.level.player.shots.length - 1; i >= 0; i--) {
                for (let row of this.level.aliens) {
                    for (let j = row.length - 1; j >= 0; j--) {
                        let d = dist(
                            this.level.player.shots[i].pos.x,
                            this.level.player.shots[i].pos.y,
                            row[j].pos.x,
                            row[j].pos.y
                        );
                        if (d <= this.level.player.shots[i].size / 2 + row[j].size / 2) {
                            this.level.player.shots[i].dead = true;
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
    }

    render() {
        if (this.level) {
            background(this.level.backgroundImage);
            this.level.player.render();
            for (let row of this.level.aliens) {
                for (let alien of row) {
                    alien.render();
                }
            }

            // RENDER UI
            stroke("white");
            strokeWeight(2);
            fill("blue");
            textSize(18);
            text(`SCORE ${this.score}`, 24, 22);

            noStroke();
            fill("green");
            for (let i = 0; i < this.currentLives; i++) {
                ellipse(width - 32 - i * 32, 16, 16, 16);
            }
        }
    }

    async loadLevel(level) {
        const display = { width, height, SCOREBOARD_HEIGHT };
        this.level = await this.levelManager.initializeLevel(display, level);
        console.log("this.level: ", this.level);
    }
}
