class SoundLoader {
    static MIN_VOLUME = 0.0;
    static MAX_VOLUME = 1.0;

    static audio = {};
    static volume = 1.0;

    static setVolume(volume) {
        if (volume <= SoundLoader.MAX_VOLUME && volume >= SoundLoader.MIN_VOLUME) {
            SoundLoader.volume = volume;
        }
    }

    static load(tag, src) {
        const audio = new Audio();
        audio.src = src;
        SoundLoader.audio[tag] = audio;
    }

    static play(tag) {
        if (SoundLoader.audio[tag]) {
            SoundLoader.audio[tag].volume = volume;
            SoundLoader.audio[tag].play();
        } else {
            console.error(`no sound with tag ${tag}`);
        }
    }
}

export { SoundLoader };
