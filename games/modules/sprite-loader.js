import { ImageLoader } from "./graphics/image-loader.js";
import { Sprite } from "../modules/graphics/sprite.js";

class SpriteLoader {
    static LoadSprites(path, spriteData) {
        const names = spriteData.names;

        let color = { r: 0, g: 0, b: 0, a: 0 };
        if (spriteData.color != "") {
            const rgba = spriteData.color;
            const r = (rgba >> 24) & 255;
            const g = (rgba >> 16) & 255;
            const b = (rgba >> 8) & 255;
            const a = rgba & 255;
            color = { r, g, b, a };
        }

        return new Promise(async (resolve, reject) => {
            let sprites = {};
            const spriteSheet = await ImageLoader.LoadImage(
                path,
                spriteData.spriteSheet
            );
            const spriteSize = spriteSheet.height;
            let spriteCount = spriteSheet.width / spriteSize;

            for (let s = 0; s < spriteCount; s++) {
                const sprite = new Sprite(spriteSize, spriteSize);
                sprite.drawingContext.drawImage(
                    spriteSheet,
                    s * spriteSize,
                    0,
                    spriteSize,
                    spriteSize,
                    0,
                    0,
                    spriteSize,
                    spriteSize
                );

                sprite.loadPixels();

                const pixels = sprite.pixels;
                for (let i = 0; i < pixels.length; i += 4) {
                    if (pixels[i + 3]) {
                        pixels[i] = color.r;
                        pixels[i + 1] = color.g;
                        pixels[i + 2] = color.b;
                        pixels[i + 3] = color.a;
                    }
                }
                sprite.updatePixels();
                sprites[names[s]] = sprite;
            }
            resolve(sprites);
        });
    }

    static LoadSpriteAtlas(path, spriteData) {
        // example arguments
        path = "~/path-to-spritesheet-folder/";
        spriteData = {
            atlas: {
                sprite1: {
                    location: new Vec(0, 0),
                    cellWidth: 16,
                    cellHeight: 16,
                    cells: 8,
                },
                sprite2: {
                    location: new Vec(0, 16),
                    cellWidth: 16,
                    cellHeight: 16,
                    cells: 8,
                },
            },
            spriteSheet: "sprite-sheet.png",
        };
    }
}

export { SpriteLoader };
