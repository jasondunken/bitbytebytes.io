let hWidth;
let hHeight;
let tWidth;
let tHeight;
let tLeft;
let tTop;
let tVPadding;
let tHPadding;

const TOOB_PADDING = 180;

const UPDATES_PER_AGE_TICK = 3;
let frameCount = 1;
let cellDensity = 0.075;
let pixelAge = [];
let lastPixelAge = [];

let ufos = [];

// called by p5 when window is ready
function setup() {
    // p5 doesn't call setup until ths page is loaded
    // so this place works for initializing the other js as well
    initHeader();
    buildName();
    setupToob();

    // p5.draw calls/second
    frameRate(60);
}

// called by p5 when window is ready
function draw() {
    frameCount = frameCount % UPDATES_PER_AGE_TICK;
    if (frameCount == 0) {
        incrementAge(pixels);
    }
    frameCount++;
    // p5.js function
    // copies the canvas' pixels a global pixels[]
    //         px0         px1         px2 ...
    //           |           |           |
    // pixels = [r, g, b, a, r, g, b, a, r ...]
    loadPixels();

    setPixelColors(pixels);

    // p5.js function
    // updates p5 display window
    updatePixels();

    updateUfos();
    updateColorChange();
}

function initHeader() {
    let header = document
        .getElementById("logo-container")
        .getBoundingClientRect();
    hWidth = header.width;
    hHeight = header.height;

    // canvas for header
    let canvas = createCanvas(hWidth, hHeight);
    canvas.parent("p5-container");

    initializePixelAge(hWidth, hHeight);
}

function setupToob() {
    // updateUfos needs the toobImage
    let toob = document.getElementById("toobImage").getBoundingClientRect();
    tWidth = toob.width;
    tHeight = toob.height;
    tLeft = toob.left;
    tTop = toob.top;
    tVPadding = TOOB_PADDING * (tHeight / tWidth);
    tHPadding = TOOB_PADDING;
}

// game of life header
function initializePixelAge(hWidth, hHeight) {
    pixelAge = new Array(hWidth * hHeight);
    for (let index = 0; index < hWidth * hHeight; index++) {
        pixelAge[index] = 0;
    }
    for (let i = 0; i < hWidth * hHeight * cellDensity; i++) {
        const index = Math.floor(Math.random() * pixelAge.length);
        pixelAge[index] = 1;
    }
    lastPixelAge = [...pixelAge];
}

