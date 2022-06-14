const WIDTH = 600;
const HEIGHT = 400;

let canvas;

let img_background1;
let img_background2;
let img_foreground1;
let scenery = [];

let images = {};

let player;

let items = [];
let aliens = [];

function preload() {
    images["player"] = loadImage("./jump-to-orion/img/sprite1.png");
    images["rocket"] = loadImage("./jump-to-orion/img/rocket.png");
    images["alien"] = loadImage("./jump-to-orion/img/alien.png");
    images["alienRocket"] = loadImage("./jump-to-orion/img/rocket-alien.png");
    images["healthSML"] = loadImage("./jump-to-orion/img/healthSMLImage.png");
    images["healthMED"] = loadImage("./jump-to-orion/img/healthMEDImage.png");
    images["healthLRG"] = loadImage("./jump-to-orion/img/healthLRGImage.png");
    images["ammo"] = loadImage("./jump-to-orion/img/ammoImage.png");
    images["shield"] = loadImage("./jump-to-orion/img/shieldImage.png");
}

function setup() {
    frameRate(60);
    canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent("game");

    player = new Player(images["player"], { x: 100, y: HEIGHT / 2 }, images["rocket"]);

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
}

function update() {
    for (let layer of scenery) {
        layer.xScroll += layer.xScrollSpeed;
        if (layer.xScroll >= layer.width) {
            layer.xScroll = 0;
        }
    }
    player.update();
    if (frameCount % 60 === 0) {
        const itemTypes = ["healthSML", "healthMED", "healthLRG", "ammo", "shield"];
        const item = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        // const itemType = Object.keys(items);
        items.push(new Item({ x: width + 32, y: Math.floor(Math.random() * height) }, item, 10, images[item], 32, -2));
        aliens.push(new Alien({ x: width + 32, y: Math.floor(Math.random() * height) }, images["alien"], 32, -3));
    }
    for (let i = items.length - 1; i >= 0; i--) {
        items[i].update();
        if (items[i].pos.x < -items[i].size) items.splice(i, 1);
    }
    console.log(`aliens: `, aliens);
    console.log(`items: `, items);
    for (let i = aliens.length - 1; i >= 0; i--) {
        aliens[i].update();
        if (aliens[i].currentPos.x < -aliens[i].size) aliens.splice(i, 1);
    }
}

function draw() {
    update();
    background("black");
    drawingContext.drawImage(scenery[0], scenery[0].xScroll, 0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
    if (scenery[0].xScroll > scenery[0].width - WIDTH) {
        drawingContext.drawImage(
            scenery[0],
            scenery[0].xScroll - scenery[0].width,
            0,
            WIDTH,
            HEIGHT,
            0,
            0,
            WIDTH,
            HEIGHT
        );
    }
    drawingContext.drawImage(scenery[1], scenery[1].xScroll, 0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
    if (scenery[1].xScroll > scenery[1].width - WIDTH) {
        drawingContext.drawImage(
            scenery[1],
            scenery[1].xScroll - scenery[1].width,
            0,
            WIDTH,
            HEIGHT,
            0,
            0,
            WIDTH,
            HEIGHT
        );
    }
    player.draw();
    for (let item of items) {
        item.draw();
    }
    for (let alien of aliens) {
        alien.draw();
    }
    drawingContext.drawImage(scenery[2], scenery[2].xScroll, 0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
    if (scenery[2].xScroll > scenery[2].width - WIDTH) {
        drawingContext.drawImage(
            scenery[2],
            scenery[2].xScroll - scenery[2].width,
            0,
            WIDTH,
            HEIGHT,
            0,
            0,
            WIDTH,
            HEIGHT
        );
    }
}
