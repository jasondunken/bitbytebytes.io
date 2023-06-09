function pointOnLine(point, line) {
    const lineLen = dist(line[0][0], line[0][1], line[1][0], line[1][1]);
    const lineALen = dist(point[0], point[1], line[0][0], line[0][1]);
    const lineBLen = dist(point[0], point[1], line[1][0], line[1][1]);

    if (
        lineALen + lineBLen >= lineLen - 0.1 &&
        lineALen + lineBLen <= lineLen + 0.1
    ) {
        return true;
    }
    return false;
}

function dist(ax, ay, bx, by) {
    const a = ax - bx;
    const b = ay - by;
    return Math.sqrt(a * a + b * b);
}

export { pointOnLine, dist };
