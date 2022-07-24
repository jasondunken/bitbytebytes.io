const DRAW_CALLS_PER_AGE_TICK = 2;
const INITIAL_CELL_DENSITY = 0.075;
const SPAWN_AREA_SIZE = 11;
let hWidth;
let hHeight;
let pixelAge;

const RESTART_DELAY = 10;
let restartTimer = 0;

let terminal;
let ufos = [];

// called by p5 when window is ready
function setup() {
    // p5.draw calls/second
    frameRate(60);
    initializeHeaderGOL();
    initializeHeaderText();
    initializeTerminal();
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
        if (frameCount % DRAW_CALLS_PER_AGE_TICK == 0) {
            incrementAge();
        }

        // p5.js function
        // copies the canvas' pixels a global pixels[]
        //         px0         px1         px2 ...
        //           |           |           |
        // pixels = [r, g, b, a, r, g, b, a, r ...]
        loadPixels();
        setPixelColors(pixels);
        updatePixels();
    }

    updateUfos();
    updateHeaderText();
}

function initializeHeaderGOL() {
    const size = getGOLSize();
    // p5 canvas
    let canvas = createCanvas(size.hWidth, size.hHeight);
    canvas.parent("p5-container");

    restartGOL();
}

function restartGOL() {
    clear();
    restartTimer = RESTART_DELAY;
    const size = getGOLSize();
    resizeCanvas(size.hWidth, size.hHeight);
    initializePixelAge(size.hWidth, size.hHeight);
}

function getGOLSize() {
    // TODO: needs to take browser zoom into consideration, breaks if zoom !== 100% currently
    let header = document.getElementById("gol-container").getBoundingClientRect();
    hWidth = header.width;
    hHeight = header.height;
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

function initializeTerminal() {
    let toobHtmlElement = document.getElementById("retro-terminal");
    terminal = new Terminal(toobHtmlElement);

    initializeUfos();
}

function windowResized() {
    restartGOL();
    initializeHeaderText();
    initializeTerminal();
}

// game of life --------------------------------->>>
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

function incrementAge() {
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
// end of gol ----------------------------------->>>

// Header text
let headerIndex = 0;
let currentColor = "";
function updateHeaderText() {
    if (frameCount % 340 === 0) {
        headerIndex = 0;
        const rColor = {
            r: Math.floor(Math.random() * 255),
            g: Math.floor(Math.random() * 255),
            b: Math.floor(Math.random() * 255),
            a: 255,
        };
        currentColor = `color: rgb(${rColor.r}, ${rColor.g}, ${rColor.b})`;
    }

    let letters = document.getElementsByClassName("ltr");
    if (frameCount % 10 === 0) {
        letters[headerIndex].style = currentColor;
        headerIndex++;
        if (headerIndex >= letters.length) headerIndex = 0;
    }
}

// Toob icons
function initializeUfos() {
    let ufoElements = document.getElementsByClassName("ufo");
    for (let i = 0; i < ufoElements.length; i++) {
        let position = new Vec2D(
            terminal.center.x + Math.random() * terminal.width - terminal.width / 2,
            terminal.center.y + Math.random() * terminal.height - terminal.height / 2
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
        if (nextPos.x < terminal.left || nextPos.x > terminal.right) ufo.vel = ufo.vel.flipX();
        if (nextPos.y < terminal.top || nextPos.y > terminal.bottom) ufo.vel = ufo.vel.flipY();
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

class Terminal {
    TOOB_PADDING = 128;

    VERSION = "JSDOS v0.0.1";
    CURSOR = "$";

    GAMES = [
        "jump-to-orion",
        "slider",
        "air-defense",
        "mine-squad-plus",
        "planet-invaders",
        "bug-dug",
        "expedition-luna",
    ];

    constructor(htmlElement) {
        this.element = htmlElement;
        this.bounds = htmlElement.getBoundingClientRect();
        this.width = this.bounds.width - this.TOOB_PADDING;
        this.height = this.bounds.height - this.TOOB_PADDING;
        this.center = new Vec2D(this.bounds.width / 2, this.bounds.height / 2);
        this.top = this.center.y - this.height / 2;
        this.right = this.center.x + this.width / 2;
        this.bottom = this.center.y + this.height / 2;
        this.left = this.center.x - this.width / 2;

        this.retroConsole = document.getElementById("console");
        this.retroConsole.addEventListener("keypress", (event) => {
            this.handleKeyEvent(event);
        });
    }

    handleKeyEvent(keyEvent) {
        if (keyEvent.keyCode === 13) {
            const consoleBuffer = keyEvent.target.value.split("\n");
            const newCommand = consoleBuffer[consoleBuffer.length - 1].split(" ");
            const command = newCommand[0]?.toLowerCase();
            const arg = newCommand[1]?.toLowerCase();
            switch (command) {
                case "version":
                case "-v":
                    this.showVersion();
                    break;
                case "help":
                case "-h":
                    this.showHelp();
                    break;
                case "catalog":
                case "-c":
                    this.listGames();
                    break;
                case "run":
                case "-r":
                    this.runGame(arg);
                    break;
                default:
                    this.commandError(command, "command invalid");
                    break;
            }
        }
    }

    showVersion() {
        this.appendConsole(this.VERSION);
    }

    showHelp(command) {
        const help = `Available commands: help, catalog, run`;
        this.appendConsole(help);
    }

    listGames() {
        let text = "\n";
        for (let game of this.GAMES) {
            text += game + "\n";
        }
        this.appendConsole(text);
    }

    runGame(arg) {
        if (this.GAMES.includes(arg)) {
            window.location.href = `./games/${arg}.html`;
            return;
        }
        if (!arg || arg.length < 1) {
            this.commandError("", "run requires an argument");
        } else {
            this.commandError("", `${arg} not found`);
        }
    }

    commandError(command, error) {
        this.appendConsole(`error ${command} ${error}`);
    }

    appendConsole(text) {
        this.retroConsole.value += `\n${text}`;
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
