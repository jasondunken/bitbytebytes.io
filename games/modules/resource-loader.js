import { ImageLoader } from "./graphics/image-loader.js";
import { SpriteLoader } from "./sprite-loader.js";
import { FontLoader } from "./font-loader.js";
import { SoundLoader } from "./sound-loader.js";

class ResourceLoader {
    static async LoadResources(basePath, config) {
        const backgrounds = await this.LoadBackgrounds(
            basePath + config.backgroundsPath,
            config.backgrounds
        );
        const sprites = await this.LoadSprites(
            basePath + config.spritesPath,
            config.sprites
        );
        const fonts = await this.LoadFonts(
            basePath + config.fontsPath,
            config.fonts
        );
        return { backgrounds, sprites, fonts };
    }

    static LoadBackgrounds(path, backgrounds) {
        const promises = [];
        for (let background of backgrounds) {
            promises.push(ImageLoader.LoadImage(path, background));
        }
        return Promise.all(promises.map((p) => p.catch((e) => e)));
    }

    static LoadSprites(path, sprites) {
        return SpriteLoader.LoadSprites(path, sprites);
    }

    static LoadFonts(path, fonts) {
        const promises = [];
        for (let font of fonts) {
            promises.push(FontLoader.LoadFont(path, font));
        }
        return Promise.all(promises.map((p) => p.catch((e) => e)));
    }

    static LoadSounds(path, config) {
        return new Promise((resolve, reject) => {
            resolve({ path, ...config });
        });
    }
}

export { ResourceLoader };
