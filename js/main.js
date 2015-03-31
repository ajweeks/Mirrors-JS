// Copyright AJ Weeks 2015 

"use strict";

var get = function (what) {
    return document.getElementById(what);
};

var Game = {};

Game.launch = function () {
    Game.version = 0.021;
    
    Game.init = function () {
        
        //-------------------//
        //      IMAGES       //
        //-------------------//
        Game.types = {};
        Game.images = {};// FIXME put images in a better place
        Game.images.lasers = {};
        
        Game.images.blank = new Image();
        Game.types.BLANK = 0;
        
        Game.images.mirror = new Image();
        Game.images.mirror.src = "res/mirror.png";
        Game.images.mirror.alt = "mirror";
        Game.types.MIRROR = 1;
        
        Game.images.pointer = new Image();
        Game.images.pointer.src = "res/pointer.png";
        Game.images.pointer.alt = "pointer";
        Game.types.POINTER = 2;
        
        Game.images.receptor = new Image();
        Game.images.receptor.src = "res/receptor_white.png";
        Game.images.receptor.alt = "receptor";
        Game.types.RECEPTOR = 3;
        
        Game.images.lasers.red = new Image();
        Game.images.lasers.red.src = "res/laser_red.png";
        Game.images.lasers.red.alt = "red laser";
        Game.types.RED = 0;
        
        Game.images.lasers.green = new Image();
        Game.images.lasers.green.src = "res/laser_green.png";
        Game.images.lasers.green.alt = "green laser";
        Game.types.GREEN = 1;
        
        Game.images.lasers.blue = new Image();
        Game.images.lasers.blue.src = "res/laser_blue.png";
        Game.images.lasers.blue.alt = "blue laser";
        Game.types.BLUE = 2;
        
        
        Game.NORTH = 0;
        Game.EAST = 1;
        Game.SOUTH = 2;
        Game.WEST = 3;
        
        Game.NW = 0;
        Game.NE = 1;
        
        Game.ticks = 0;
        Game.fps = 60;
        
        Game.mobile = 0;
//        if (Android | iPhone | iPod) Game.mobile = 1; // LATER add mobile support
        
//        Game.clickStr = Game.mobile ? 'ontouchend' : 'onclick';
        
        Game.mousex = -1;
        Game.mousey = -1;
        Game.lmb = false;
        Game.rmb = false;
        
        Game.keysdown = {};
        
        Game.bgCanvas = get('backgroundCanvas');
        Game.bgCanvas.width = window.innerWidth;
        Game.bgCanvas.height = window.innerHeight;

        Game.gameBoardCanvas = get('gameBoardCanvas');
        
        document.onresize = function () {
            Game.bgCanvas.width = document.innerWidth;
            Game.bgCanvas.height = document.innerHeight;
            Game.render(); // attempt to reduce flicker on resize
        };
        
        Game.prefs = [];
        
        Game.defaultPrefs = function () {
            Game.debug = 1; // RELEASE make 0
            Game.prefs.warn = !Game.debug;
        };
        Game.defaultPrefs();
        
        ////////////////////////////////////////////////////////////////////////////
        //                               STATES                                   //
        ////////////////////////////////////////////////////////////////////////////
        
        Game.BasicState = {
            sm : null,
            
            update : function () {
                if (Game.keysdown[27]) {
                    this.enterPreviousState();
                }
            },
            
            render : function () {
                var context = get('backgroundCanvas').getContext('2d');
                context.fillStyle = "#191919";
                context.fillRect(0, 0, Game.bgCanvas.width, Game.bgCanvas.width); ///////////////////////////////////// <<<<<<<<
            },
            
            enterPreviousState : function () {
                if (this.sm.enterPreviousState()) {
                    this.destroy();
                }
            },
            
            restore : function () {},
            
            destroy : function () {}
        };
    
        
//        Game.BasicState = function (sm) {
//            this.sm = sm;
//            console.log("bs const");
//            
//            this.update = function () {
//                if (Game.keysdown[27]) {
//                    this.enterPreviousState();
//                }
//            };
//            
//            this.render = function () {
//                var context = get('backgroundCanvas').getContext('2d');
//                context.fillStyle = "#191919";
//                context.fillRect(0, 0, Game.WIDTH); ///////////////////////////////////// <<<<<<<<
//            };
//            
//            this.enterPreviousState = function () {
//                if (this.sm.enterPreviousState()) {
//                    this.destroy();
//                }
//            };
//            
//            this.destroy = function () {};
//        };
//    
        Game.MainMenuState = function (sm) {
            this.prototype = Game.BasicState;
            this.constructor = this;
            
            this.init = function (sm) {
                this.prototype.sm = sm;
            };
            
            this.update = function () {
                this.prototype.update();
                if (Game.lmb) {
                    this.prototype.sm.enterState(new Game.GameState(this.prototype.sm));
                    Game.bgCanvas.style.visibility = "hidden";
                }
            };
            
            this.render = function () {
                this.prototype.render();
                var context = get('backgroundCanvas').getContext('2d');
                context.fillStyle = "green";
                context.fillRect(400, 10, 250, 250);
                
                context.fillStyle = "white";
                context.font = "64px Consolas";
                context.fillText("Main Menu!", 400, 60);
            };
            
            this.restore = function () {
                Game.bgCanvas.style.visibility = "visible";
            };
            
            this.destroy = function () {
                this.prototype.destroy();
            };
        };
        
        Game.GameState = function (sm) {
            this.prototype = Game.BasicState;
            this.constructor = this;
            
            this.init = function (sm) {
                this.prototype.sm = sm;
                this.board = new Game.GameState.Board(10, 8);
                Game.gameBoardCanvas.width = this.board.w * this.board.tileSize;
                Game.gameBoardCanvas.height = this.board.h * this.board.tileSize;
                Game.gameBoardCanvas.style.visibility = "visible";
            };
            
            this.update = function () {
                this.prototype.update();
                this.board.update();
            };
            
            this.render = function () {
                this.prototype.render();
                var context = get('gameBoardCanvas').getContext('2d');
                this.board.render(context);
            };
            
            this.restore = function () {
                Game.gameBoardCanvas.style.visibility = "visible";
            };
            
            this.destroy = function () {
                this.prototype.destroy();
                Game.gameBoardCanvas.style.visibility = "hidden";
            };
        };
        
        Game.GameState.Tile = function (type, maxdir, size, init, onmouseup, update, render) {
            Game.GameState.Tile.Laser = function (image) {
                this.image = image;

                this.render = function (context, x, y, dir, size) {
                    Game.renderImage(context, x, y, this.image, dir, size);
                };
            }; // end Game.GameState.Tile.Laser()

            this.size = size;
            this.type = type;
            this.lasers = [];
            this.dir = Game.NORTH;
            this.maxdir = maxdir;

            if (init) this.init = init; // SETUP ANY REQUIRED VARIBLES HERE
            else this.init = function (that) {
                // Default init function
            };

            if (onmouseup) this.onmouseup = onmouseup;
            else {
                // Default onmouseup function
                this.onmouseup = function () {
                    if (Game.lmb) {
                        // Rotate clockwise by default on left click
                        this.dir += 1;
                        if (this.dir > this.maxdir) this.dir = 0;
                    } else if (Game.rmb) {
                        // Do nothing by default on right click
                    }
                };
            }

            if (update) this.update = update;
            else {
                this.update = function () {
                    // Default update function here
                };
            }
            
            if (render) this.render = render;
            else this.render = function (context, x, y) {
                // Default render function

                for (var i = 0; i < this.lasers.length; i++) {
                    this.lasers[i].render(context, x, y, this.dir);
                }

                var image = Game.images.blank;
                switch (this.type) {
                    case Game.types.BLANK:
                        image = Game.images.blank;
                        break;
                    case Game.types.MIRROR:
                        image = Game.images.mirror;
                        break;
                    case Game.types.POINTER:
                        image = Game.images.pointer;
                        break;
                    case Game.types.RECEPTOR:
                        image = Game.images.receptor;
                        break;
                }

                Game.renderImage(context, x, y, image, this.dir, this.size);

                // LATER implement debug overlay
//                    var xx = Math.floor((x - this.size / 2) / this.size),
//                        yy = Math.floor((y - this.size / 2) / this.size);
//                    if (Game.debug && Game.mouseContains(xx, yy, this.size)) {
//                        context.strokeStyle = "white";
//                        context.font = "32px Consolas";
//                        context.strokeText(x + " " + y, Game.mousex, Game.mousey);
//                    }
            };

            this.addLaser = function (laser) {
                this.lasers.push(laser);
            };

            this.removeLaser = function (laser) {
                if (this.lasers.indexOf(laser) > -1) {
                    this.lasers.pop();
                }
            };

            this.removeAllLasers = function () {
                for (var laser in this.lasers) {
                    this.lasers.pop();
                }
            };

            this.copy = function () {
                return new Game.GameState.Tile(this.type, this.maxdir, this.size, this.init, this.onmouseup, this.update, this.render);
            };

            this.init(this.dir, this.size);
        }; // end Game.GameState.Tile()


        Game.GameState.Board = function (w, h) {
            this.w = w;
            this.h = h;
            this.tiles = [w * h];
            this.tileSize = 64;

            Game.GameState.Board.BlankTile = new Game.GameState.Tile(Game.types.BLANK, 0, this.tileSize, null /* init */, null /* onmouseup */, null /* update */, null /* render */);
            Game.GameState.Board.MirrorTile = new Game.GameState.Tile(Game.types.MIRROR, 1, this.tileSize, null /* init */, null /* onmouseup */, null /* update */, null /* render */);
            Game.GameState.Board.PointerTile = new Game.GameState.Tile(Game.types.POINTER, 3, this.tileSize, 
            function (dir, size) { /* init */
                this.on = false;
                this.dir = dir;
                this.size = size;
            },
            function () { /* onmouseup */
                if (Game.lmb) {
                    this.dir += 1;
                    if (this.dir > this.maxdir) this.dir = 0;
                } else if (Game.rmb) {
                    this.on = !this.on;
                    if (this.on == false) {
                        this.removeAllLasers();
                    } else {
                        if (this.lasers.length == 0) {
                            this.lasers.push(new Game.GameState.Tile.Laser(Game.images.lasers.blue));
                        }
                    }
                }
            },
            function () { /* update */
                if (this.on === false) return;
                
                // start laser chain LATERLGATELAGLELSLRLSLARELATERLATERLAEERLATER=---==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==--==--=-=-=-=-=-==-=-=-=--=-=-=
                var checkedTiles = [this.w * this.h],
                    nextDir = this.dir,
                    xx = 0;
            },
            function (context, x, y) { /* render */
                if (this.on) Game.renderImage(context, x, y, Game.images.lasers.red, this.dir, this.size);
                Game.renderImage(context, x, y, Game.images.pointer, this.dir, this.size);
            });
            Game.GameState.Board.ReceptorTile = new Game.GameState.Tile(Game.types.RECEPTOR, 3, this.tileSize, null /* init */, null /* onmouseup */, null /* update */, null /* render */);

            for (var i = 0; i < w * h; i++) {
                if (i % 2 == 0) this.tiles[i] = Game.GameState.Board.MirrorTile.copy();
                else if (i % 3 == 0) this.tiles[i] = Game.GameState.Board.PointerTile.copy();
                else this.tiles[i] = Game.GameState.Board.ReceptorTile.copy();
            }

            this.update = function () {
                if (Game.lmb || Game.rmb) {
                    var xx = Math.floor(Game.mousex / this.tileSize),
                        yy = Math.floor(Game.mousey / this.tileSize);
                    this.tiles[yy * this.w + xx].onmouseup();

                    //remove all lasers (except for pointer tiles
                    for (var i = 0; i < this.tiles.length; i++) {
                        if (this.tiles[i].type != Game.types.POINTER) this.tiles[i].removeAllLasers();
                    }

                    for (var i = 0; i < w * h; i++) {
                        this.tiles[i].update();
                    }
                }
            };

            this.render = function (context) {
                context.fillStyle = '#0a0a0a';
                context.fillRect(0, 0, this.w * this.tileSize, this.h * this.tileSize);

                context.strokeStyle = 'gray';
                for (var i = 0; i < w * h; i++) {
                    context.strokeRect((i % w) * this.tileSize, Math.floor(i / w) * this.tileSize, this.tileSize, this.tileSize);
                    this.tiles[i].render(context, (i % w) * this.tileSize + this.tileSize / 2, Math.floor(i / w) * this.tileSize + this.tileSize / 2);
                };
            };
        }; // end Game.GameState.Board

//        Game.MainMenuState
//           //  Create button divs
//            
//            this.update = function () {
//                // immediately enter game state
//                if (Game.lmb) {
//                    Game.bgCanvas.style.visibility = "hidden";
//                    this.sm.enterState(new Game.GameState(this.sm));
//                }
//            };
//            
//            this.render = function () {
//                var context = Game.bgCanvas.getContext('2d');
//                context.font = "bold small-caps 42px sans-serif";
//                context.fillText("Test", 112, 81);
//
//                context.save();
//                context.translate(32, 32);
//                context.rotate((Math.PI / 2) * Game.NORTH);
//                context.drawImage(Game.images.pointer, -32, -32);
//                context.restore();
//
//                context.save();
//                context.translate(96, 32);
//                context.rotate((Math.PI / 2) * Game.EAST);
//                context.drawImage(Game.images.mirror, -32, -32);
//                context.restore();
//            };
//            
//            this.enterPreviousState = function () {
//                //there are no previous states to enter!
//            };
//            
//            // Gets called when this becomes the current state again (after being hidden)
//            this.restore = function () {
//                Game.bgCanvas.style.visibility = "visible";
//            };
//            
//            this.destroy = function () {
//                
//            };
//        }; // end Game.MainMenuState
        
        Game.StateManager = function () {
            this.states = [];
            this.states.push(new Game.MainMenuState(this));
            this.states[0].init(this);
            
            this.update = function () {
                this.states[this.states.length - 1].update();
            };
            
            this.render = function () {
                this.states[this.states.length - 1].render();
            };
            
            this.enterState = function (state) {
                this.states.push(state);
                this.states[this.states.length - 1].init(this);
                Game.lmb = false;
            };
            
            this.enterPreviousState = function () {
                Game.lmb = false;
                Game.rmb = false;
                if (this.states.length > 1) {
                    this.states.pop();
                    this.states[this.states.length - 1].restore();
                    return true;
                }
                return false;
            };
        }; // end Game.StateManager()
        Game.sm = new Game.StateManager();
        
//        Game.GameState = function (sm) {
//            
//            this.sm = sm;
//            this.board = new Game.GameState.Board(10, 9);
//            
//            Game.gameBoardCanvas.style.visibility = "visible";
//            Game.gameBoardCanvas.width = this.board.w * this.board.tileSize;
//            Game.gameBoardCanvas.height = this.board.h * this.board.tileSize;
//            
//            this.update = function () {
//                if (Game.keysdown[27]) {
//                    this.enterPreviousState();
//                    return;
//                }
//                this.board.update();
//            };
//            
//            this.render = function () {
//                this.board.render();
//            };
//            
//            this.enterPreviousState = function () {
//                this.destroy();
//                this.sm.enterPreviousState();
//            };
//                        
//            // Gets called when this becomes the current state again (after being hidden)
//            this.restore = function () {
//                Game.gameBoardCanvas.style.visibility = "visible";
//            };
//            
//            // Gets called right before this state is deleted
//            this.destroy = function () {
//                Game.gameBoardCanvas.style.visibility = "hidden";
//            };
//            
//        }; // end Game.GameState()
        
        Game.renderImage = function (context, x, y, image, dir, size) {
            context.save();
            context.translate(x, y);
            context.rotate(dir * 90 * (Math.PI / 180));

            context.drawImage(image, -size / 2, -size / 2);
            context.restore();
        };
        
        Game.update = function () {
            Game.ticks += 1;
            Game.sm.update();
            Game.lmb = false;
            Game.rmb = false;
        };
        
        Game.render = function () {
//            var context = Game.bgCanvas.getContext('2d');
            Game.sm.render();
        };
        
    }; // end Game.init()
    
    // Main loop
    Game.loop = function () {
        Game.update();
        if (document.hasFocus() || Game.ticks % 5 === 0) {
            Game.render();
        }
        setTimeout(Game.loop, 1000 / Game.fps);
    };
    
}; // end Game.launch()

