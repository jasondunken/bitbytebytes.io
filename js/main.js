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
    switchElement.offsetWidth; // hack to get switch animation to restart on subsequent clicks
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
        // sets pixel color based on its age
        setPixelColors(pixels);
        // p5.js function
        // updates screen buffer with pixels[]
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
    let name_ = "bitbytebytes.io";
    for (let l = 0; l < name_.length; l++) {
        let next = "<span class='ltr'>" + name_[l] + "</span>";
        _name += next;
    }
    document.querySelector(".logo").innerHTML = _name;
}

function initializeTerminal() {
    terminal = new Terminal(document.getElementById("retro-terminal"));
    initializeUfos();
}

function windowResized() {
    restartGOL();
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

let randomColorDelta = 0;
let currentRandomColor = null;
function setPixelColors(pixels) {
    randomColorDelta += 0.001;
    currentRandomColor = hslToRgb(Math.sin(randomColorDelta), 0.5, 0.5);

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
                pixels[index * 4] = currentRandomColor.r;
                pixels[index * 4 + 1] = currentRandomColor.g;
                pixels[index * 4 + 2] = currentRandomColor.b;
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
    TERMINAL_PADDING = 128;

    VERSION = "BBBDOS v0.0.1b";
    PROMPT = "guest@bitbytebytes:~$";
    CURSORS = ["▀", "▄", "█", "▌", "▐", "░", "▒", "▓"];
    CURSOR = this.CURSORS[6];

    GAMES = [
        "jump-to-orion",
        "slider",
        "air-defense",
        "mine-squad-plus",
        "planet-invaders",
        "bug-dug",
        "expedition-luna",
    ];

    loading = false;
    settings = null;

    constructor(htmlElement) {
        this.element = htmlElement;
        this.bounds = htmlElement.getBoundingClientRect();
        this.width = this.bounds.width - this.TERMINAL_PADDING;
        this.height = this.bounds.height - this.TERMINAL_PADDING;
        this.center = new Vec2D(this.bounds.width / 2, this.bounds.height / 2);
        this.top = this.center.y - this.height / 2;
        this.right = this.center.x + this.width / 2;
        this.bottom = this.center.y + this.height / 2;
        this.left = this.center.x - this.width / 2;

        this.retroConsole = document.getElementById("console");
        this.retroConsole.addEventListener("click", () => {
            this.focusCMD();
        });
        this.consoleOutput = document.getElementById("console-output");
        this.outputInsertPoint = document.getElementById("output-bottom");

        this.commandLine = document.getElementById("command-line");
        this.hiddenInput = document.getElementById("hidden-input");
        this.hiddenInput.addEventListener("keyup", (event) => {
            this.handleKeyEvent(event);
        });
        this.focusCMD();

        this.prompt = document.getElementById("prompt");
        this.prompt.innerHTML = this.PROMPT;
        this.dummyInput = document.getElementById("dummy-input");
        this.cursor = document.getElementById("cursor");
        this.cursor.innerHTML = this.CURSOR;

        this.loadSettings();
        this.addWelcome();
        this.login();
    }

    focusCMD() {
        this.hiddenInput.focus();
    }

    handleKeyEvent(keyEvent) {
        this.dummyInput.innerHTML = keyEvent.target.value;
        if (keyEvent.keyCode === 13) {
            this.appendConsole(this.PROMPT + " " + keyEvent.target.value);
            const newCommand = keyEvent.target.value.split(" ");
            const command = newCommand[0]?.trim().toLowerCase();
            const args = newCommand.splice(1);
            this.hiddenInput.value = "";
            this.dummyInput.innerHTML = "";
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
                case "cat":
                case "-c":
                    this.listGames();
                    break;
                case "run":
                case "-r":
                    this.runGame(args);
                    break;
                case "reset":
                    this.reset(args);
                    break;
                case "about":
                    this.addWelcome();
                    break;
                default:
                    this.commandError(command, "command invalid");
                    break;
            }
        }
    }

    addWelcome() {
        this.appendConsole(`        ______ ______ ______       __               `);
        this.appendConsole(`       |   __ |   __ |   __ .--.--|  |_.-----.-----.`);
        this.appendConsole(`       |   __ |   __ |   __ |  |  |   _|  -__|__ --|`);
        this.appendConsole(`       |______|______|______|___  |____|_____|_____|`);
        this.appendConsole(`  +---+---+---+---+---+---+-|_____|Welcome to BitByteBytes!`);
        this.appendConsole(this.VERSION);
        this.appendConsole(`Last Login:${this.getLastLogin()}`);
    }

    showVersion() {
        this.appendConsole(this.VERSION);
    }

    showHelp(command) {
        const help = `Available commands: help, catalog, run, version`;
        this.appendConsole(help);
    }

    listGames() {
        this.appendConsole("</br>");
        this.appendConsole("Currently available games");
        this.appendConsole("----------------------------");
        for (let game of this.GAMES) {
            this.appendConsole(game);
        }
        this.appendConsole("----------------------------");
        this.appendConsole("</br>");
    }

    runGame(args) {
        const game = args[0].trim();
        if (this.GAMES.includes(game) && !this.loading) {
            this.appendConsole(`Loading ${game}`);
            this.loading = true;
            setTimeout(() => {
                window.location.href = `./games/${game}.html`;
            }, 3000);
            return;
        }
        if (!game || game.length < 1) {
            this.commandError("run", "requires an argument");
        } else {
            this.commandError("run", `${game} not found`);
        }
    }

    commandError(command, error) {
        this.appendConsole(`ERROR: ${command} ${error}`);
    }

    appendConsole(line) {
        line = this.encodeLine(line);
        let newLine = document.createElement("p");
        newLine.innerHTML = line;

        this.outputInsertPoint.parentNode.insertBefore(newLine, this.outputInsertPoint);
        this.retroConsole.scrollTo(0, document.body.offsetHeight);
    }

    encodeLine(line) {
        let encodedString = "";
        for (let i = 0; i < line.length; i++) {
            if (i === 0 && line.charAt(i) == " ") {
                encodedString += "&#160;";
            } else if (line.charAt(i) == " " && line.charAt(i + 1) == " ") {
                encodedString += "&#160;&#160;";
                i++;
            } else {
                encodedString += line.charAt(i);
            }
        }
        return encodedString;
    }

    getLastLogin() {
        const date = new Date(this.settings["last-login"]);
        return this.formatDate(date);
    }

    login() {
        const thisLogin = new Date(Date.now() - new Date("2022-01-01"));
        this.updateSettings("last-login", thisLogin);
    }

    initSettings() {
        this.appendConsole("initializing settings...");
        localStorage.clear();
        this.settings = {
            "last-login": new Date("1970-01-01T16:20:00"),
        };
        this.saveSettings();
    }

    loadSettings() {
        const settings = localStorage.getItem("bbbdos-settings");
        if (!settings) {
            this.initSettings();
        } else {
            this.settings = JSON.parse(settings);
        }
    }

    updateSettings(setting, value) {
        this.settings[setting] = value;
        this.saveSettings();
    }

    saveSettings() {
        localStorage.setItem("bbbdos-settings", JSON.stringify(this.settings));
    }

    reset(args) {
        const arg1 = args[0].trim();
        console.log("args: ", args);
        switch (arg1) {
            case "settings":
                this.initSettings();
                break;
            default:
                this.appendConsole(`unauthorized reset of ${arg1}`);
                this.appendConsole(`reset command cancelled`);
        }
    }

    formatDate(date) {
        const dateString = date.toDateString();
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, 0);
        const seconds = String(date.getSeconds()).padStart(2, 0);
        const millis = String(date.getMilliseconds()).padStart(4, 0);
        return `${dateString} ${hours}:${minutes}:${seconds}:${millis}`;
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

// converts h(0-1)s(0-1)l(0-1) to rgb
function hslToRgb(h, s, l) {
    let r, g, b;
    if (s == 0) {
        r = g = b = l;
    } else {
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3.0);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3.0);
    }

    return {
        r: Math.round(r * 254) + 1, // +1 is for the age check
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}

function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6.0) return p + (q - p) * 6 * t;
    if (t < 1 / 2.0) return q;
    if (t < 2 / 3.0) return p + (q - p) * 6 * (2 / 3.0 - t);
    return p;
}
