class Item extends GameObject {
    value;
    image;
    id;

    values = {
        healthSML: 10,
        healthMED: 25,
        healthLRG: 50,
        ammo: 10,
        shield: 25,
    };

    constructor(initialPos, speed, size, itemImage, id) {
        super("item", initialPos, speed, size);
        this.itemImage = itemImage;
        this.id = id;
        this.value = this.values[id];
    }

    update() {
        this.pathPos.x += this.speed;
        this.setCorners();
    }

    draw() {
        image(this.itemImage, this.corners.a.x, this.corners.a.y, this.size, this.size);
    }
}
