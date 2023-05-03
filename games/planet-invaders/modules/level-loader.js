import { Alien } from "./alien.js";
import { Vec2 } from "./vec2d.js";

class LevelLoader {
    loadLevel(level, display) {
        const gameObjects = new Set();
        const alienNames = Object.keys(levelSprites).filter((spriteName) => {
            return spriteName.startsWith("alien_");
        });
        for (let j = 0; j < levelData.map.length; j++) {
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
    }
}

export { LevelLoader };
