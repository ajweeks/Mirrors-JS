// Copyright AJ Weeks 2015 
/* jshint browser: true */
/* jshint devel: true */
/* global Stats */
/* global Bugsnag */

var get = function (what) {
    return document.getElementById(what);
};

var Game = {};

Game.init = function () {
    Game.version = 0.035;
    document.title = "Mirrors V" + Game.version;
    get('versionNumber').innerHTML = '<a href="https://github.com/ajweeks/mirrors-js" target="_blank" style="color: inherit; text-decoration: none;">' + "V." + Game.version + '</a>';
    
    Game.releaseStages = { DEVELEOPMENT: "development", PRODUCTION: "production" };
    Game.releaseStage = Game.releaseStages.DEVELEOPMENT; // RELEASE make production
    
//    Bugsnag.appVersion = Game.version;
//    Bugsnag.releaseStage = Game.releaseStages.DEVELEOPMENT; 
//    Bugsnag.notifyReleaseStages = [Game.releaseStages.PRODUCTION];
    
    Game.types = {};
    Game.types.tiles = {};
    Game.types.colours = {};
    Game.types.states = {};
    
    Game.types.tiles.BLANK = 0;
    Game.types.tiles.MIRROR = 1;
    Game.types.tiles.POINTER = 2;
    Game.types.tiles.RECEPTOR = 3;
    
    Game.types.colours.RED = 0;
    Game.types.colours.GREEN = 1;
    Game.types.colours.BLUE = 2;
    Game.types.colours.WHITE = 3;
    
    Game.types.states.MAIN_MENU = "mainmenustate";
    Game.types.states.GAME = "gamestate";
    Game.types.states.ABOUT = "aboutstate";
    Game.types.states.LEVEL_SELECT = "levelselectstate";
    
    Game.selectedTile = Game.types.tiles.BLANK;
    
    Game.saveLocation = "Mirrors";
    
    //-------------------//
    //      IMAGES       //
    //-------------------//
    
    Game.images = {};
    Game.images.lasers = {};
    
    Game.images[Game.types.tiles.BLANK] = new Image();
    Game.images[Game.types.tiles.BLANK].src = "res/blank.png";
    Game.images[Game.types.tiles.BLANK].alt = "blank";

    Game.images[Game.types.tiles.MIRROR] = new Image();
    Game.images[Game.types.tiles.MIRROR].src = "res/mirror.png";
    Game.images[Game.types.tiles.MIRROR].alt = "mirror";

    Game.images[Game.types.tiles.POINTER] = new Image();
    Game.images[Game.types.tiles.POINTER].src = "res/pointer.png";
    Game.images[Game.types.tiles.POINTER].alt = "pointer";

    Game.images[Game.types.tiles.RECEPTOR] = {};
    Game.images[Game.types.tiles.RECEPTOR][Game.types.colours.WHITE] = new Image();
    Game.images[Game.types.tiles.RECEPTOR][Game.types.colours.WHITE].src = "res/receptor_white.png";
    Game.images[Game.types.tiles.RECEPTOR][Game.types.colours.WHITE].alt = "receptor";
    
    Game.images[Game.types.tiles.RECEPTOR][Game.types.colours.RED] = new Image();
    Game.images[Game.types.tiles.RECEPTOR][Game.types.colours.RED].src = "res/receptor_red.png";
    Game.images[Game.types.tiles.RECEPTOR][Game.types.colours.RED].alt = "receptor";
    
    Game.images[Game.types.tiles.RECEPTOR][Game.types.colours.GREEN] = new Image();
    Game.images[Game.types.tiles.RECEPTOR][Game.types.colours.GREEN].src = "res/receptor_green.png";
    Game.images[Game.types.tiles.RECEPTOR][Game.types.colours.GREEN].alt = "receptor";
    
    Game.images[Game.types.tiles.RECEPTOR][Game.types.colours.BLUE] = new Image();
    Game.images[Game.types.tiles.RECEPTOR][Game.types.colours.BLUE].src = "res/receptor_blue.png";
    Game.images[Game.types.tiles.RECEPTOR][Game.types.colours.BLUE].alt = "receptor";

    Game.images.lasers[Game.types.colours.RED] = [];
    Game.images.lasers[Game.types.colours.RED] = new Image();
    Game.images.lasers[Game.types.colours.RED].src = "res/laser_red.png";
    Game.images.lasers[Game.types.colours.RED].alt = "red laser";

    Game.images.lasers[Game.types.colours.GREEN] = new Image();
    Game.images.lasers[Game.types.colours.GREEN].src = "res/laser_green.png";
    Game.images.lasers[Game.types.colours.GREEN].alt = "green laser";

    Game.images.lasers[Game.types.colours.BLUE] = new Image();
    Game.images.lasers[Game.types.colours.BLUE].src = "res/laser_blue.png";
    Game.images.lasers[Game.types.colours.BLUE].alt = "blue laser";

    Game.tileSize = 64;

    Game.offset = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // tile offsets (N, E, S, W)
    Game.NORTH = 0;
    Game.EAST = 1;
    Game.SOUTH = 2;
    Game.WEST = 3;

    Game.NW = 0;
    Game.NE = 1;

    Game.ticks = 0;
    Game.fps = 65;

    Game.lvlselectButtonSpeed = 6; // the speed the level selection buttons are going
    Game.lvlselectButtonDirection = 0;
    
    Game.KEYBOARD = {
    BACKSPACE: 8,
    TAB:       9,
    RETURN:   13,
    ESC:      27,
    SPACE:    32,
    PAGEUP:   33,
    PAGEDOWN: 34,
    END:      35,
    HOME:     36,
    LEFT:     37,
    UP:       38,
    RIGHT:    39,
    DOWN:     40,
    INSERT:   45,
    DELETE:   46,
    ZERO:     48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
    A:        65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
    TILDE:    192
    };
    Game.keysdown = [];
    
    Game.makeLevel = function (obj) {
        var object = (obj === undefined ? Game.levels[0].copy() : obj.copy()), w = object.w, h = object.h, i;
        for (i = 0; i < w * h; i++) {
            object.tiles[i] = new Game.GameState.Tile(i % w, Math.floor(i / w), object.tiles[i], 0);
        }
        return object;
    };
    
    Game.level = function(w, h, tiles) {
        this.w = w;
        this.h = h;
        this.tiles = tiles;
        this.completed = false;

        this.copy = function () {
            return new Game.level(this.w, this.h, this.tiles.slice());
        };
    };
        
    Game.levels = [
        new Game.level(10, 8, [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]),
        new Game.level(10, 8, [2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    ];
    
    // Game.clickStr = Game.mobile ? 'ontouchend' : 'onclick';
    
    Game.stats = new Stats();
    Game.stats.setMode(0); // 0: fps, 1: ms
    Game.stats.domElement.style.position = 'absolute';
    Game.stats.domElement.style.left = '0px';
    Game.stats.domElement.style.top = '0px';
    document.body.appendChild( Game.stats.domElement );

    Game.prefs = [];

    Game.defaultPrefs = function () {
        setDebug(Game.releaseStage === Game.releaseStages.DEVELEOPMENT);
        setLevelEditMode(false);
        Game.prefs.warn = !Game.debug;
    };
    Game.defaultPrefs();

    // @param text: text to display
    // @param state: the state to enter when this object is clicked
    Game.StateButton = function (text, state, callback, w, h) {
        this.text = text + "Button";

        get('mainmenubuttons').innerHTML += '<div class="button" id="' + this.text + '" style="width: ' + w + 'px; height: ' + h + 'px; line-height: ' + h + 'px;"' +
            'onclick="Game.sm.enterState(\'' + state + '\');' + (callback||'') + '">' + text +'</div>';

        this.hide = function () {
            // no need to hide the individual elements, the container div ('mainmenubuttons') will get hidden if/when needed
            // get(this.text).style.display = "none";
        };

        this.restore = function () {
            // no need to hide the individual elements, the container div ('mainmenubuttons') will get hidden if/when needed
            // get(this.text).style.display = "block";
        };
        
        this.remove = function () {
            get('mainmenubuttons').removeChild(get(this.text));
        };

    }; // end Game.StateButton


    ////////////////////////////////////////////////////////////////////////////
    //                               STATES                                   //
    ////////////////////////////////////////////////////////////////////////////

    Game.MainMenuState = function () {
        this.type = Game.types.states.MAIN_MENU;
        
        new Game.StateButton("Play", Game.types.states.LEVEL_SELECT, "", 180, 80);
        new Game.StateButton("About", Game.types.states.ABOUT, "", 180, 80);

        this.init = function (sm) {
            this.sm = sm;
        };

        this.update = function () {};

        this.render = function () {};

        // gets called when another state is placed on top of the stack and therefore covering this one
        this.hide = function () {
            get('mainmenubuttons').style.display = "none";
        };

        this.restore = function () {
            get('mainmenubuttons').style.display = "block";
        };

        this.destroy = function () {
            // should never be called, this state is always in memory
            assert(false, "Main Menu State is being destroyed!! D:");
        };
    }; // end Game.MainMenuState

    Game.AboutState = function () {
        this.init = function (sm) {
            this.sm = sm;
            this.type = Game.types.states.ABOUT;
            get('aboutstate').style.display = "block";
        };

        this.update = function () {};

        this.render = function () {};

        this.hide = function () {};
        
        this.restore = function () {
            get('aboutstate').style.display = "block";
        };

        this.destroy = function () {
            get('aboutstate').style.display = "none";
        };
    };
    
    Game.LevelSelectState = function () {
        this.init = function (sm) {
            this.sm = sm;
            this.type = Game.types.states.LEVEL_SELECT;
            this.height = 8;
            this.numOfLevels = 64;
            this.offset = 150;
            this.maxOffset = -(Math.ceil(this.numOfLevels / this.height) * 250 - window.innerWidth + 150);
            get('levelselectstate').style.display = "block";
            var x, y, str = '', n;
            for (x = 0; x < Math.ceil(this.numOfLevels / this.height); x++) { // for every column
                str += '<div class="col">';
                for (y = 0; y < this.height; y++) { // for every item in the column
                    n = (x * this.height) + y;
                    str += '<div class="button lvlselect" id="' + n + 'lvlselectButton" ' +
                        (Game.levels[n] === undefined ? '' : 'onmousedown="if (clickType(event)===\'left\') Game.sm.enterState(\'gamestate\', ' + n + ');"') +
                        '>' + decimalToHex(n) + '</div>';
                }
                str += '</div>';
            }
            str += '<div id="backarrow" onmouseover="Game.lvlselectButtonDirection=1;" onmouseout="Game.lvlselectButtonDirection = 0;" style="visibility: hidden"><p>&#9664;</p></div>';
            str += '<div id="forwardarrow" onmouseover="Game.lvlselectButtonDirection=-1" onmouseout="Game.lvlselectButtonDirection = 0;"><p>&#9654;</p></div>';
            str += '<div class="button" onmousedown="if (clickType(event)===\'left\') Game.sm.enterPreviousState();" style="margin-left: -90px; margin-top: -490px;">Back</div>';
            get('levelselectstate').style.width = 250 * Math.ceil(this.numOfLevels / this.height) + 'px'; // LATER make this better, but this works for now I guess
            get('levelselectstate').style.marginLeft = '150px';
            get('levelselectstate').style.marginTop = '80px';
            get('levelselectstate').innerHTML = str;
            
            this.updateButtonBgs();
        };

        this.update = function () {
            this.offset += Game.lvlselectButtonSpeed * Game.lvlselectButtonDirection;
            if (this.offset >= 150) {
                this.offset = 150;
                get('backarrow').style.visibility = "hidden";
            } else if (this.offset <= this.maxOffset) {
                this.offset = this.maxOffset;
                get('forwardarrow').style.visibility = "hidden";
            } else {
                get('forwardarrow').style.visibility = "visible";
                get('backarrow').style.visibility = "visible";
            }

            get('levelselectstate').style.marginLeft = this.offset + 'px';
        };

        this.render = function () {};

        this.updateButtonBgs = function () {
            var i;
            for (i = 0; i < Game.levels.length; i++) {
                get(i + 'lvlselectButton').style.cursor = "pointer";
                if (Game.levels[i].completed === true) {
                    get(i + 'lvlselectButton').style.backgroundColor = "#007900";
                } else {
                    get(i + 'lvlselectButton').style.backgroundColor = "#501967";
                }
            }
        };
        
        this.hide = function () {
            get('levelselectstate').style.display = "none";
        };
        
        this.restore = function () {
            this.updateButtonBgs();
            get('levelselectstate').style.display = "block";
        };

        this.destroy = function () {
            get('levelselectstate').style.display = "none";
        };
    };
    
    // LATER add a tutorial overlay? controls at least?
    
    Game.GameState = function () {
        this.init = function (sm, levelNum) {
            this.sm = sm;
            this.type = Game.types.states.GAME;
            this.levelNum = levelNum;
            if (!this.loadBoard()) {
                this.setBoard(Game.makeLevel(Game.levels[levelNum]));
            }
            
            var lvledittiles = '<div>' +
                '<div class="selectionTile" id="0tile" onmousedown="selectionTileClick(event, true, 0);" onmouseup="selectionTileClick(event, false, 0);" style="background-image: url(res/blank.png)"></div>' +
                '<div class="selectionTile" id="1tile" onmousedown="selectionTileClick(event, true, 1);" onmouseup="selectionTileClick(event, false, 1);" style="background-image: url(res/mirror.png)"></div>' +
                '<div class="selectionTile" id="2tile" onmousedown="selectionTileClick(event, true, 2);" onmouseup="selectionTileClick(event, false, 2);" style="background-image: url(res/pointer.png)"></div>' +
                '<div class="selectionTile" id="3tile" onmousedown="selectionTileClick(event, true, 3);" onmouseup="selectionTileClick(event, false, 3);" style="background-image: url(res/receptor_white.png)"></div>' +
                '<div class="selectionTile" id="saveButton" style="background-color: red" onmousedown="selectionTileClick(event, true, 999)"></div>' +
                '</div>';
            get('lvledittiles').innerHTML = lvledittiles;
            
            get('lvledittilescanvas').width = Game.tileSize;
            get('lvledittilescanvas').height = 4 * Game.tileSize;
            
            if (Game.levelEditMode) {
                get('lvledittilesarea').style.display = "block";
            }
        };
        
        this.setBoard = function (obj) {
            this.board = new Game.GameState.Board(obj.w, obj.h, this);
            this.board.createBoard(obj.tiles);
            get('gameboard').style.display = "block";
        };

        /*
        //
        // The game board is saved using local storage, with each level being saved in a different key-value pair
        // Use pipes ('|') to separate items, and commas (',') to separate properties of each item
        //
        */
        this.saveBoard = function () {
            var str = '', i, j, tile, receptors;
            if(typeof(Storage) === "undefined") {
                console.log("Why you gotta be using such an old broser bro? :( failed to save data.");
                return; // LATER USE COOKIES HERE INSTEAD?
            }
            
            str += Game.version + '|';
            // store game board
            str += this.board.w + ',' + this.board.h + '|';
            for (i = 0; i < this.board.tiles.length; i++) {
                tile = this.board.tiles[i];
                switch (tile.type) {
                    case Game.types.tiles.BLANK:
                        break; // Don't store blank tiles, any tile position that isn't saved is assumed to be blank
                    case Game.types.tiles.MIRROR:
                        str += 'M,' + i + ',' + tile.dir + '|';
                        break;
                    case Game.types.tiles.POINTER:
                        str += 'P,' + i + ',' + tile.dir + ',' + getBoolShorthand(tile.on) + ',' + tile.lasers[0].colour + '|';
                        break;
                    case Game.types.tiles.RECEPTOR:
                        receptors = 'XXXX';
                        for (j = 0; j < 4; j++) {
                            if (tile.receptors[j] !== null) receptors = receptors.substring(0, j) + getColourShorthand(tile.receptors[j].colour) + receptors.substring(j + 1);
                        }
                        str += 'R,' + i + ',' + tile.dir + ',' + receptors + '|';
                        break;

                }
            }
            window.localStorage.setItem(Game.saveLocation + ' lvl: ' + this.levelNum, encodeURI(str)); // LATER add more encryption to prevent cheating!
        }; // end of saveBoard
        
        // LATER add string exporting to make default level creation easier
        
        /* Returns whether or not we were able to load data */
        this.loadBoard = function () {
            var data, storage, tiles, i, w, h;
            if(typeof(Storage) === "undefined") {
                console.log("Why you gotta be using such an old broser bro? :( failed to load data.");
                return false;
            }
            
            storage = window.localStorage.getItem(Game.saveLocation + ' lvl: ' + this.levelNum);
            if (storage !== null) data = decodeURI(storage).split('|').filter(function(n) { return n !== ''; });
            if (data === undefined) {
                console.error("Failed to load level data for level " + this.levelNum + "! Using default level.");
                return false;
            }
            
            w = parseInt(data[1].split(',')[0]);
            h = parseInt(data[1].split(',')[1]);
            tiles = [w * h];
            
            for (i = 0; i < w * h; i++) {
                tiles[i] = new Game.GameState.Tile(0, 0, Game.types.tiles.BLANK, 0);
            }
            
            for (i = 2; i < data.length; i++) {
                var info = data[i].split(','), type = info[0], pos = parseInt(info[1]), dir = parseInt(info[2]);
                console.log(info);
                switch (type) {
                    case 'M':
                        tiles[pos] = new Game.GameState.Tile(pos % w, Math.floor(pos / w), Game.types.tiles.MIRROR, dir);
                        break;
                    case 'P':
                        tiles[pos] = new Game.GameState.Tile(pos % w, Math.floor(pos / w), Game.types.tiles.POINTER, dir, [parseInt(info[3]), parseInt(info[4])]); 
                        ////////////////////////////////////////////////////////////////////////////////
                        /////////////// LATER CLEAN UP GOD DAMN TILE JANKY-NESS. UGH. //////////////////
                        ////////////////////////////////////////////////////////////////////////////////
                        break;
                    case 'R':
                        tiles[pos] = new Game.GameState.Tile(pos % w, Math.floor(pos / w), Game.types.tiles.RECEPTOR, dir, [info[3]]);
                        tiles[pos].receptors = [];
                        console.log(info);
                        break;
                    default:
                        console.error("unknown type saved in local storage: " + type);
                        break;
                    
                }
            }
            
            // LATER version check on board load
            this.board = new Game.GameState.Board(w, h, this);
            this.board.createBoard(tiles.slice());
            get('gameboard').style.display = "block";
            
            return true;
        }; // end of loadBoard()
        
        this.update = function () {
            this.board.update();
        };

        this.render = function () {
            this.board.render();
            var context;
            if (Game.levelEditMode) {
                context = get('lvledittilescanvas').getContext('2d');
                for (var i = 0; i < 4; i++) {
                    if (Game.selectedTile === i) context.fillStyle = "#134304";
                    else context.fillStyle = "#121212";
                    context.fillRect(0, i * Game.tileSize, Game.tileSize, Game.tileSize);
                }
            }
        };

        this.restore = function () {
            get('gameboard').style.display = "block";
            if (Game.levelEditMode) get('lvledittilesarea').style.display = "block";
        };

        this.destroy = function () {
            get('tiles').innerHTML = "";
            get('gameboard').style.display = "none";
            get('lvledittilesarea').style.display = "none";
        };
        
        this.click = function (event, down) {
            this.board.click(event, down);
        };
        
        this.hover = function (into, x, y) {
            this.board.hover(into, x, y);
        };
    }; // end Game.GameState()

    /* @param colours: an array of size two [single laser, corner laser]
       @param dir: direction the tile is facing */
    Game.GameState.Laser = function (entering, exiting, colour) {
        this.entering = entering; // the side of the tile the laser is entering (GLOBALLY, not locally)
        this.exiting = exiting; // the side of the tile the laser is exiting (GLOBALLY)
        this.colour = colour || Game.types.colours.RED;

        // @param dir: the direction the tile is facing
        this.render = function (context, x, y, dir) {
            if (this.entering !== null) Game.renderImage(context, x, y, Game.images.lasers[this.colour], add(dir, this.entering), Game.tileSize);
            if (this.exiting !== null) Game.renderImage(context, x, y, Game.images.lasers[this.colour], add(dir, this.exiting), Game.tileSize);
        };
    }; // end Game.GameState.Laser()

    // represents an actual receptor, in a receptor tile (receptor tiles can have 0-4 of these things)
    Game.GameState.Receptor = function (colour) {
        this.colour = colour;
        this.laser = null;
        this.on = false;

        this.update = function () {
            this.on = false;
            if (this.laser !== null && this.colourTurnsMeOn(this.laser.colour, this.colour)) {
                this.on = true;
            } else this.on = false;

            if (this.on === false) {
                this.laser = null;
            }
        };

        this.render = function(context, x, y, dir) {
//            if (this.laser) this.laser.render(context, x, y, sub(dir, 2)); // don't render lasers on receptor tiles, for now at least
            Game.renderImage(context, x, y, Game.images[Game.types.tiles.RECEPTOR][this.colour], dir, Game.tileSize);
        };

        // returns whether or not the specified colour turns the specified receptor on
        this.colourTurnsMeOn = function (laserColour, receptorColour) {
            if (receptorColour === Game.types.colours.WHITE) return true;
            if (receptorColour === laserColour) return true;
            return false;
        };
    }; // end Game.GameState.Receptor()

    /* Because JS inheritance is essentially non-existant, just give every tile all properties, and use a type field */
    Game.GameState.Tile = function (x, y, type, dir, args) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.hovering = false;
        this.lasers = [];
        this.receptors = [];
        this.dir = dir;
        this.on = false;
        this.colour = Game.types.colours.RED;
        
        var i;
        if (args !== undefined) { // optional parameters were passed in
            switch(this.type) {
                case Game.types.tiles.POINTER:
                    this.on = parseInt(args[0]);
                    this.colour = parseInt(args[1]);
                    if (this.on) {
                        this.lasers.push(new Game.GameState.Laser(null, this.dir, this.colour));
                    }
                    break;
                case Game.types.tiles.RECEPTOR:
                    this.receptors = [4];
                    for (i = 0; i < 4; i++) {
                        if (args[0].charAt(i) === 'X') this.receptors[i] = null;
                        else this.receptors[i] = new Game.GameState.Receptor(getColourLonghand(args[0].charAt(i)));
                    }
                    break;
            }
        }
        
        this.maxdir = function () {
            switch(this.type) {
                case Game.types.tiles.BLANK:
                    return 0;
                case Game.types.tiles.MIRROR:
                    return 1;
                case Game.types.tiles.POINTER:
                case Game.types.tiles.RECEPTOR:
                    return 3;
                default:
                    return 0;
            }
        };

        // init
        this.init = function () {
            this.allReceptorsOn = function (receptors) {
                for (var i = 0; i < receptors.length; i++) {
                    if (receptors[i] !== null && receptors[i].on === false) return false;
                }
                return true;
            };
            
            switch (this.type) {
                case Game.types.tiles.BLANK:
                case Game.types.tiles.MIRROR:
                case Game.types.tiles.POINTER:
                case Game.types.tiles.RECEPTOR:
                    this.receptors = [new Game.GameState.Receptor(Game.types.colours.WHITE), null, new Game.GameState.Receptor(Game.types.colours.RED), null];
                    break;
                default:
                    break;
            }
        };

        this.nextColor = function (colour, useWhite) {
            switch (colour) {
                case Game.types.colours.RED:
                    return Game.types.colours.GREEN;
                case Game.types.colours.GREEN:
                    return Game.types.colours.BLUE;
                case Game.types.colours.BLUE:
                    if (useWhite) return Game.types.colours.WHITE;
                    return Game.types.colours.RED;
                case Game.types.colours.WHITE:
                    return Game.types.colours.RED;
            }
            return Game.types.colours.RED;
        };
        
        this.numOfReceptors = function (receptors) {
            var num = 0, i;
            for (i = 0; i < this.receptors.length; i++) {
                if (receptors[i] !== null) num++;
            }
            return num;
        };
        
        // click
        this.click = function (event, down) {
            if (down === false) return;
            switch (this.type) {
                case Game.types.tiles.RECEPTOR:
                    if (clickType(event) === "left") {
                        this.dir += 1;
                        if (this.dir > this.maxdir()) this.dir = 0;
                    } else if (clickType(event) === "right") {
                        if (Game.levelEditMode) {
                            if (Game.selectedTile === this.type) {
                                // cycle through the different colours of receptors
                                var xx = getRelativeCoordinates(event, get('gamecanvas')).x % Game.tileSize, yy = getRelativeCoordinates(event, get('gamecanvas')).y % Game.tileSize,
                                    index;
                                if (xx + yy <= Game.tileSize) { // NW
                                    if (xx >= yy) { // NE
                                        index = sub(Game.NORTH, this.dir);
                                    } else { // SW
                                        index = sub(Game.WEST, this.dir);
                                    }
                                } else { // SE
                                    if (xx >= yy) { // NE
                                        index = sub(Game.EAST, this.dir);
                                    } else { // SW
                                        index = sub(Game.SOUTH, this.dir);
                                    }
                                }
                                if (this.receptors[index] === null) {
                                    this.receptors[index] = new Game.GameState.Receptor(Game.types.colours.RED);
                                } else {
                                    this.receptors[index].colour = this.nextColor(this.receptors[index].colour, true);
                                    if (this.numOfReceptors(this.receptors) > 1 && this.receptors[index].colour === Game.types.colours.RED) this.receptors[index] = null;
                                }
                            }
                        }
                    }
                    break;
                case Game.types.tiles.BLANK:
                case Game.types.tiles.MIRROR:
                    if (clickType(event) === "left") {
                        this.dir += 1;
                        if (this.dir > this.maxdir()) this.dir = 0;
                    }
                    break;
                case Game.types.tiles.POINTER:
                    if (clickType(event) === "left") {
                        this.dir += 1;
                        if (this.dir > this.maxdir()) this.dir = 0;
                    } else if (clickType(event) === "right") {
                        this.on = !this.on;
                        if (this.on) {
                            this.colour = this.nextColor(this.colour, false);
                            this.addLaser(new Game.GameState.Laser(null, this.dir, this.colour));
                        } else {
                            this.removeAllLasers();
                        }
                    }
                    break;
                default:
                    break;
            }
        };
        
        // hover
        this.hover = function (into) {
            this.hovering = into;
        };

        // update
        this.update = function (board) {
            var i;
            switch (this.type) {
                case Game.types.tiles.BLANK:
                case Game.types.tiles.MIRROR:
                    break;
                case Game.types.tiles.RECEPTOR:
                    for (i = 0; i < this.receptors.length; i++) {
                        if (this.receptors[i] !== null) this.receptors[i].laser = null;
                    }
                    for (i = 0; i < this.lasers.length; i++) {
                        if (this.receptors[sub(this.lasers[i].entering, this.dir)] !== null) { // there's a laser pointing into a receptor
                            this.receptors[sub(this.lasers[i].entering, this.dir)].laser = this.lasers[i];
                        }
                    }
                    for (i = 0; i < this.receptors.length; i++) {
                        if (this.receptors[i] !== null) this.receptors[i].update();
                    }
                    break;
                case Game.types.tiles.POINTER:
                    if (this.on === false) return;
                    
                    this.addLaser(new Game.GameState.Laser(null, this.dir, this.colour));
                    // ^ this line ^ should always be true if this tile is "on" LATER test that
                    
                    var checkedTiles = [this.w * this.h], // 0=not checked, 1=checked once, 2=checked twice (done)
                        nextDir = this.dir, // direction towards next tile
                        nextTile = board.getTile(this.x, this.y),
                        xx,
                        yy;

                    for (i = 0; i < this.w * this.h; i++) {
                        checkedTiles[i] = 0;
                    }
                    
                    do {
                        xx = nextTile.x + Game.offset[nextDir][0];
                        yy = nextTile.y + Game.offset[nextDir][1];

                        if (xx < 0 || xx >= board.w || yy < 0 || yy >= board.h) break; // The next direction is leading us into the wall
                        if (checkedTiles[xx + yy * board.w] >= 2) break; // we've already checked this tile twice (this line avoids infinite loops)
                        else checkedTiles[xx + yy * board.w]++;

                        nextTile = board.getTile(xx, yy); // get the tile to be updated
                        if (nextTile === null) break; // we hit a wall

                        if (nextTile.type === Game.types.tiles.POINTER) { // !!!! Add all other opaque/solid tiles here
                            break;
                        }

                        // Find the next direction *after* setting the new laser object
                        nextTile.addLaser(new Game.GameState.Laser(opposite(nextDir), null, this.lasers[0].colour));
                        if (nextTile.lasers.length > 0) {
                            nextDir = nextTile.lasers[nextTile.lasers.length - 1].exiting;
                        } else break; // they didn't add the laser, end the chain
                    } while (nextDir !== null);
                    break;
                default:
                    break;
            }
        };

        // render
        this.render = function (context, x, y) {
            var i;
            switch (this.type) {
                case Game.types.tiles.BLANK:
                case Game.types.tiles.MIRROR:
                case Game.types.tiles.POINTER:
//                    console.log(this.on + " " + this.lasers.length);
                    for (i = 0; i < this.lasers.length; i++) {
                        this.lasers[i].render(context, x, y, 0);
                    }
                    Game.renderImage(context, x, y, Game.images[this.type], this.dir, Game.tileSize);
                    break;
                case Game.types.tiles.RECEPTOR:
                    if (this.allReceptorsOn(this.receptors)) {
                        context.fillStyle = "#1d4d12";
                        context.fillRect(x - Game.tileSize / 2 , y - Game.tileSize / 2, Game.tileSize, Game.tileSize);    
                    }
                    for (i = 0; i < this.lasers.length; i++) {
                        // check if any of our lasers go straight through us
                        if (this.lasers[i].exiting !== null) this.lasers[i].render(context, x, y, 0);
                    }
                    for (i = 0; i < this.receptors.length; i++) {
                        if (this.receptors[i] !== null) this.receptors[i].render(context, x, y, this.dir + i);
                    }
                    break;
                default:
                    break;
            }
        };
    
        //@param laser: a laser obj: { entering = the side of the tile it is entering (GLOBALLY), exiting = null }
        this.addLaser = function (laser) {
            // first set the laser's exiting direction (null if the laser doesn't pass through this tile)
            switch (this.type) {
                case Game.types.tiles.BLANK:
                    laser.exiting = opposite(laser.entering);
                    break;
                case Game.types.tiles.POINTER:
                    if (this.lasers.length > 0) return; // we already have a laser!! Don't add another one!
                    break;
                case Game.types.tiles.RECEPTOR:
                    // receptors keep track of their own lasers, but leave the rendering to the receptor objects
                    
                    // check if the laser can pass straight through us (if we have two or fewer receptors and they aren't in the way of the laser)
                    var solid = false;
                    for (var i = 0; i < this.receptors.length; i++) {
                        if (this.receptors[i] !== null) {
                            if (sub(i, this.dir) === laser.entering || sub(i, this.dir) === opposite(laser.entering)) {
                                solid = true; // there is a receptor in the way, just add the laser without an exiting dir
                            }
                        }
                    }
                    // if we reach this point, we can do what a blank tile does
                    if (solid === false) laser.exiting = opposite(laser.entering);
                    break;
                case Game.types.tiles.MIRROR:
                    // there's probably a better way to do this, this will work for now though. FUTURE - implement a cool algorithm which elegantly handles this
                    if (this.dir === Game.NW) {
                        if (laser.entering === Game.NORTH) laser.exiting = Game.EAST;
                        else if (laser.entering === Game.EAST) laser.exiting = Game.NORTH;
                        else if (laser.entering === Game.SOUTH) laser.exiting = Game.WEST;
                        else if (laser.entering === Game.WEST) laser.exiting = Game.SOUTH;
                    } else if (this.dir === Game.NE) {
                        if (laser.entering === Game.NORTH) laser.exiting = Game.WEST;
                        else if (laser.entering === Game.WEST) laser.exiting = Game.NORTH;
                        else if (laser.entering === Game.EAST) laser.exiting = Game.SOUTH;
                        else if (laser.entering === Game.SOUTH) laser.exiting = Game.EAST;
                    }
                    break;
            }
            // then add the laser
            this.lasers.push(laser);
        };

        this.removeAllLasers = function () {
            if (this.type === Game.types.tiles.RECEPTOR) {
                for (var i = 0; i < this.receptors.length; i++) {
                    if (this.receptors[i] !== null) this.receptors[i].laser = null;
                }
            }
            
            this.lasers = [];
        };
    }; // end Game.GameState.Tile()

    Game.GameState.Board = function (w, h, gs) {
        var str, i, y, x;
        this.w = w;
        this.h = h;
        this.gs = gs;
        this.tiles = [w * h];

        for (i = 0; i < w * h; i++) {
            this.tiles[i] = new Game.GameState.Tile(i % w, Math.floor(i / w), Game.types.tiles.BLANK, Game.NORTH);
            this.tiles[i].init();
        }
        // create div tags! (used only for handling input, all rendering is done with a canvas)
        // div tags only get created (or recreated) when loading a new level
        this.createBoard = function (tiles) {
//            var type, dir;
            this.tiles = tiles;
//            for (y = 0; y < h; y++) {
//                for (x = 0; x < w; x++) {
//                    i = y * w + x;
//                    type = this.tiles[i].type;
//                    dir = this.tiles[i].dir;
//                    
//                    this.tiles[i] = new Game.GameState.Tile(x, y, type, dir);
//                    this.tiles[i].init();
//                }
//            }
            
            // centering code:
            get('gameboard').style.left = "50%";
            get('gameboard').style.marginLeft = -(w * Game.tileSize) / 2 + "px";
            
            get('gameboard').style.width = w * Game.tileSize+ "px";
            get('gameboard').style.height = h * Game.tileSize + "px";
            
            get('gamecanvas').width = w * Game.tileSize;
            get('gamecanvas').height = h * Game.tileSize;
        };

        this.update = function () {
            // remove all lasers
            for (i = 0; i < this.tiles.length; i++) {
                this.tiles[i].removeAllLasers();
            }
            // update all pointer tiles
            for (i = 0; i < this.tiles.length; i++) {
                if (this.tiles[i].type === Game.types.tiles.POINTER) this.tiles[i].update(this); 
            }
            // update all non-pointer tiles
            for (i = 0; i < this.tiles.length; i++) {
                if (this.tiles[i].type !== Game.types.tiles.POINTER) this.tiles[i].update();
            }
            
//            if (Game.ticks % 10 === 0) {
//                for (i = 0; i < this.tiles.length; i++) {
//                    if (this.tiles[i].hovering === true) console.log(this.tiles[i].x + " " + this.tiles[i].y + " " + this.tiles[i].on);
//                }
//            }
        };

        this.getTile = function (x, y) {
            if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
                if (this.tiles[x + y * this.w] !== null) {
                    return this.tiles[x + y * this.w];
                }
            }
            return null;
        };

        this.render = function () {
            var context = get('gamecanvas').getContext('2d');
            context.fillStyle = '#0a0a0a';
            context.fillRect(0, 0, this.w * Game.tileSize, this.h * Game.tileSize);
            
            var i = 0;

            context.strokeStyle = '#444444';
            for (i = 0; i < w * h; i++) {
            if (Game.debug === true) context.strokeRect((i % w) * Game.tileSize, Math.floor(i / w) * Game.tileSize, Game.tileSize, Game.tileSize);
                this.tiles[i].render(context, (i % w) * Game.tileSize + Game.tileSize / 2, Math.floor(i / w) * Game.tileSize + Game.tileSize / 2);
            }
        };

        this.click = function (event, down) {
            x = getRelativeCoordinates(event, get('gamecanvas')).x;
            y = getRelativeCoordinates(event, get('gamecanvas')).y;
            this.tiles[y * this.w + x].click(event, down);
        };
        
        this.hover = function (event, into) {
            x = getRelativeCoordinates(event, get('gamecanvas')).x;
            y = getRelativeCoordinates(event, get('gamecanvas')).y;
            this.tiles[y * this.w + x].hover(into);
        };
        
    }; // end Game.GameState.Board

    Game.InitStateList = function (sm) {
        Game.StatesList = {
            'mainmenustate' : new Game.MainMenuState(),
            'aboutstate' : new Game.AboutState(),
            'gamestate' : new Game.GameState(),
            'levelselectstate' : new Game.LevelSelectState()
        };
    };

    Game.StateManager = function () {
        this.init = function () {
            Game.InitStateList(this);
            this.states = [];
            this.states.push(Game.StatesList.mainmenustate);
            this.currentState().init(this);
        };

        this.update = function () {
            if (this.states.length > 0) {
                this.currentState().update();
            }
        };

        this.render = function () {
            if (this.states.length > 0) {
                this.currentState().render();
            }
        };
        
        this.enterState = function (state, levelNum) { // levelNum only used when entering a game state
            this.currentState().hide();
            this.states.push(Game.StatesList[state]);
            this.currentState().init(this, levelNum);
        };

        this.enterPreviousState = function () {
            if (this.states.length > 1) { // if there is only one state, we can't go back any further
                this.currentState().destroy();
                this.states.pop();
                this.currentState().restore();
                return true;
            }
            return false;
        };

        this.currentState = function () {
            return this.states[this.states.length - 1];
        };

        this.init();
    }; // end Game.StateManager()
    Game.sm = new Game.StateManager();

    Game.renderImage = function (context, x, y, image, dir, size) {
        context.save();
        context.translate(x, y);
        context.rotate(dir * 90 * (Math.PI / 180));

//        try {
            context.drawImage(image, -size / 2, -size / 2);
//        } catch (e) {
//            throw new Error(e.message);
//        }

        context.restore();
    };

    Game.update = function () {
        Game.ticks += 1;
        
        if (Game.keysdown[Game.KEYBOARD.ESC]) {
            this.sm.enterPreviousState();
        } else if (Game.keysdown[Game.KEYBOARD.ZERO]) {
            toggleLevelEditMode();
        } else if (Game.keysdown[Game.KEYBOARD.NINE]) {
            toggleDebug();
        }
        
        Game.sm.update();
        
        for (var i = 0; i < Game.keysdown.length; i++) {
            Game.keysdown[i] = false;
        }
    };

    Game.render = function () {
        Game.sm.render();
//        var context = get('gamecanvas').getContext('2d');
    };
        
    // Main loop
    Game.loop = function () {
        Game.stats.begin();
        
        Game.update();
        if (document.hasFocus() || Game.ticks % 5 === 0) {
            Game.render();
        }
        
        Game.stats.end();
        
        window.setTimeout(Game.loop, 1000 / Game.fps);
    };
    
}; // end Game.init()

