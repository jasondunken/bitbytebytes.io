class SpriteLoader {
    SPRITE_SIZE = 16;
    sprites = {};

    constructor() {
        const spriteSheetData = SpriteData.spriteSheetData;
        this.loadSpriteSheet(spriteSheetData.names, spriteSheetData.spriteSheetPath);
    }

    loadSpriteSheet(names, path) {
        loadImage(path, (spriteSheet) => {
            image(spriteSheet, 0, 0);
            console.log("spriteSheet: ", spriteSheet);
            let spriteCount = spriteSheet.width / this.SPRITE_SIZE;
            console.log("spriteCount: ", spriteCount);
            // let spriteNumFrames = spriteSheet.height / this.SPRITE_SIZE;
            spriteSheet.loadPixels();
            for (let s = 0; s < spriteCount; s++) {
                let pixelBuffer = [];
                for (let i = 0; i < this.SPRITE_SIZE; i++) {
                    for (let j = 0; j < this.SPRITE_SIZE; j++) {
                        pixelBuffer[i + j * this.SPRITE_SIZE] = spriteSheet.pixels[i + j * spriteSheet.width];
                    }
                }
                this.createSprite(names[s], pixelBuffer);
            }

            console.log("this.sprites: ", this.sprites);
        });
    }

    createSprite(name, pixelBuffer) {
        const sprite = createImage(this.SPRITE_SIZE, this.SPRITE_SIZE);
        sprite.loadPixels();
        sprite.pixels = pixelBuffer;
        sprite.updatePixels();
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
