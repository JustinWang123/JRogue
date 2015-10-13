/*global game, gameState, SCREEN_HEIGHT, LARGE_BLACK_FONT, LARGE_RED_FONT, LARGE_WHITE_FONT*/
'use strict';

var NUM_DAMAGE_TEXT_SPRITES = 10;

// CREATE_HUD_SPRITES:
// ************************************************************************************************
gameState.createHUDSprites = function () {
    var startX = 480,
        width = 160,
        sprite,
        text,
        createItemSlot,
        i,
        buttonX,
        buttonY;
    
    this.HUD = {};
    this.HUD.group = game.add.group();
    this.HUD.group.fixedToCamera = true;
    
    // HUD:
    this.HUD.menu = this.createSprite(0, 0, 'HUD');
    this.HUD.group.add(this.HUD.menu);
    
    // CHARACTER STATUS:
    // ******************************************************************************************
    // HUD HP Bar:
    buttonX = startX + 8;
    buttonY = 18;
    this.createSprite(buttonX, buttonY, 'Bar', this.HUD.group);
    this.HUD.hpBar = this.createSprite(buttonX + 2, buttonY + 2, 'BarFill', this.HUD.group);
    this.HUD.hpText = this.createText(buttonX + 8, buttonY + 2, 'HP: ', LARGE_BLACK_FONT, this.HUD.group);

    // Food Text:
    buttonX = startX + 8;
    buttonY = 46;
    this.createSprite(buttonX, buttonY, 'Bar', this.HUD.group);
    this.HUD.foodBar = this.createSprite(buttonX + 2, buttonY + 2, 'BarFill', this.HUD.group);
    this.HUD.foodBar.frame = 1;
    this.HUD.foodText = this.createText(buttonX + 8, buttonY + 2, 'Food: ', LARGE_BLACK_FONT, this.HUD.group);
    
    // Level Text:
    buttonX = startX + 8;
    buttonY = 74;
    this.createSprite(buttonX, buttonY, 'Bar', this.HUD.group);
    this.HUD.levelBar = this.createSprite(buttonX + 2, buttonY + 2, 'BarFill', this.HUD.group);
    this.HUD.levelBar.frame = 2;
    this.HUD.levelText = this.createText(buttonX + 8, buttonY + 2, 'LVL: ', LARGE_BLACK_FONT, this.HUD.group);

    // Dungeon Level Text:
    this.HUD.dungeonLevelText = this.createText(256, 0, 'Turn: ', LARGE_BLACK_FONT, this.HUD.group);
    this.HUD.dungeonLevelText.anchor.setTo(0.5, 0);
    
    // Item Name Text:
    this.HUD.itemText = this.createText(16, SCREEN_HEIGHT - 20, 'Item: ', LARGE_BLACK_FONT, this.HUD.group);
    
    // INVENTORY:
    // ******************************************************************************************
    // Weapon Slot:
    buttonX = startX + 16;
    buttonY = 102;
    this.HUD.weaponSlot = this.createSprite(buttonX, buttonY, 'ItemSlot', this.HUD.group);
    this.HUD.weaponSlot.frame = 1;
    this.HUD.weaponSprite = this.createSprite(buttonX + 4, buttonY + 4, 'Tileset', this.HUD.group);
    this.HUD.weaponAmountText = this.createText(buttonX + 16, buttonY + 20, '10', LARGE_WHITE_FONT, this.HUD.group);
    
    // Mouse over weapon:
    this.HUD.weaponSlot.inputEnabled = true;
    this.HUD.weaponSlot.events.onInputOver.add(function () {
        this.HUD.inventoryItemIcons.selectedItem = this.playerCharacter.weapon.item;
    }, this);

    this.HUD.weaponSlot.events.onInputOut.add(function () {
        this.HUD.inventoryItemIcons.selectedItem = null;
    }, this);
    
    // Body Slot:
    buttonX = startX + 16 + 44;
    buttonY = 102;
    this.HUD.bodySlot = this.createSprite(buttonX, buttonY, 'ItemSlot', this.HUD.group);
    this.HUD.bodySlot.frame = 2;
    this.HUD.armorSprite = this.createSprite(buttonX + 4, buttonY + 4, 'Tileset', this.HUD.group);
    
    // Mouse over body:
    this.HUD.bodySlot.inputEnabled = true;
    this.HUD.bodySlot.events.onInputOver.add(function () {
        this.HUD.inventoryItemIcons.selectedItem = this.playerCharacter.body;
    }, this);

    this.HUD.bodySlot.events.onInputOut.add(function () {
        this.HUD.inventoryItemIcons.selectedItem = null;
    }, this);
    
    // Neck slot:
    buttonX = startX + 16 + 44 * 2;
    buttonY = 102;
    this.HUD.neckSlot = this.createSprite(buttonX, buttonY, 'ItemSlot', this.HUD.group);
    this.HUD.neckSlot.frame = 3;
    this.HUD.neckSprite = this.createSprite(buttonX + 4, buttonY + 4, 'Tileset', this.HUD.group);
    
    // Mouse over neck:
    this.HUD.neckSlot.inputEnabled = true;
    this.HUD.neckSlot.events.onInputOver.add(function () {
        this.HUD.inventoryItemIcons.selectedItem = this.playerCharacter.neck;
    }, this);

    this.HUD.neckSlot.events.onInputOut.add(function () {
        this.HUD.inventoryItemIcons.selectedItem = null;
    }, this);
    
    // Inventory Item Icons:
    this.HUD.inventoryItemIcons = this.createInventoryItemIcons(startX + 16, 300);
    this.HUD.group.add(this.HUD.inventoryItemIcons.group);
    
    
    // BUTTONS:
    // ******************************************************************************************
    // Rest Button:
    this.HUD.restButton = this.createTextButton(startX + width / 2, 450, 'REST', this.restClicked, this);
    this.HUD.group.add(this.HUD.restButton.group);
    
    // MINI MAP:
    // ******************************************************************************************
    this.createMiniMap(488, 148);
    
    // DAMAGE TEXT SPRITES:
    // ******************************************************************************************
    this.HUD.damageTextSprites = [];
    for (i = 0; i < NUM_DAMAGE_TEXT_SPRITES; i += 1) {
        this.HUD.damageTextSprites.push(game.add.text(0, 0, 'undefined', LARGE_RED_FONT));
        this.HUD.damageTextSprites[i].anchor.setTo(0.5, 0.5);
        this.HUD.damageTextSprites[i].visible = false;
        this.HUD.damageTextSprites[i].isAlive = false;
    }
};