function getBoolShorthand(bool) {
    return bool === true ? 1 : 0;
}

function getColourShorthand(colour) {
    switch (colour) {
        case Game.types.colours.RED:
            return 'R';
        case Game.types.colours.GREEN:
            return 'G';
        case Game.types.colours.BLUE:
            return 'B';
        case Game.types.colours.WHITE:
            return 'W';
    }
    return 'NULL';
}

function getColourLonghand(colour) {
    switch (colour) {
        case 'R':
            return Game.types.colours.RED;
        case 'G':
            return Game.types.colours.GREEN;
        case 'B':
            return Game.types.colours.BLUE;
        case 'W':
            return Game.types.colours.WHITE;
    }
    return -1;
}

function decimalToHex(decimal) {
    var n = Number(decimal).toString(16).toUpperCase();
    while (n.length < 2) {
        n = "0" + n;
    }
    return n;
}

function hexToDecimal(hex) {
    var n = String(parseInt(hex, 16));
    while (n.length < 2) {
        n = "0" + n;
    }
    return n;
}

function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}

function selectionTileClick(event, down, type) {
    if (clickType(event) !== 'left') return;
    if (type === 999) {
        if (Game.sm.currentState().type === Game.types.states.GAME) Game.sm.currentState().saveBoard();
    } else if (down) {
        Game.selectedTile = type;
    }
}

