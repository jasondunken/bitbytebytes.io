import { Vec } from "../../modules/math/vec.js";
import { Block, Door } from "./blocks.js";
import { Chest, Item, Coin, Key } from "./item.js";
import { Enemy } from "./enemies.js";

class Level {
    constructor(
        background,
        blocks,
        foreground,
        items,
        enemies,
        spawn,
        skyColor
    ) {
        this.backgroundLayer = background;
        this.foregroundLayer = foreground;
        this.blocks = blocks;
        this.blockSize = blocks[0][0].width;
        this.items = items;
        this.enemies = enemies;
        this.playerSpawn = spawn;
        this.skyColor = skyColor;
    }

    update() {}

    renderBlocks() {}

    renderLayer(layer) {
        for (let i = 0; i < layer.length; i++) {
            for (let j = 0; j < layer[i].length; j++) {
                if (layer[i][j] !== "none") {
                    image(
                        layer[i][j],
                        i * this.blockSize,
                        j * this.blockSize,
                        this.blockSize,
                        this.blockSize
                    );
                }
            }
        }
    }

    renderBackground() {
        this.renderLayer(this.backgroundLayer);
    }

    renderForeground() {
        this.renderLayer(this.foregroundLayer);
    }
}

class LevelArchitect {
    static BLOCK_TYPES = ["dirt", "clay", "sand", "stone"];
    static BLOCK_SIZE = 32;
    static GRAVITY = 3;

    static createLevel(
        screenWidth,
        screenHeight,
        levelConfig,
        blockSprites,
        enemySprites
    ) {
        const blocksPerColumn = screenHeight / LevelArchitect.BLOCK_SIZE;
        const blocksPerRow = screenWidth / LevelArchitect.BLOCK_SIZE;

        const backgroundLayer = [];
        const blocks = [];
        const foregroundLayer = [];
        const enemies = new Set();
        const items = new Set();

        const surfaceHeight = levelConfig.surfaceHeight;

        for (let i = 0; i < blocksPerRow; i++) {
            blocks[i] = [];
            backgroundLayer[i] = [];
            foregroundLayer[i] = [];
            for (let j = 0; j < blocksPerColumn; j++) {
                let blockPosition = new Vec(
                    i * LevelArchitect.BLOCK_SIZE,
                    j * LevelArchitect.BLOCK_SIZE
                );
                if (j < surfaceHeight / LevelArchitect.BLOCK_SIZE) {
                    blocks[i][j] = new Block(
                        blockPosition,
                        LevelArchitect.BLOCK_SIZE,
                        LevelArchitect.BLOCK_SIZE,
                        levelConfig.AIR_BLOCK
                    );
                    backgroundLayer[i][j] = "none";
                    foregroundLayer[i][j] = "none";
                } else if (j === surfaceHeight / LevelArchitect.BLOCK_SIZE) {
                    blocks[i][j] = new Block(
                        blockPosition,
                        LevelArchitect.BLOCK_SIZE,
                        LevelArchitect.BLOCK_SIZE,
                        levelConfig.SURFACE_BLOCK,
                        blockSprites["grass_3"]
                    );
                    backgroundLayer[i][j] = blockSprites["dirt_3_0"];
                    foregroundLayer[i][j] = blockSprites["grass_3"];
                } else if (j === blocksPerColumn - 1) {
                    blocks[i][j] = new Block(
                        blockPosition,
                        LevelArchitect.BLOCK_SIZE,
                        LevelArchitect.BLOCK_SIZE,
                        levelConfig.BEDROCK_BLOCK,
                        blockSprites["bedrock"]
                    );
                    backgroundLayer[i][j] = blockSprites["dirt_3_0"];
                    foregroundLayer[i][j] = blockSprites["dirt_3_0"];
                } else {
                    let blockIndex = 0;
                    let blockChance = Math.random();
                    if (blockChance > 0.9) {
                        blockIndex = LevelArchitect.BLOCK_TYPES.length - 1;
                    } else {
                        blockIndex = Math.floor(
                            Math.random() *
                                (LevelArchitect.BLOCK_TYPES.length - 1)
                        );
                    }
                    const blockType = LevelArchitect.BLOCK_TYPES[blockIndex];
                    blocks[i][j] = new Block(
                        blockPosition,
                        LevelArchitect.BLOCK_SIZE,
                        LevelArchitect.BLOCK_SIZE,
                        blockType,
                        blockSprites[blockType]
                    );
                    backgroundLayer[i][j] = blockSprites["dirt_3_0"];
                    foregroundLayer[i][j] = blockSprites["dirt_3_0"];
                }
            }
        }
        for (let rndDirt = 0; rndDirt < 32; rndDirt++) {
            let i = Math.floor(Math.random() * blocks.length);
            let j =
                Math.floor(
                    Math.random() *
                        (blocks[0].length -
                            (surfaceHeight / LevelArchitect.BLOCK_SIZE + 1))
                ) +
                surfaceHeight / LevelArchitect.BLOCK_SIZE +
                1;
            backgroundLayer[i][j] =
                Math.random() < 0.5
                    ? blockSprites["dirt_3_1"]
                    : blockSprites["dirt_3_2"];
        }
        for (let rndDirt = 0; rndDirt < 16; rndDirt++) {
            let i = Math.floor(Math.random() * blocks.length);
            let j =
                Math.floor(
                    Math.random() *
                        (blocks[0].length -
                            (surfaceHeight / LevelArchitect.BLOCK_SIZE + 1))
                ) +
                surfaceHeight / LevelArchitect.BLOCK_SIZE +
                1;
            1;
            foregroundLayer[i][j] =
                Math.random() < 0.5
                    ? blockSprites["dirt_3_1"]
                    : blockSprites["dirt_3_2"];
        }
        LevelArchitect.addStuff(
            levelConfig,
            blocks,
            blocksPerRow,
            blocksPerColumn,
            blockSprites,
            enemies,
            enemySprites,
            items
        );

        return new Level(
            backgroundLayer,
            blocks,
            foregroundLayer,
            items,
            enemies,
            levelConfig.playerSpawn,
            levelConfig.SKY_COLOR
        );
    }

