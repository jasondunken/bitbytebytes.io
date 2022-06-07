const WIDTH = 600;
const HEIGHT = 400;

let canvas;

let img_background1;
let img_background2;
let img_foreground1;
let scenery = [];

let img_player;
let pos = { x: 100, y: HEIGHT / 2 };
let fireReady = 0;
let cooldown = 30;
let rockets = [];

function setup() {
    frameRate(60);
    canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent("game");

    img_player = new Image();
    img_player.src = "./jump-to-orion/img/sprite1.png";

    img_rocket = new Image();
    img_rocket.src = "./jump-to-orion/img/rocket.png";

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
    if (keyIsDown(87)) pos.y -= 1;
    if (keyIsDown(83)) pos.y += 1;
    if (keyIsDown(32) && fireReady === 0) {
        fireReady = cooldown;
        rockets.push({ x: pos.x, y: pos.y, s: 5 });
    } else {
        fireReady -= 1;
        if (fireReady < 0) fireReady = 0;
    }

    for (let rocket of rockets) {
        rocket.x += rocket.s;
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
    drawingContext.drawImage(img_player, pos.x, pos.y);
    for (let rocket of rockets) {
        drawingContext.drawImage(img_rocket, rocket.x, rocket.y);
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

function setColor(newColor) {
    stroke(newColor);
    fill(newColor);
}