function toggleLevelEditMode () {
    setLevelEditMode(!Game.levelEditMode);
}

function setLevelEditMode (levelEditMode) {
    Game.levelEditMode = levelEditMode;
    if (Game.levelEditMode) {
        setDebug(true);
        get('lvlEditInfo').style.backgroundColor = "#134304";
        
        if (Game.sm.currentState().type === Game.types.states.GAME) {
            get('lvledittilesarea').style.display = "block";
        }
    } else {
        get('lvlEditInfo').style.backgroundColor = "initial";
        get('lvledittilesarea').style.display = "none";
    }
}

function toggleDebug () {
    setDebug(!Game.debug);
}

function setDebug (debug) {
    Game.debug = debug;
    if (Game.debug === false) setLevelEditMode(false);
    if (Game.debug) Game.stats.domElement.style.display = "block";
    else Game.stats.domElement.style.display = "none";
    
    if (Game.debug) {
        get('infoarea').style.display = "block";
        get('debugInfo').style.backgroundColor = "#134304";
    } else {
        get('infoarea').style.display = "none";
        get('debugInfo').style.backgroundColor = "initial";
    }
}

function clockwise (dir) {
    dir += 1;
    if (dir > 3) {
        dir = 0;
    }
    return dir;
}

function anticlockwise (dir) {
    dir -= 1;
    if (dir < 0) {
        dir = 3;
    }
    return dir;
}

