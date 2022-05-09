class LevelManager {
    levels = {
        level_1: {
            name: "Level 1",
            map: [
                [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
            ],
            spriteSheetData: {
                names: ["alien_1", "alien_2", "alien_3", "alien_4", "alien_5", "barrier", "ship", "bonus"],
                spriteSheetPath: "./planet-invaders/img/sprite_sheet_2.png",
                color: "0x00ff00ff",
            },
            backgroundImage: "./planet-invaders/img/bg.png",
        },

        level_2: {
            name: "Level 2",
            map: [
                [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
            ],
            spriteSheetData: {
                names: ["alien_1", "alien_2", "alien_3", "alien_4", "alien_5", "barrier", "ship", "bonus"],
                spriteSheetPath: "./planet-invaders/img/sprite_sheet_2.png",
                color: "0x00ffffff",
            },
            backgroundImage: "./planet-invaders/img/bg.png",
        },

        level_3: {
            name: "Level 3",
            map: [
                [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
            ],
            spriteSheetData: {
                names: ["alien_1", "alien_2", "alien_3", "alien_4", "alien_5", "barrier", "ship", "bonus"],
                spriteSheetPath: "./planet-invaders/img/sprite_sheet_2.png",
                color: "0xffff00ff",
            },
            backgroundImage: "./planet-invaders/img/bg.png",
        },
    };

    PLAYER_SIZE = 16;
    PLAYER_SPEED = 2;

    ALIEN_SIZE = 16;
    ALIEN_SPEED = 0.25;

    BARRIER_SIZE = 24;

    GUTTER_WIDTH = 32;

    BONUS_SIZE = 16;
    BONUS_INTERVAL = 1000;
    bonusSprite;
    bonusSpriteReversed;

    async initializeLevel(display, levelName) {
        const level = this.levels[levelName];
        const backgroundImage = await loadImage(level.backgroundImage);
        const levelSprites = await SpriteLoader.loadSprites(level.spriteSheetData);
        this.bonusSprite = levelSprites["bonus"];
        this.bonusSpriteReversed = levelSprites["bonus_reversed"];

        const playerStartingPosition = {
            x: display.width / 2,
            y: display.height - this.PLAYER_SIZE * 2,
        };
        const player = new Ship(this.PLAYER_SIZE, playerStartingPosition, this.PLAYER_SPEED, levelSprites["ship"]);

        let spawnAreaWidth = display.width - this.GUTTER_WIDTH * 2;
        let barriers = [];
        let aliens = [];
        const alienNames = Object.keys(levelSprites).filter((spriteName) => {
            return spriteName.startsWith("alien_");
        });
        let totalAliens = 0;
        for (let j = 0; j < level.map.length; j++) {
            let spacing = spawnAreaWidth / (level.map[j].length - 1);
            let row = [];
            for (let i = 0; i < level.map[j].length; i++) {
                if (level.map[j][i] == 1) {
                    row.push(
                        new Alien(
                            this.ALIEN_SIZE,
                            {
                                x: i * spacing + this.GUTTER_WIDTH,
                                y: j * spacing + display.SCOREBOARD_HEIGHT,
                            },
                            j % 2 == 0 ? this.ALIEN_SPEED : -this.ALIEN_SPEED,
                            levelSprites[alienNames[Math.floor(Math.random() * alienNames.length)]]
                        )
                    );
                    totalAliens++;
                }
                if (level.map[j][i] == 2) {
                    barriers.push(
                        new Barrier(
                            this.BARRIER_SIZE,
                            {
                                x: i * spacing + this.GUTTER_WIDTH,
                                y: j * spacing + display.SCOREBOARD_HEIGHT,
                            },
                            levelSprites["barrier"]
                        )
                    );
                }
            }
            aliens.push(row);
        }
        return {
            name: levelName,
            backgroundImage,
            player,
            aliens,
            totalAliens,
            barriers,
            bonus: null,
        };
    }

    getBonus() {
        const speed = Math.random() > 0.5 ? 1 : -1;
        const pos = {
            x: speed > 0 ? -this.BONUS_SIZE : width + this.BONUS_SIZE,
            y: this.BONUS_SIZE,
        };
        const sprite = speed > 0 ? this.bonusSprite : this.bonusSpriteReversed;
        return new Bonus(this.BONUS_SIZE, pos, speed, sprite);
    }
}
