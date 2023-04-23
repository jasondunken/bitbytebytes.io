import { GameObject } from "./gameObject.js";

class Player extends GameObject {
    imagePlayer;

    fireReady = 0;
    loadSpeed = 30;

    STARTING_HEALTH = 100;
    health = this.STARTING_HEALTH;

    MIN_SHIELD_RADIUS = 50;
    MAX_SHIELD_RADIUS = 100;
    STARTING_SHIELD = 2000;
    shield = this.STARTING_SHIELD;
    shieldRadius = this.MAX_SHIELD_RADIUS;
    shieldsRaised = false;

    STARTING_AMMO = 20;
    ammo = this.STARTING_AMMO;

    updateDelta = false;
    shieldOrbitDelta = 0;

    shieldSound = new Audio();

    constructor(initialPos, speed, size, imagePlayer) {
        super("player", initialPos, speed, size);
        this.imagePlayer = imagePlayer;
        this.smokeEmitter = new SmokeEmitter(this.STARTING_HEALTH / 2);
        this.shieldSound.src = "./jump-to-orion/res/snd/shield_loop.wav";
        this.shieldSound.loop = true;
    }

    update() {
        if (keyIsDown(87)) this.pathPos.y -= this.speed;
        if (keyIsDown(83)) this.pathPos.y += this.speed;
        this.currentPos = {
            x: this.pathPos.x,
            y: this.health > 30 ? this.pathPos.y : this.pathPos.y + Math.sin(this.delta) * this.size,
        };

        this.setCorners();
        this.updateDamage();

        if (this.updateDelta) {
            this.delta += this.speed / 60.0;
        }

        if (this.fireReady > 0) this.fireReady--;
        if (this.fireReady < 0) this.fireReady = 0;

        if (keyIsDown(81)) {
            this.raiseShield();
        } else {
            this.lowerShield();
        }

        if (this.shieldsRaised) {
            this.shieldRadius = this.shield;
            if (this.shieldRadius > this.MAX_SHIELD_RADIUS) this.shieldRadius = this.MAX_SHIELD_RADIUS;
            if (this.shieldRadius < this.MIN_SHIELD_RADIUS) this.shieldRadius = this.MIN_SHIELD_RADIUS;
        }
    }

    updateDamage() {
        if (this.shieldsRaised && this.shield > 0) {
            this.shield--;
        }
        let damageDir = this.health - this.lastHealth > 0 ? "up" : this.health - this.lastHealth < 0 ? "down" : "none";
        if (this.health <= 30 && damageDir === "down" && this.lastHealth > 30) {
            this.updateDelta = true;
            this.delta = 0;
        }
        if (this.health > 30 / 2 && damageDir === "up" && this.lastHealth < 30) {
            this.updateDelta = false;
        }
        if (this.health <= this.STARTING_HEALTH / 2) {
            this.smokeEmitter.smoke(this.health);
        } else {
            this.smokeEmitter.stopSmoking();
        }
        this.smokeEmitter.update(this.currentPos);
        this.lastHealth = this.health;
    }

    draw() {
        image(this.imagePlayer, this.corners.a.x, this.corners.a.y, this.size, this.size);
        this.smokeEmitter.drawSmoke();
        if (this.shieldsRaised) {
            this.shieldOrbitDelta += 0.33;
            let shieldDensity = 20;
            for (let i = 0; i < shieldDensity; i++) {
                if (i % 2 == 0) {
                    let xr = Math.floor(Math.random() * 20) + 1;
                    let yr = Math.floor(Math.random() * 20) + 1;
                    let xa =
                        this.currentPos.x +
                        (Math.sin(((i + this.shieldOrbitDelta) / shieldDensity) * 2 * PI) * this.shieldRadius) / 2;
                    let ya =
                        this.currentPos.y +
                        (Math.cos(((i + this.shieldOrbitDelta) / shieldDensity) * 2 * PI) * this.shieldRadius) / 2;
                    stroke(
                        color(
                            `hsla(${Math.floor(
                                Math.cos(i / shieldDensity + this.shieldOrbitDelta) * 360
                            )}, 50%, 50%, 1)`
                        )
                    );
                    noFill();
                    ellipse(xa, ya, xr, yr);
                } else {
                    let xr = Math.floor(Math.random() * 10) + 11;
                    let yr = Math.floor(Math.random() * 10) + 11;
                    let xa =
                        this.currentPos.x +
                        (Math.sin(((i + -this.shieldOrbitDelta) / shieldDensity) * 2 * PI) * this.shieldRadius) / 2;
                    let ya =
                        this.currentPos.y +
                        (Math.cos(((i + -this.shieldOrbitDelta) / shieldDensity) * 2 * PI) * this.shieldRadius) / 2;
                    stroke(color(`hsla(${Math.floor(Math.cos(i / shieldDensity) * 180)}, 50%, 50%, 1)`));
                    noFill();
                    ellipse(xa, ya, xr, yr);
                }
            }
        }
    }

