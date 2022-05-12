class LevelManager {
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

    async initializeLevel(display, levelName, isDemo) {
        const level = levels[levelName];
        const backgroundImage = await loadImage(level.backgroundImage);
        const levelSprites = await SpriteLoader.loadSprites(level.spriteSheetData);
        this.bonusSprite = levelSprites["bonus"];
        this.bonusSpriteReversed = levelSprites["bonus_reversed"];

        const playerStartingPosition = {
            x: display.width / 2,
            y: display.height - this.PLAYER_SIZE * 2,
        };
        let player = null;
        if (isDemo) {
            player = new DemoPlayer(
                this.PLAYER_SIZE,
                playerStartingPosition,
                this.PLAYER_SPEED,
                levelSprites["ship"],
                display
            );
        } else {
            player = new Player(this.PLAYER_SIZE, playerStartingPosition, this.PLAYER_SPEED, levelSprites["ship"]);
        }

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
