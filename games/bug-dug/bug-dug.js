const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

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
        background(color("#9EF6FF"));
        noStroke();

        for (let gameObj of this.gameObjects) {
            gameObj.render();
        }

        this.player.render();

        // draw foreground
        // for (let i = 0; i < this.foregroundLayer.length; i++) {
        //     for (let j = 0; j < this.foregroundLayer[i].length; j++) {
        //         image(
        //             this.foregroundLayer[i][j],
        //             i * this.terrain.blockSize,
        //             j * this.terrain.blockSize + this.terrain.surfaceHeight,
        //             this.terrain.blockSize,
        //             this.terrain.blockSize
        //         );
        //     }
        // }
    }

    loadLevel() {
        this.terrain = new Terrain(this.width, this.height, levels[this.currentLevel]);
        this.terrain.blocks.forEach((column) => {
            column.forEach((block) => {
                this.gameObjects.push(block);
            });
        });

        this.player.setPosition(this.terrain.playerSpawn);

        this.foregroundLayer = [];
        for (let i = 0; i < this.terrain.blocks.length; i++) {
            this.foregroundLayer[i] = [];
            let column = this.terrain.blocks[i];
            for (let j = 0; j < column.length; j++) {
                let sprite = null;
                if (j === 0) {
                    sprite = this.sprites["grass_3"];
                } else {
                    sprite = this.sprites["dirt_3_0"];
                }
                this.foregroundLayer[i][j] = sprite;
            }
        }
        for (let rndDirt = 0; rndDirt < 16; rndDirt++) {
            let i = Math.floor(Math.random() * this.terrain.blocks.length);
            let j = Math.floor(Math.random() * (this.terrain.blocks[0].length - 1)) + 1;
            this.foregroundLayer[i][j] = Math.random() < 0.5 ? this.sprites["dirt_3_1"] : this.sprites["dirt_3_2"];
        }
    }
}
