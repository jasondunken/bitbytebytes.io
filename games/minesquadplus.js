// minesquadplus a minswseper clone with more
// 2019 BitByteBytes
// minesweeper's advanced option is a 16 x 30 grid with 99 mines
const boardHeight = 16;
const boardWidth = 30;
const footerHeight = 100;
const minesLeftBox = Math.floor(footerHeight / 2);
const squareHeight = 30;
const halfSquare = Math.floor(squareHeight / 2);
const bombHeight = squareHeight * 0.7;
const numSquares = boardHeight * boardWidth;
const numMines = 99;
const numSquads = 3;
const squadCost = 1000;

let playing = true;
let board = [];
let score = 0;
let time = 0;
let squadsLeft = numSquads;
let minesUncovered = 0;

function preload() {
}

function setup() {
    const canvas = createCanvas(boardWidth * squareHeight, boardHeight * squareHeight + footerHeight);
    canvas.parent('p5-container');
    initGame();
}

function draw() {
    textSize(squareHeight);
    textAlign(CENTER, CENTER);
    for (let i = 0; i < numSquares; i++) {
        const x = (i % boardWidth) * squareHeight;
        const y = Math.floor(i / boardWidth) * squareHeight;
        const tile = board[i];

        if (playing) {
            stroke('black');
            fill('green');
            rect(x, y, squareHeight, squareHeight);
            if (tile.flagged) {
                stroke('black');
                strokeWeight(1);
                fill('yellow');
                ellipse(x + halfSquare, y + halfSquare, bombHeight, bombHeight)
            }
        }

        if (board[i].hidden === false) {
            stroke('black');
            strokeWeight(1);
            fill('gray');
            rect(x, y, squareHeight, squareHeight);
            if (tile.type === 'empty' && tile.value !== 0) {
                stroke('black');
                fill('black');
                if (tile.value === 1) {
                    setColor('blue');
                } else if (tile.value === 2) {
                    setColor('green');
                } else if (tile.value === 3) {
                    setColor('purple');
                } else if (tile.value === 4) {
                    setColor('orange');
                } else if (tile.value === 5) {
                    setColor('red');
                } else if (tile.value === 6) {
                    setColor('yellow');
                } else if (tile.value === 7) {
                    setColor('magenta');
                } else {
                    setColor('teal');
                }
                text(tile.value, x + halfSquare, y + (squareHeight * 0.6));
            }

            if (tile.type === 'mine') {
                if (board[i].subtype === 'baby') {
                    fill('blue');
                } else {
                    fill('red');
                }
                ellipse(x + halfSquare, y + halfSquare, bombHeight, bombHeight)
            }
            if (!playing) {
                if (tile.flagged === true) {
                    if (tile.type === 'mine') {
                        stroke('green');
                    } else {
                        stroke('red');
                    }
                strokeWeight(5);
                line(x, y, x + squareHeight, y + squareHeight);
                line(x + squareHeight, y, x, y + squareHeight);
                }
            }
        }
    }

    // draws box around selected tile
    stroke('red');
    strokeWeight(1);
    noFill();
    rect(Math.floor(mouseX / squareHeight) * squareHeight+ 1, Math.floor(mouseY / squareHeight) * squareHeight+ 1, squareHeight - 2, squareHeight - 2);
    
    // draws dashboard
    stroke('black');
    fill('black');
    rect(0, boardHeight * squareHeight, boardWidth * squareHeight, footerHeight);
    
    // draws mines left counter
    fill('gray');
    let minesLeftBoxX = boardWidth * squareHeight - (minesLeftBox + minesLeftBox / 2);
    let minesLeftBoxY = boardHeight * squareHeight + minesLeftBox / 2;
    rect(minesLeftBoxX, minesLeftBoxY, minesLeftBox, minesLeftBox);
    fill('red');
    text('' + (numMines - getNumFlags() - minesUncovered), minesLeftBoxX + minesLeftBox / 2, minesLeftBoxY + minesLeftBox / 2);
    
    // draws bomb squads left
    fill('magenta');
    for (let i = 0; i < squadsLeft; i++) {
        if (i === squadsLeft - 1 && score > squadCost) {
            fill('green');
        }
        ellipse((squareHeight / 2) + (squareHeight * 2) + (i * (squareHeight * 2)), (boardHeight * squareHeight) + minesLeftBox - (squareHeight / 2), bombHeight, bombHeight);
    }
    
    // draws score
    fill('white');
    text('' + score, (squareHeight / 2 + (squareHeight * 2)), (boardHeight * squareHeight) + minesLeftBox - (squareHeight / 2) + squareHeight);
}

function setColor(newColor) {
    fill(newColor);
    stroke(newColor);
}

function getNumFlags() {
    let result = 0;
    for (let i = 0; i < board.length; i++) {
        if (board[i].flagged) {
            result++;
        } 
    }
    return result;
}

function initGame() {
    for (let i = 0; i < numSquares; i++) {
        board[i] = new tile('empty');
    }
    availableSquares = board.slice();
    playing = true;
    score = 0;
    time = 0;
    squadsLeft = numSquads;
    minesUncovered = 0;
    placeMines();
    calculateValues();
}