function incrementAge(pixels) {
    let age = 0;
    let n = 0;
    for (let index = 0; index < pixelAge.length; index++) {
        // get age from pixelAge array
        age = pixelAge[index];
        // determine neighbors from previous screen buffer
        // testing with a parallel int array for now
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
    lastPixelAge = [...pixelAge];
    // update screen buffer based on new ages
    setPixelColors(pixels);
}

function setPixelColors(pixels) {
    for (let index = 0; index < pixelAge.length; index++) {
        let age = pixelAge[index];
        if (age >= 1) {
            if (age > 2048) pAge = 1;
            if (age < 256) {
                pixels[index * 4] = 255;
                pixels[index * 4 + 1] = 255;
                pixels[index * 4 + 2] = 255;
                pixels[index * 4 + 3] = 255;
            } else if (age < 512) {
                pixels[index * 4] = 255;
                pixels[index * 4 + 1] = 0;
                pixels[index * 4 + 2] = 0;
                pixels[index * 4 + 3] = 255;
            } else if (age < 768) {
                pixels[index * 4] = 0;
                pixels[index * 4 + 1] = 255;
                pixels[index * 4 + 2] = 0;
                pixels[index * 4 + 3] = 255;
            } else if (age < 1024) {
                pixels[index * 4] = 0;
                pixels[index * 4 + 1] = 0;
                pixels[index * 4 + 2] = 255;
                pixels[index * 4 + 3] = 255;
            } else {
                let rColor = getRandomOpaqueColor();
                pixels[index * 4] = rColor.r;
                pixels[index * 4 + 1] = rColor.g;
                pixels[index * 4 + 2] = rColor.b;
                pixels[index * 4 + 3] = 255;
            }
        } else {
            pixels[index * 4] =
                pixels[index * 4 + 1] =
                pixels[index * 4 + 2] =
                    0;
            pixels[index * 4 + 3] = 255;
        }
    }
}

function getNumNeighbors(index) {
    let neighbors = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let nIndex = index + i + j * hWidth;
            if (nIndex !== index && nIndex >= 0 && nIndex < pixels.length) {
                if (lastPixelAge[nIndex] > 0) {
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
    const SIZE = 11;
    let cellIndex = y * hWidth + x;
    for (let i = -Math.floor(SIZE / 2); i < SIZE; i++) {
        for (let j = -Math.floor(SIZE / 2); j < SIZE; j++) {
            index = cellIndex + i + j * hWidth;
            if (index > 0 && index < lastPixelAge.length) {
                lastPixelAge[index] = Math.random() > 0.5 ? 1 : 0;
            }
        }
    }
}

// logo
function buildName() {
    let _name = "";
    let name_ = "BITbyteBYTES.io";
    for (let l = 0; l < name_.length; l++) {
        let next = "<span class='ltr'>" + name_[l] + "</span>";
        _name += next;
    }
    document.querySelector(".logo").innerHTML = _name;
}

function updateColorChange() {
    if (Math.random() * 100 > 80) {
        let letters = document.getElementsByClassName("ltr");
        let index = Math.floor(Math.random() * letters.length);
        let rColor = getRandomOpaqueColor();
        letters[
            index
        ].style = `color: rgb(${rColor.r}, ${rColor.g}, ${rColor.b})`;
    }
}

// game icons
function updateUfos() {
    let ufo = document.getElementsByClassName("ufo");
    for (let i = 0; i < ufo.length; i++) {
        if (!ufos[i]) {
            let x_start = Math.random() * tWidth;
            let y_start = Math.random() * tHeight;
            let x_dir = Math.random() > 0.5 ? 1 : -1;
            let y_dir = Math.random() > 0.5 ? 1 : -1;
            let speed = Math.random() * 2;
            ufos[i] = {
                x: x_start,
                y: y_start,
                xd: x_dir,
                yd: y_dir,
                s: speed,
                type: "none",
                state: "none",
            };
        }
        let move = moveUfo(ufos[i]);
        ufo[i].style =
            "position: absolute; top: " +
            move.y +
            "px; left: " +
            move.x +
            "px;";
    }
}

function moveUfo(ufo) {
    let move = {};
    move.x = ufo.x + ufo.s * ufo.xd;
    move.y = ufo.y + ufo.s * ufo.yd;
    if (move.x < tLeft + tHPadding) {
        move.x = tLeft + tHPadding;
        ufo.xd *= -1;
    }
    if (move.x > tWidth + tLeft - 32 - tHPadding) {
        move.x = tWidth + tLeft - 32 - tHPadding;
        ufo.xd *= -1;
    }
    if (move.y < tTop + tVPadding) {
        move.y = tTop + tVPadding;
        ufo.yd *= -1;
    }
    if (move.y > tTop + tHeight - tVPadding) {
        move.y = tTop + tHeight - tVPadding;
        ufo.yd *= -1;
    }
    ufo.x = move.x;
    ufo.y = move.y;
    return move;
}

function getRandomOpaqueColor() {
    return {
        r: Math.floor(Math.random() * 255),
        g: Math.floor(Math.random() * 255),
        b: Math.floor(Math.random() * 255),
        a: 255,
    };
}

function windowResized() {
    let header = document
        .getElementById("logo-container")
        .getBoundingClientRect();
    hWidth = header.width;
    hHeight = header.height;
    resizeCanvas(hWidth, hHeight);

    // this resets the pixel buffer
    background("black");

    initializePixelAge(hWidth, hHeight);
}
