const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;

let game = null;

// p5.js functions ------------------------>
function preload() {
    let scenery = [];
    let sprites = {};
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

    sprites["player"] = loadImage("./jump-to-orion/img/sprite1.png");
    sprites["rocket"] = loadImage("./jump-to-orion/img/rocket.png");
    sprites["alien"] = loadImage("./jump-to-orion/img/alien.png");
    sprites["alienRocket"] = loadImage("./jump-to-orion/img/rocket-alien.png");
    sprites["healthSML"] = loadImage("./jump-to-orion/img/healthSMLImage.png");
    sprites["healthMED"] = loadImage("./jump-to-orion/img/healthMEDImage.png");
    sprites["healthLRG"] = loadImage("./jump-to-orion/img/healthLRGImage.png");
    sprites["ammo"] = loadImage("./jump-to-orion/img/ammoImage.png");
    sprites["shield"] = loadImage("./jump-to-orion/img/shieldImage.png");
    sprites["health_ui"] = loadImage("./jump-to-orion/img/healthImage_ui.png");
    sprites["ammo_ui"] = loadImage("./jump-to-orion/img/ammoImage_ui.png");
    sprites["shield_ui"] = loadImage("./jump-to-orion/img/shieldImage_ui.png");
    sprites["explosion_0"] = loadImage("./jump-to-orion/img/explosion_0.png");
    sprites["explosion_1"] = loadImage("./jump-to-orion/img/explosion_1.png");
    sprites["explosion_2"] = loadImage("./jump-to-orion/img/explosion_2.png");
    sprites["explosion_3"] = loadImage("./jump-to-orion/img/explosion_3.png");
    sprites["explosion_4"] = loadImage("./jump-to-orion/img/explosion_4.png");

    let font = loadFont("./jump-to-orion/font/PressStart2P.ttf");

    game = new JumpToOrion(GAME_WIDTH, GAME_HEIGHT, scenery, sprites, font);
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
    sprites = {};
    font;

    player;
    score = 0;

    gameObjects = [];

    constructor(width, height, scenery, sprites, font) {
        this.WIDTH = width;
        this.HEIGHT = height;
        this.scenery = scenery;
        this.sprites = sprites;
        this.font = font;
    }

    mousePressed(pos) {
        if (!this.demo) {
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
    }

    startDemo() {
        this.demo = true;
        this.player = new DemoPlayer({ x: 100, y: this.HEIGHT / 2 }, 2, 32, this.sprites["player"]);
        this.startGame();
    }

    start1Player() {
        this.demo = false;
        this.player = new Player({ x: 100, y: this.HEIGHT / 2 }, 2, 32, this.sprites["player"]);
        this.startGame();
    }

    startGame() {
        this.score = 0;
        this.gameObjects = [];
        this.resetScenery();
    }

    update() {
        this.updateScenery();

        this.player.update();
        if (!this.demo) {
            if (keyIsDown(32)) {
                if (this.player.fire()) {
                    this.gameObjects.push(new Rocket(this.player.currentPos, 5, 32, this.sprites["rocket"]));
                }
            }
        }

        for (let gameObj of this.gameObjects) {
            gameObj.update();
            if (gameObj.currentPos.x < -gameObj.size) {
                gameObj.remove = true;
                continue;
            }
            if (gameObj.type === "rocket" && gameObj.currentPos.x > this.WIDTH + gameObj.size) gameObj.remove = true;
            const playerCollision = this.player.checkForCollision(gameObj);
            const rocketCollision = this.checkForRocketCollision(gameObj);
            if (rocketCollision) this.score++;
            if (playerCollision || rocketCollision) {
                gameObj.remove = true;
                this.gameObjects.push(
                    new Explosion(
                        { x: gameObj.currentPos.x, y: gameObj.currentPos.y },
                        -1,
                        32,
                        new Animation(
                            [
                                this.sprites["explosion_0"],
                                this.sprites["explosion_1"],
                                this.sprites["explosion_2"],
                                this.sprites["explosion_3"],
                                this.sprites["explosion_4"],
                            ],
                            15,
                            false
                        )
                    )
                );
            }
        }

        for (let i = this.gameObjects.length - 1; i >= 0; i--) {
            if (this.gameObjects[i].remove) {
                this.gameObjects.splice(i, 1);
            }
        }

        if (frameCount % 60 === 0) {
            const itemTypes = ["healthSML", "healthMED", "healthLRG", "ammo", "shield"];
            const item = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            this.gameObjects.push(
                new Item(
                    { x: width + 32, y: Math.floor(Math.random() * this.HEIGHT) },
                    -2,
                    32,
                    this.sprites[item],
                    item
                )
            );
            this.gameObjects.push(
                new Alien({ x: width + 32, y: Math.floor(Math.random() * this.HEIGHT) }, -3, 32, this.sprites["alien"])
            );
        }
    }

    checkForRocketCollision(entity) {
        const rockets = this.gameObjects.filter((gameObj) => {
            return gameObj.type === "rocket";
        });
        if (rockets) {
            for (let rocket of rockets) {
                if (rocket !== entity && !rocket.remove) {
                    if (
                        dist(entity.currentPos.x, entity.currentPos.y, rocket.currentPos.x, rocket.currentPos.y) <
                        (entity.size + rocket.size) / 2
                    ) {
                        rocket.remove = true;
                        return true;
                    }
                }
            }
        }
        return false;
    }

    updateScenery() {
        for (let layer of this.scenery) {
            layer.xScroll += layer.xScrollSpeed;
            if (layer.xScroll >= layer.width) {
                layer.xScroll = 0;
            }
        }
    }

    render() {
        background("black");
        this.renderSceneryLayer(this.scenery[0], this.WIDTH, this.HEIGHT);
        this.renderSceneryLayer(this.scenery[1], this.WIDTH, this.HEIGHT);
        this.player.draw();
        for (let gameObj of this.gameObjects) {
            gameObj.draw();
        }
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
        image(this.sprites["health_ui"], 10, this.HEIGHT - 42, 32, 32);

        const shield = this.player.getShield();
        const shieldWidth = (shield / this.player.STARTING_SHIELD) * statBar.width;
        fill("red");
        rect(170, this.HEIGHT - 13 - statBar.height, statBar.width, statBar.height);
        fill("lightblue");
        rect(170, this.HEIGHT - 13 - statBar.height, shieldWidth, statBar.height);
        image(this.sprites["shield_ui"], 138, this.HEIGHT - 42, 32, 32);

        image(this.sprites["ammo_ui"], 270, this.HEIGHT - 42, 32, 32);
        const ammo = this.player.getAmmo();
        const topRowCount = this.countBelow(ammo, this.player.STARTING_AMMO / 2);
        const bottomRowCount = this.countAbove(ammo, this.player.STARTING_AMMO / 2);
        for (let i = 0; i < topRowCount; i++) {
            image(this.sprites["rocket"], 302 + i * 8, this.HEIGHT - 40, 16, 16);
        }
        for (let i = 0; i < bottomRowCount; i++) {
            image(this.sprites["rocket"], 302 + i * 8, this.HEIGHT - 25, 16, 16);
        }

        fill("red");
        textFont(this.font);
        textSize(18);
        // text(`Score 0000`, this.WIDTH - 190, this.HEIGHT - 10);
        text(`Score ${this.score}`, this.WIDTH - 190, this.HEIGHT - 10);

        if (this.demo) {
            fill("blue");
            textSize(36);
            const title = "Jump To Orion";
            const tWidth = textWidth(title);
            text(title, this.WIDTH / 2 - tWidth / 2, this.HEIGHT / 3);
            if (frameCount % 60 > 30) {
                fill("red");
                textSize(16);
                const play = "Press Start to Play";
                const pWidth = textWidth(play);
                text(play, this.WIDTH / 2 - pWidth / 2, this.HEIGHT / 2);
            }
        }

        let debug = false;
        if (debug) {
            const debugVals = {
                item: 0,
                alien: 0,
                rocket: 0,
                explosion: 0,
            };
            for (let gameObj of this.gameObjects) {
                debugVals[gameObj.type]++;
            }
            textSize(12);
            text(`i:${debugVals["item"]}`, 10, 20);
            text(`a:${debugVals["alien"]}`, 90, 20);
            text(`r:${debugVals["rocket"]}`, 170, 20);
            text(`e:${debugVals["explosion"]}`, 250, 20);
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
