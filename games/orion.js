function setup() {
    frameRate(15);
    let canvas = createCanvas(600, 400);
    canvas.parent('game');
}

function draw() {
    loadPixels();
    for (let i = 0; i < (600 * 400 * 4); i += 4) {
        let flip = Math.random() < 0.5 ? 0 : 255;
        pixels[i] = pixels[i + 1] = pixels[i + 2] = flip;
        pixels[i + 3] = 255;
    }
    updatePixels();
}