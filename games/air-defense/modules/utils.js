function setColor(newColor) {
    stroke(newColor);
    fill(newColor);
}

function isBulletCollision(gameObj, bullet) {
    if (dist(gameObj.position.x, gameObj.position.y, bullet.position.x, bullet.position.y) <= 16 + bullet.DIAMETER) {
        return true;
    }
    return false;
}

function isBombCollision(gameObj, bomb) {
    if (dist(gameObj.position.x, gameObj.position.y, bomb.position.x, bomb.position.y) <= 8 + bomb.DIAMETER) {
        return true;
    }
    return false;
}

function isBlockCollision(bomb, block) {
    if (dist(bomb.position.x, bomb.position.y, block.center.x, block.center.y) <= bomb.DIAMETER / 2 + block.width / 2) {
        return true;
    }
    return false;
}

function isCrateCollision(paratrooper, crate) {
    if (
        dist(paratrooper.position.x, paratrooper.position.y, crate.center.x, crate.center.y) <=
        paratrooper.DIAMETER / 2 + crate.width / 2
    ) {
        return true;
    }
    return false;
}

function isParatrooperBlockCollision(paratrooper, block) {
    const xDist = Math.abs(paratrooper.position.x - block.position.x);
    const yDist = Math.abs(paratrooper.position.y - block.position.y);
    if (xDist < paratrooper.width / 2 && yDist < paratrooper.height / 2) {
        return true;
    }
    return false;
}

export {
    setColor,
    isBlockCollision,
    isBombCollision,
    isBulletCollision,
    isCrateCollision,
    isParatrooperBlockCollision,
};