function add (dir1, dir2) {
    return (dir1 + dir2) % 4;
}

function sub (dir1, dir2) {
    var result = dir1 - dir2;
    if (result < 0) {
        dir1 = (4 + result) % 4;
    } else {
        dir1 = result;
    }
    return dir1;
}

function opposite (dir) {
    if (dir === Game.NORTH) {
        return Game.SOUTH;
    } else if (dir === Game.EAST) {
        return Game.WEST;
    } else if (dir === Game.SOUTH) {
        return Game.NORTH;
    } else if (dir === Game.WEST) {
        return Game.EAST;
    } else {
        console.error("Invalid direction!! " + dir);
    }
    return 0;
}

function keyPressed(event, down) {
    if (Game.keysdown) {
        var keycode = event.keyCode ? event.keyCode : event.which;
        Game.keysdown[keycode] = down;
        
        if (Game.keysdown[Game.KEYBOARD.ONE]) Game.selectedTile = 0;
        if (Game.keysdown[Game.KEYBOARD.TWO]) Game.selectedTile = 1;
        if (Game.keysdown[Game.KEYBOARD.THREE]) Game.selectedTile = 2;
        if (Game.keysdown[Game.KEYBOARD.FOUR]) Game.selectedTile = 3;
    }
}

window.onkeydown = function (event) { keyPressed(event, true); };
window.onkeyup = function (event) { keyPressed(event, false); };

