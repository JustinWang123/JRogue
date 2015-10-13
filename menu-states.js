/*global game, SCREEN_WIDTH, SCREEN_HEIGHT, gameState, LARGE_WHITE_FONT*/
'use strict';

var LARGE_BLACK_FONT = {font: '16px silkscreennormal', fill: '#202020' };
var LARGE_GREEN_FONT = {font: '16px silkscreennormal', fill: '#00ff00' };
var LARGE_RED_FONT = {font: '16px silkscreennormal', fill: '#ff0000' };
var SMALL_BLACK_FONT = {font: '14px silkscreennormal', fill: '#202020' };
var LARGE_WHITE_FONT = {font: '16px silkscreennormal', fill: '#ffffff' };

var menuState = {
    preload: function () {
        // GAME ICONS:
        game.load.spritesheet('Tileset', 'assets/TilesetColor.png', 16, 16);
        game.load.spritesheet('HalfTileset', 'assets/TilesetColor.png', 16, 8);
        
        // HUD:
        game.load.spritesheet('ItemSlot', 'assets/ItemSlotColor.png', 20, 20);
        game.load.image('HUD', 'assets/HUDColor.png');
        game.load.image('ItemSlotSelect', 'assets/ItemSlotSelect.png');
        game.load.image('Bar', 'assets/BarColor.png');
        game.load.spritesheet('BarFill', 'assets/BarFill.png', 2, 10);
        game.load.spritesheet('Button', 'assets/Button.png', 72, 12);
        game.load.image('Title', 'assets/Title.png');
        game.load.spritesheet('Button', 'assets/Button.png', 72, 12);
        game.load.image('Instructions', 'assets/Instructions.png');
        
        game.time.advancedTiming = true;
    },
    
    create: function () {
        var text, button, sprite, tileTypeMap, x, y, dungeonImageIndex, caveImageIndex, i, data;
   
                            
        // Create back ground:
        dungeonImageIndex = {Wall: 1,
                     Floor: 2,
                     DownStair: 10,
                     UpStair: 2,
                     Door: 3,
                     VineFloor: 9,
                     Water: 7};
        
        caveImageIndex = {Wall: 5,
                            Floor: 6,
                            Water: 7,
                            DownStair: 10,
                            UpStair: 6};
    
        tileTypeMap = gameState.generateBSP1();
        for (x = 1; x < 21; x += 1) {
            for (y = 1; y < 16; y += 1) {
                
                if (tileTypeMap[x - 1][y].type !== 'Wall'
                        || tileTypeMap[x + 1][y].type !== 'Wall'
                        || tileTypeMap[x][y - 1].type !== 'Wall'
                        || tileTypeMap[x][y + 1].type !== 'Wall'
                        || tileTypeMap[x + 1][y + 1].type !== 'Wall'
                        || tileTypeMap[x + 1][y - 1].type !== 'Wall'
                        || tileTypeMap[x - 1][y + 1].type !== 'Wall'
                        || tileTypeMap[x - 1][y - 1].type !== 'Wall') {
                
                    sprite = gameState.createSprite(x * 32 - 32, y * 32 - 32, 'Tileset');
                    if (tileTypeMap[x][y].area.type === 'Dungeon') {
                        sprite.frame = dungeonImageIndex[tileTypeMap[x][y].type];
                    } else if (tileTypeMap[x][y].area.type === 'Cave') {
                        sprite.frame = caveImageIndex[tileTypeMap[x][y].type];
                    }
                    //sprite.alpha = 0.75;
                }
            }
        }
        
        // Title:
        sprite = game.add.sprite(SCREEN_WIDTH / 2 - 10, SCREEN_HEIGHT / 2 - 60, 'Title');
        sprite.anchor.setTo(0.5, 0.5);
        
        // Click to start:
        text = game.add.text(SCREEN_WIDTH / 2 - 70, SCREEN_HEIGHT / 2 - 20, 'Click to Start', LARGE_WHITE_FONT);
        
        // Score:
        gameState.score = JSON.parse(localStorage.getItem('Score'));
        if (!gameState.score) {
            gameState.score = [];
        }
        
        for (i = 0; i < 5 && i < gameState.score.length; i += 1) {
            text = game.add.text(SCREEN_WIDTH / 2, 360 + i * 20, gameState.score[i], LARGE_WHITE_FONT);
            text.anchor.setTo(0.5, 0);
        }
    
        
        // Start button:
        game.input.onDown.add(function () {
            this.startClick();
        }, this);
    },
    
    update: function () {
        
    },
    
    startClick: function () {
        gameState.dungeonLevel = 1;
        gameState.paused = true;
        game.state.start('game');
    },

    // RENDER FUNCTION:
    render: function () {
        //game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
    }
};

var loseState = {
    preload: function () {
    },
    
    create: function () {
        var text, image, button;

        gameState.createTextButton(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 'menu', this.startClick, this);
        
        
        text = game.add.text(320, 140, gameState.deathText, LARGE_WHITE_FONT);
        text.anchor.set(0.5, 0.5);
    },
    
    update: function () {
        
    },
    
    startClick: function () {
        game.state.start('menu');
    }
};

var winState = {
    preload: function () {
    },
    
    create: function () {
        var text, image, button;

        gameState.createTextButton(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 'menu', this.startClick, this);
        
        
        text = game.add.text(320, 140, 'YOU RETRIEVED THE GOBLET OF YENDOR ', LARGE_WHITE_FONT);
        text.anchor.set(0.5, 0.5);
    },
    
    update: function () {
        
    },
    
    startClick: function () {
        game.state.start('menu');
    }
};