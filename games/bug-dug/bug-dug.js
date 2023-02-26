const GAME_WIDTH = 512;
const GAME_HEIGHT = 768;

let game = null;

// p5.js functions ------------------------>
function preload() {
    let blockSprites = LevelArchitect.loadSprites();
    let playerSprites = Player.loadSpriteSheets();
    let enemySprites = Enemy.loadSpriteSheets();

    let font = loadFont("./bug-dug/font/PressStart2P.ttf");

    game = new BugDug(GAME_WIDTH, GAME_HEIGHT, blockSprites, playerSprites, enemySprites, font);
}

function setup() {
    let canvas = createCanvas(GAME_WIDTH, GAME_HEIGHT);
    canvas.parent("game");

    frameRate(60);
    noSmooth();
    initGame();
}

function initGame() {
    game.startDemo();
}

function draw() {
    game.update();
    game.render();
}

class BugDug {
    PLAYER_1_START_BUTTON = document.getElementById("start-1p").addEventListener("click", () => {
        this.start1Player();
    });

    level = null;
    backgroundLayer = null;
    foregroundLayer = null;
    damageAnimation = null;

    player = null;
    currentLevel = 0;

    constructor(width, height, blockSprites, playerSprites, enemySprites, font) {
        this.width = width;
        this.height = height;
        this.blockSprites = blockSprites;
        this.playerSprites = playerSprites;
        this.enemySprites = enemySprites;
        this.font = font;

        this.demo = true;
        this.gameOver = true;
        this.score = 0;
        this.gameObjects = new Set();
    }

    startDemo() {
        this.demo = true;
        this.player = new DemoPlayer(this.playerSprites);
        this.startGame();
    }

    start1Player() {
        this.demo = false;
        this.player = new Player(this.playerSprites);
        this.startGame();
    }

    startGame() {
        this.currentLevel = 0;
        this.gameOver = false;
        this.score = 0;

        this.loadLevel();
    }

    update() {
        this.player.update(this.level);
        for (let enemy of this.level.enemies) {
            enemy.update(this.level);
        }

        this.gameObjects.forEach((gameObj) => {
            gameObj.update();
            if (gameObj.destroyed) {
                clearForegroundAround(getGridIndex(gameObj.position, this.level.BLOCK_SIZE), this.foregroundLayer);
            }
        });
    }

    render() {
        background(color(this.level.skyColor));
        noStroke();
        // draw background
        for (let i = 0; i < this.backgroundLayer.length; i++) {
            for (let j = 0; j < this.backgroundLayer[i].length; j++) {
                if (this.backgroundLayer[i][j] !== "none") {
                    image(
                        this.backgroundLayer[i][j],
                        i * this.level.BLOCK_SIZE,
                        j * this.level.BLOCK_SIZE,
                        this.level.BLOCK_SIZE,
                        this.level.BLOCK_SIZE
                    );
                }
            }
        }

        this.gameObjects.forEach((gameObj) => {
            gameObj.render();
            if (gameObj.type === "block") {
                if (!gameObj.destroyed && gameObj.health < gameObj.MAX_HEALTH) {
                    let damageSpriteIndex = Math.floor(
                        map(gameObj.health, 0, gameObj.MAX_HEALTH, this.damageAnimation.keyFrames.length - 1, 0)
                    );
                    image(
                        this.damageAnimation.keyFrames[damageSpriteIndex],
                        gameObj.position.x,
                        gameObj.position.y,
                        gameObj.width,
                        gameObj.height
                    );
                }
                if (gameObj.destroyed) {
                    const blockAbove = getBlockAbove(
                        getGridIndex(gameObj.position, this.level.BLOCK_SIZE),
                        this.level.blocks
                    );
                    if (blockAbove.destroyed || blockAbove.blockType === "air") {
                        image(
                            this.blockSprites["background-ladder"],
                            gameObj.position.x,
                            gameObj.position.y,
                            gameObj.width,
                            gameObj.height
                        );
                    } else {
                        image(
                            this.blockSprites["background-wall"],
                            gameObj.position.x,
                            gameObj.position.y,
                            gameObj.width,
                            gameObj.height
                        );
                    }
                }
            }
        });

        this.player.render();
        clearForegroundAround(
            getGridIndex(this.player.position, this.level.BLOCK_SIZE),
            this.level.foregroundLayer,
            1.75
        );
        for (let enemy of this.level.enemies) {
            enemy.render();
        }
        for (let item of this.level.items) {
            item.render();
        }

        // draw foreground
        for (let i = 0; i < this.foregroundLayer.length; i++) {
            for (let j = 0; j < this.foregroundLayer[i].length; j++) {
                if (this.foregroundLayer[i][j] !== "none") {
                    image(
                        this.foregroundLayer[i][j],
                        i * this.level.BLOCK_SIZE,
                        j * this.level.BLOCK_SIZE,
                        this.level.BLOCK_SIZE,
                        this.level.BLOCK_SIZE
                    );
                }
            }
        }
    }

    loadLevel() {
        this.gameObjects = new Set();
        this.level = new LevelArchitect(
            this.width,
            this.height,
            levels[this.currentLevel],
            this.blockSprites,
            this.enemySprites
        );
        this.level.blocks.forEach((column) => {
            column.forEach((block) => {
                this.gameObjects.add(block);
            });
        });

        this.backgroundLayer = this.level.backgroundLayer;
        this.foregroundLayer = this.level.foregroundLayer;

        this.player.setPosition(this.level.playerSpawn);

        this.damageAnimation = new Animation(this.blockSprites["block-damage"], 60, false);

        console.log("gameObjects: ", this.gameObjects);
        console.log("items: ", this.level.items);
    }
}
