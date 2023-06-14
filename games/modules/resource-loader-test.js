import { ResourceLoader } from "./resource-loader.js";
import { Text2D } from "./text/text.js";
import { config } from "./resources.cfg.js";

async function testLoadResources() {
    const resources = await ResourceLoader.LoadResources("./res/", config);
    testCanvas.width = 512;
    testCanvas.height = 400;
    const canvasCtx = testCanvas.getContext("2d");
    canvasCtx.imageSmoothingEnabled = false;
    canvasCtx.textRendering = "geometricPrecision";

    console.log("resources: ", resources);

    canvasCtx.drawImage(
        resources.backgrounds[2],
        0,
        0,
        testCanvas.width,
        testCanvas.height
    );
    const SCALE = 2;
    const sprites = resources.sprites;
    const spriteNames = Object.keys(sprites);
    for (let i = 0; i < spriteNames.length; i++) {
        const sprite = sprites[spriteNames[i]];
        canvasCtx.drawImage(
            sprite.canvas,
            i * sprite.width * SCALE,
            0,
            sprite.width * SCALE,
            sprite.height * SCALE
        );
    }

    const str = "WeeGame";

    // Examples...
    // canvasCtx.strokeStyle = "blue";
    // canvasCtx.fillRect(25, 25, 100, 100);
    // canvasCtx.clearRect(45, 45, 60, 60);
    // canvasCtx.strokeRect(50, 50, 50, 50);

    // const circle = new Path2D();
    // circle.arc(100, 35, 25, 0, 2 * Math.PI);

    // canvasCtx.fill(circle);

    // canvasCtx.beginPath();
    // canvasCtx.moveTo(75, 50);
    // canvasCtx.lineTo(100, 75);
    // canvasCtx.lineTo(100, 25);
    // canvasCtx.fill();
    // canvasCtx.beginPath();
    // canvasCtx.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
    // canvasCtx.moveTo(110, 75);
    // canvasCtx.arc(75, 75, 35, 0, Math.PI, false); // Mouth (clockwise)
    // canvasCtx.moveTo(65, 65);
    // canvasCtx.arc(60, 65, 5, 0, Math.PI * 2, true); // Left eye
    // canvasCtx.moveTo(95, 65);
    // canvasCtx.arc(90, 65, 5, 0, Math.PI * 2, true); // Right eye
    // canvasCtx.stroke();
}

testLoadResources();