    static addStuff(
        levelConfig,
        blocks,
        blocksPerRow,
        blocksPerColumn,
        blockSprites,
        enemies,
        enemySprites,
        items
    ) {
        let firstPlatform = 10;
        let platformSpacing = 4;
        let PLATFORM_MAX_WIDTH = 9;
        let PLATFORM_MIN_WIDTH = 4;

        let itemTypes = shuffle([...levelConfig.ITEM_TYPES]);

        for (let i = 0; i < levelConfig.numEnemies; i++) {
            let platformWidth =
                Math.floor(
                    Math.random() * (PLATFORM_MAX_WIDTH - PLATFORM_MIN_WIDTH) +
                        1
                ) +
                PLATFORM_MIN_WIDTH -
                1;

            let xIndex = Math.floor(Math.random() * blocksPerRow);
            if (xIndex + platformWidth > blocksPerRow - 1) {
                xIndex = xIndex - platformWidth;
            }
            let chestIndex = Math.floor(Math.random() * platformWidth);
            let enemyIndex = Math.floor(Math.random() * platformWidth);

            // test chest
            const chestPosition = new Vec(256, 178);
            const item = itemTypes[i % itemTypes.length];
            let contents = [];
            const numCoins = Math.ceil(Math.random() * 20);
            for (let c = 0; c < numCoins; c++) {
                contents.push(
                    new Coin(chestPosition, blockSprites["coin-gold"])
                );
            }
            if (item === "key") {
                contents.push(
                    new Key(chestPosition, blockSprites["white-key"])
                );
            }
            items.add(
                new Chest(chestPosition, blockSprites["chest"], contents)
            );

            for (let j = 0; j < platformWidth; j++) {
                let blockAbove =
                    blocks[xIndex + j][firstPlatform + i * platformSpacing - 1];
                blockAbove.solid = false;
                blockAbove.sprite = null;
                blockAbove.blockType = "none";

                if (j === enemyIndex) {
                    enemies.add(
                        new Enemy(blockAbove.position.copy(), enemySprites)
                    );
                }
                if (j === chestIndex) {
                    const chestPosition = new Vec(
                        blockAbove.position.x + Chest.SIZE / 2,
                        blockAbove.position.y + Chest.SIZE
                    );
                    const item = itemTypes[i % itemTypes.length];
                    let contents = [];
                    const numCoins = Math.ceil(Math.random() * 20);
                    for (let c = 0; c < numCoins; c++) {
                        contents.push(
                            new Coin(chestPosition, blockSprites["coin-gold"])
                        );
                    }
                    if (item === "key") {
                        contents.push(
                            new Key(chestPosition, blockSprites["white-key"])
                        );
                    }
                    items.add(
                        new Chest(
                            chestPosition,
                            blockSprites["chest"],
                            contents
                        )
                    );
                }
                if (j !== chestIndex) {
                    const coinPosition = new Vec(
                        blockAbove.position.x + Item.SIZE,
                        blockAbove.position.y + Item.SIZE
                    );
                    items.add(
                        new Coin(coinPosition, blockSprites["coin-gold"])
                    );
                }

                let block =
                    blocks[xIndex + j][firstPlatform + i * platformSpacing];
                block.blockType = "bedrock";
                block.solid = true;

                if (j === 0) {
                    block.sprite = blockSprites["cave_wall_top_1"];
                    continue;
                }
                if (j === platformWidth - 1) {
                    block.sprite = blockSprites["cave_wall_top_6"];
                    continue;
                }
                const rndFloorSprite = Math.floor(Math.random() * 4) + 2;
                block.sprite = blockSprites[`cave_wall_top_${rndFloorSprite}`];
            }
        }
        let exitX = Math.floor(Math.random() * (blocksPerRow - 1));
        let exitY = blocksPerColumn - 2;

        let exitPosition = new Vec(
            exitX * LevelArchitect.BLOCK_SIZE,
            exitY * LevelArchitect.BLOCK_SIZE
        );
        blocks[exitX][exitY] = new Door(
            exitPosition,
            blockSprites["door-locked"]
        );
    }

