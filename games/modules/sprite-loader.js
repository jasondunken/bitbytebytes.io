import { ImageLoader } from "./graphics/image-loader.js";

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
                const sprite = new Image();
                sprite.width = spriteSize;
                sprite.height = spriteSize;

                const canvas = document.createElement("canvas");
                canvas.width = spriteSize;
                canvas.height = spriteSize;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(
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

                const imageData = ctx.getImageData(
                    0,
                    0,
                    spriteSize,
                    spriteSize
                );

                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3]) {
                        data[i] = color.r;
                        data[i + 1] = color.g;
                        data[i + 2] = color.b;
                        data[i + 3] = color.a;
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                sprite.src = canvas.toDataURL("image/png");
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
