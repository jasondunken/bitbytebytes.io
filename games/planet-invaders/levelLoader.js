class LevelLoader {
    async initializeLevel(level, player, display) {
        const levelData = WORLD.LEVELS[level];
        console.log("levelData: ", levelData);
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
                }
            }
        }
        return {
            backgroundImage,
            gameObjects,
        };
    }
}
