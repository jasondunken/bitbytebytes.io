class SpriteLoader {
    static loadSprites(spriteSheetData) {
        return new Promise((resolve, reject) => {
            const SPRITE_SIZE = 16;
            let sprites = {};
            const names = spriteSheetData.names;
            const path = spriteSheetData.spriteSheetPath;
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
                                sprite.set(i, j, [
                                    0,
                                    255,
                                    0,
                                    spriteSheet.pixels[i * 4 + SPRITE_SIZE * s * 4 + j * 4 * spriteSheet.width + 3],
                                ]);
                            }
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
