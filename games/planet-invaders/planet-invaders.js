const GAME_WIDTH = 512; // 32 x 16px
const GAME_HEIGHT = 400; // 25 x 16px

let game = null;

function setup() {
    let canvas = createCanvas(GAME_WIDTH, GAME_HEIGHT);
    canvas.parent("game");

    frameRate(60);
    noSmooth();
    initGame();
}

function initGame() {
    game = new PlanetInvaders(GAME_WIDTH, GAME_HEIGHT);
    game.startDemo();
}

function draw() {
    game.update();
    game.render();
}

// PlanetInvaders
class PlanetInvaders {
    PLAYER_1_START_BUTTON = document.getElementById("start-1p").addEventListener("click", () => {
        this.start1Player();
    });
    SCOREBOARD_HEIGHT = 48;
    display = null;

    START_DELAY = 60;

    STARTING_LIVES = 3;
    DEMO_STARTING_LIVES = 1;
    isDemo = true;

    currentLives = 0;
    score = 0;
    gameOver = true;

    levels = Object.keys(WORLD.LEVELS);
    currentLevel = this.levels[0];
    levelLoader = new LevelLoader();
    level = null;
    levelTime = 0;

    player = null;
    aliens = null;
    shots = null;

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.display = { width, height, scoreboardHeight: this.SCOREBOARD_HEIGHT };
    }

    startDemo() {
        this.isDemo = true;
        this.player = new DemoPlayer(this);
        this.currentLives = this.DEMO_STARTING_LIVES;
        this.startGame();
    }

    start1Player() {
        this.isDemo = false;
        this.player = new Player(this);
        this.currentLives = this.STARTING_LIVES;
        this.startGame();
    }

    startGame() {
        console.log("player: ", this.player);
        this.score = 0;
        this.gameOver = false;
        this.loadLevel(this.currentLevel);
    }

    update() {
        if (this.level) {
            if (!this.gameOver) {
                this.levelTime++;
                if (this.levelTime < this.START_DELAY) return;

                this.player.update();

                this.shots = Array.from(this.level.gameObjects).filter((gameObj) => {
                    return gameObj.type === "shot";
                });

                let moveDown = false;
                this.level.gameObjects.forEach((gameObj) => {
                    gameObj.update();
                    if (this.outOfBounds(gameObj) || gameObj.remove) {
                        this.level.gameObjects.delete(gameObj);
                    }
                    if (gameObj.type != "shot") {
                        this.shots.forEach((shot) => {
                            if (
                                shot.position.x > gameObj.position.x - gameObj.size / 2 &&
                                shot.position.x < gameObj.position.x + gameObj.size / 2 &&
                                shot.position.y > gameObj.position.y - gameObj.size / 2 &&
                                shot.position.y < gameObj.position.y + gameObj.size / 2
                            ) {
                                this.score += 10;
                                this.level.alienCount--;
                                shot.remove = true;
                                gameObj.remove = true;
                            }
                        });
                    }
                    if (gameObj.type === "alien") {
                        if (gameObj.position.x < gameObj.size / 2 || gameObj.position.x > this.width - gameObj.size / 2)
                            moveDown = true;
                    }
                });
                if (moveDown) {
                    this.level.gameObjects.forEach((gameObj) => {
                        if (gameObj.type === "alien") {
                            gameObj.moveDown();
                        }
                    });
                }

                if (this.level.alienCount <= 0) {
                    this.currentLevel = this.levels[(this.levels.indexOf(this.currentLevel) + 1) % this.levels.length];
                    this.loadLevel(this.currentLevel);
                }
            } else {
                // game over update
            }
        }
    }

    render() {
        if (this.level) {
            background(this.level.backgroundImage);

            this.level.gameObjects.forEach((gameObj) => {
                gameObj.render();
            });
            this.player.render();

            if (this.gameOver) {
                stroke("white");
                strokeWeight(4);
                fill("blue");
                textSize(32);
                textAlign(CENTER);
                text(`GAME OVER`, width / 2, height / 2);
            }

            // RENDER UI
            stroke("white");
            strokeWeight(2);
            fill("blue");
            textSize(18);
            textAlign(LEFT);
            text(`SCORE ${this.score}`, 24, 22);

            for (let i = 0; i < this.currentLives; i++) {
                image(this.player.sprite, width - 48 - i * 32, 0, 32, 32);
            }
        }
    }

    async loadLevel(level) {
        this.level = await this.levelLoader.initializeLevel(level, this.player, this.display);
        this.levelTime = 0;
    }

    outOfBounds(gameObj) {
        if (
            gameObj.position.x < 0 - gameObj.size ||
            gameObj.position.y < 0 - gameObj.size ||
            gameObj.position.x > this.width + gameObj.size ||
            gameObj.position.y > this.height + gameObj.size
        )
            return true;
        return false;
    }
}
