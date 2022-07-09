const GAME_WIDTH = 512;
const GAME_HEIGHT = 768;

let game = null;

// p5.js functions ------------------------>
function preload() {
    let sprites = Terrain.loadSprites();

    let font = loadFont("./bug-dug/font/PressStart2P.ttf");

    game = new BugDug(GAME_WIDTH, GAME_HEIGHT, sprites, font);
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

    terrain = null;
    backgroundLayer = null;
    foregroundLayer = null;

    player = null;
    currentLevel = 0;

    constructor(width, height, sprites, font) {
        this.width = width;
        this.height = height;
        this.sprites = sprites;
        this.font = font;
        this.demo = true;
        this.gameOver = true;
        this.score = 0;
        this.gameObjects = [];
    }

    startDemo() {
        this.demo = true;
        this.player = new DemoPlayer(this.sprites["player"]);
        this.startGame();
    }

    start1Player() {
        this.demo = false;
        this.player = new Player(this.sprites["player"]);
        this.startGame();
    }

    startGame() {
        this.currentLevel = 0;
        this.gameOver = false;
        this.score = 0;

        this.loadLevel();
    }

    update() {
        this.player.update(this.terrain);

        for (let gameObj of this.gameObjects) {
            gameObj.update();
        }
    }

    render() {
        background(color(this.terrain.skyColor));
        noStroke();
        // draw background
        for (let i = 0; i < this.backgroundLayer.length; i++) {
            for (let j = 0; j < this.backgroundLayer[i].length; j++) {
                if (this.backgroundLayer[i][j] !== "none") {
                    image(
                        this.backgroundLayer[i][j],
                        i * this.terrain.BLOCK_SIZE,
                        j * this.terrain.BLOCK_SIZE,
                        this.terrain.BLOCK_SIZE,
                        this.terrain.BLOCK_SIZE
                    );
                }
            }
        }

        for (let gameObj of this.gameObjects) {
            gameObj.render();
        }

        this.player.render();

        // draw foreground
        for (let i = 0; i < this.foregroundLayer.length; i++) {
            for (let j = 0; j < this.foregroundLayer[i].length; j++) {
                if (this.foregroundLayer[i][j] !== "none") {
                    image(
                        this.foregroundLayer[i][j],
                        i * this.terrain.BLOCK_SIZE,
                        j * this.terrain.BLOCK_SIZE,
                        this.terrain.BLOCK_SIZE,
                        this.terrain.BLOCK_SIZE
                    );
                }
            }
        }
    }

    loadLevel() {
        this.terrain = new Terrain(this.width, this.height, levels[this.currentLevel], this.sprites);
        this.terrain.blocks.forEach((column) => {
            column.forEach((block) => {
                this.gameObjects.push(block);
            });
        });

        this.backgroundLayer = this.terrain.backgroundLayer;
        this.foregroundLayer = this.terrain.foregroundLayer;

        this.player.setPosition({ x: this.terrain.playerSpawn.x, y: this.terrain.playerSpawn.y });
    }
}
