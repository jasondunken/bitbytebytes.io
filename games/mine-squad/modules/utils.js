import { Vec } from "../../modules/math/vec.js";

function setColor(newColor) {
    fill(newColor);
    stroke(newColor);
}

function valueToColor(value) {
    switch (value) {
        case 0:
        case 1:
            return "black";
        case 2:
            return "blue";
        case 3:
            return "purple";
        case 4:
            return "orange";
        case 5:
            return "red";
        case 6:
            return "yellow";
        case 7:
            return "magenta";
        case 8:
            return "teal";
    }
}

// returns the array index of tile containing coords
function screenPositionToTileIndex(coords, tileWidth, config) {
    const xIndex = Math.floor((coords.x - config.pos.x) / tileWidth);
    const yIndex = Math.floor((coords.y - config.pos.y) / tileWidth);
    return xIndex + yIndex * (config.width / tileWidth);
}

// returns the screen position of the center of the tile at the given array index
function tileIndexToTileCenter(tileIndex, tileWidth, config) {
    return new Vec(
        (tileIndex % (config.width / tileWidth)) * tileWidth +
            config.pos.x +
            tileWidth / 2,
        Math.floor(tileIndex / (config.width / tileWidth)) * tileWidth +
            config.pos.y +
            tileWidth / 2
    );
}

// returns the screen position of the top-left of the tile at the given array index
function tileIndexToTileTopLeft(tileIndex, tileWidth, config) {
    return new Vec(
        (tileIndex % (config.width / tileWidth)) * tileWidth + config.pos.x,
        Math.floor(tileIndex / (config.width / tileWidth)) * tileWidth +
            config.pos.y
    );
}

// returns the screen position of the center of the tile containing coords
function screenPositionToTileCenter(coords, tileWidth, config) {
    const tileIndex = this.screenPositionToTileIndex(coords, tileWidth, config);
    return this.tileIndexToTileCenter(tileIndex, tileWidth, config);
}

// returns the screen position of the top-left of the tile containing coords
function screenPositionToTileTopLeft(coords, tileWidth, config) {
    const tileIndex = this.screenPositionToTileIndex(coords, tileWidth, config);
    return this.tileIndexToTileTopLeft(tileIndex, tileWidth, config);
}

function getElapsedTimeString(gameTime) {
    const elapsedSeconds = (gameTime % 60000) / 1000;
    let secondsStr = ("" + elapsedSeconds).split(".")[0];
    if (elapsedSeconds < 10) secondsStr = "0" + secondsStr;
    const minutes = (gameTime - (gameTime % 60000)) / 60000;
    return minutes + ":" + secondsStr;
}

export {
    setColor,
    valueToColor,
    screenPositionToTileIndex,
    tileIndexToTileCenter,
    tileIndexToTileTopLeft,
    screenPositionToTileCenter,
    screenPositionToTileTopLeft,
    getElapsedTimeString,
};