// UPDATE_HUD_SPRITES:
// ************************************************************************************************
gameState.updateHUDSprites = function () {
    var pc = gameState.playerCharacter;
    
    // Update HP text:
    this.HUD.hpText.setText('HP: ' + pc.currentHp + '/' + pc.maxHp);
    
    // Update HP Bar:
    this.HUD.hpBar.scale.setTo(70 * pc.currentHp / pc.maxHp, 2);
    
    // Update level text:
    this.HUD.levelText.setText('LVL: ' + pc.level + ' (' + this.playerCharacterExpPercent() + '%)');

    // Update level bar:
    this.HUD.levelBar.scale.setTo(70 * this.playerCharacterExpPercent() / 100, 2);

    // Update food text
    this.HUD.foodText.setText('FOOD: ' + pc.currentFood + '/' + pc.maxFood);
    if (pc.currentFood <= 100) {
        this.HUD.foodText.setStyle(LARGE_RED_FONT);
    } else {
        this.HUD.foodText.setStyle(LARGE_BLACK_FONT);
    }
    
    // Update food bar:
    this.HUD.foodBar.scale.setTo(70 * pc.currentFood / pc.maxFood, 2);

    // Update dungeon level text:
    if (this.state === 'ZAP_STATE') {
        this.HUD.dungeonLevelText.setText('ZAPPING: ' + pc.activeWand.type.niceName);
        this.HUD.dungeonLevelText.setStyle(LARGE_RED_FONT);
    } else {
        this.HUD.dungeonLevelText.setText('DUNGEON LEVEL: ' + this.dungeonLevel + '/' + this.lastDungeonLevel);
        this.HUD.dungeonLevelText.setStyle(LARGE_BLACK_FONT);
    }
    
    // Update inventory icons:
    this.HUD.inventoryItemIcons.refresh();
    
    // Update item text:
    if (this.HUD.inventoryItemIcons.selectedItem) {
        this.HUD.itemText.setText(this.HUD.inventoryItemIcons.selectedItem.type.desc);
        this.HUD.itemText.visible = true;
    } else {
        this.HUD.itemText.setText(this.getDescUnderCursor());
    }
        
    // Update weapon sprite:
    if (pc.weapon.item.type !== this.itemTypes.Fists) {
        this.HUD.weaponSprite.visible = true;
        this.HUD.weaponSprite.frame = pc.weapon.item.type.imageIndex;
        this.HUD.weaponSlot.frame = 0;
        if (pc.weapon.amount > 1) {
            this.HUD.weaponAmountText.setText(pc.weapon.amount);
            this.HUD.weaponAmountText.visible = true;
        } else {
            this.HUD.weaponAmountText.visible = false;
        }
    } else {
        this.HUD.weaponSprite.visible = false;
        this.HUD.weaponSlot.frame = 1;
    }
    
    // Update armor sprite:
    if (pc.body) {
        this.HUD.armorSprite.visible = true;
        this.HUD.armorSprite.frame = pc.body.type.imageIndex;
        this.HUD.bodySlot.frame = 0;
    } else {
        this.HUD.armorSprite.visible = false;
        this.HUD.bodySlot.frame = 2;
    }
    
    // Update neck sprite:
    if (pc.neck) {
        this.HUD.neckSprite.visible = true;
        this.HUD.neckSprite.frame = pc.neck.type.imageIndex;
        this.HUD.neckSlot.frame = 0;
    } else {
        this.HUD.neckSprite.visible = false;
        this.HUD.neckSlot.frame = 3;
    }
    
    this.refreshMiniMap();
};

