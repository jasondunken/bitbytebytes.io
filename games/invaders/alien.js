function Alien(x, y) {
    this.r = 15;
    this.posx = x;
    this.posy = y;
    this.moveSpeed = 1;
    this.dead = false;
}

Alien.prototype.render = function() {
    noStroke();
    fill("GREEN");
    ellipse(this.posx, this.posy, this.r, this.r);
};

Alien.prototype.move = function(multiplier) {
    this.posx += this.moveSpeed * multiplier;
};