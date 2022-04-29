class Level {
    levels = {
        level_1: {
            name: "Level 1",
            map: [
                [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            ],
        },

        level_2: {
            name: "Level 2",
            map: [
                [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            ],
        },

        level_3: {
            name: "Level 3",
            map: [
                [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            ],
        },
    };

    PLAYER_SIZE = 16;
    PLAYER_SPEED = 2;

    ALIEN_SIZE = 16;
    ALIEN_SPEED = 0.25;

    GUTTER_WIDTH = 32;

    backgroundImage = null;
    currentLevel = null;

    player = null;
    aliens = [];

    constructor(width, height, scoreboardHeight) {
        this.backgroundImage = loadImage("./planet-invaders/img/bg.png");

        this.currentLevel = this.levels["level_1"];

        const playerStartingPosition = {
            x: width / 2,
            y: height - 32,
        };
        this.player = new Ship(this.PLAYER_SIZE, playerStartingPosition, this.PLAYER_SPEED);

        let spawnAreaWidth = width - this.GUTTER_WIDTH * 2;
        for (let j = 0; j < this.currentLevel.map.length; j++) {
            let spacing = spawnAreaWidth / (this.currentLevel.map[j].length - 1);
            let row = [];
            for (let i = 0; i < this.currentLevel.map[j].length; i++) {
                if (this.currentLevel.map[j][i] == 1) {
                    row.push(
                        new Alien(
                            this.ALIEN_SIZE,
                            {
                                x: i * spacing + this.GUTTER_WIDTH,
                                y: j * spacing + scoreboardHeight,
                            },
                            j % 2 == 0 ? this.ALIEN_SPEED : -this.ALIEN_SPEED
                        )
                    );
                }
            }
            this.aliens.push(row);
        }
    }

    getBackground() {
        return this.backgroundImage;
    }

    getPlayer() {
        return this.player;
    }

    getAliens() {
        return this.aliens;
    }
}
