let ship;
let aliens = [];
let level = [];
let levelSpeed = 1;
let levelNum = 0;

let score = 0;
let gameOver = false;

let bg_img;

function  preload() {
    bg_img = loadImage('invaders/img/bg.png');
}

function setup() {
    let canvas = createCanvas(400, 300);
    canvas.parent('game');

    frameRate(60);
    ship = new Ship();
    let board = new Board();
    level = board.getLayout();
    loadLevel(level);
}

function update() {
    if (keyIsDown(RIGHT_ARROW)) {
        moveShip(2);
    }
    if (keyIsDown(LEFT_ARROW)) {
        moveShip(-2);
    }
    if (keyIsDown(32)) {
        ship.fire();
    }
    ship.update();
    moveAliens();

    //check for alien shot collision
    for (let i = ship.shots.length - 1; i >= 0; i--) {
        for (let j = aliens.length - 1; j >= 0; j--) {
            let d = dist(ship.shots[i].posx, ship.shots[i].posy, aliens[j].posx, aliens[j].posy);
            if (d <= ship.shots[i].r + aliens[j].r) {
                ship.shots[i].dead = true;
                aliens.splice(j, 1);

                score += 10;
                levelSpeed += 0.02;
                break;
            }
        }
    }

    //check for alien ship collision
    for (let i = 0; i < aliens.length; i++) {
        let d = dist(ship.posx, ship.posy, aliens[i].posx, aliens[i].posy);
        if (d < ship.r + aliens[i].r) {
            gameOver = true;
        }
    }

    //Check if aliens have reached bottom
    for (let i = 0; i < aliens.length; i++) {
        if (aliens[i].posy >= height) {
            gameOver = true;
        }
    }
    //check if all the aliens are dead
    if (aliens.length < 1) {
        loadLevel(level);
    }

    //exit render loop if game over
    if (gameOver) {
        noLoop();
    }
}

function draw() {
    update();
    background(bg_img);
    textSize(24);
    text('Score: ' + score, 5, 24);

    ship.render();
    for (let i = 0; i < aliens.length; i++) {
        aliens[i].render();
    }
}

function moveShip(val) {
    ship.posx += val;
    if (ship.posx < ship.r) {
        ship.posx = ship.r;
    }
    if (ship.posx > width - ship.r) {
        ship.posx = width - ship.r;
    }
}

let shiftDown = false;
function moveAliens() {
    for (let i = 0; i < aliens.length; i++) {
        aliens[i].move(levelSpeed / 2);
        if (aliens[i].posx >= width - aliens[i].r || aliens[i].posx <= aliens[i].r) {
            shiftDown = true;
        }
    }
    if (shiftDown) {
        for (let i = 0; i < aliens.length; i++) {
            aliens[i].posy += 10;
            aliens[i].moveSpeed = -(aliens[i].moveSpeed);
        }
        shiftDown = false;
    }
}

function loadLevel(level) {
    let margin = 25;
    let fieldWidth = width - (margin * 2);
    for (let j = 0; j < level.length; j++) {
        let spacing = fieldWidth / (level[j].length - 1);
        for (let i = 0; i < level[j].length; i++) {
            if (level[j][i] === 1) {
                aliens.push(new Alien(i * spacing + margin, j * spacing + margin));
            }
        }
    }
    levelNum++;
    levelSpeed = levelNum;
}
