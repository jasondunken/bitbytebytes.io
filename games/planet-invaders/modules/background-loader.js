class BackgroundLoader {
    static loadBackgrounds(backgroundURLs) {
        const backgrounds = [];
        for (let url of backgroundURLs) {
            backgrounds.push(loadImage(url));
        }
        return backgrounds;
    }
}

export { BackgroundLoader };
