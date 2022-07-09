class Terrain {
    BLOCK_SIZE = 32;
    blocks = [];

    blocksPerColumn;
    blocksPerRow;

    playerSpawn;
    surfaceHeight;

    gravity;

    constructor(screenWidth, screenHeight, levelConfig) {
        this.width = screenWidth;
        this.height = screenHeight;
        this.blocksPerColumn = screenHeight / this.BLOCK_SIZE;
        this.blocksPerRow = screenWidth / this.BLOCK_SIZE;

        this.gravity = levelConfig.gravity;
        this.surfaceHeight = levelConfig.surfaceHeight;
        this.playerSpawn = levelConfig.playerSpawn;

        for (let i = 0; i < this.blocksPerRow; i++) {
            this.blocks[i] = [];
            for (let j = 0; j < this.blocksPerColumn; j++) {
                let blockPosition = { x: i * this.BLOCK_SIZE, y: j * this.BLOCK_SIZE };
                if (j < this.surfaceHeight / this.BLOCK_SIZE) {
                    this.blocks[i][j] = new Block(
                        blockPosition,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        levelConfig.AIR_BLOCK
                    );
                } else if (j === this.surfaceHeight / this.BLOCK_SIZE) {
                    this.blocks[i][j] = new Block(
                        blockPosition,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        levelConfig.SURFACE_BLOCK
                    );
                } else if (j === this.blocksPerColumn - 1) {
                    this.blocks[i][j] = new Block(
                        blockPosition,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        levelConfig.BEDROCK_BLOCK
                    );
                } else {
                    this.blocks[i][j] = new Block(
                        blockPosition,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        levelConfig.BLOCK_TYPES[Math.floor(Math.random() * levelConfig.BLOCK_TYPES.length)]
                    );
                }
            }
        }

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
            case "air":
                return color("#9EF6FF");
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