function boardClick(event, down) {
    if (Game.sm.currentState().type === Game.types.states.GAME) Game.sm.currentState().click(event, down);
}

function clickType(event) {
    if (event.which === 3 || event.button === 2) return "right";
    else if (event.which === 1 || event.button === 0) return "left";
    else if (event.which === 2 || event.button === 1) return "middle";
}

/** The following two functions were taken from Acko.net */
function getRelativeCoordinates(event, reference) {
    var x, y, e, el, pos, offset;
    event = event || window.event;
    el = event.target || event.srcElement;

    if (!window.opera && typeof event.offsetX != 'undefined') {
      // Use offset coordinates and find common offsetParent
      pos = { x: event.offsetX, y: event.offsetY };

      // Send the coordinates upwards through the offsetParent chain.
      e = el;
      while (e) {
        e.mouseX = pos.x;
        e.mouseY = pos.y;
        pos.x += e.offsetLeft;
        pos.y += e.offsetTop;
        e = e.offsetParent;
      }

      // Look for the coordinates starting from the reference element.
      e = reference;
      offset = { x: 0, y: 0 };
      while (e) {
        if (typeof e.mouseX != 'undefined') {
          x = e.mouseX - offset.x;
          y = e.mouseY - offset.y;
          break;
        }
        offset.x += e.offsetLeft;
        offset.y += e.offsetTop;
        e = e.offsetParent;
      }

      // Reset stored coordinates
      e = el;
      while (e) {
        e.mouseX = undefined;
        e.mouseY = undefined;
        e = e.offsetParent;
      }
    } else {
      // Use absolute coordinates
      pos = getAbsolutePosition(reference);
      x = event.pageX  - pos.x;
      y = event.pageY - pos.y;
    }
    // Subtract distance to middle
    return { x: x, y: y };
}

function getAbsolutePosition(element) {
    var r = { x: element.offsetLeft, y: element.offsetTop };
    if (element.offsetParent) {
      var tmp = getAbsolutePosition(element.offsetParent);
      r.x += tmp.x;
      r.y += tmp.y;
    }
    return r;
}

window.onbeforeunload=function(event) {
    if (Game.debug === false) {
        if (typeof event == 'undefined') event = window.event;
        if (event) event.returnValue='Are you sure you want to close Mirrors?';
    }
};

window.onload = function () {
// RELEASE remove this
//    Bugsnag.user = {
//      id: 0,
//      name: "AJ Weeks",
//      email: "ajweeks@shaw.ca"
//    };
    
    Game.init();
    Game.loop();
};
