const DRAW_CALLS_PER_AGE_TICK = 2;
const INITIAL_CELL_DENSITY = 0.075;
const SPAWN_AREA_SIZE = 11;
let hWidth;
let hHeight;
let pixelAge = [];

const RESTART_DELAY = 10;
let restartTimer = 0;

let toob;
let ufos = [];

// called by p5 when window is ready
function setup() {
    // p5.draw calls/second
    frameRate(60);
    initializeHeaderGOL();
    initializeHeaderText();
    initializeToob();
    document.getElementById("toggle-1").addEventListener("click", ($event) => {
        this.momentarySwitch($event.target);
        restartGOL();
    });
    document.getElementById("toggle-2").addEventListener("click", ($event) => {
        this.toggleSwitch($event.target);
    });
    document.getElementById("toggle-3").addEventListener("click", ($event) => {
        this.toggleSwitch($event.target);
    });
    document.getElementById("toggle-4").addEventListener("click", ($event) => {
        this.toggleSwitch($event.target);
    });
}

function momentarySwitch(switchElement) {
    switchElement.classList.remove("switch-off");
    switchElement.classList.remove("momentary-animation");
    switchElement.offsetWidth; // hack to get animation to restart on subsequent clicks
    switchElement.classList.add("momentary-animation");
}

function toggleSwitch(switchElement) {
    if (switchElement.classList.contains("switch-off")) {
        switchElement.classList.remove("switch-off");
        switchElement.classList.add("switch-on");
    } else {
        switchElement.classList.remove("switch-on");
        switchElement.classList.add("switch-off");
    }
}

// called by p5 when window is ready
function draw() {
    if (restartTimer > 0) {
        restartTimer--;
    } else {
        // frameCount is a p5 global
        frameCount = frameCount % DRAW_CALLS_PER_AGE_TICK;
        if (frameCount == 0) {
            incrementAge(pixels);
        }
    }

    // p5.js function
    // copies the canvas' pixels a global pixels[]
    //         px0         px1         px2 ...
    //           |           |           |
    // pixels = [r, g, b, a, r, g, b, a, r ...]
    loadPixels();

    setPixelColors(pixels);

    // p5.js function
    updatePixels();

    updateUfos();
    updateHeaderText();
}

function initializeHeaderGOL() {
    const size = getGOLSize();

    // p5 canvas
    let canvas = createCanvas(size.hWidth, size.hHeight);
    canvas.parent("p5-container");

    initializePixelAge(size.hWidth, size.hHeight);
    console.log("pixelAge.length: ", pixelAge.length);
}

function restartGOL() {
    restartTimer = RESTART_DELAY;
    const size = getGOLSize();
    resizeCanvas(size.hWidth, size.hHeight);
    initializePixelAge(size.hWidth, size.hHeight);
}

function getGOLSize() {
    // TODO: needs to take browser zoom into consideration, breaks if zoom !== 100% currently
    let header = document.getElementById("gol-container").getBoundingClientRect();
    console.log("header: ", header);
    console.log("pixelRatio: ", window.devicePixelRatio);
    console.log("pixelRatioHeight: ", header.height / window.devicePixelRatio);

    hWidth = Math.floor(header.width * window.devicePixelRatio);
    hHeight = Math.floor(header.height * window.devicePixelRatio);
    return { hWidth, hHeight };
}

function initializeHeaderText() {
    let _name = "";
    let name_ = "BITbyteBYTES.io";
    for (let l = 0; l < name_.length; l++) {
        let next = "<span class='ltr'>" + name_[l] + "</span>";
        _name += next;
    }
    document.querySelector(".logo").innerHTML = _name;
}

function initializeToob() {
    let toobHtmlElement = document.getElementById("toobImage");
    toob = new Toob(toobHtmlElement);

    initializeUfos();
}

// game of life ------------------------------->>>
function initializePixelAge(hWidth, hHeight) {
    pixelAge = new Array(hWidth * hHeight);
    for (let index = 0; index < hWidth * hHeight; index++) {
        pixelAge[index] = 0;
    }
    for (let i = 0; i < hWidth * hHeight * INITIAL_CELL_DENSITY; i++) {
        const index = Math.floor(Math.random() * pixelAge.length);
        pixelAge[index] = 1;
    }
}

function incrementAge(pixels) {
    let age = 0;
    let n = 0;
    for (let index = 0; index < pixelAge.length; index++) {
        // get age from pixelAge array
        age = pixelAge[index];
        // determine neighbors from previous screen buffer
        n = getNumNeighbors(index);

        if (age >= 1) {
            if (n == 2 || n == 3) {
                // Any live cell with two or three live neighbors lives on to the next generation..
                age++;
            } else {
                // any live cell with fewer than two live neighbors dies, as if caused by under-population.
                // or live cell with more than three live neighbors dies, as if by overcrowding.
                age = 0;
            }
        } else if (n == 3) {
            //Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
            age = 1;
        }
        // store the updated age
        pixelAge[index] = age;
    }
    // update screen buffer based on new ages
    setPixelColors(pixels);
}

