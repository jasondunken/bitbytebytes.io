const GAMES = [
    {
        title: "Air Defense",
        description: "Defend your battery against aerial assult!",
        icon: "../img/game_icons/defense.png",
        file: "air-defense",
    },
    {
        title: "Mine Squad",
        description: "Farmers need crop fields not minefields!",
        icon: "../img/game_icons/mine.png",
        file: "mine-squad",
    },
    {
        title: "Planet Invaders",
        description: "The invasion has begun, save the planet!",
        icon: "../img/game_icons/invaders.png",
        file: "planet-invaders",
    },
    {
        title: "Slider",
        description: "Slide your way to insanity!",
        icon: "../img/game_icons/slider.png",
        file: "slider",
    },
    {
        title: "Jump to Orion",
        description: "Taking it straight to the aliens!",
        icon: "../img/game_icons/orion.png",
        file: "jump-to-orion",
    },
];

const body = document.getElementById("games-carousel");
for (let game of GAMES) {
    let gameBox = document.createElement("div");
    gameBox.innerHTML = `<div class="container">
        <div class="card">
            <div class="icon">
                <img src="${game.icon}" alt="${game.title}" />
            </div>
            <div class="info">
                <h1 class="title">${game.title}</h1>
                <div>${game.description}</div>
            </div>
            <div class="play">
                <a href="${game.file}.html"><button>Play</button></a>
            </div>
        </div>
    </div>`;
    body.appendChild(createGameBoxElement(gameBox));
}

for (let game of GAMES) {
    let gameBox = document.createElement("div");
    gameBox.innerHTML = `<div class="container">
        <div class="card">
            <div class="icon">
            </div>
            <div class="info">
                <h1 class="title">Coming Soon!</h1>
                <div>Another Retro Redo</div>
            </div>
            <div class="play">
            </div>
        </div>
    </div>`;
    body.appendChild(createGameBoxElement(gameBox));
}

function createGameBoxElement(element) {
    const container = element.querySelector(".container");
    const card = element.querySelector(".card");
    const icon = element.querySelector(".icon");
    const description = element.querySelector(".info");
    const play = element.querySelector(".play");

    container.addEventListener("mousemove", (e) => {
        const bb = card.getBoundingClientRect();
        let yRotation = (bb.x + bb.width / 2 - e.pageX) / 15;
        let xRotation = (bb.y + bb.height / 2 - e.pageY) / 15;
        card.style.transform = `rotateY(${-yRotation}deg) rotateX(${xRotation}deg)`;
    });
    container.addEventListener("mouseenter", () => {
        card.style.transition = "none";
        icon.style.transform = "translateZ(70px)";
        icon.style.transition = "all 0.7s ease-in";
        description.style.transform = "translateZ(50px)";
        description.style.transition = "all 0.5s ease-in";
        play.style.transform = "translateZ(70px)";
        play.style.transition = "all 0.7s ease-in";
    });
    container.addEventListener("mouseleave", (e) => {
        card.style.transition = "all 0.7s ease-in";
        card.style.transform = `rotateY(0deg) rotateX(0deg)`;
        icon.style.transform = "translateZ(0px)";
        description.style.transform = "translateZ(0px)";
        play.style.transform = "translateZ(0px)";
    });
    return element;
}
