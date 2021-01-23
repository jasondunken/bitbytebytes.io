let map = [];
let nextMap = [];
let _width,
  _height = 0;

function setup() {
  frameRate(15);
  _width = window.innerWidth;
  _height = 145;
  let canvas = createCanvas(_width, _height);
  canvas.parent("p5-container");

  // initialize map arrays to 0 (empty)
  for (let i = 0; i < _width * _height; i++) {
    map[i] = 0;
    nextMap[i] = 0;
  }

  // randomly set n cells to 1 (occupied)
  for (let i = 0; i < 10000; i++) {
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
        pixels[i * 4 + 2] = 255;
        pixels[i * 4] = pixels[i * 4 + 1] = 0;
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
  for (let i = -1; i < 2; i++) {
    let cell = index + i - _width;
    if (cell < 0) {
      //do nothing;
    } else {
      if (map[cell] >= 1) {
        walls++;
      }
    }
  }
  for (let i = -1; i < 2; i++) {
    let cell = index + i;
    if (cell < 0 || cell >= map.length) {
      //do nothing;
    } else {
      if (i != 0 && map[cell] >= 1) walls++;
    }
  }
  for (let i = -1; i < 2; i++) {
    let cell = index + i + _width;
    if (cell >= map.length) {
      //do nothing;
    } else {
      if (map[cell] >= 1) walls++;
    }
  }
  return walls;
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
  let t_color = () => {
    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);
    return "rgb(" + r + ", " + g + ", " + b + ");";
  };
  let index = Math.floor(Math.random() * letters.length);
  letters[index].style = "color: " + t_color();
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
      let speed = Math.random() * 3 + 2;
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
  if (move.y < 0) {
    move.y = 0;
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