// GET_DESC_UNDER_CURSOR:
// ************************************************************************************************
gameState.getDescUnderCursor = function () {
    var pointerWorldPosition = {x: game.input.activePointer.x + game.camera.x, y: game.input.activePointer.y + game.camera.y},
        tileIndex = this.getTileIndexFromPosition(pointerWorldPosition);
    
    if (!this.isTileIndexInBounds(tileIndex) || this.game.input.activePointer.x >= 470) {
        return '';
    } else if (!this.getTile(tileIndex).explored) {
        return 'UNEXPLORED';
    } else if (this.getTile(tileIndex).character) {
        return this.getTile(tileIndex).character.type.niceName;
    } else if (this.getTile(tileIndex).ice) {
        return 'ICE';
    } else if (this.getTile(tileIndex).item) {
        return this.getTile(tileIndex).item.type.niceName;
    } else {
        return this.getTile(tileIndex).tileType.niceName;
    }
};

// CREATE_HUD_TILE_SPRITES:
// ************************************************************************************************
gameState.createHUDTileSprites = function () {
    var i;
    
    this.mouseTileSprite = this.createSprite(0, 0, 'Tileset');
    this.mouseTileSprite.frame = 75;
    this.hudTileSpritesGroup.add(this.mouseTileSprite);
    
    this.targetSprites = [];
    for (i = 0; i < 30; i += 1) {
        this.targetSprites.push(this.createSprite(0, 0, 'Tileset'));
        this.targetSprites[i].frame = 76;
        this.hudTileSpritesGroup.add(this.targetSprites[i]);
    }
};