    static loadSprites() {
        let sprites = {};
        sprites["grass_3"] = loadImage("./bug-dug/res/img/block_grass_3.png");
        sprites["dirt_3_0"] = loadImage("./bug-dug/res/img/block_dirt_3_0.png");
        sprites["dirt_3_1"] = loadImage("./bug-dug/res/img/block_dirt_3_1.png");
        sprites["dirt_3_2"] = loadImage("./bug-dug/res/img/block_dirt_3_2.png");
        sprites["dirt"] = loadImage("./bug-dug/res/img/block_dirt.png");
        sprites["clay"] = loadImage("./bug-dug/res/img/block_clay.png");
        sprites["sand"] = loadImage("./bug-dug/res/img/block_sand.png");
        sprites["stone"] = loadImage("./bug-dug/res/img/block_stone.png");
        sprites["bedrock"] = loadImage("./bug-dug/res/img/block_bedrock.png");
        sprites["nether"] = loadImage("./bug-dug/res/img/block_nether.png");
        sprites["cave_floor_1"] = loadImage(
            "./bug-dug/res/img/cave_floor_1.png"
        );
        sprites["cave_floor_2"] = loadImage(
            "./bug-dug/res/img/cave_floor_2.png"
        );
        sprites["cave_floor_3"] = loadImage(
            "./bug-dug/res/img/cave_floor_3.png"
        );
        sprites["cave_floor_4"] = loadImage(
            "./bug-dug/res/img/cave_floor_4.png"
        );
        sprites["cave_floor_5"] = loadImage(
            "./bug-dug/res/img/cave_floor_5.png"
        );
        sprites["cave_floor_6"] = loadImage(
            "./bug-dug/res/img/cave_floor_6.png"
        );
        sprites["cave_wall"] = loadImage("./bug-dug/res/img/cave_wall.png");
        sprites["cave_wall_L"] = loadImage("./bug-dug/res/img/cave_wall_L.png");
        sprites["cave_wall_R"] = loadImage("./bug-dug/res/img/cave_wall_R.png");
        sprites["cave_wall_top_1"] = loadImage(
            "./bug-dug/res/img/cave_wall_top_1.png"
        );
        sprites["cave_wall_top_2"] = loadImage(
            "./bug-dug/res/img/cave_wall_top_2.png"
        );
        sprites["cave_wall_top_3"] = loadImage(
            "./bug-dug/res/img/cave_wall_top_3.png"
        );
        sprites["cave_wall_top_4"] = loadImage(
            "./bug-dug/res/img/cave_wall_top_4.png"
        );
        sprites["cave_wall_top_5"] = loadImage(
            "./bug-dug/res/img/cave_wall_top_5.png"
        );
        sprites["cave_wall_top_6"] = loadImage(
            "./bug-dug/res/img/cave_wall_top_6.png"
        );
        sprites["background-wall"] = loadImage(
            "./bug-dug/res/img/background_wall.png"
        );
        sprites["background-ladder"] = loadImage(
            "./bug-dug/res/img/background_ladder.png"
        );
        sprites["chest"] = loadImage("./bug-dug/res/img/chest.png");
        sprites["chest_sm"] = loadImage("./bug-dug/res/img/chest_sm.png");
        sprites["door"] = loadImage("./bug-dug/res/img/door.png");
        sprites["door-locked"] = loadImage("./bug-dug/res/img/door_locked.png");
        sprites["white-key"] = loadImage(
            "./bug-dug/res/img/animations/White_Key.png"
        );
        sprites["coin-gold"] = loadImage(
            "./bug-dug/res/img/animations/coin_gold.png"
        );
        sprites["block-damage"] = loadImage(
            "./bug-dug/res/img/animations/block_damage.png"
        );
        return sprites;
    }
}

export { LevelArchitect };