    fire() {
        if (this.ammo > 0 && this.fireReady === 0) {
            this.ammo--;
            this.fireReady = this.loadSpeed;
            const fire = new Audio();
            fire.src = "./jump-to-orion/res/snd/explodemini.wav";
            fire.play();
            return true;
        }
    }

    raiseShield() {
        if (!this.shieldsRaised) {
            this.shieldsRaised = true;
            this.shieldSound.currentTime = 0;
            this.shieldSound.play();
        }
    }

    lowerShield() {
        if (this.shieldsRaised) {
            this.shieldsRaised = false;
            this.shieldSound.pause();
        }
    }

    addHealth(health) {
        this.health += health;
        if (this.health > this.STARTING_HEALTH) this.health = this.STARTING_HEALTH;
    }

    getHealth() {
        return this.health;
    }

    addAmmo(ammo) {
        this.ammo += ammo;
        if (this.ammo > this.STARTING_AMMO) this.ammo = this.STARTING_AMMO;
    }

    getAmmo() {
        return this.ammo;
    }

    addShield(shield) {
        this.shield += shield;
        if (this.shield > this.STARTING_SHIELD) this.shield = this.STARTING_SHIELD;
    }

    getShield() {
        return this.shield;
    }

    checkForCollision(entity) {
        if (entity.type === "rocket" || entity.type === "explosion") return false;

        let size = this.size;
        if (this.shieldsRaised) {
            size = this.shieldRadius;
        }
        let isCollision =
            dist(entity.currentPos.x, entity.currentPos.y, this.currentPos.x, this.currentPos.y) <
            (size + entity.size) / 2;
        if (isCollision && !this.shieldsRaised) this.health -= 10;
        if (this.health < 0) this.health = 0;
        return isCollision;
    }
}

class DemoPlayer extends Player {
    moveTimer = 0;
    currentMove = null;
    centerY = null;
    targetLocked = null;
    cursorPos = null; // a vector away from the player's position
    cursorMoveSpeed = 3;
    constructor(initialPos, speed, size, imagePlayer, imageRocket) {
        super(initialPos, speed, size, imagePlayer, imageRocket);
        this.centerY = initialPos.y;
    }

    target(items) {
        if (this.targetLocked && this.targetLocked.remove) {
            this.targetLocked = null;
        }
        if (!this.targetLocked) {
            let targetItem = null;
            let closestTarget = Number.MAX_VALUE;
            for (let i = 0; i < items.length; i++) {
                let dist = Math.abs(this.currentPos.x - items[i].currentPos.x);
                if (dist < closestTarget) {
                    closestTarget = dist;
                    targetItem = items[i];
                }
            }
            this.targetLocked = targetItem;
            if (this.cursorPos === null) {
                this.cursorPos = this.currentPos;
            }
        }
    }

