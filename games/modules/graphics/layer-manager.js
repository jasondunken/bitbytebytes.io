export const LAYERS = Object.freeze({
    BACKGROUND: "BACKGROUND",
    SPRITES_0: "SPRITES_0",
    SPRITES_1: "SPRITES_1",
    SPRITES_2: "SPRITES_2",
    FOREGROUND: "FOREGROUND",
    UI: "UI",
    IsValidLayer: (layerId) => {
        return Object.values(LAYERS).includes(layerId);
    },
});

const RENDER_ORDER = [
    LAYERS.BACKGROUND,
    LAYERS.SPRITES_0,
    LAYERS.SPRITES_1,
    LAYERS.SPRITES_2,
    LAYERS.FOREGROUND,
    LAYERS.UI,
];

const DEFAULT_LAYER = LAYERS.SPRITES_0;

export class LayerManager {
    static layers = new Map();

    static AddObject(obj, layerId) {
        layerId = layerId || DEFAULT_LAYER;

        if (!LAYERS.IsValidLayer(layerId)) {
            console.log("invalid layerId :", layerId);
            return;
        }
        if (!LayerManager.layers.has(layerId)) {
            LayerManager.layers.set(layerId, new Set());
        }
        const layer = LayerManager.layers.get(layerId);
        layer.add(obj);

        // console.log("layerM: ", LayerManager.layers);
    }

    static Update(delta) {
        for (let gameObjs of LayerManager.layers.values()) {
            for (let obj of gameObjs.values()) {
                obj.update(delta);
                if (obj.done) {
                    gameObjs.delete(obj);
                }
            }
        }
    }

    static LayersComplete() {
        for (let layerId of RENDER_ORDER) {
            const layer = LayerManager.layers.get(layerId);
            if (layer && layer.size != 0) {
                return false;
            }
        }
        return true;
    }

    static Render() {
        for (let layerId of RENDER_ORDER) {
            const layer = LayerManager.layers.get(layerId);
            if (layer) {
                for (let obj of layer.values()) {
                    obj.render();
                }
            }
        }
    }
}
