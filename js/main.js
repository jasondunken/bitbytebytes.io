function buildName() {
    let _name = '';
    let name_ = "BITbyteBYTES.io";
    for (let l = 0; l < name_.length; l++) {
        let next = "<span class='ltr'>" + name_[l] + "</span>";
        _name += next;
    }
    document.querySelector('.logo').innerHTML = _name;
}

function twinkle() {
    let letters = document.getElementsByClassName('ltr');
    let t_color = () => {
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        return 'rgb(' + r + ', ' + g + ', ' + b + ');';
    };
    let index = Math.floor(Math.random() * letters.length);
    letters[index].style = "color: " + t_color();
}

let ufos = [];
const MAX_Y = 400;

function update() {
    let ufo = document.getElementsByClassName('ufo');
    for (let i = 0; i < ufo.length; i++) {
        if (!ufos[i]) {
            let x_start = Math.random() * this.innerWidth;
            let y_start = Math.random() * MAX_Y;
            let x_dir = Math.random() > 0.5 ? 1 : -1;
            let y_dir = Math.random() > 0.5 ? 1 : -1;
            let speed = (Math.random() * 3) + 2;
            ufos[i] = { x: x_start, y: y_start, xd: x_dir, yd: y_dir, s: speed, type: 'none', state: 'none' };
        }
        let move = move_mob(ufos[i]);
        ufo[i].style = 'position: absolute; top: ' + move.y + 'px; left: ' + move.x + 'px;';
    }
}

function move_mob(ufo) {
    let move = {};
    move.x = ufo.x + (ufo.s * ufo.xd);
    move.y = ufo.y + (ufo.s * ufo.yd);
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