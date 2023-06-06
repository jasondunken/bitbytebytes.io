class BackgroundLoader {
    static LoadBackgrounds(backgroundURLs) {
        const backgrounds = [];
        for (let url of backgroundURLs) {
            backgrounds.push(loadImage(url));
        }
        return backgrounds;
    }

    static LoadBackgroundsAsync(backgroundURLs) {
        return new Promise((resolve, reject) => {
            const backgrounds = [];
            for (let url of backgroundURLs) {
                loadImage(
                    url,
                    (img) => {
                        backgrounds.push(img);
                    },
                    (failed) => {
                        reject(failed);
                    }
                );
                backgrounds.push(loadImage(url));
            }
            resolve(backgrounds);
        });
    }
}

export { BackgroundLoader };
