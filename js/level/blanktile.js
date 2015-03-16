"use strict";

function BlankTile(x, y) {
    this.superclass = new Tile(x, y, Tile.BLANK_TILE_ID);
    
}

BlankTile.prototype.update = function () {
    this.superclass.update();
    
};

BlankTile.prototype.render = function (context) {
    this.superclass.render(context);
    
    context.fillStyle = "#ffffff";
    context.fillRect(this.x * 32 + 140, this.y * 32 + 100, 32, 32); // FIXME why doesn't the sub class render here?
};