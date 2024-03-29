import { World } from "./world.js";
import { LEVELS } from "./levels.js";
import { Alien } from "./alien.js";

import { Vec } from "../../modules/math/vec.js";

class LevelLoader {
    static LoadLevel(level, spriteMetadata, spawnArea) {
        const aliens = new Set();
        const alienNames = spriteMetadata.alienNames;
        const levelData = LEVELS[level];
        const xNodes = levelData[0].length;
        const yNodes = levelData.length;
        for (let y = 0; y < levelData.length; y++) {
            for (let x = 0; x < levelData[y].length; x++) {
                if (levelData[y][x] == 1) {
                    aliens.add(
                        new Alien(
                            LevelLoader.LevelIndexToWorldPosition(
                                { x, y },
                                spawnArea,
                                xNodes,
                                yNodes
                            ),
                            World.resources.sprites[
                                alienNames[
                                    Math.floor(
                                        Math.random() * alienNames.length
                                    )
                                ]
                            ],
                            World.ALIEN_SIZE,
                            World.ALIEN_COLLIDER_SIZE,
                            World.ALIEN_SPEED
                        )
                    );
                }
            }
        }
        return aliens;
    }

    static LoadLevelAsync(level, spriteMetadata, spawnArea) {
        return new Promise((resolve, reject) => {
            const aliens = new Set();
            const alienNames = spriteMetadata.alienNames;
            const levelData = LEVELS[level];
            const xNodes = levelData[0].length;
            const yNodes = levelData.length;
            for (let j = 0; j < levelData.length; j++) {
                for (let i = 0; i < levelData[j].length; i++) {
                    if (levelData[j][i] == 1) {
                        aliens.add(
                            new Alien(
                                LevelLoader.LevelIndexToWorldPosition(
                                    { x, y },
                                    spawnArea,
                                    xNodes,
                                    yNodes
                                ),
                                World.resources.sprites[
                                    alienNames[
                                        Math.floor(
                                            Math.random() * alienNames.length
                                        )
                                    ]
                                ],
                                World.ALIEN_SIZE,
                                World.ALIEN_SPEED
                            )
                        );
                    }
                }
            }
            resolve(aliens);
        });
    }

    static LevelIndexToWorldPosition(index, spawnArea, xNodes, yNodes) {
        const xSpace = (spawnArea.br.x - spawnArea.tl.x) / (xNodes - 1);
        const ySpace = (spawnArea.br.y - spawnArea.tl.y) / (yNodes - 1);
        return new Vec(
            index.x * xSpace + spawnArea.tl.x,
            index.y * ySpace + spawnArea.tl.y
        );
    }
}

export { LevelLoader };
