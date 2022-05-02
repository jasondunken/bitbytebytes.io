class Barrier {
    constructor(size, position, sprite) {
        this.size = size;
        this.pos = position;
        this.sprite = sprite;
    }

    update() {}

    render() {
        image(this.sprite, this.pos.x - this.size, this.pos.y - this.size, this.size * 2, this.size * 2);
    }
}
