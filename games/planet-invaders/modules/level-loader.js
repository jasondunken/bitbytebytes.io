import { LEVELS } from "./levels.js";
import { World } from "./world.js";

import { Alien } from "./alien.js";
import { Barrier } from "./barrier.js";
import { Vec2 } from "./vec2d.js";
import { GameObject } from "./game-object.js";

class LevelLoader {
    static LoadLevel(level, spriteMetadata, spawnArea) {
        const gameObjects = new Set();
        const alienNames = spriteMetadata.alienNames;
        const levelData = LEVELS[level];
        const xNodes = levelData[0].length;
        const yNodes = levelData.length;
        for (let y = 0; y < levelData.length; y++) {
            for (let x = 0; x < levelData[y].length; x++) {
                if (levelData[y][x] == 1) {
                    gameObjects.add(
                        new Alien(
                            LevelLoader.LevelIndexToWorldPosition({ x, y }, spawnArea, xNodes, yNodes),
                            World.resources.sprites[alienNames[Math.floor(Math.random() * alienNames.length)]],
                            World.ALIEN_SIZE,
                            World.ALIEN_SPEED
                        )
                    );
                }
            }
        }
        return gameObjects;
    }

    static LoadLevelAsync(level, spriteMetadata, spawnArea) {
        return new Promise((resolve, reject) => {
            const gameObjects = new Set();
            const alienNames = spriteMetadata.names;
            const levelData = LEVELS[level];
            for (let j = 0; j < levelData.length; j++) {
                for (let i = 0; i < levelData[j].length; i++) {
                    if (levelData[j][i] == 1) {
                        gameObjects.add(
                            new Alien(
                                new Vec2(
                                    i * spacing + WORLD.METADATA.GUTTER_WIDTH,
                                    j * spacing + display.scoreboardHeight
                                ),
                                World.resources.sprites[alienNames[Math.floor(Math.random() * alienNames.length)]],
                                World.ALIEN_SIZE
                            )
                        );
                    }
                }
            }
            resolve(gameObjects);
        });
    }

    static LevelIndexToWorldPosition(index, spawnArea, xNodes, yNodes) {
        const xSpace = (spawnArea.br.x - spawnArea.tl.x) / (xNodes - 1);
        const ySpace = (spawnArea.br.y - spawnArea.tl.y) / (yNodes - 1);
        return new Vec2(index.x * xSpace + spawnArea.tl.x, index.y * ySpace + spawnArea.tl.y);
    }
}

class DefaultObject extends GameObject {
    constructor(position) {
        super("defaultObj", position, 4);
    }

    render() {
        stroke("magenta");
        strokeWeight(this.size);
        noFill();
        point(this.position.x, this.position.y);
    }
}

export { LevelLoader };
