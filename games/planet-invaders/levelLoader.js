class LevelLoader {
    async initializeLevel(level, player, display) {
        const levelData = WORLD.LEVELS[level];
        const backgroundImage = await loadImage(levelData.backgroundImage);
        const levelSprites = await SpriteLoader.loadSprites(levelData.spriteSheetData);

        const playerStartingPosition = {
            x: display.width / 2,
            y: display.height - WORLD.METADATA.PLAYER_SIZE * 2,
        };
        player.setPosition(playerStartingPosition);
        player.setSprite(levelSprites["ship"]);

        const spawnAreaWidth = display.width - WORLD.METADATA.GUTTER_WIDTH * 2;
        const gameObjects = new Set();
        const alienNames = Object.keys(levelSprites).filter((spriteName) => {
            return spriteName.startsWith("alien_");
        });
        let alienCount = 0;
        for (let j = 0; j < levelData.map.length; j++) {
            const spacing = spawnAreaWidth / (levelData.map[j].length - 1);
            for (let i = 0; i < levelData.map[j].length; i++) {
                if (levelData.map[j][i] == 1) {
                    gameObjects.add(
                        new Alien(
                            new Vec2(i * spacing + WORLD.METADATA.GUTTER_WIDTH, j * spacing + display.scoreboardHeight),
                            levelSprites[alienNames[Math.floor(Math.random() * alienNames.length)]]
                        )
                    );
                    alienCount++;
                }
            }
        }
        const bonus = new Bonus(
            new Vec2(-WORLD.METADATA.BONUS_SIZE, display.scoreboardHeight / 2),
            WORLD.METADATA.BONUS_SIZE,
            WORLD.METADATA.BONUS_SPEED,
            WORLD.METADATA.BONUS_INTERVAL,
            levelSprites["bonus"]
        );
        return {
            backgroundImage,
            gameObjects,
            alienCount,
            bonus,
        };
    }
}
