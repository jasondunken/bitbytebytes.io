export const KEY_CODES = {
    SPACE: 32,
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,
    // new school/stick 1
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    // old school/stick 2
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    CONTROL_LEFT: 17,
    CONTROL_RIGHT: 17,
    TAB: 9,
    ESC: 27,
    SHIFT_LEFT: 16,
    SHIFT_RIGHT: 16,
    contains: (keyCode) => {
        let contained = false;
        for (let key of Object.keys(KEY_CODES)) {
            if (KEY_CODES[key] === keyCode) {
                contained = true;
                break;
            }
        }
        return contained;
    },
};

export const KEY_NAMES = {
    SPACE: "Space",
    ARROW_LEFT: "ArrowLLeft",
    ARROW_UP: "ArrowUp",
    ARROW_RIGHT: "ArrowRight",
    ARROW_DOWN: "ArrowDown",
    W: "KeyW",
    A: "KeyA",
    S: "KeyS",
    D: "KeyD",
    I: "KeyI",
    J: "KeyJ",
    K: "KeyK",
    L: "KeyL",
    CONTROL_LEFT: "ControlLeft",
    CONTROL_RIGHT: "ControlRight",
    TAB: "Tab",
    ESC: "Escape",
    SHIFT_LEFT: "ShiftLeft",
    SHIFT_RIGHT: "ShiftRight",
    contains: (keyName) => {
        let contained = false;
        for (let key of Object.keys(KEY_NAMES)) {
            if (KEY_NAMES[key] === keyName) {
                contained = true;
                break;
            }
        }
        return contained;
    },
};