// UPDATE_HUD_TILE_SPRITES:
// ************************************************************************************************
gameState.updateHUDTileSprites = function () {
    var pc = gameState.playerCharacter,
        i,
        pointerTileIndex = this.getTileIndexFromPosition({x: game.input.activePointer.x + game.camera.x, y: game.input.activePointer.y + game.camera.y}),
        isPointerInWorld,
        isNPCTargeted,
        showAxeTarget,
        showSingleTarget,
        showMultiTarget,
        showBoltTarget;
    
    // IS POINTER IN WORLD:
    // ********************************************************************************************
    isPointerInWorld = function () {
        return game.input.activePointer.x < 470 && game.input.activePointer.x > 46 && game.input.activePointer.y < 434 && gameState.isTileIndexInBounds(pointerTileIndex);
    };
    
    // IS NPC TARGETED:
    // ********************************************************************************************
    isNPCTargeted = function () {
        return gameState.canPlayerCharacterAttack(pointerTileIndex);
    };
    
    // SHOW AXE TARGET:
    // ********************************************************************************************
    showAxeTarget = function () {
        var j = 0;
        for (i = 0; i < gameState.npcList.length; i += 1) {
            if (gameState.canPlayerCharacterAttack(gameState.npcList[i].tileIndex)) {
                gameState.targetSprites[j].x = gameState.npcList[i].tileIndex.x * gameState.tileSize;
                gameState.targetSprites[j].y = gameState.npcList[i].tileIndex.y * gameState.tileSize;
                gameState.targetSprites[j].visible = true;
                j += 1;
            }
        }
    };
    
    // SHOW SINGLE TARGET:
    // ********************************************************************************************
    showSingleTarget = function () {
        gameState.targetSprites[0].x = pointerTileIndex.x * gameState.tileSize;
        gameState.targetSprites[0].y = pointerTileIndex.y * gameState.tileSize;
        gameState.targetSprites[0].visible = true;
    };
    
    // SHOW MULTI TARGET:
    // ********************************************************************************************
    showMultiTarget = function (center, range, centerIncluded) {
        var x, y, j = 0;
        for (x = center.x - range; x <= center.x + range; x += 1) {
            for (y = center.y - range; y <= center.y + range; y += 1) {
                if (!(x === center.x && y === center.y) || centerIncluded) {
                    gameState.targetSprites[j].x = x * gameState.tileSize;
                    gameState.targetSprites[j].y = y * gameState.tileSize;
                    gameState.targetSprites[j].visible = true;
                    j += 1;
                }
            }
        }
    };
    
    // SHOW BOLT TARGET:
    // ********************************************************************************************
    showBoltTarget = function (endTile) {
        var startPos, endPos, tiles, y;
        
        startPos = gameState.getPositionFromTileIndex(gameState.playerCharacter.tileIndex);
        endPos = gameState.getPositionFromTileIndex(endTile);
        tiles = gameState.getTilesInRay(startPos, endPos);
        
        for (i = 1; i < tiles.length; i += 1) {
            gameState.targetSprites[i].x = tiles[i].tileIndex.x * gameState.tileSize;
            gameState.targetSprites[i].y = tiles[i].tileIndex.y * gameState.tileSize;
            gameState.targetSprites[i].visible = true;
        }
    };
    
    // Hide movement sprite:
    this.mouseTileSprite.visible = false;
    
    // Hide all target sprites:
    for (i = 0; i < 30; i += 1) {
        this.targetSprites[i].visible = false;
    }
    
    if (isPointerInWorld()) {
        // ZAPPING:
        if (this.canPlayerCharacterZap(pointerTileIndex)) {
            // WAND OF FIRE BALL:
            if (pc.activeWand.type.name === 'ScrollOfFireBall' || pc.activeWand.type.name === 'ScrollOfIce') {
                showMultiTarget(pointerTileIndex, 1, true);
                
            } else if (pc.activeWand.type.name === 'ScrollOfLightning') {
                showBoltTarget(pointerTileIndex);
            
            } else if (pc.activeWand.type.name === 'ScrollOfPolymorph' || pc.activeWand.type.name === 'ScrollOfBlink') {
                showSingleTarget();
            }

        // ATTACKING:
        } else if (isNPCTargeted()) {
            if (pc.weapon.item.type.name === 'Axe') {
                showAxeTarget();
            } else {
                showSingleTarget();
            }
            
        // MOVING:
        } else if (this.getTile(pointerTileIndex).explored &&
                   (this.isTileIndexPassable(pointerTileIndex)
                   || this.getTile(pointerTileIndex).tileType.name === 'ClosedDoor'
                   || this.getTile(pointerTileIndex).tileType.name === 'DownStair'
                   || this.getTile(pointerTileIndex).tileType.name === 'WarriorAlter'
                   || this.getTile(pointerTileIndex).tileType.name === 'MageAlter'
                   || this.getTile(pointerTileIndex).tileType.name === 'HunterAlter'
                   || this.getTile(pointerTileIndex).character)) {
            // Place mouseTileSprite:
            this.mouseTileSprite.x = pointerTileIndex.x * this.tileSize;
            this.mouseTileSprite.y = pointerTileIndex.y * this.tileSize;
            this.mouseTileSprite.visible = true;
        } else {
            this.mouseTileSprite.visible = false;
        }
    } else if (this.HUD.mouseOverReadButton && this.HUD.inventoryItemIcons.selectedItem.type.name === 'ScrollOfFireNova') {
        showMultiTarget(pc.tileIndex, 2, false);
    }
};

// CREATE_DAMAGE_TEXT:
// ************************************************************************************************
gameState.createDamageText = function (x, y, text, color) {
    var i;
    
    for (i = 0; i < NUM_DAMAGE_TEXT_SPRITES; i += 1) {
        if (!this.HUD.damageTextSprites[i].isAlive) {
            this.HUD.damageTextSprites[i].x = x;
            this.HUD.damageTextSprites[i].y = y;
            this.HUD.damageTextSprites[i].life = 80;
            this.HUD.damageTextSprites[i].isAlive = true;
            this.HUD.damageTextSprites[i].setText(text);
            this.HUD.damageTextSprites[i].setStyle({font: '16px silkscreennormal', fill: color });
            this.HUD.damageTextSprites[i].visible = true;
            this.HUD.damageTextSprites[i].alpha = 1.0;
            break;
        }
    }
};

// UPDATE_DAMAGE_TEXT:
// ************************************************************************************************
gameState.updateDamageText = function () {
    var i;
    
    for (i = 0; i < NUM_DAMAGE_TEXT_SPRITES; i += 1) {
        // Disapear:
        if (this.HUD.damageTextSprites[i].life === 0) {
            this.HUD.damageTextSprites[i].isAlive = false;
            this.HUD.damageTextSprites[i].visible = false;
        // Pause and fade:
        } else if (this.HUD.damageTextSprites[i].life < 30) {
            this.HUD.damageTextSprites[i].life -= 1;
            this.HUD.damageTextSprites[i].alpha = this.HUD.damageTextSprites[i].alpha - 0.03;
        // Pause:
        } else if (this.HUD.damageTextSprites[i].life < 40) {
            this.HUD.damageTextSprites[i].life -= 1;
        
        
        // Move upwards:
        } else {
            this.HUD.damageTextSprites[i].life -= 1;
            this.HUD.damageTextSprites[i].y -= 0.25;
        }
    }
};
