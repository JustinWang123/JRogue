/*global Phaser, menuState, loseState, console, winState, LARGE_BLACK_FONT */
'use strict';

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 480;


var PLAYER_CHARACTER_REGEN_TIME = 15;
var INVENTORY_SIZE = 9;

var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.CANVAS, 'gameDiv');

var gameState = {
    numTilesX: 36,
    numTilesY: 36,
    tileSize: 32,
    scaleFactor: 2,
    numScreenTilesX: 17,
    numScreenTilesY: 17,
    turn: 0,
    dungeonLevel: 1,
    lastDungeonLevel: 12,
    itemTypes: {},
    damageText: [],
    createdTemple: false,
    
    // PRELOAD FUNCTION:
    preload: function () {

        // TIMING (allows fps to show):
        //game.time.advancedTiming = true;
    },

    // CREATE FUNCTION:
    create: function () {
        this.createdTemple = false;
        this.dungeonLevel = 1;
        
        // Lists:
        this.itemList = [];
        this.characterList = [];
        this.npcList = [];
        this.projectileList = [];
        this.iceList = [];
        this.bloodList = [];
        
        // Sprite Groups (for layering):
        this.tileMapSpritesGroup = game.add.group();
        this.bloodGroup = game.add.group();
        this.itemSpritesGroup = game.add.group();
        this.characterSpritesGroup = game.add.group();
        this.hudTileSpritesGroup = game.add.group();
        this.projectileSpritesGroup = game.add.group();
        
        // Create Types:
        this.createNPCTypes();
        this.createItemTypes();
        this.createTileTypes();
        this.createProjectileTypes();
        
        // Map:
        this.createTileMap();
        this.createTileMapSprites();
        
        // Player:
        this.createPlayerCharacter();
        this.createPlayerCharacterInput();
        
        // HUD:
        this.createHUDTileSprites();
        this.createHUDSprites();
        
        // Camera:
        game.world.bounds.setTo(-300, -300, (this.numTilesX - 1) * this.tileSize + 1000, (this.numTilesY - 1) * this.tileSize + 1000);
        game.camera.setBoundsToWorld();
        
        // Set player start position:
        gameState.setPlayerCharacterTileIndex(gameState.getPassableAdjacentIndex(gameState.upStairsIndex));
        //gameState.setPlayerCharacterTileIndex(gameState.getPassableAdjacentIndex(gameState.downStairsIndex));
        this.playerCharacter.stickSprite();
        
        // Create items near player:
        //this.createItem(this.getPassableAdjacentIndex(gameState.playerCharacter.tileIndex), this.itemTypes.EnchantedAxe, 1);
        //this.createItem(this.getPassableAdjacentIndex(gameState.playerCharacter.tileIndex), this.itemTypes.ChainArmor, 1);
        //this.createItem(this.getPassableAdjacentIndex(gameState.playerCharacter.tileIndex), this.itemTypes.AmuletOfRegeneration, 1);
        //this.createItem(this.getPassableAdjacentIndex(gameState.playerCharacter.tileIndex), this.itemTypes.Spear, 1);
        
        gameState.instructionsSprite = game.add.sprite(0, 0, 'Instructions');
        gameState.HUD.group.add(gameState.instructionsSprite);

        
        // Game proporties:
        this.state = 'GAME_STATE';
        this.activeCharacterIndex = 0;
    },
        
    // UPDATE FUNCTION:
    update: function () {
        var i;
        
        if (!this.paused) {
            // Active character choose action:
            if (this.projectileList.length > 0) {
                this.updateProjectiles();
            }
            if (this.projectileList.length === 0) {
                while (this.characterList[this.activeCharacterIndex] !== this.playerCharacter) {
                    this.characterList[this.activeCharacterIndex].chooseAction();
                }
                this.characterList[this.activeCharacterIndex].chooseAction();
            }
        }
        
        // Update sprites:
        this.updateCharacterSprites();
        this.updateHUDTileSprites();
        this.updateTileMapSprites();
        this.updateDamageText();
        this.updateHUDSprites();
        
        // Update camera:
        game.camera.focusOnXY(this.playerCharacter.sprite.x + 80 - 16, this.playerCharacter.sprite.y + 16 - 16);
    },
    
    // RENDER FUNCTION:
    render: function () {
        //game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
    }
};



