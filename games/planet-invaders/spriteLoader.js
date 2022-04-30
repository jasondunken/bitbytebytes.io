class SpriteLoader {
    SPRITE_SIZE = 16;
    sprites = {};

    constructor() {
        const spriteSheetData = SpriteData.spriteSheetData;
        this.loadSpriteSheet(spriteSheetData.names, spriteSheetData.spriteSheetPath);
    }

    loadSpriteSheet(names, path) {
        loadImage(path, (spriteSheet) => {
            console.log("spriteSheet: ", spriteSheet);
            let spriteCount = spriteSheet.width / this.SPRITE_SIZE;
            // let spriteNumFrames = spriteSheet.height / this.SPRITE_SIZE;
            spriteSheet.loadPixels();
            for (let s = 0; s < spriteCount; s++) {
                const sprite = createImage(this.SPRITE_SIZE, this.SPRITE_SIZE);
                sprite.loadPixels();
                for (let i = 0; i < this.SPRITE_SIZE; i++) {
                    for (let j = 0; j < this.SPRITE_SIZE; j++) {
                        sprite.set(i, j, [
                            0,
                            255,
                            0,
                            spriteSheet.pixels[i * 4 + this.SPRITE_SIZE * s * 4 + j * 4 * spriteSheet.width + 3],
                        ]);
                    }
                }
                sprite.updatePixels();
                this.addSprite(names[s], sprite);
            }

            console.log("this.sprites: ", this.sprites);
            image(this.sprites["ship"], 0, 0, 400, 300);
        });
    }

    addSprite(name, sprite) {
        this.sprites[name] = sprite;
    }

    getSprite(type) {
        return this.sprites[type];
    }
}

class SpriteData {
    static spriteSheetData = {
        names: ["alien", "barrier", "ship", "bonus"],
        spriteSheetPath: "./planet-invaders/img/sprite_sheet_1.png",
    };
}
