"use strict";

var GameState = function (level) {
    new State();
    
    this.level = level;
    this.tiles = new Array(6 * 11);
    for(var i = 0; i < this.tiles.length; i++) {
        this.tiles[i] = new BlankTile(i % 6, (i / 6) | 0);
    }
};

GameState.prototype.update = function (mouse, game) {
    State.prototype.update(mouse, game);
    
};

GameState.prototype.render = function (context) {
    State.prototype.render(context);
    
    context.fillStyle = "orange";
    context.fillText("Game state! lvl: " + this.level, 10, 75);
    
    for(var i = 0; i < this.tiles.length; i++) {
        this.tiles[i].render(context);
    }
};