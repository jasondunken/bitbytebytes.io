import { Resources } from "./resource-manager.js";

import { Entity } from "./game-object.js";
import { Vec } from "./math/vec.js";

import { Bomb } from "./weapons.js";
import { Paratrooper } from "./troops.js";

class AirTrafficControl {
    static AIRCRAFT = ["light-bomber", "airborne-transport"];
    static MINIMUM_FLIGHT_CEILING = 200;
    static FLIGHT_SEPARATION = 64;
    static spawn(game, wave) {
        let spawnX = wave.approach > 0 ? 0 : game.width;
        spawnX -= wave.approach * AirTrafficControl.FLIGHT_SEPARATION;
        for (let i = 0; i < wave.count; i++) {
            const aircraft = AirTrafficControl.getAircraft(wave.type);
            const flightDeviation = AirTrafficControl.FLIGHT_SEPARATION * aircraft.pilotConfidence;
            aircraft.setPosition(
                new Vec(
                    spawnX + flightDeviation,
                    aircraft.MINIMUM_FLIGHT_CEILING - (i * AirTrafficControl.FLIGHT_SEPARATION) / 2
                )
            );
            aircraft.setDirection(new Vec(wave.approach, 0));
            aircraft.setTarget(game.turret.position);
            game.addGameObject(aircraft);
        }
    }

    static getAircraft(type) {
        switch (type) {
            case "light-bomber":
                return new LightBomber();
            case "airborne-transport":
                return new AirborneTransport();
            default:
                console.warn(`no aircraft type ${type}`);
        }
    }
    static getRandomAircraft() {
        //return "light-bomber";
        return AirTrafficControl.AIRCRAFT[Math.floor(Math.random() * AirTrafficControl.AIRCRAFT.length)];
    }
}

class Aircraft extends Entity {
    constructor(type, position, width, height) {
        super(type, position, width, height);
    }
    targetBuffer;

    setPosition(pos) {
        this.position = pos;
    }

    setDirection(dir) {
        this.direction = dir;
        this.setSprite(dir.x);
    }

    setTarget(pos) {
        this.target = pos;
    }

    isOverTarget() {
        const xDist = Math.abs(this.position.x - this.target.x);
        if (xDist / this.pilotConfidence < this.targetBuffer) return true;
        return false;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) this.dead = true;
    }

    render() {
        image(
            this.sprite,
            this.position.x - this.width / 2,
            this.position.y - this.height / 2,
            this.width,
            this.height
        );
        // noStroke();
        // fill("red");
        // textSize(10);
        // text(`${this.pilotConfidence}`, this.position.x - 56, this.position.y - 16);
        // circle(this.position.x, this.position.y, 8);
        // if (this.isOverTarget()) {
        //     stroke("magenta");
        //     strokeWeight(3);
        //     circle(this.position.x, this.position.y, 32);
        // }
    }
}

class LightBomber extends Aircraft {
    static WIDTH = 32;
    static HEIGHT = 16;

    MINIMUM_FLIGHT_CEILING = 200;

    MAX_HEALTH = 10;
    MOVE_SPEED = 5.5;
    MAX_BOMBS = 2;

    BOMB_RELOAD_TIME = 25;
    BOMB_DEPLOY_BUFFER = 150;

    health;
    bombs;
    target;

    cooldownTime = 0;
    pilotConfidence = 0;

    sprites = ["blue_1_1_L", "blue_1_2_L", "blue_1_1_R", "blue_1_2_R"];

    constructor(position, direction, velocity) {
        super("light-bomber", position, LightBomber.WIDTH, LightBomber.HEIGHT);
        this.direction = direction || new Vec();
        this.velocity = velocity || new Vec();
        this.setSprite(this.direction.x);

        this.health = this.MAX_HEALTH;
        this.bombs = this.MAX_BOMBS;
        this.pilotConfidence = (Math.random() * 50 + 50) / 100;
        this.targetBuffer = this.BOMB_DEPLOY_BUFFER;
    }

    setSprite(dir) {
        if (dir < 0) this.sprite = Resources.getSprite("blue_1_1_L");
        if (dir > 0) this.sprite = Resources.getSprite("blue_1_1_R");
    }

    update(bounds, gameObjects) {
        this.position.add(this.direction);
        this.cooldown();

        if (this.bombReady() && this.isOverTarget()) {
            this.dropBomb(gameObjects);
        }
    }

    cooldown() {
        if (this.cooldownTime > 0) this.cooldownTime--;
    }

    bombReady() {
        if (this.cooldownTime <= 0 && this.bombs > 0) {
            return true;
        }
        return false;
    }

    dropBomb(gameObjects) {
        this.bombs--;
        gameObjects.bombs.add(new Bomb(new Vec(this.position.x, this.position.y), new Vec(this.direction.x, 0)));
        this.cooldownTime = this.BOMB_RELOAD_TIME;
    }
}

class AirborneTransport extends Aircraft {
    MINIMUM_FLIGHT_CEILING = 50;

    static WIDTH = 96;
    static HEIGHT = 32;

    MAX_HEALTH = 50;
    MOVE_SPEED = 3.5;
    PARATROOPER_COUNT = 10;
    PARATROOPER_DEPLOY_BUFFER = 200;
    JUMP_INTERVAL = 30;

    health;
    paratroopers;

    jumpTimer = 0;

    sprites = ["airborne_left", "airborne_right"];

    constructor(position, direction, velocity) {
        super("airborne", position, AirborneTransport.WIDTH, AirborneTransport.HEIGHT);
        this.direction = direction || new Vec();
        this.velocity = velocity || new Vec();
        this.setSprite(this.direction.x);

        this.health = this.MAX_HEALTH;
        this.paratroopers = this.PARATROOPER_COUNT;
        this.pilotConfidence = (Math.random() * 50 + 50) / 100;
        this.targetBuffer = this.PARATROOPER_DEPLOY_BUFFER;
    }

    setSprite(dir) {
        if (dir < 0) this.sprite = Resources.getSprite("airborne_left");
        if (dir > 0) this.sprite = Resources.getSprite("airborne_right");
    }

    update(bounds, gameObjects) {
        this.position.add(this.direction);
        if (this.jumpTimer > 0) this.jumpTimer--;
        if (this.isOverTarget() && this.canDeploy()) {
            this.jumpTimer = this.JUMP_INTERVAL;
            this.paratroopers--;
            gameObjects.paratroopers.add(new Paratrooper(this.position.copy()));
        }
    }

    canDeploy() {
        if (this.jumpTimer === 0 && this.paratroopers > 0) {
            return true;
        }
        return false;
    }
}

export { AirTrafficControl, LightBomber, AirborneTransport };
