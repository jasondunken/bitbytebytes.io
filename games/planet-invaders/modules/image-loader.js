class ImageLoader {
    static LoadImage(path, file) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = path + file;
            image.onload = () => {
                resolve(image);
            };
            image.onerror = () => {
                reject(`failed to load ${file}`);
            };
        });
    }
}

export { ImageLoader };
