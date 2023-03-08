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

class Vec3 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
