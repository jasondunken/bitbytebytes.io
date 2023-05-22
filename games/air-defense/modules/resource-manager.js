class Resources {
    static sprites;

    static load() {
        const sprites = [];
        sprites["paratrooper"] = loadImage("./air-defense/res/img/paratrooper.png");
        sprites["background"] = loadImage("./air-defense/res/img/background.png");
        sprites["foreground"] = loadImage("./air-defense/res/img/foreground.png");
        sprites["blue_1_1_L"] = loadImage("./air-defense/res/img/blue_1_1_L.png");
        sprites["blue_1_2_L"] = loadImage("./air-defense/res/img/blue_1_2_L.png");
        sprites["blue_1_1_R"] = loadImage("./air-defense/res/img/blue_1_1_R.png");
        sprites["blue_1_2_R"] = loadImage("./air-defense/res/img/blue_1_2_R.png");
        sprites["airborne_left"] = loadImage("./air-defense/res/img/airborne_left.png");
        sprites["airborne_right"] = loadImage("./air-defense/res/img/airborne_right.png");
        sprites["ammo-crate-500"] = loadImage("./air-defense/res/img/ammo_crate_500.png");
        Resources.sprites = sprites;

        const turretBlocks = [];
        turretBlocks["red-block"] = loadImage("./air-defense/res/img/redblock.png");
        turretBlocks["green-block"] = loadImage("./air-defense/res/img/greenblock.png");
        turretBlocks["generator"] = loadImage("./air-defense/res/img/generator.png");

        let font = loadFont("./air-defense/res/font/PressStart2P.ttf");
        return { sprites, turretBlocks, font };
    }

    static getSprite(id) {
        if (Object.keys(Resources.sprites).includes(id)) {
            return Resources.sprites[id];
        }
    }
}

export { Resources };
