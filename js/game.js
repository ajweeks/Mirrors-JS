"use strict";

function Game(state) {
    this.state = state;
}

Game.prototype.update = function (mouse) {
    this.state.update(mouse, this);
};

Game.prototype.enterState = function (state) {
    this.state = state;
};

Game.prototype.render = function (context) {
    this.state.render(context);
};