Game.launch();

function rightClick(event) {
    // prevent default context menu from appearing, the actual click is handled in boardClick()
    return false;
}

function boardClick(event) {
    Game.mousex = event.offsetX;
    Game.mousey = event.offsetY;
    if ("which" in event) { // firefox, safari, chrome, opera
        if (event.which === 1) Game.lmb = true;
        else if (event.which === 3) Game.rmb = true;
    } else if ("button" in event) { // IE 8+, opera
        if (event.button === 0) Game.lmb = true;
        else if (event.button === 2) Game.rmb = true;
    }
};

function boardHover(event, inside) {
    if (inside) {
        Game.mousex = event.offsetX;
        Game.mousey = event.offsetY;
    } else {
        Game.mousex = -1;
        Game.mousey = -1;
    }
};

function keyPressed(event, down) {
    Game.keysdown[event.keyCode ? event.keyCode : event.which] = down;
};

window.onkeydown = function (event) { keyPressed(event, true); };
window.onkeyup = function (event) { keyPressed(event, false); };

window.onbeforeunload=function(event) {
    if (Game.prefs.warn) {
        if (typeof event == 'undefined') event = window.event;
        if (event) event.returnValue='Are you sure you want to close Mirrors?';
    }
}

window.onload = function () {
    Game.init();
    Game.loop();
};
