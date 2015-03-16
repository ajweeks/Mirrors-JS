"use strict";

function Button(x, y, w, h, text) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.col = "red";
    this.text = text;
}

Button.prototype.update = function (mouse) {
    if (mouse.x > this.x && mouse.x < this.x + this.w && mouse.y > this.y && mouse.y < this.y + this.h) {
        if (mouse.ldown) {
            this.col = "#710093";
        } else {
            this.col = "#8400ac";
        }
        return mouse.lup;
    } else {
        this.col = "#9c03c9";
    }
    return false;
};

Button.prototype.render  = function (context) {
    context.fillStyle = this.col;
    context.fillRect(this.x, this.y, this.w, this.h);
    
    context.fillStyle = "white";
    context.font = "38px Consolas";
    context.fillText(this.text, this.x + 26, this.y + 38);
};
