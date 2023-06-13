class Sprite {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.drawingContext = this.canvas.getContext("2d");
        this.pixels = [];
    }

    loadPixels() {
        this.imageData = this.drawingContext.getImageData(
            0,
            0,
            this.width,
            this.height
        );
        this.pixels = this.imageData.pixels;
    }

    updatePixels() {
        this.drawingContext.putImageData(this.imageData, 0, 0);
    }
}

export { Sprite };
