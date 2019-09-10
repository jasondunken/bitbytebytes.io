let width = 600;
let height = 400;

let baseWidth = 80;
let baseHeight = 40;
let turretDiameter = 60;
let turretBarrelLength = 50;
let turretCenter = { x: width / 2, y: height - baseHeight };
let endOfBarrel = { x: width / 2, y: height - baseHeight - turretBarrelLength };
let barrelAngle = 0.0;
let cooldown = 5;
let charge = 0;

let bulletDiameter = 2;
let bulletSpeed = 10;

let maxAmmo = 10000;
let maxHealth = 5000;

let score;
let ammo;
let health;
let wave;

let bullets;
let enemy;

let enemySpawnRate = 120; // frames between spawns - higher is longer
let spawnCooldown = enemySpawnRate;

let levelTicks = 3600; // 1 minute
let levelTime = 0;

function preload() {
    // preload assets here
}

function setup() {
    // setup stuff here
    const canvas = createCanvas(width, height);
    canvas.parent('p5-container');
    initGame();
}

function initGame() {
    score = 0;
    ammo = maxAmmo;
    health = maxHealth;
    wave = 0;

    bullets = [];
    enemy = [];
}

function spawnerTick() {
    switch (wave) {
        case 0:
            if (spawnCooldown === enemySpawnRate) {
                enemy.push(new Enemy(0, height / 2, 1));
            }
            break;
        case 1:
            if (spawnCooldown === (enemySpawnRate / 2) || spawnCooldown === enemySpawnRate) {
                enemy.push(new Enemy(0, 40, -1));
            }
            if (spawnCooldown === enemySpawnRate) {
                enemy.push(new Enemy(width, 60, 1));
            }
            break;
        case 2:
            if (spawnCooldown === (enemySpawnRate / 2) || spawnCooldown === enemySpawnRate) {
                enemy.push(new Enemy(0, 50, -1));
            }
            if (spawnCooldown === enemySpawnRate) {
                enemy.push(new Enemy(width, 30, 1));
            }
            break;
        default:
            break;
    }
    spawnCooldown--;
    if (spawnCooldown <= 0) {
        spawnCooldown = enemySpawnRate;
    }
}

function weaponsTick() {
    charge++;
    if (charge >= cooldown) {
        charge = cooldown;
    }
}

function update() {
    levelTime++;
    this.spawnerTick();
    this.weaponsTick();
    if (levelTime >= levelTicks) {
        levelTime = 0;
        wave++;
    }

    if (keyIsDown(RIGHT_ARROW)) {
        barrelAngle += 0.01;
        if (barrelAngle >= 0) barrelAngle = 0;
    }
    if (keyIsDown(LEFT_ARROW)) {
        barrelAngle -= 0.01;
        if (barrelAngle <= -Math.PI) barrelAngle = -Math.PI;
    }
    if (keyIsDown(DOWN_ARROW)) {
    }

    // fire turret
    if (keyIsDown(32)) {
        if (charge === cooldown && ammo > 0) {
            charge = 0;
            fireTurret();
        }
    }

    endOfBarrel = {
        x: turretCenter.x + turretBarrelLength * Math.cos(barrelAngle),
        y: turretCenter.y + turretBarrelLength * Math.sin(barrelAngle)
    };

    for (let b = bullets.length - 1; b >= 0; b--) {
        if (bullets[b]) {
            if (bullets[b].pos.y < 0 || bullets[b].pos.x < 0 || bullets[b].pos.x > width) {
                bullets.splice(b, 1);
            } else {
                bullets[b].update();
                checkForHit(bullets[b]);
            }
        }
    }
    for (let i = enemy.length - 1; i >= 0; i--) {
        if (enemy[i]) {
            if (enemy[i].dead) {
                enemy.splice(i, 1);
            } else {
                enemy[i].update();
            }
        }
    }
}

function checkForHit(bullet) {
    for (let e in enemy) {
        if (!enemy[e].dead) {
            const _enemy = enemy[e];
            if (dist(bullet.pos.x, bullet.pos.y, _enemy._pos.x, _enemy._pos.y) <= _enemy.diameter + bulletDiameter) {
                _enemy.hit(bullet.damage);
                score++;
            }
        }
    }
}

function spawnEnemy(x, y, z) {
    enemy.push(new Enemy(x, y, z));
}

function fireTurret() {
    // fire turret
    ammo--;
    bullets.push(new bullet(
        new p5.Vector(endOfBarrel.x, endOfBarrel.y),
        // create a vector from two points VC = (VBx - VAx, VBy - VAy)
        new p5.Vector(endOfBarrel.x - turretCenter.x, endOfBarrel.y - turretCenter.y)
    ));

}

// p5.draw is called @ 60fps by default
function draw() {
    // update game logic
    update();

    // render game objects
    background('black');
    strokeWeight(1);

    // draw enemys
    for (let e in enemy) {
        if (enemy[e]) {
            enemy[e].render();
        }
    }

    // draw bullets
    for (let b in bullets) {
        if (bullets[b]) {
            setColor('white');
            ellipse(bullets[b].pos.x, bullets[b].pos.y, bulletDiameter, bulletDiameter);
        }
    }

    // draw turret barrel
    setColor('gray');
    strokeWeight(5);
    line(turretCenter.x, turretCenter.y, endOfBarrel.x, endOfBarrel.y);
    strokeWeight(1);

    // draw stationary part of base
    setColor('silver');
    ellipse(turretCenter.x, turretCenter.y, turretDiameter, turretDiameter);
    setColor('brown');
    rect((width - baseWidth) / 2, height - baseHeight, baseWidth, baseHeight);

    // UI --------------------------------------------------------------------
    // draw ammo reserve
    setColor('green');
    text(ammo, width - 55, 20);

    // draw score
    setColor('blue');
    text(score, 20, 20);
}

function setColor(newColor) {
    stroke(newColor);
    fill(newColor);
}

function bullet(position, direction) {
    this.damage = 10;
    this.pos = position
    this.dir = direction

    bullet.prototype.update = function () {
        this.pos = new p5.Vector(this.pos.x + (this.dir.x / bulletSpeed), this.pos.y + (this.dir.y / bulletSpeed));
    }
}