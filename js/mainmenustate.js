"use strict";

var MainMenu = function () { // TODO figure out how to properly implement super classes
    this.superclass = new State();
    
    this.playButton = new Button(150, 140, 180, 50, "Play");
    this.optionsButton = new Button(150, 205, 180, 50, "Options");
    this.aboutButton = new Button(150, 270, 180, 50, "About");
};

MainMenu.prototype.update = function (mouse, game) {
    this.superclass.update(mouse, game);
    
    if (this.playButton.update(mouse)) {
        game.enterState(new GameState(1));
    }
    if(this.optionsButton.update(mouse)) {
        
    }
    if(this.aboutButton.update(mouse)) {
       
    }
};

MainMenu.prototype.render = function (context) {
    this.superclass.render(context);
    
    this.playButton.render(context);
    this.optionsButton.render(context);
    this.aboutButton.render(context);
    
};
