"use strict";

function Direction(dir) {
    this.dir = dir;
}

//Direction.prototype.decode = function () {
//    return this.directions[this.dir];
//};

//Direction.prototype.encode = function () {
//    return this.directions.indexOf(this.dir);
//};

Direction.prototype.clockwise = function () {
    this.dir += 1;
    if (this.dir > 3) {
        this.dir = 0;
    }
};

Direction.prototype.anticlockwise = function () {
    this.dir -= 1;
    if (this.dir < 0) {
        this.dir = 3;
    }
};

Direction.prototype.add = function (dir) {
    this.dir = (this.dir + dir) % 4;
};

Direction.prototype.sub = function (dir) {
    var result = this.dir - dir;
    if (result < 0) {
        this.dir = (4 + result) % 4;
    } else {
        this.dir = result;
    }
};

Direction.prototype.opposite = function () {
    if (this.dir === "n") {
        this.dir = "s";
    } else if (this.dir === "e") {
        this.dir = "w";
    } else if (this.dir === "s") {
        this.dir = "n";
    } else if (this.dir === "w") {
        this.dir = "e";
    } else {
        console.log("Invalid direction!! Direction: " + this.dir);
    }
};