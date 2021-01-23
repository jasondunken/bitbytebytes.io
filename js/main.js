let _width;
let _height = 245;

let map = [];
let nextMap = [];

let rColor;

function setup() {
  frameRate(15);
  _width = window.innerWidth;
  let canvas = createCanvas(_width, _height);
  canvas.parent("p5-container");

  if (!rColor) setRndColor();

  // initialize map arrays to 0 (empty)
  for (let i = 0; i < _width * _height; i++) {
    map[i] = 0;
    nextMap[i] = 0;
  }

  // randomly set n cells to 1 (occupied)
  for (let i = 0; i < _height * 75; i++) {
    const index = Math.floor(Math.random() * map.length);
    const value = map[index];
    if (value !== 1) {
      map[index] = 1;
    }
  }
}

function draw() {
  loadPixels();
  for (let i = 0; i < map.length; i++) {
    //     r               g               b
    if (map[i] >= 1) {
      // white range
      if (map[i] > 2048) map[i] = 1;
      if (map[i] < 256) {
        pixels[i * 4] = pixels[i * 4 + 1] = pixels[i * 4 + 2] = 256;
        pixels[i * 4 + 3] = 255;
      } else if (map[i] < 512) {
        pixels[i * 4] = 255;
        pixels[i * 4 + 1] = pixels[i * 4 + 2] = 0;
        pixels[i * 4 + 3] = 255;
      } else if (map[i] < 768) {
        pixels[i * 4 + 1] = 255;
        pixels[i * 4] = pixels[i * 4 + 2] = 0;
        pixels[i * 4 + 3] = 255;
      } else if (map[i] < 1024) {
        pixels[i * 4] = rColor.r;
        pixels[i * 4 + 1] = rColor.g;
        pixels[i * 4 + 2] = rColor.b;
        pixels[i * 4 + 3] = 255;
      }
    } else {
      pixels[i * 4] = pixels[i * 4 + 1] = pixels[i * 4 + 2] = 0;
      pixels[i * 4 + 3] = 255;
    }
  }
  updatePixels();

  // create new nextMap from map
  for (let i = 0; i < map.length; i++) {
    if (map[i] >= 1) {
      ////Any live cell...
      let n = getNumNeighbors(i);
      if (n < 2) {
        //with fewer than two live neighbors dies, as if caused by under-population.
        nextMap[i] = 0;
      } else if (n == 2 || n == 3) {
        //live cell with two or three live neighbors lives on to the next generation.
        nextMap[i] = map[i] + 1;
      } else if (n > 3) {
        //live cell with more than three live neighbors dies, as if by overcrowding.
        nextMap[i] = 0;
      }
    } else {
      if (getNumNeighbors(i) == 3) {
        //Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
        nextMap[i] = 1;
      }
    }
  }
  map = [...nextMap];
  // clear nextMap
  for (let i = 0; i < nextMap.length; i++) {
    nextMap[i] = 0;
  }
}

function getNumNeighbors(index) {
  let walls = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let nIndex = index + i + j * _width;
      if (nIndex !== index && nIndex >= 0 && nIndex < map.length) {
        if (map[nIndex] >= 1) {
          walls++;
        }
      }
    }
  }
  return walls;
}

function mouseClicked(e) {
  if (e.pageY <= _height) {
    randomSpawn(e.pageX, e.pageY);
  }
}

function mouseDragged(e) {
  randomSpawn(e.pageX, e.pageY);
}

function randomSpawn(x, y) {
  const SIZE = 11;
  let cellIndex = y * _width + x;
  for (let i = -Math.floor(SIZE / 2); i < SIZE; i++) {
    for (let j = -Math.floor(SIZE / 2); j < SIZE; j++) {
      index = cellIndex + i + j * _width;
      if (index > 0 && index < map.length) {
        map[index] = Math.random() > 0.5 ? 1 : 0;
      }
    }
  }
}

function buildName() {
  let _name = "";
  let name_ = "BITbyteBYTES.io";
  for (let l = 0; l < name_.length; l++) {
    let next = "<span class='ltr'>" + name_[l] + "</span>";
    _name += next;
  }
  document.querySelector(".logo").innerHTML = _name;
}

function twinkle() {
  let letters = document.getElementsByClassName("ltr");
  let index = Math.floor(Math.random() * letters.length);
  setRndColor();
  letters[index].style = `color: rgb(${rColor.r}, ${rColor.g}, ${rColor.b})`;
}

function setRndColor() {
  rColor = {
    r: Math.floor(Math.random() * 255),
    g: Math.floor(Math.random() * 255),
    b: Math.floor(Math.random() * 255),
  };
}

let ufos = [];
const MAX_Y = 400;

function update() {
  let ufo = document.getElementsByClassName("ufo");
  for (let i = 0; i < ufo.length; i++) {
    if (!ufos[i]) {
      let x_start = Math.random() * this.innerWidth;
      let y_start = Math.random() * MAX_Y;
      let x_dir = Math.random() > 0.5 ? 1 : -1;
      let y_dir = Math.random() > 0.5 ? 1 : -1;
      let speed = Math.random() * 4 + 1;
      ufos[i] = {
        x: x_start,
        y: y_start,
        xd: x_dir,
        yd: y_dir,
        s: speed,
        type: "none",
        state: "none",
      };
    }
    let move = move_mob(ufos[i]);
    ufo[i].style =
      "position: absolute; top: " + move.y + "px; left: " + move.x + "px;";
  }
}

function move_mob(ufo) {
  let move = {};
  move.x = ufo.x + ufo.s * ufo.xd;
  move.y = ufo.y + ufo.s * ufo.yd;
  if (move.x < 0) {
    move.x = 0;
    ufo.xd *= -1;
  }
  if (move.x > this.innerWidth - 32) {
    move.x = this.innerWidth - 32;
    ufo.xd *= -1;
  }
  if (move.y < 0 + _height) {
    move.y = _height;
    ufo.yd *= -1;
  }
  if (move.y > MAX_Y - 32) {
    move.y = MAX_Y - 32;
    ufo.yd *= -1;
  }
  ufo.x = move.x;
  ufo.y = move.y;
  return move;
}

buildName();
setInterval(update, 32);
setInterval(twinkle, 100);
