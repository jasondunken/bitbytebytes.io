import { Vec2d } from "./math.js";

function setColor(newColor) {
    fill(newColor);
    stroke(newColor);
}

function valueToColor(value) {
    if (value === 0 || value === 1) {
        return "black";
    } else if (value === 2) {
        return "blue";
    } else if (value === 3) {
        return "purple";
    } else if (value === 4) {
        return "orange";
    } else if (value === 5) {
        return "red";
    } else if (value === 6) {
        return "yellow";
    } else if (value === 7) {
        return "magenta";
    } else if (value === 8) {
        return "teal";
    }
}

// returns the array index of tile under coords
function screenPositionToTileIndex(coords, config) {
    const xIndex = Math.floor((coords.x - config.xOffset) / config.tileSize);
    const yIndex = Math.floor((coords.y - config.yOffset) / config.tileSize);
    return xIndex + yIndex * config.tilesPerRow;
}

// returns the screen position of the center of the tile at the given array index
function tileIndexToTileCenter(tileIndex, config) {
    return new Vec2d(
        (tileIndex % config.tilesPerRow) * config.tileSize + config.xOffset + config.tileSize / 2,
        Math.floor(tileIndex / config.tilesPerRow) * config.tileSize + config.yOffset + config.tileSize / 2
    );
}

// returns the screen position of the top-left of the tile at the given array index
function tileIndexToTileTopLeft(tileIndex, config) {
    return new Vec2d(
        (tileIndex % config.tilesPerRow) * config.tileSize + config.xOffset,
        Math.floor(tileIndex / config.tilesPerRow) * config.tileSize + config.yOffset
    );
}

// returns the screen position of the center of the tile under coords
function screenPositionToTileCenter(coords, config) {
    const tileIndex = this.screenPositionToTileIndex(coords, config);
    return this.tileIndexToTileCenter(tileIndex, config);
}

// returns the screen position of the top-left of the tile under coords
function screenPositionToTileTopLeft(coords, config) {
    const tileIndex = this.screenPositionToTileIndex(coords, config);
    return this.tileIndexToTileTopLeft(tileIndex, config);
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
