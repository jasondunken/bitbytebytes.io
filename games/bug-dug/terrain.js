class Terrain {
    BLOCKS_PER_ROW = 16;

    blockSize;
    blocks = [];

    playerSpawn;
    surfaceHeight;

    constructor(screenWidth, screenHeight, levelConfig) {
        this.blockSize = screenWidth / this.BLOCKS_PER_ROW;
        this.blockPerColumn = screenHeight / this.blockSize - levelConfig.surfaceHeight / this.blockSize;

        for (let i = 0; i < this.BLOCKS_PER_ROW; i++) {
            this.blocks[i] = [];
            for (let j = 0; j < this.blockPerColumn; j++) {
                if (j === 0) {
                    this.blocks[i][j] = levelConfig.SURFACE_BLOCK;
                    continue;
                }
                if (j === this.blockPerColumn - 1) {
                    this.blocks[i][j] = levelConfig.BEDROCK_BLOCK;
                    continue;
                }

                this.blocks[i][j] = levelConfig.BLOCK_TYPES[Math.floor(Math.random() * levelConfig.BLOCK_TYPES.length)];
            }
        }

        this.surfaceHeight = levelConfig.surfaceHeight;
        this.playerSpawn = levelConfig.playerSpawn;
    }

    static loadSprites() {
        let sprites = {};
        sprites["grass_1"] = loadImage("./bug-dug/img/block_grass_1.png");
        sprites["dirt_1_1"] = loadImage("./bug-dug/img/block_dirt_1_1.png");
        sprites["dirt_1_2"] = loadImage("./bug-dug/img/block_dirt_1_2.png");
        sprites["grass_2"] = loadImage("./bug-dug/img/block_grass_2.png");
        sprites["dirt_2_0"] = loadImage("./bug-dug/img/block_dirt_2_0.png");
        sprites["dirt_2_1"] = loadImage("./bug-dug/img/block_dirt_2_1.png");
        sprites["dirt_2_2"] = loadImage("./bug-dug/img/block_dirt_2_2.png");
        sprites["grass_3"] = loadImage("./bug-dug/img/block_grass_3.png");
        sprites["dirt_3_0"] = loadImage("./bug-dug/img/block_dirt_3_0.png");
        sprites["dirt_3_1"] = loadImage("./bug-dug/img/block_dirt_3_1.png");
        sprites["dirt_3_2"] = loadImage("./bug-dug/img/block_dirt_3_2.png");
        sprites["nether"] = loadImage("./bug-dug/img/block_nether.png");
        return sprites;
    }
}