function placeMines() {
    let placedMines = [];
    while (placedMines.length <= numMines - 1) {
        const square =  Math.floor(Math.random() * numSquares);
        if (!placedMines.includes(square)) {
            board[square].type = 'mine';
            if (Math.random() * 100 < 10) {
                board[square].subtype = 'baby';
            }
            placedMines.push(square);
        }
    }
}

function calculateValues() {
    for (let i = 0; i < board.length; i++) {
        if (board[i].type !== 'mine') {
            board[i].value = countNeighbors(i);
        }
    }
}

function countNeighbors(tile) {
    let value = 0;
    let neighbors = getNeighbors(tile);
    for (let i = 0; i < neighbors.length; i++) {
        if (board[neighbors[i]].type === 'mine') {
            value++;
        }
    }
    return value;
}

function unhide(tile, checked) {
    if (board[tile].flagged === false) {
        board[tile].hidden = false;
    }
    // if tile.value is zero, uncover all the tiles around it
    // if one of the ones uncovered is a zero uncover all the ones around it and so on
    // checked is a blank list to track zeros already checked
    if (board[tile].value === 0 && !checked.includes(tile)) {
        checked.push(tile);
        // a list of the valid neighbors
        let neighbors = getNeighbors(tile);
        for (const n in neighbors) {
            unhide(neighbors[n], checked);
        }
    }
}

function getNeighbors(tile) {
    let neighbors = [];
    let topLeft = tile - boardWidth - 1;
    let topCenter = tile - boardWidth;
    let topRight = tile - boardWidth + 1;
    let midLeft = tile - 1;
    let midRight = tile + 1;
    let btmLeft = tile + boardWidth - 1;
    let btmCenter = tile + boardWidth;
    let btmRight = tile + boardWidth + 1;

    if (getNeighbor(tile, topLeft)) {neighbors.push(topLeft);};
    if (getNeighbor(tile, topCenter)) {neighbors.push(topCenter);};
    if (getNeighbor(tile, topRight)) {neighbors.push(topRight);};
    if (getNeighbor(tile, midLeft)) {neighbors.push(midLeft);};
    if (getNeighbor(tile, midRight)) {neighbors.push(midRight);};
    if (getNeighbor(tile, btmLeft)) {neighbors.push(btmLeft);};
    if (getNeighbor(tile, btmCenter)) {neighbors.push(btmCenter);};
    if (getNeighbor(tile, btmRight)) {neighbors.push(btmRight);};
    return neighbors;
}

function getNeighbor(square, neighbor) {
    const squareValue = Math.floor(square % boardWidth);
    const neighborValue = Math.floor(neighbor % boardWidth);
    const score = Math.abs(squareValue - neighborValue);
    if (neighbor < 0 || neighbor > board.length - 1) {
        return false;
    } else {
        if (score > 1) {
            return false;
        } else return true;
    }
    return false;
}

function blastRadius(tileIndex) {
    let damage = getNeighbors(tileIndex);
    damage.push(tileIndex + 2);
    damage.push(tileIndex - 2);
    damage.push(tileIndex + (boardWidth * 2));
    damage.push(tileIndex - (boardWidth * 2));
    for (let i = 0; i < damage.length; i++) {
        board[damage[i]].hidden = false;
        if (board[i].type === 'mine') {
            minesUncovered++;
        }
    }
    board[tileIndex].hidden = false;
    if (board[tileIndex].type === 'mine') {
        minesUncovered++;
    }
}

function bombSquad(tileIndex) {
    if (board[tileIndex].type !== 'mine') {       
        squadsLeft = squadsLeft - 1;
        blastRadius(tileIndex);
        score -= squadCost;      
    } else {
        gameOver();
    }
}

function mousePressed(event) {
    const x = Math.floor(mouseX / squareHeight);
    const y = Math.floor(mouseY / squareHeight);
    const tileIndex = y * boardWidth + x;
    const tile = board[tileIndex];
    if (playing && tile) {
        if (keyIsDown(CONTROL)) {
            if (tile.hidden) {
                tile.flagged = true;
            }
        } else {
            if (tile.flagged) {
                tile.flagged = false;
            } else {
                if (keyIsDown(SHIFT)) {
                    if (squadsLeft > 0 && score > squadCost) {
                        bombSquad(tileIndex);
                    }
                } else if (tile.type === 'mine') {
                    if (tile.subtype === 'baby') {
                        blastRadius(tileIndex);
                    } else {
                    gameOver();
                    }
                } else {
                    if (tile.hidden === true) {
                        score += (tile.value > 0) ? (tile.value * 10) : 5;
                        unhide(tileIndex, []);
                    }
                }
            } 
        }
    }
}

function gameOver() {
    for (let i = 0; i < board.length; i++) {
        if (board[i].hidden === false) {
            score += 100;
        }
        board[i].hidden = false;
    }
    playing = false;
}

class tile {
    constructor(tileType) {
        this.type = tileType;
        this.subtype = 'std';
        this.hidden = true;
        this.value = 0;
        this.flagged = false;
    }
}