let cWidth, cHeight, tWidth, tHeight, tLeft, tTop, tVPadding, tHPadding;

const TOOB_PADDING = 180;

let map = [];
let nextMap = [];
let cellDensity = 0.075;
let newPixels = [];

let ufos = [];

function setup() {
    frameRate(15);
    let header = document
        .getElementById("logo-container")
        .getBoundingClientRect();
    cWidth = header.width;
    cHeight = header.height;

    let toob = document.getElementById("toobImage").getBoundingClientRect();
    tWidth = toob.width;
    tHeight = toob.height;
    tLeft = toob.left;
    tTop = toob.top;
    tVPadding = TOOB_PADDING * (tHeight / tWidth);
    tHPadding = TOOB_PADDING;

    let canvas = createCanvas(header.width, header.height);
    canvas.parent("p5-container");

    // initialize map arrays to age 0 (dead/empty)
    for (let i = 0; i < header.width * header.height; i++) {
        map[i] = 0;
        nextMap[i] = 0;
    }
    // randomly set n cells to age 1
    // the value of map[n] is how many generations it has been alive for
    for (let i = 0; i < cWidth * cHeight * cellDensity; i++) {
        const index = Math.floor(Math.random() * map.length);
        const value = map[index];
        if (value !== 1) {
            map[index] = 1;
        }
    }

    setInterval(this.update, 32);
}

// function windowResized() {
//     this.setup();
//     resizeCanvas(windowWidth, windowHeight);
// }

// game of life header
function drawd() {
    let rColor = this.getRandomColor();
    loadPixels();
    for (let i = 0; i < map.length; i++) {
        //     r               g               b               a
        if (map[i] >= 1) {
            // white range
            if (map[i] > 2048) map[i] = 1;
            if (map[i] < 256) {
                pixels[i * 4] = pixels[i * 4 + 1] = pixels[i * 4 + 2] = 256;
                pixels[i * 4 + 3] = 255;
            } else if (map[i] < 512) {
                pixels[i * 4] = 255;
                pixels[i * 4 + 1] = pixels[i * 4 + 2] = 0;
                pixels[i * 4 + 3] = 255;
            } else if (map[i] < 768) {
                pixels[i * 4 + 1] = 255;
                pixels[i * 4] = pixels[i * 4 + 2] = 0;
                pixels[i * 4 + 3] = 255;
            } else if (map[i] < 1024) {
                pixels[i * 4] = rColor.r;
                pixels[i * 4 + 1] = rColor.g;
                pixels[i * 4 + 2] = rColor.b;
                pixels[i * 4 + 3] = 255;
            }
        } else {
            pixels[i * 4] = pixels[i * 4 + 1] = pixels[i * 4 + 2] = 0;
            pixels[i * 4 + 3] = 255;
        }
    }
    updatePixels();

    // create new nextMap from map
    for (let i = 0; i < map.length; i++) {
        if (map[i] >= 1) {
            ////Any live cell...
            let n = getNumNeighbors(i);
            if (n < 2) {
                //with fewer than two live neighbors dies, as if caused by under-population.
                nextMap[i] = 0;
            } else if (n == 2 || n == 3) {
                //live cell with two or three live neighbors lives on to the next generation.
                nextMap[i] = map[i] + 1; // so increment it's age
            } else if (n > 3) {
                //live cell with more than three live neighbors dies, as if by overcrowding.
                nextMap[i] = 0;
            }
        } else {
            if (getNumNeighbors(i) == 3) {
                //Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
                nextMap[i] = 1;
            }
        }
    }
    map = [...nextMap];
    // clear nextMap
    for (let i = 0; i < nextMap.length; i++) {
        nextMap[i] = 0;
    }
}

function getNumNeighbors(index) {
    let neighbors = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let nIndex = index + i + j * cWidth;
            if (nIndex !== index && nIndex >= 0 && nIndex < map.length) {
                if (map[nIndex] >= 1) {
                    neighbors++;
                }
            }
        }
    }
    return neighbors;
}

function mouseClicked(e) {
    if (e.pageY <= cHeight) {
        randomSpawn(e.pageX, e.pageY);
    }
}

function mouseDragged(e) {
    randomSpawn(e.pageX, e.pageY);
}

function randomSpawn(x, y) {
    const SIZE = 11;
    let cellIndex = y * cWidth + x;
    for (let i = -Math.floor(SIZE / 2); i < SIZE; i++) {
        for (let j = -Math.floor(SIZE / 2); j < SIZE; j++) {
            index = cellIndex + i + j * cWidth;
            if (index > 0 && index < map.length) {
                map[index] = Math.random() > 0.5 ? 1 : 0;
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

function twinkle() {
    let letters = document.getElementsByClassName("ltr");
    let index = Math.floor(Math.random() * letters.length);
    let rColor = this.getRandomColor();
    letters[index].style = `color: rgb(${rColor.r}, ${rColor.g}, ${rColor.b})`;
}

function getRandomColor() {
    return {
        r: Math.floor(Math.random() * 255),
        g: Math.floor(Math.random() * 255),
        b: Math.floor(Math.random() * 255),
    };
}

// game icons
function update() {
    let ufo = document.getElementsByClassName("ufo");
    for (let i = 0; i < ufo.length; i++) {
        if (!ufos[i]) {
            let x_start = Math.random() * this.innerWidth;
            let y_start = Math.random() * tHeight;
            let x_dir = Math.random() > 0.5 ? 1 : -1;
            let y_dir = Math.random() > 0.5 ? 1 : -1;
            let speed = Math.random() * 4 + 1;
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
        let move = move_mob(ufos[i]);
        ufo[i].style =
            "position: absolute; top: " +
            move.y +
            "px; left: " +
            move.x +
            "px;";
    }
}

function move_mob(ufo) {
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

// __main__
buildName();
setInterval(twinkle, 100);
