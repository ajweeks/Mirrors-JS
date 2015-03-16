"use strict";

function Tile(x, y, type) {
    this.BLANK_ID = 0;
    this.MIRROR_ID = 1;
    this.POINTER_ID = 2;
    this.RECEPTOR_ID = 3;
    this.x = x;
    this.y = y;
    this.type = type;
}

Tile.prototype.update = function () {
    
};

Tile.prototype.render = function (context) {
    context.fillStyle = "#702aa3";
    context.fillRect(this.x * 32 + 140, this.y * 32 + 100, 32, 32);
};