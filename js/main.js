let gol;
let terminal;

// called by p5 when window is ready
function setup() {
    // p5.draw calls/second
    frameRate(60);
    document.getElementById("toggle-1").addEventListener("click", ($event) => {
        this.momentarySwitch($event.target);
        this.restartGOL();
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

    initializeGOL();
    initializeBanner();
    initializeTerminal();
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

// called by p5 when setup is resolved
// @ framerate/second
function draw() {
    if (this.gol && (this.gol.state === this.gol.STATES.READY || this.gol.state === this.gol.STATES.RUNNING)) {
        // p5.js function
        // copies the canvas' pixels a global pixels[]
        //         px0         px1         px2 ...
        //           |           |           |
        // pixels = [r, g, b, a, r, g, b, a, r ...]
        loadPixels();
        this.gol.update(pixels);
        this.gol.draw(pixels);
        // p5.js function
        // updates screen buffer with pixels[]
        updatePixels();
    }
    updateHeaderText();
}

function initializeGOL() {
    const header = document.getElementById("gol-container").getBoundingClientRect();
    this.gol = new GOL(header.width, header.height);
}

function restartGOL() {
    const header = document.getElementById("gol-container").getBoundingClientRect();
    this.gol.restart(header.width, header.height);
}

function initializeBanner() {
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
}

function windowResized() {
    this.restartGOL();
}

function mouseReleased(e) {
    this.gol.randomCellSpawn(e.pageX, e.pageY);
}

function mouseClicked(e) {
    this.gol.randomCellSpawn(e.pageX, e.pageY);
}

function mouseDragged(e) {
    this.gol.randomCellSpawn(e.pageX, e.pageY);
}

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

class GOL {
    DRAW_CALLS_PER_AGE_TICK = 2;
    INITIAL_CELL_DENSITY = 0.075;
    SPAWN_AREA_SIZE = 11;

    RESTART_DELAY = 20;
    restartTime = 0;

    golCanvas = null;
    pixelAge;

    STATES = { STARTING: 0, READY: 1, RUNNING: 2, PAUSED: 3 };
    state = this.STATES.STARTING;

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.restart(width, height);
    }

    restart(width, height) {
        if (this.golCanvas) {
            const p5Container = document.getElementById("p5-container");
            p5Container.removeChild(p5Container.firstChild);
            this.golCanvas = null;
        }
        this.state = this.STATES.STARTING;
        this.restartTime = this.RESTART_DELAY;
        this.width = width;
        this.height = height;
        this.golCanvas = createCanvas(width, height);
        this.golCanvas.parent("p5-container");
        this.pixelAge = [];
        this.initializeGOL(width, height);
    }

    initializeGOL(width, height) {
        this.pixelAge = new Array(width * height);
        for (let i = 0; i < width * height * this.INITIAL_CELL_DENSITY; i++) {
            const index = Math.floor(Math.random() * this.pixelAge.length);
            this.pixelAge[index] = 1;
        }
        this.state = this.STATES.READY;
    }

    update(pixels) {
        if (this.restartTime > 0) {
            this.restartTime--;
        } else this.state = this.STATES.RUNNING;

        if (this.state === this.STATES.RUNNING) {
            // frameCount is a p5 global
            if (frameCount % this.DRAW_CALLS_PER_AGE_TICK == 0) {
                this.incrementAge(pixels);
            }
        }
    }

    incrementAge(pixels) {
        let age = 0;
        let n = 0;
        for (let index = 0; index < this.pixelAge.length; index++) {
            // get age from pixelAge array
            age = this.pixelAge[index];
            // determine neighbors from previous screen buffer
            n = this.getNumNeighbors(index, pixels);

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
            this.pixelAge[index] = age;
        }
    }

    draw(pixels) {
        if (this.state === this.STATES.STARTING) {
            // sets pixel color based on its age
            for (let i = 0; i < pixels.length; i++) {
                pixels[i] = 0;
            }
        }
        if (this.state === this.STATES.RUNNING) {
            // sets pixel color based on its age
            this.setPixelColors(pixels);
        }
    }

    randomColorDelta = 0;
    currentRandomColor = null;
    setPixelColors(pixels) {
        this.randomColorDelta += 0.001;
        this.currentRandomColor = hslToRgb(Math.sin(this.randomColorDelta), 0.5, 0.5);

        let age = 0;
        for (let index = 0; index < this.pixelAge.length; index++) {
            age = this.pixelAge[index];
            if (age >= 1) {
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
                    pixels[index * 4] = this.currentRandomColor.r;
                    pixels[index * 4 + 1] = this.currentRandomColor.g;
                    pixels[index * 4 + 2] = this.currentRandomColor.b;
                    pixels[index * 4 + 3] = 255;
                }
            } else {
                pixels[index * 4] = pixels[index * 4 + 1] = pixels[index * 4 + 2] = 0;
                pixels[index * 4 + 3] = 255;
            }
        }
    }

    getNumNeighbors(index, pixels) {
        index = index * 4;
        let neighbors = 0;
        let nIndex = 0;
        for (let i = -4; i <= 4; i += 4) {
            for (let j = -4; j <= 4; j += 4) {
                nIndex = index + i + j * this.width;
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

    randomCellSpawn(x, y) {
        let cellIndex = y * this.width + x;
        for (let i = -Math.floor(this.SPAWN_AREA_SIZE / 2); i < this.SPAWN_AREA_SIZE; i++) {
            for (let j = -Math.floor(this.SPAWN_AREA_SIZE / 2); j < this.SPAWN_AREA_SIZE; j++) {
                const index = cellIndex + i + j * this.width;
                if (index > 0 && index < this.pixelAge.length) {
                    this.pixelAge[index] = Math.random() > 0.5 ? 1 : 0;
                }
            }
        }
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

    cmdHistory = [];
    cmdHistoryIndex = 0;

    constructor(htmlElement) {
        this.element = htmlElement;
        this.bounds = htmlElement.getBoundingClientRect();
        this.width = this.bounds.width - this.TERMINAL_PADDING;
        this.height = this.bounds.height - this.TERMINAL_PADDING;

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
        this.showWelcome();
        this.login();
    }

    focusCMD() {
        this.hiddenInput.focus();
    }

    handleKeyEvent(keyEvent) {
        this.dummyInput.innerHTML = keyEvent.target.value;
        if (keyEvent.key === "ArrowUp") {
            if (this.cmdHistoryIndex > 0) {
                this.cmdHistoryIndex--;
            }
            if (this.cmdHistory.length) {
                this.hiddenInput.value = this.cmdHistory[this.cmdHistoryIndex];
                this.dummyInput.innerText = this.cmdHistory[this.cmdHistoryIndex];
            }
        }
        if (keyEvent.key === "ArrowDown") {
            if (this.cmdHistoryIndex < this.cmdHistory.length - 1) {
                this.cmdHistoryIndex++;
            }
            if (this.cmdHistory.length) {
                this.hiddenInput.value = this.cmdHistory[this.cmdHistoryIndex];
                this.dummyInput.innerText = this.cmdHistory[this.cmdHistoryIndex];
            }
        }
        if (keyEvent.key === "Enter") {
            const commandString = keyEvent.target.value.trim();
            if (!commandString.length) return;

            this.cmdHistory.push(commandString);
            this.cmdHistoryIndex = this.cmdHistory.length;
            this.appendConsole(this.PROMPT + " " + commandString);

            const newCommand = commandString.split(" ");
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
                case "cat":
                case "-c":
                    this.listGames();
                    break;
                case "run":
                case "-r":
                    this.runGame(args);
                    break;
                case "motd":
                case "-m":
                    this.showWelcome();
                    break;
                case "ifconfig":
                case "-i":
                    this.showClientInfo();
                    break;
                case "reset":
                    this.reset(args);
                    break;
                default:
                    this.commandError(command, "command invalid");
                    break;
            }
        }
    }

    showWelcome() {
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
        this.appendConsole("</br>");
        this.appendConsole(`Available commands:`);
        this.appendConsole(`version, -v: shows bbbdos version information`);
        this.appendConsole(`help, -h: shows this help page`);
        this.appendConsole(`cat, -c: lists currently available bbbdos games`);
        this.appendConsole(`run, -r: runs a game program`);
        this.appendConsole(`motd, -m: shows message of the day`);
        this.appendConsole(`ifconfig, -i: shows connection information`);
        this.appendConsole("</br>");
    }

    listGames() {
        this.appendConsole("</br>");
        for (let game of this.GAMES) {
            this.appendConsole(`--x   ${game}`);
        }
        this.appendConsole(`---   toad-runner`);
        this.appendConsole(`---   hexbert`);
        this.appendConsole(`---   chateau-hasenpfeffer`);
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

    async showClientInfo() {
        console.log("window: ", window);
        let ip = await this.getIP();
        if (!ip) ip = "***.***.***.***";
        this.appendConsole("-----------------");
        this.appendConsole(`host: ${window.location.host}`);
        this.appendConsole(`client: ${ip}`);
        this.appendConsole(`connected: ${window.clientInformation.onLine}`);
        this.appendConsole("-----------------");
    }

    async getIP() {
        const ipify = await fetch("https://api.ipify.org?format=json").catch((error) => {
            // console.log("catch.error: ", error);
        });
        if (ipify) {
            const data = await ipify.json();
            return data.ip;
        }
        return null;
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
        const millis = String(date.getMilliseconds()).padStart(3, 0);
        return `${dateString} ${hours}:${minutes}:${seconds}:${millis}`;
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
