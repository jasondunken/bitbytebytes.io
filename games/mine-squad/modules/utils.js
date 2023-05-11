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

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vec2((this.x += vector.x), (this.y += vector.y));
    }
}
// returns the array index for the tile mouse is over
function mousePositionToTileIndex(coords, tileSize, tilesPerRow, xOffset, yOffset) {
    const xIndex = Math.floor((coords.x - xOffset) / tileSize);
    const yIndex = Math.floor((coords.y - yOffset) / tileSize);
    return xIndex + yIndex * tilesPerRow;
}

// returns the screen position of the center of the tile at the given array index
function tileIndexToTileCenter(tileIndex, tileSize, tilesPerRow, xOffset, yOffset) {
    return new Vec2(
        (tileIndex % tilesPerRow) * tileSize + xOffset + tileSize / 2,
        Math.floor(tileIndex / tilesPerRow) * tileSize + yOffset + tileSize / 2
    );
}

// returns the center coords of tile under pointer
function mousePositionToTileCenter(coords, tileSize, tilesPerRow, xOffset, yOffset) {
    const tileIndex = this.mousePositionToTileIndex(coords, tileSize, tilesPerRow, xOffset, yOffset);
    return this.tileIndexToTileCenter(tileIndex, tileSize, tilesPerRow, xOffset, yOffset);
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
    Vec2,
    mousePositionToTileIndex,
    tileIndexToTileCenter,
    mousePositionToTileCenter,
    getElapsedTimeString,
};
