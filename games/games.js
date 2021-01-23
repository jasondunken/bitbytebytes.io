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

const body = document.querySelector("body");
for (let game of GAMES) {
  let menuDiv = document.createElement("div");
  menuDiv.innerHTML = `<div class="container">
        <div class="card">
            <div class="icon">
                <img src="${game.icon}" alt="${game.title}" />
            </div>
            <div class="info">
                <h1 class="title">${game.title}</h1>
                <h3>${game.description}</h3>
                <div class="play">
                    <a href="${game.file}"><button>Play</button></a>
                </div>
            </div>
        </div>
    </div>`;

  const card = menuDiv.querySelector(".card");
  const container = menuDiv.querySelector(".container");
  const icon = menuDiv.querySelector(".icon img");
  const title = menuDiv.querySelector(".title");
  const description = menuDiv.querySelector(".info h3");
  const play = menuDiv.querySelector(".play");

  container.addEventListener("mousemove", (e) => {
    let bb = card.getBoundingClientRect();
    let yRotation = (bb.x + bb.width / 2 - e.pageX) / 30;
    let xRotation = (window.pageYOffset + bb.height / 2 - e.pageY) / 30;
    card.style.transform = `rotateY(${-yRotation}deg) rotateX(${-xRotation}deg)`;
  });
  container.addEventListener("mouseenter", () => {
    card.style.transition = "none";
    icon.style.transform = "translateZ(150px)";
    title.style.transform = "translateZ(125px)";
    description.style.transform = "translateZ(125px)";
    play.style.transform = "translateZ(150px)";
  });
  container.addEventListener("mouseleave", (e) => {
    card.style.transition = "all 0.3s ease";
    card.style.transform = `rotateY(0deg) rotateX(0deg)`;
    icon.style.transform = "translateZ(0px)";
    title.style.transform = "translateZ(0px)";
    description.style.transform = "translateZ(0px)";
    play.style.transform = "translateZ(0px)";
  });
  body.appendChild(menuDiv);
}
