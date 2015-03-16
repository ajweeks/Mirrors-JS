"use strict";

var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60); };

var mouse = null,
    canvas = null,
    context = null,
    game = null,
    mouse = null,
    
    init = function () {
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');
        
        this.mouse = {
            ldown : false, // lmb is down
            lup : false, // lmb was just released
            x : 0,
            y : 0,
            handleMove : function (event) {
                mouse.x = event.offsetX;
                mouse.y = event.offsetY;
            },
            handleClick : function (down) {
                if (down) {
                    mouse.ldown = down;
                    mouse.lup = false;
                } else { // down is 
                    if (mouse.ldown) { // mouse was just 
                        mouse.lup = true;
                    } else {
                        mouse.lup = false;
                    }
                    mouse.ldown = false;
                }
            },
            update : function () {
                mouse.lup = false;
            }
        };
        
        
        this.canvas.addEventListener('mousemove', this.mouse.handleMove, false);
        this.canvas.addEventListener('mousedown', function (event) { mouse.handleClick(true); }, false);
        this.canvas.addEventListener('mouseup', function (event) { mouse.handleClick(false); }, false);
        
        this.canvas.width = 480;
        this.canvas.height = 544;
        
        this.game = new Game(new MainMenu());
    },

    step = function () {
        game.update(this.mouse);
        
        this.mouse.update();
        
        context.fillStyle = "#2a2a2a"; // off black
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
        game.render(this.context);
        animate(step);
    };

window.onload = function () {
    this.init();
    animate(step);
};
