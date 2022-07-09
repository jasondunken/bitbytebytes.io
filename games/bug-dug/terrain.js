class Terrain {
    BLOCK_SIZE = 32;
    blocks = [];

    blocksPerColumn;
    blocksPerRow;

    playerSpawn;
    surfaceHeight;

    gravity;

    backgroundLayer = [];
    foregroundLayer = [];

    constructor(screenWidth, screenHeight, levelConfig, sprites) {
        this.width = screenWidth;
        this.height = screenHeight;
        this.blocksPerColumn = screenHeight / this.BLOCK_SIZE;
        this.blocksPerRow = screenWidth / this.BLOCK_SIZE;

        this.skyColor = levelConfig.SKY_COLOR;
        this.backgroundLayer = [];
        this.foregroundLayer = [];

        this.gravity = levelConfig.gravity;
        this.surfaceHeight = levelConfig.surfaceHeight;
        this.playerSpawn = levelConfig.playerSpawn;

        for (let i = 0; i < this.blocksPerRow; i++) {
            this.blocks[i] = [];
            this.backgroundLayer[i] = [];
            this.foregroundLayer[i] = [];
            for (let j = 0; j < this.blocksPerColumn; j++) {
                let blockPosition = { x: i * this.BLOCK_SIZE, y: j * this.BLOCK_SIZE };
                if (j < this.surfaceHeight / this.BLOCK_SIZE) {
                    this.blocks[i][j] = new Block(
                        blockPosition,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        levelConfig.AIR_BLOCK
                    );
                    this.backgroundLayer[i][j] = "none";
                    this.foregroundLayer[i][j] = "none";
                } else if (j === this.surfaceHeight / this.BLOCK_SIZE) {
                    this.blocks[i][j] = new Block(
                        blockPosition,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        levelConfig.SURFACE_BLOCK
                    );
                    this.backgroundLayer[i][j] = sprites["dirt_3_0"];
                    this.foregroundLayer[i][j] = sprites["grass_3"];
                } else if (j === this.blocksPerColumn - 1) {
                    this.blocks[i][j] = new Block(
                        blockPosition,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        levelConfig.BEDROCK_BLOCK
                    );
                    this.backgroundLayer[i][j] = sprites["dirt_3_0"];
                    this.foregroundLayer[i][j] = sprites["dirt_3_0"];
                } else {
                    this.blocks[i][j] = new Block(
                        blockPosition,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        levelConfig.BLOCK_TYPES[Math.floor(Math.random() * levelConfig.BLOCK_TYPES.length)]
                    );
                    this.backgroundLayer[i][j] = sprites["dirt_3_0"];
                    this.foregroundLayer[i][j] = sprites["dirt_3_0"];
                }
            }
        }
        for (let rndDirt = 0; rndDirt < 16; rndDirt++) {
            let i = Math.floor(Math.random() * this.blocks.length);
            let j =
                Math.floor(Math.random() * (this.blocks[0].length - (this.surfaceHeight / this.BLOCK_SIZE + 1))) +
                this.surfaceHeight / this.BLOCK_SIZE +
                1;
            this.backgroundLayer[i][j] = Math.random() < 0.5 ? sprites["dirt_3_1"] : sprites["dirt_3_2"];
        }
        for (let rndDirt = 0; rndDirt < 16; rndDirt++) {
            let i = Math.floor(Math.random() * this.blocks.length);
            let j =
                Math.floor(Math.random() * (this.blocks[0].length - (this.surfaceHeight / this.BLOCK_SIZE + 1))) +
                this.surfaceHeight / this.BLOCK_SIZE +
                1;
            1;
            this.foregroundLayer[i][j] = Math.random() < 0.5 ? sprites["dirt_3_1"] : sprites["dirt_3_2"];
        }
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
