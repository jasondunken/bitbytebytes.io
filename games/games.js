const GAMES = [
    {
        title: "Air Defense",
        description: "Defend your battery against aerial assult!",
        icon: "../img/defense.png",
        file: "air-defense.html",
    },
    {
        title: "Mine Squad Plus",
        description: "Hunt for hidden mines!",
        icon: "../img/mine.png",
        file: "minesquadplus.html",
    },
    {
        title: "Planet Invaders",
        description: "The invasion has begun, save the planet!",
        icon: "../img/invaders.png",
        file: "planet-invaders.html",
    },
    {
        title: "Slider",
        description: "Slide your way to insanity!",
        icon: "../img/slider.png",
        file: "slider.html",
    },
    {
        title: "Jump to Orion",
        description: "Taking it straight to the aliens!",
        icon: "../img/orion.png",
        file: "jump-to-orion.html",
    },
];

const body = document.getElementById("games-carousel");
for (let game of GAMES) {
    let menuDiv = document.createElement("div");
    menuDiv.innerHTML = `<div class="container">
        <div class="card">
            <div class="icon">
                <img src="${game.icon}" alt="${game.title}" />
            </div>
            <div class="info">
                <h1 class="title">${game.title}</h1>
                <div>${game.description}</div>
            </div>
            <div class="play">
                <a href="${game.file}"><button>Play</button></a>
            </div>
        </div>
    </div>`;

    const container = menuDiv.querySelector(".container");
    const card = menuDiv.querySelector(".card");
    const icon = menuDiv.querySelector(".icon");
    const description = menuDiv.querySelector(".info");
    const play = menuDiv.querySelector(".play");

    container.addEventListener("mousemove", (e) => {
        const bb = card.getBoundingClientRect();
        let yRotation = (bb.x + bb.width / 2 - e.pageX) / 15;
        let xRotation = (bb.y + bb.height / 2 - e.pageY) / 15;
        card.style.transform = `rotateY(${-yRotation}deg) rotateX(${xRotation}deg)`;
    });
    container.addEventListener("mouseenter", () => {
        card.style.transition = "none";
        icon.style.transform = "translateZ(75px)";
        description.style.transform = "translateZ(75px)";
        play.style.transform = "translateZ(75px)";
    });
    container.addEventListener("mouseleave", (e) => {
        card.style.transition = "all 1.0s ease";
        card.style.transform = `rotateY(0deg) rotateX(0deg)`;
        icon.style.transform = "translateZ(0px)";
        description.style.transform = "translateZ(0px)";
        play.style.transform = "translateZ(0px)";
    });
    body.appendChild(menuDiv);
}