    update() {
        // move demo player
        if (this.moveTimer === 0) {
            const moveRoll = Math.floor(Math.random() * 100);
            if (moveRoll < 30) {
                this.moveTimer = 15;
                this.currentMove = -this.speed;
            } else if (moveRoll < 70) {
                this.moveTimer = 60;
                this.currentMove = 0;
            } else {
                this.moveTimer = 15;
                this.currentMove = +this.speed;
            }
            if (this.currentPos.y < this.centerY - this.centerY / 2) {
                this.moveTimer = 60;
                this.currentMove = this.speed;
            }
            if (this.currentPos.y > this.centerY + this.centerY / 2) {
                this.moveTimer = 60;
                this.currentMove = -this.speed;
            }
        } else {
            this.moveTimer--;
        }
        this.pathPos.y += this.currentMove;
        this.currentPos = {
            x: this.pathPos.x,
            y: this.health > 30 ? this.pathPos.y : this.pathPos.y + Math.sin(this.delta) * this.size,
        };

        if (this.targetLocked) {
            const targetPos = this.targetLocked.currentPos;
            const targetVector = {
                x: targetPos.x - this.cursorPos.x,
                y: targetPos.y - this.cursorPos.y,
            };
            const targetDist = Math.sqrt(targetVector.x * targetVector.x + targetVector.y * targetVector.y);
            if (targetDist < this.targetLocked.size / 5) {
                this.targetLocked.remove = true;
                if (this.targetLocked.id === "ammo") {
                    this.addAmmo(this.targetLocked.value);
                    const reloadSound = new Audio();
                    reloadSound.src = "./jump-to-orion/res/snd/reload.wav";
                    reloadSound.play();
                }
                if (this.targetLocked.id === "shield") {
                    this.addShield(this.targetLocked.value);
                    const shieldChargeSound = new Audio();
                    shieldChargeSound.src = "./jump-to-orion/res/snd/got_it.wav";
                    shieldChargeSound.play();
                }
                if (this.targetLocked.id === "health") {
                    this.addHealth(this.targetLocked.value);
                    const healthSound = new Audio();
                    healthSound.src = "./jump-to-orion/res/snd/health_1.wav";
                    healthSound.play();
                }
            } else {
                const targetVectorNormal = {
                    x: targetVector.x / targetDist,
                    y: targetVector.y / targetDist,
                };
                this.cursorPos.x += targetVectorNormal.x * this.cursorMoveSpeed;
                this.cursorPos.y += targetVectorNormal.y * this.cursorMoveSpeed;
            }
        }

        this.setCorners();
        this.updateDamage();

        if (this.updateDelta) {
            this.delta += this.speed / 60.0;
        }

        if (this.fireReady > 0) this.fireReady--;
        if (this.fireReady < 0) this.fireReady = 0;

        if (this.shieldsRaised) {
            this.shieldRadius = this.shield;
            if (this.shieldRadius > this.MAX_SHIELD_RADIUS) this.shieldRadius = this.MAX_SHIELD_RADIUS;
            if (this.shieldRadius < this.MIN_SHIELD_RADIUS) this.shieldRadius = this.MIN_SHIELD_RADIUS;
        }
    }

    drawCursor() {
        if (this.cursorPos) {
            stroke("yellow");
            noFill();
            ellipse(this.cursorPos.x, this.cursorPos.y, 3, 3);
        }
    }
}

class SmokeEmitter {
    MAX_PARTICLES = 100;
    smokeParticles = [];
    MAX_PARTICLES_PER_UPDATE = 10;
    particlesPerUpdate;

    halfHealth; // half the player's starting health

    constructor(halfHealth) {
        this.halfHealth = halfHealth;
    }

    smoke(playerHealth) {
        this.particlesPerUpdate = Math.floor(this.MAX_PARTICLES_PER_UPDATE * (1 - playerHealth / this.halfHealth)) + 1;
        this.smoking = true;
    }

    stopSmoking() {
        this.smoking = false;
    }

    update(playerPosition) {
        if (frameCount % 15 === 0 && this.smoking) {
            for (let i = 0; i < this.particlesPerUpdate; i++) {
                if (this.smokeParticles.length < this.MAX_PARTICLES) {
                    this.smokeParticles.push({
                        pos: { x: playerPosition.x - 16, y: playerPosition.y },
                        dir: { x: Math.random() * -1 + -0.5, y: Math.random() * 0.5 - 0.25 },
                        life: 60,
                        color: Math.floor(Math.random() * 100 + 100),
                    });
                }
            }
        }

        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            let particle = this.smokeParticles[i];
            particle.life--;
            if (particle.life <= 0) {
                this.smokeParticles.splice(i, 1);
                continue;
            }
            particle.pos.x += particle.dir.x;
            particle.pos.y += particle.dir.y;
        }
    }

    drawSmoke() {
        for (let particle of this.smokeParticles) {
            noStroke();
            fill(color(`rgba(${particle.color}, ${particle.color}, ${particle.color}, ${particle.life})`));
            const particleDiameter = Math.floor(Math.random() * 6 + 1);
            ellipse(particle.pos.x, particle.pos.y, particleDiameter, particleDiameter);
        }
    }
}

export { Player, DemoPlayer };
