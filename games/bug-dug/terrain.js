class Terrain {
    BLOCKS_PER_ROW = 16;

    blockSize;
    blocks = [];

    playerSpawn;
    surfaceHeight;

    gravity;

    constructor(screenWidth, screenHeight, levelConfig) {
        this.width = screenWidth;
        this.height = screenHeight;
        this.blockSize = screenWidth / this.BLOCKS_PER_ROW;
        this.blockPerColumn = screenHeight / this.blockSize - levelConfig.surfaceHeight / this.blockSize;
        this.gravity = levelConfig.gravity;

        for (let i = 0; i < this.BLOCKS_PER_ROW; i++) {
            this.blocks[i] = [];
            for (let j = 0; j < this.blockPerColumn; j++) {
                let blockPosition = { x: i * this.blockSize, y: j * this.blockSize + levelConfig.surfaceHeight };
                if (j === 0) {
                    this.blocks[i][j] = new Block(
                        blockPosition,
                        this.blockSize,
                        this.blockSize,
                        levelConfig.SURFACE_BLOCK
                    );
                    continue;
                }
                if (j === this.blockPerColumn - 1) {
                    this.blocks[i][j] = new Block(
                        blockPosition,
                        this.blockSize,
                        this.blockSize,
                        levelConfig.BEDROCK_BLOCK
                    );
                    continue;
                }

                this.blocks[i][j] = new Block(
                    blockPosition,
                    this.blockSize,
                    this.blockSize,
                    levelConfig.BLOCK_TYPES[Math.floor(Math.random() * levelConfig.BLOCK_TYPES.length)]
                );
            }
        }

        this.surfaceHeight = levelConfig.surfaceHeight;
        this.playerSpawn = levelConfig.playerSpawn;

        console.log("this.blocks: ", this.blocks);
    }

    static getColor(blockType) {
        switch (blockType) {
            case "grass":
                return "green";
            case "dirt":
                return "brown";
            case "clay":
                return "orange";
            case "sand":
                return "beige";
            case "water":
                return "blue";
            case "stone":
                return "gray";
            default:
                console.log("unknown block type: ", blockType);
                return "magenta";
        }
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