function setPixelColors(pixels) {
    let age = 0;
    for (let index = 0; index < pixelAge.length; index++) {
        age = pixelAge[index];
        if (age >= 1) {
            if (age > 1024) pAge = 1;
            // a pixel is considered alive if it has > 0 in red channel
            // dead if 0
            if (age < 128) {
                // red
                pixels[index * 4] = 255;
                // green
                pixels[index * 4 + 1] = 255;
                // blue
                pixels[index * 4 + 2] = 255;
                // alpha
                pixels[index * 4 + 3] = 255;
            } else if (age < 256) {
                pixels[index * 4] = 255;
                pixels[index * 4 + 1] = 0;
                pixels[index * 4 + 2] = 0;
                pixels[index * 4 + 3] = 255;
            } else if (age < 512) {
                pixels[index * 4] = 1;
                pixels[index * 4 + 1] = 255;
                pixels[index * 4 + 2] = 0;
                pixels[index * 4 + 3] = 255;
            } else if (age < 768) {
                pixels[index * 4] = 1;
                pixels[index * 4 + 1] = 0;
                pixels[index * 4 + 2] = 255;
                pixels[index * 4 + 3] = 255;
            } else {
                let rColor = {
                    r: Math.floor(Math.random() * 254 + 1),
                    g: Math.floor(Math.random() * 255),
                    b: Math.floor(Math.random() * 255),
                    a: 255,
                };
                pixels[index * 4] = rColor.r;
                pixels[index * 4 + 1] = rColor.g;
                pixels[index * 4 + 2] = rColor.b;
                pixels[index * 4 + 3] = 255;
            }
        } else {
            pixels[index * 4] = pixels[index * 4 + 1] = pixels[index * 4 + 2] = 0;
            pixels[index * 4 + 3] = 255;
        }
    }
}

function getNumNeighbors(index) {
    index = index * 4;
    let neighbors = 0;
    let nIndex = 0;
    for (let i = -4; i <= 4; i += 4) {
        for (let j = -4; j <= 4; j += 4) {
            nIndex = index + i + j * hWidth;
            if (nIndex !== index && nIndex >= 0 && nIndex < pixels.length) {
                // pixel red channel > 0 is alive
                if (pixels[nIndex] > 0) {
                    neighbors++;
                }
            }
        }
    }
    return neighbors;
}

function mouseClicked(e) {
    if (e.pageY <= hHeight) {
        randomCellSpawn(e.pageX, e.pageY);
    }
}

function mouseDragged(e) {
    randomCellSpawn(e.pageX, e.pageY);
}

function randomCellSpawn(x, y) {
    let cellIndex = y * hWidth + x;
    for (let i = -Math.floor(SPAWN_AREA_SIZE / 2); i < SPAWN_AREA_SIZE; i++) {
        for (let j = -Math.floor(SPAWN_AREA_SIZE / 2); j < SPAWN_AREA_SIZE; j++) {
            index = cellIndex + i + j * hWidth;
            if (index > 0 && index < pixelAge.length) {
                pixelAge[index] = Math.random() > 0.5 ? 1 : 0;
            }
        }
    }
}

function windowResized() {
    restartGOL();
    initializeHeaderText();
    initializeToob();
}
// end of p5/gol stuff--------------------------------------->>>

// Header text
function updateHeaderText() {
    if (Math.random() * 100 > 80) {
        let letters = document.getElementsByClassName("ltr");
        let index = Math.floor(Math.random() * letters.length);
        let rColor = {
            r: Math.floor(Math.random() * 255),
            g: Math.floor(Math.random() * 255),
            b: Math.floor(Math.random() * 255),
            a: 255,
        };
        letters[index].style = `color: rgb(${rColor.r}, ${rColor.g}, ${rColor.b})`;
    }
}

// Toob icons
function initializeUfos() {
    let ufoElements = document.getElementsByClassName("ufo");
    for (let i = 0; i < ufoElements.length; i++) {
        let position = new Vec2D(
            toob.center.x + Math.random() * toob.width - toob.width / 2,
            toob.center.y + Math.random() * toob.height - toob.height / 2
        );
        let velocity = new Vec2D(Math.random() * 2, Math.random() * 2);
        let htmlElement = ufoElements[i];
        ufos[i] = new Ufo(position, velocity, htmlElement);
    }
}

function updateUfos() {
    for (let i = 0; i < ufos.length; i++) {
        const ufo = ufos[i];
        let nextPos = ufo.pos.add(ufo.vel);
        if (nextPos.x < toob.left || nextPos.x > toob.right) ufo.vel = ufo.vel.flipX();
        if (nextPos.y < toob.top || nextPos.y > toob.bottom) ufo.vel = ufo.vel.flipY();
        ufo.pos = ufo.pos.add(ufo.vel);
        ufo.htmlElement.style = `transform: translate(${ufo.pos.x - ufo.SIZE / 2}px, ${ufo.pos.y - ufo.SIZE / 2}px)`;
    }
}

class Ufo {
    SIZE = 32;
    constructor(position, velocity, element) {
        this.pos = position;
        this.vel = velocity;
        this.htmlElement = element;
    }

    setPosition(position) {
        this.pos = position;
    }

    setVelocity(velocity) {
        this.vel = velocity;
    }
}

class Toob {
    TOOB_PADDING = 128;
    constructor(htmlElement) {
        this.bounds = htmlElement.getBoundingClientRect();
        this.width = this.bounds.width - this.TOOB_PADDING;
        this.height = this.bounds.height - this.TOOB_PADDING;
        this.center = new Vec2D(this.bounds.x + this.bounds.width / 2, this.bounds.y + this.bounds.height / 2);
        this.top = this.center.y - this.height / 2;
        this.right = this.center.x + this.width / 2;
        this.bottom = this.center.y + this.height / 2;
        this.left = this.center.x - this.width / 2;
    }
}

class Vec2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector2D) {
        return new Vec2D(this.x + vector2D.x, this.y + vector2D.y);
    }

    sub(vector2D) {
        return new Vec2D(this.x - vector2D.x, this.y - vector2D.y);
    }

    flipX() {
        return new Vec2D(-this.x, this.y);
    }

    flipY() {
        return new Vec2D(this.x, -this.y);
    }
}
