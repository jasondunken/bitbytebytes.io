const GAME_WIDTH = 512;
const GAME_HEIGHT = 768;

let game = null;

// p5.js functions ------------------------>
function preload() {
    let font = loadFont("./expedition-luna/font/PressStart2P.ttf");
    game = new ExpeditionLuna(GAME_WIDTH, GAME_HEIGHT, font);
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

class ExpeditionLuna {
    PLAYER_1_START_BUTTON = document.getElementById("start-1p").addEventListener("click", () => {
        this.start1Player();
    });

    player = null;
    terrain = null;

    constructor(width, height, font) {
        this.width = width;
        this.height = height;
        this.font - font;
    }

    startDemo() {
        this.player = new DemoLander();
        this.startGame();
    }

    start1Player() {
        this.player = new Lander();
        this.startGame();
    }

    startGame() {
        const terrainPoints = 16;
        const landingAreas = 3;
        const landingAreaWidth = 64;
        this.terrain = [];
        for (let i = 0; i <= terrainPoints; i++) {
            this.terrain.push([Math.floor((i * this.width) / terrainPoints), Math.floor(Math.random() * 100) + 500]);
        }

        console.log("terrain: ", this.terrain);
    }

    update() {
        if (keyIsDown(87)) this.mainThruster();
        if (keyIsDown(65)) this.leftRCS();
        if (keyIsDown(68)) this.rightRCS();
    }

    render() {
        background("black");
        stroke("white");
        for (let i = 0; i < this.terrain.length - 1; i++) {
            line(this.terrain[i][0], this.terrain[i][1], this.terrain[i + 1][0], this.terrain[i + 1][1]);
        }
    }
}

class Lander {
    constructor() {}
}

class DemoLander extends Lander {
    constructor() {
        super();
    }
}
