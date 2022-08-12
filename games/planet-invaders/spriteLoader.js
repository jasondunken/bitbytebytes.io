class SpriteLoader {
    static loadSprites(spriteSheetData) {
        return new Promise((resolve, reject) => {
            const SPRITE_SIZE = 16;
            let sprites = {};
            const names = spriteSheetData.names;
            const path = spriteSheetData.spriteSheetPath;
            let color = { r: 0, g: 0, b: 0, a: 0 };
            if (spriteSheetData.color != "") {
                const rgba = spriteSheetData.color;
                const r = (rgba >> 24) & 255;
                const g = (rgba >> 16) & 255;
                const b = (rgba >> 8) & 255;
                const a = rgba & 255;
                color = { r, g, b, a };
            }
            loadImage(
                path,
                (spriteSheet) => {
                    let spriteCount = spriteSheet.width / SPRITE_SIZE;
                    // let spriteNumFrames = spriteSheet.height / this.SPRITE_SIZE;
                    spriteSheet.loadPixels();
                    for (let s = 0; s < spriteCount; s++) {
                        const sprite = createImage(SPRITE_SIZE, SPRITE_SIZE);
                        sprite.loadPixels();
                        for (let i = 0; i < SPRITE_SIZE; i++) {
                            for (let j = 0; j < SPRITE_SIZE; j++) {
                                if (
                                    spriteSheet.pixels[i * 4 + SPRITE_SIZE * s * 4 + j * 4 * spriteSheet.width + 3] > 0
                                ) {
                                    sprite.set(i, j, [color.r, color.g, color.b, color.a]);
                                }
                            }
                        }
                        if (names[s] == "bonus") {
                            const sprite_reversed = createImage(SPRITE_SIZE, SPRITE_SIZE);
                            sprite_reversed.loadPixels();
                            for (let i = 0; i < SPRITE_SIZE; i++) {
                                for (let j = 0; j < SPRITE_SIZE; j++) {
                                    sprite_reversed.set(SPRITE_SIZE - i, SPRITE_SIZE - j, sprite.get(i, j));
                                }
                            }
                            sprite_reversed.updatePixels();
                            sprites[names[s] + "_reversed"] = sprite_reversed;
                        }
                        sprite.updatePixels();

                        sprites[names[s]] = sprite;
                    }
                    resolve(sprites);
                },
                (failed) => {
                    reject(failed);
                }
            );
        });
    }
}