// END_TURN:
// ************************************************************************************************
gameState.endTurn = function () {
    this.activeCharacterIndex += 1;
    
    if (this.activeCharacterIndex === this.characterList.length) {
        this.activeCharacterIndex = 0;
    }
    this.characterList[this.activeCharacterIndex].updateTurn();
    
};

// UPDATE_GLOBAL_TURN:
// ************************************************************************************************
gameState.updateGlobalTurn = function () {
    var i;
    
    gameState.turn += 1;
    
    // Spawn new monsters:
    if (this.turn % 80 === 0) {
        this.createNPC(this.getRandomPassableIndex(), this.chooseRandom(this.levelNPCs[this.dungeonLevel]), false);
    }
    
    // Update ice:
    for (i = 0; i < this.iceList.length; i += 1) {
        if (this.iceList[i].isAlive) {
            this.iceList[i].updateTurn();
        }
    }
    
    // The player has just started his turn so we set hasNPCActed to false
    // If an npc acts in between then we stop the player from moving
    if (this.hasNPCActed) {
        this.playerCharacter.clickQueue = [];
    }
    this.hasNPCActed = false;
};

// UPDATE_CHARACTER_SPRITES:
// ************************************************************************************************
gameState.updateCharacterSprites = function () {
    var i;
    
    for (i = 0; i < this.characterList.length; i += 1) {
        if (this.characterList[i].isAlive) {
            this.characterList[i].updateSprite();
        }
    }
};

// CREATE_SPRITE:
// ************************************************************************************************
gameState.createSprite = function (x, y, image, group) {
    var sprite;
    sprite = game.add.sprite(x, y, image);
    sprite.smoothed = false;
    sprite.scale.setTo(this.scaleFactor, this.scaleFactor);
    
    if (group) {
        group.add(sprite);
    }
    
    return sprite;
};

// CREATE TEXT:
// ************************************************************************************************
gameState.createText = function (x, y, textStr, font, group) {
    var text;
    text = game.add.text(x, y, textStr, font);
    
    if (group) {
        group.add(text);
    }
    
    return text;
};

// CREATE_BUTTON:
// ************************************************************************************************
gameState.createButton = function (x, y, image, callBack, context) {
    var button = game.add.button(x, y, image, callBack, context);
    button.smoothed = false;
    button.scale.setTo(this.scaleFactor, this.scaleFactor);
    return button;
};

// CREATE_TEXT_BUTTON:
// ************************************************************************************************
gameState.createTextButton = function (x, y, text, callBack, context) {
    var button = {};
    
    // Create button group:
    button.group = game.add.group();
    
    // Create button:
    button.button = game.add.button(x, y, 'Button', callBack, context, 1, 0, 0, 0);
    button.button.smoothed = false;
    button.button.anchor.setTo(0.5, 0.5);
    button.button.scale.setTo(this.scaleFactor, this.scaleFactor);
    button.group.add(button.button);
    
    // Create text:
    button.text = game.add.text(x - 1, y + 1, text, LARGE_BLACK_FONT);
    button.text.anchor.setTo(0.5, 0.5);
    //button.text.smoothed = false;
    button.group.add(button.text);
    
    return button;
};

// RAND_ELEM:
// ************************************************************************************************
gameState.randElem = function (list) {
    return list[game.rnd.integerInRange(0, list.length - 1)];
};

// RAND_ELEM:
// ************************************************************************************************
gameState.inArray =  function (element, array) {
    var i;
    for (i = 0; i < array.length; i += 1) {
        if (array[i] === element) {
            return true;
        }
    }

    return false;
};

game.state.add('game', gameState);
game.state.add('lose', loseState);
game.state.add('menu', menuState);
game.state.add('win', winState);
game.state.start('menu');