class FontLoader {
    static LoadFont(path, font) {
        path = path + font;
        const name = font.split(".")[0];

        return new Promise(async (resolve, reject) => {
            const src = `url(${path})`;
            const font = new FontFace(name, src);

            const fontFace = await font.load();
            if (fontFace) {
                document.fonts.add(fontFace);
                resolve(name);
            } else {
                reject(`could not load ${font}`);
            }
        });
    }
}

export { FontLoader };
