class Background {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.drawingContext = this.canvas.getContext("2d");
    }
}

export { Background };
