class Item extends GameObject {
    type;
    value;
    image;

    values = {
        healthSML: 2,
        healthMED: 4,
        healthLRG: 10,
        ammo: 10,
        shield: 25,
    };

    constructor(initialPos, speed, size, itemImage, type) {
        super(initialPos, speed, size);
        this.itemImage = itemImage;
        this.type = type;
        this.value = this.values[type];
    }

    update() {
        this.pathPos.x += this.speed;
        this.setCorners();
    }

    draw() {
        image(this.itemImage, this.corners.a.x, this.corners.a.y, this.size, this.size);
    }
}
