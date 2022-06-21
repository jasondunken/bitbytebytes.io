let game = null;

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;

let scenery = [];
let images = {};

function preload() {
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

// Jump to Orion -------------------------->
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

    constructor(width, height, scenery, images) {
        this.WIDTH = width;
        this.HEIGHT = height;
        this.scenery = scenery;
        this.images = images;
    }

    mousePressed(pos) {
        for (let item of this.items) {
            if (dist(pos.x, pos.y, item.currentPos.x, item.currentPos.y) < item.size) {
                switch (item.type) {
                    case "healthSML":
                    case "healthMED":
                    case "healthLRG":
                        this.player.addHealth(item.value);
                        break;
                    case "ammo":
                        this.player.addAmmo(item.value);
                        break;
                    case "shield":
                        this.player.addShield(item.value);
                }
                this.items.splice(this.items.indexOf(item), 1);
                return;
            }
        }
    }

    startDemo() {
        this.player = new Player({ x: 100, y: this.HEIGHT / 2 }, 2, 32, this.images["player"], this.images["rocket"]);
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
            this.items.push(
                new Item({ x: width + 32, y: Math.floor(Math.random() * this.HEIGHT) }, -2, 32, this.images[item], item)
            );
            this.aliens.push(
                new Alien({ x: width + 32, y: Math.floor(Math.random() * this.HEIGHT) }, -3, 32, this.images["alien"])
            );
        }
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.update();
            const playerCollision = this.checkForPlayerCollision(item);
            if (item.currentPos.x < -item.size || playerCollision) this.items.splice(i, 1);
        }
        for (let i = this.aliens.length - 1; i >= 0; i--) {
            const alien = this.aliens[i];
            alien.update();
            const playerCollision = this.checkForPlayerCollision(alien);
            if (alien.currentPos.x < -alien.size || playerCollision) this.aliens.splice(i, 1);
        }
    }

    render() {
        background("black");
        this.renderSceneryLayer(this.scenery[0], this.WIDTH, this.HEIGHT);
        this.renderSceneryLayer(this.scenery[1], this.WIDTH, this.HEIGHT);
        // drawingContext.drawImage(
        //     this.scenery[0],
        //     this.scenery[0].xScroll,
        //     0,
        //     this.WIDTH,
        //     this.HEIGHT,
        //     0,
        //     0,
        //     this.WIDTH,
        //     this.HEIGHT
        // );
        // if (this.scenery[0].xScroll > this.scenery[0].width - this.WIDTH) {
        //     drawingContext.drawImage(
        //         this.scenery[0],
        //         scenery[0].xScroll - scenery[0].width,
        //         0,
        //         WIDTH,
        //         HEIGHT,
        //         0,
        //         0,
        //         WIDTH,
        //         HEIGHT
        //     );
        // }
        // drawingContext.drawImage(scenery[1], scenery[1].xScroll, 0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
        // if (scenery[1].xScroll > scenery[1].width - WIDTH) {
        //     drawingContext.drawImage(
        //         scenery[1],
        //         scenery[1].xScroll - scenery[1].width,
        //         0,
        //         WIDTH,
        //         HEIGHT,
        //         0,
        //         0,
        //         WIDTH,
        //         HEIGHT
        //     );
        // }
        this.player.draw();
        for (let item of this.items) {
            item.draw();
        }
        for (let alien of this.aliens) {
            alien.draw();
        }
        this.renderSceneryLayer(this.scenery[2], this.WIDTH, this.HEIGHT);

        // drawingContext.drawImage(scenery[2], scenery[2].xScroll, 0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
        // if (scenery[2].xScroll > scenery[2].width - WIDTH) {
        //     drawingContext.drawImage(
        //         scenery[2],
        //         scenery[2].xScroll - scenery[2].width,
        //         0,
        //         WIDTH,
        //         HEIGHT,
        //         0,
        //         0,
        //         WIDTH,
        //         HEIGHT
        //     );
        // }

        // UI elements
        fill("red");
        textSize(28);
        image(this.images["health_ui"], 10, this.HEIGHT - 42, 32, 32);
        text(this.player.getHealth(), 42, this.HEIGHT - 15);
        image(this.images["ammo_ui"], 110, this.HEIGHT - 42, 32, 32);
        text(this.player.getAmmo(), 142, this.HEIGHT - 15);
        image(this.images["shield_ui"], 190, this.HEIGHT - 42, 32, 32);
        text(this.player.getShield(), 222, this.HEIGHT - 15);
        text(`Score ${this.score}`, this.WIDTH - 180, this.HEIGHT - 15);
    }

    renderSceneryLayer(layer, width, height) {
        drawingContext.drawImage(layer, layer.xScroll, 0, width, height, 0, 0, width, height);
        if (layer.xScroll > layer.width - width) {
            drawingContext.drawImage(layer, layer.xScroll - layer.width, 0, width, height, 0, 0, width, height);
        }
    }

    checkForPlayerCollision(entity) {
        let size = this.player.size;
        if (this.player.shieldsRaised) size = this.player.shieldDistance;
        return (
            dist(entity.currentPos.x, entity.currentPos.y, this.player.currentPos.x, this.player.currentPos.y) < size
        );
    }
}
