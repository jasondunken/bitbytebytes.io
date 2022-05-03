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

    levels = ["level_1", "level_2", "level_3"];
    level = null;
    levelTime = 0;

    bonus = null;

    START_DELAY = 60;

    constructor() {}

    initializeGame() {
        this.currentLives = STARTING_LIVES;
        this.loadLevel("level_1");
    }

    update() {
        //exit render loop if game over
        if (this.gameOver) {
            noLoop();
        }

        if (this.level) {
            this.levelTime++;
            if (this.levelTime < this.START_DELAY) return;

            this.level.player.update();

            // check player bounds
            if (this.level.player.pos.x < 0 + this.level.player.size / 2)
                this.level.player.pos.x = this.level.player.size / 2;
            if (this.level.player.pos.x > width - this.level.player.size / 2)
                this.level.player.pos.x = width - this.level.player.size / 2;

            if (this.bonus) {
                this.bonus.update();
                if (this.bonus.pos.x > width + this.bonus.size && this.bonus.speed > 0) {
                    this.bonus = null;
                } else if (this.bonus.pos.x < -this.bonus.size && this.bonus.speed < 0) {
                    this.bonus = null;
                }
            }

            for (let row of this.level.aliens) {
                for (let alien of row) {
                    alien.update();
                }
            }

            // check for alien/bounds collision
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

            //check for alien/bonus/shot collision
            for (let i = this.level.player.shots.length - 1; i >= 0; i--) {
                const shot = this.level.player.shots[i];
                if (this.bonus) {
                    let d = dist(shot.pos.x, shot.pos.y, this.bonus.pos.x, this.bonus.pos.y);
                    if (d <= shot.size + this.bonus.size) {
                        this.bonus = null;
                        this.score += 250;
                    }
                }
                for (let row of this.level.aliens) {
                    for (let j = row.length - 1; j >= 0; j--) {
                        let d = dist(shot.pos.x, shot.pos.y, row[j].pos.x, row[j].pos.y);
                        if (d <= shot.size / 2 + row[j].size / 2) {
                            shot.dead = true;
                            row.splice(j, 1);
                            this.level.totalAliens -= 1;
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

            //check if all the aliens are dead
            if (this.level.totalAliens < 1) {
                this.loadLevel(this.levels[Math.floor(Math.random() * this.levels.length)]);
            }

            if (this.levelTime % this.levelManager.BONUS_INTERVAL == 0) {
                this.bonus = this.levelManager.getBonus();
            }
        }
    }

    render() {
        if (this.level) {
            background(this.level.backgroundImage);
            this.level.player.render();

            if (this.bonus) {
                this.bonus.render();
            }

            for (let row of this.level.aliens) {
                for (let alien of row) {
                    alien.render();
                }
            }

            for (let barrier of this.level.barriers) {
                barrier.render();
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
                image(this.level.player.sprite, width - 48 - i * 32, 0, 32, 32);
            }
        }
    }

    async loadLevel(level) {
        const display = { width, height, SCOREBOARD_HEIGHT };
        this.level = await this.levelManager.initializeLevel(display, level);
        this.levelTime = 0;
        this.bonus = null;
    }
}
