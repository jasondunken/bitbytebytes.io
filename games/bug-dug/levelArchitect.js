class LevelArchitect {
    BLOCK_SIZE = 32;
    blocks = [];

    blocksPerColumn;
    blocksPerRow;

    playerSpawn;
    surfaceHeight;

    gravity;

    backgroundLayer = [];
    foregroundLayer = [];

    items = [];

    constructor(screenWidth, screenHeight, levelConfig, sprites) {
        this.width = screenWidth;
        this.height = screenHeight;
        this.blocksPerColumn = screenHeight / this.BLOCK_SIZE;
        this.blocksPerRow = screenWidth / this.BLOCK_SIZE;

        this.skyColor = levelConfig.SKY_COLOR;
        this.backgroundLayer = [];
        this.foregroundLayer = [];
        this.items = [];

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
                        levelConfig.SURFACE_BLOCK,
                        sprites["grass_3"]
                    );
                    this.backgroundLayer[i][j] = sprites["dirt_3_0"];
                    this.foregroundLayer[i][j] = sprites["grass_3"];
                } else if (j === this.blocksPerColumn - 1) {
                    this.blocks[i][j] = new Block(
                        blockPosition,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        levelConfig.BEDROCK_BLOCK,
                        sprites["bedrock"]
                    );
                    this.backgroundLayer[i][j] = sprites["dirt_3_0"];
                    this.foregroundLayer[i][j] = sprites["dirt_3_0"];
                } else {
                    const blockType =
                        levelConfig.BLOCK_TYPES[Math.floor(Math.random() * levelConfig.BLOCK_TYPES.length)];
                    this.blocks[i][j] = new Block(
                        blockPosition,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        blockType,
                        sprites[blockType]
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
        this.addStuff(levelConfig, sprites);
    }

    addStuff(levelConfig, sprites) {
        let firstPlatform = 12;
        let platformSpacing = 5;

        for (let i = 0; i < levelConfig.numEnemies; i++) {
            let platformWidth = Math.floor(Math.random() * 4) + 3;

            let xIndex = Math.floor(Math.random() * this.blocksPerRow);
            if (xIndex + platformWidth > this.blocksPerRow - 1) {
                xIndex = xIndex - platformWidth;
            }
            let chestIndex = Math.floor(Math.random() * platformWidth);

            for (let j = 0; j < platformWidth; j++) {
                let blockAbove = this.blocks[xIndex + j][firstPlatform + i * platformSpacing - 1];
                blockAbove.solid = false;
                blockAbove.sprite = null;
                blockAbove.blockType = "none";

                if (j === chestIndex) {
                    // this.items.push(new Item(blockAbove.position, sprites["chest_sm"]));
                    this.items.push(new Item(blockAbove.position, sprites["white-key"]));
                }

                let block = this.blocks[xIndex + j][firstPlatform + i * platformSpacing];
                block.blockType = "bedrock";
                block.solid = true;

                if (j === 0) {
                    block.sprite = sprites["cave_floor_1"];
                    continue;
                }
                if (j === platformWidth - 1) {
                    block.sprite = sprites["cave_floor_6"];
                    continue;
                }
                block.sprite = sprites["cave_floor_2"];
            }
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
            case "stone":
                return "gray";
            case "bedrock":
                return "black";
            case "air":
                return color("#9EF6FF");
            case "none":
                return color("#00000000");
            default:
                console.log("unknown block type: ", blockType);
                return "magenta";
        }
    }

    static loadSprites() {
        let sprites = {};
        sprites["grass_3"] = loadImage("./bug-dug/img/block_grass_3.png");
        sprites["dirt_3_0"] = loadImage("./bug-dug/img/block_dirt_3_0.png");
        sprites["dirt_3_1"] = loadImage("./bug-dug/img/block_dirt_3_1.png");
        sprites["dirt_3_2"] = loadImage("./bug-dug/img/block_dirt_3_2.png");
        sprites["dirt"] = loadImage("./bug-dug/img/block_dirt.png");
        sprites["clay"] = loadImage("./bug-dug/img/block_clay.png");
        sprites["sand"] = loadImage("./bug-dug/img/block_sand.png");
        sprites["stone"] = loadImage("./bug-dug/img/block_stone.png");
        sprites["bedrock"] = loadImage("./bug-dug/img/block_bedrock.png");
        sprites["nether"] = loadImage("./bug-dug/img/block_nether.png");
        sprites["cave_floor_1"] = loadImage("./bug-dug/img/cave_floor_1.png");
        sprites["cave_floor_2"] = loadImage("./bug-dug/img/cave_floor_2.png");
        sprites["cave_floor_3"] = loadImage("./bug-dug/img/cave_floor_3.png");
        sprites["cave_floor_4"] = loadImage("./bug-dug/img/cave_floor_4.png");
        sprites["cave_floor_5"] = loadImage("./bug-dug/img/cave_floor_5.png");
        sprites["cave_floor_6"] = loadImage("./bug-dug/img/cave_floor_6.png");
        sprites["cave_wall"] = loadImage("./bug-dug/img/cave_wall.png");
        sprites["cave_wall_L"] = loadImage("./bug-dug/img/cave_wall_L.png");
        sprites["cave_wall_R"] = loadImage("./bug-dug/img/cave_wall_R.png");
        sprites["cave_wall_top_1"] = loadImage("./bug-dug/img/cave_wall_top_1.png");
        sprites["cave_wall_top_2"] = loadImage("./bug-dug/img/cave_wall_top_2.png");
        sprites["cave_wall_top_3"] = loadImage("./bug-dug/img/cave_wall_top_3.png");
        sprites["cave_wall_top_4"] = loadImage("./bug-dug/img/cave_wall_top_4.png");
        sprites["cave_wall_top_5"] = loadImage("./bug-dug/img/cave_wall_top_5.png");
        sprites["cave_wall_top_6"] = loadImage("./bug-dug/img/cave_wall_top_6.png");
        sprites["chest"] = loadImage("./bug-dug/img/chest.png");
        sprites["chest_sm"] = loadImage("./bug-dug/img/chest_sm.png");
        sprites["sprite-sheet-mushroom"] = loadImage("./bug-dug/img/animations/Big_Mushroom_walk.png");
        sprites["white-key"] = loadImage("./bug-dug/img/animations/White_Key.png");
        return sprites;
    }
}
