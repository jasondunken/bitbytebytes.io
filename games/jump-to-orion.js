const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;

let game = null;

// p5.js functions ------------------------>
function preload() {
    let scenery = [];
    let images = {};
    img_background1 = new Image();
    img_background1.src = "./jump-to-orion/img/space.png";
    img_background1.xScroll = 0;
    img_background1.xScrollSpeed = 1;
    scenery.push(img_background1);
    img_background2 = new Image();
    img_background2.src = "./jump-to-orion/img/planets.png";
    img_background2.xScroll = 0;
    img_background2.xScrollSpeed = 2;
    scenery.push(img_background2);
    img_foreground1 = new Image();
    img_foreground1.src = "./jump-to-orion/img/debris.png";
    img_foreground1.xScroll = 0;
    img_foreground1.xScrollSpeed = 5;
    scenery.push(img_foreground1);

    images["player"] = loadImage("./jump-to-orion/img/sprite1.png");
    images["rocket"] = loadImage("./jump-to-orion/img/rocket.png");
    images["alien"] = loadImage("./jump-to-orion/img/alien.png");
    images["alienRocket"] = loadImage("./jump-to-orion/img/rocket-alien.png");
    images["healthSML"] = loadImage("./jump-to-orion/img/healthSMLImage.png");
    images["healthMED"] = loadImage("./jump-to-orion/img/healthMEDImage.png");
    images["healthLRG"] = loadImage("./jump-to-orion/img/healthLRGImage.png");
    images["ammo"] = loadImage("./jump-to-orion/img/ammoImage.png");
    images["shield"] = loadImage("./jump-to-orion/img/shieldImage.png");
    images["health_ui"] = loadImage("./jump-to-orion/img/healthImage_ui.png");
    images["ammo_ui"] = loadImage("./jump-to-orion/img/ammoImage_ui.png");
    images["shield_ui"] = loadImage("./jump-to-orion/img/shieldImage_ui.png");
    images["explosion_0"] = loadImage("./jump-to-orion/img/explosion_0.png");
    images["explosion_1"] = loadImage("./jump-to-orion/img/explosion_1.png");
    images["explosion_2"] = loadImage("./jump-to-orion/img/explosion_2.png");
    images["explosion_3"] = loadImage("./jump-to-orion/img/explosion_3.png");
    images["explosion_4"] = loadImage("./jump-to-orion/img/explosion_4.png");

    game = new JumpToOrion(GAME_WIDTH, GAME_HEIGHT, scenery, images);
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

function mousePressed() {
    game.mousePressed({ x: mouseX, y: mouseY });
}
// p5.js functions end -------------------->

class JumpToOrion {
    PLAYER_1_START_BUTTON = document.getElementById("start-1p").addEventListener("click", () => {
        this.start1Player();
    });

    HEIGHT;
    WIDTH;

    scenery = [];
    images = {};

    player;
    score = 0;

    items = [];
    aliens = [];
    rockets = [];

    gameObjects = [];

    explosionManager = null;

    constructor(width, height, scenery, images) {
        this.WIDTH = width;
        this.HEIGHT = height;
        this.scenery = scenery;
        this.images = images;
        this.explosionManager = new ExplosionManager();
        this.explosionManager.addAnimation(
            "explosion_1",
            new Animation(
                [
                    this.images["explosion_0"],
                    this.images["explosion_1"],
                    this.images["explosion_2"],
                    this.images["explosion_3"],
                    this.images["explosion_4"],
                ],
                15,
                false
            )
        );
    }

    mousePressed(pos) {
        for (let gameObj of this.gameObjects) {
            if (gameObj.type === "item") {
                if (dist(pos.x, pos.y, gameObj.currentPos.x, gameObj.currentPos.y) < gameObj.size) {
                    switch (gameObj.id) {
                        case "healthSML":
                        case "healthMED":
                        case "healthLRG":
                            this.player.addHealth(gameObj.value);
                            break;
                        case "ammo":
                            this.player.addAmmo(gameObj.value);
                            break;
                        case "shield":
                            this.player.addShield(gameObj.value);
                    }
                    this.gameObjects.splice(this.gameObjects.indexOf(gameObj), 1);
                    return;
                }
            }
        }
    }

    startDemo() {
        this.player = new DemoPlayer(
            { x: 100, y: this.HEIGHT / 2 },
            2,
            32,
            this.images["player"],
            this.images["rocket"]
        );
        this.startGame();
    }

    start1Player() {
        this.player = new Player({ x: 100, y: this.HEIGHT / 2 }, 2, 32, this.images["player"], this.images["rocket"]);
        this.startGame();
    }

    startGame() {
        this.score = 0;
        this.items = [];
        this.aliens = [];
        this.rockets = [];
        this.resetScenery();
        this.explosionManager.reset();
    }

    update() {
        for (let layer of this.scenery) {
            layer.xScroll += layer.xScrollSpeed;
            if (layer.xScroll >= layer.width) {
                layer.xScroll = 0;
            }
        }

        this.player.update();

        if (frameCount % 60 === 0) {
            const itemTypes = ["healthSML", "healthMED", "healthLRG", "ammo", "shield"];
            const item = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            this.gameObjects.push(
                new Item({ x: width + 32, y: Math.floor(Math.random() * this.HEIGHT) }, -2, 32, this.images[item], item)
            );
            this.gameObjects.push(
                new Alien({ x: width + 32, y: Math.floor(Math.random() * this.HEIGHT) }, -3, 32, this.images["alien"])
            );
        }

        for (let i = this.gameObjects.length - 1; i >= 0; i--) {
            const gameObj = this.gameObjects[i];
            gameObj.update();
            const playerCollision = this.player.checkForCollision(gameObj);
            if (playerCollision) {
                this.explosionManager.addExplosion(
                    { x: gameObj.currentPos.x, y: gameObj.currentPos.y },
                    -1,
                    32,
                    "explosion_1"
                );
                this.gameObjects.splice(i, 1);
            }
            if (gameObj.currentPos.x < -gameObj.size) {
                this.gameObjects.splice(i, 1);
            }
        }
        this.explosionManager.update();
    }

    render() {
        background("black");
        this.renderSceneryLayer(this.scenery[0], this.WIDTH, this.HEIGHT);
        this.renderSceneryLayer(this.scenery[1], this.WIDTH, this.HEIGHT);
        this.player.draw();
        for (let gameObj of this.gameObjects) {
            gameObj.draw();
        }
        this.explosionManager.draw();
        this.renderSceneryLayer(this.scenery[2], this.WIDTH, this.HEIGHT);

        // UI elements
        const statBar = {
            height: 18,
            width: 96,
        };
        noStroke();
        const health = this.player.getHealth();
        const healthWidth = (health / this.player.STARTING_HEALTH) * statBar.width;
        fill("red");
        rect(42, this.HEIGHT - 13 - statBar.height, statBar.width, statBar.height);
        fill("green");
        rect(42, this.HEIGHT - 13 - statBar.height, healthWidth, statBar.height);
        image(this.images["health_ui"], 10, this.HEIGHT - 42, 32, 32);

        const shield = this.player.getShield();
        const shieldWidth = (shield / this.player.STARTING_SHIELD) * statBar.width;
        fill("red");
        rect(170, this.HEIGHT - 13 - statBar.height, statBar.width, statBar.height);
        fill("lightblue");
        rect(170, this.HEIGHT - 13 - statBar.height, shieldWidth, statBar.height);
        image(this.images["shield_ui"], 138, this.HEIGHT - 42, 32, 32);

        image(this.images["ammo_ui"], 270, this.HEIGHT - 42, 32, 32);
        const ammo = this.player.getAmmo();
        const topRowCount = this.countBelow(ammo, this.player.STARTING_AMMO / 2);
        const bottomRowCount = this.countAbove(ammo, this.player.STARTING_AMMO / 2);
        for (let i = 0; i < topRowCount; i++) {
            image(this.images["rocket"], 302 + i * 8, this.HEIGHT - 40, 16, 16);
        }
        for (let i = 0; i < bottomRowCount; i++) {
            image(this.images["rocket"], 302 + i * 8, this.HEIGHT - 25, 16, 16);
        }

        fill("red");
        textSize(28);
        text(`Score ${this.score}`, this.WIDTH - 180, this.HEIGHT - 15);

        let debug = true;
        if (debug) {
            textSize(16);
            text(`i: ${this.items.length}`, 10, 20);
            text(`a: ${this.aliens.length}`, 50, 20);
            text(`m: ${this.player.rockets.length}`, 90, 20);
            text(`e: ${this.explosionManager.explosions.length}`, 130, 20);
        }
    }

    renderSceneryLayer(layer, width, height) {
        drawingContext.drawImage(layer, layer.xScroll, 0, width, height, 0, 0, width, height);
        if (layer.xScroll > layer.width - width) {
            drawingContext.drawImage(layer, layer.xScroll - layer.width, 0, width, height, 0, 0, width, height);
        }
    }

    resetScenery() {
        for (let layer of this.scenery) {
            layer.xScroll = 0;
        }
    }

    countBelow(number, split) {
        if (number <= split) return number;
        if (number > split) return split;
    }

    countAbove(number, split) {
        if (number < split) return 0;
        if (number > split) return number - split;
    }
}
