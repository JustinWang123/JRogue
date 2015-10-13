/*global Phaser, game, gameState, LARGE_GREEN_FONT, LARGE_RED_FONT, PLAYER_CHARACTER_REGEN_TIME, PLAYER_CHARACTER_FOOD_TIME, console*/
'use strict';

// CREATE_PLAYER_CHARACTER:
// ************************************************************************************************
gameState.createPlayerCharacter = function () {
    this.expPerLevel = [0, 0, 20, 40, 65, 95, 130, 200, 265, 340, 420, 620, 840];
    
    this.playerCharacter = {isAlive: true,
                            tileIndex: {x: 0, y: 0},
                            destTileIndex: {x: 0, y: 0},
                            state: 'WAITING',
                            
                            // Stats:
                            maxHp: 20,
                            currentHp: 20,
                            currentFood: 500,
                            maxFood: 500,
                            damageBonus: 0,
                            agroRange: 10,
                            starveTimer: 0,
                            
                            // Exp:
                            exp: 0,
                            level: 1,
                            
                            // Item slots:
                            weapon: {item: {type: this.itemTypes.EnchantedSword}, amount: 1},
                            body: null,
                            neck: null,
                            
                            // Timers:
                            hpRegenRate: PLAYER_CHARACTER_REGEN_TIME,
                            hpRegenTime: 0,
 
                            // Inventory:
                            inventory: this.createInventory(),
                           
                            // Click Queue:
                            clickQueue: [],
                           
                            statusEffects: [],
                            god: 'None',
                            facing: 'RIGHT',
                           
                            type: {imageIndex: 50,
                                   speed: 'fast',
                                   niceName: 'The Rogue'}};
    this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.Dart}, 10);
    this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.Food}, 3);
    this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.PlateArmor}, 1);
    this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.Dart}, 10);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.Axe}, 1);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.EnchantedAxe}, 1);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.AmuletOfStrength}, 1);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.ScrollOfIce}, 10);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.ScrollOfFireNova}, 10);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.ScrollOfLightning}, 10);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.ThrowingNet}, 10);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.Javalin}, 10);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.LeatherArmor}, 1);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.AmuletOfProtection}, 1);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.ScrollOfFireNova}, 10);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.PlateArmor}, 1);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.ScrollOfBlink, mod: 0, charges: 0}, 10);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.ScrollOfPolymorph}, 10);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.ScrollOfFireNova, mod: 0, charges: 0}, 10);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.StormStrengthPotion, mod: 0, charges: 0}, 10);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.ScrollOfFireNova, mod: 0, charges: 0}, 5);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.Javalin, mod: 0, charges: 0}, 10);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.Food, mod: 0, charges: 0}, 1);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.HealingPotion, mod: 0, charges: 0}, 1);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.WandOfFire, mod: 0, charges: 3}, 1);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.RingOfProtection, mod: 0, charges: 0}, 1);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.ProtectionPotion}, 5);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.AmuletOfRegeneration}, 1);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.ScrollOfEnchantWeapon, mod: 0, charges: 0}, 1);
    //this.addItemToInventory(this.playerCharacter.inventory, {type: this.itemTypes.ScrollOfEnchantArmor}, 1);
    //this.playerCharacter.currentHp = this.playerCharacter.maxHp = 30;
    //this.playerCharacter.weapon = {type: this.itemTypes.Sword, mod: 5};
    
    
    
    // Set functions:
    this.playerCharacter.chooseAction = this.playerCharacterChooseAction;
    this.playerCharacter.updateTurn = this.playerCharacterUpdateTurn;
    this.playerCharacter.updateSprite = this.updateCharacterSprite;
    this.playerCharacter.takeDamage = this.playerCharacterTakeDamage;
    this.playerCharacter.stickSprite = this.stickCharacterSprite;
    
    // Create sprite:
    this.playerCharacter.sprite = this.characterSpritesGroup.create(this.playerCharacter.tileIndex.x * this.tileSize, this.playerCharacter.tileIndex.y * this.tileSize, 'Tileset');
    this.playerCharacter.sprite.frame = 50;
    this.playerCharacter.sprite.smoothed = false;
    this.playerCharacter.sprite.scale.setTo(this.scaleFactor, this.scaleFactor);
    this.playerCharacter.sprite.anchor.setTo(0.5, 0.5);
    
    // HP Sprite:
    this.playerCharacter.hpSprite = game.add.text(0, 0, '0', LARGE_GREEN_FONT);
    this.characterSpritesGroup.add(this.playerCharacter.hpSprite);
    
    // Damage sprite:
    this.playerCharacter.damageSprite = game.add.text(0, 0, '0', LARGE_RED_FONT);
    this.characterSpritesGroup.add(this.playerCharacter.damageSprite);
    
    this.updatePlayerCharacterStats();
    
    // Push player character to characterList:
    this.characterList.push(this.playerCharacter);
};

// UPDATE_PLAYER_CHARACTER_STATS:
// ************************************************************************************************
gameState.updatePlayerCharacterStats = function () {
    var i, pc = this.playerCharacter;
    
    // Base stats:
    pc.maxHp = 20 + (pc.level - 1) + (pc.god === 'Warrior' ? 5 : 0);
    pc.hpRegenRate = PLAYER_CHARACTER_REGEN_TIME;
    pc.agroRange = 6;
    pc.damageBonus = (pc.god === 'Warrior' ? 1 : 0);
    pc.maxFood = 500 + (pc.god === 'Hunter' ? 200 : 0);
    
    // Testing hack:
    //pc.damageBonus = 100;
    
    // Weapon:
    if (pc.weapon && pc.weapon.item.type.passiveEffect) {
        pc.weapon.item.type.passiveEffect(pc.weapon.item);
    }
    
    // Body:
    if (pc.body && pc.body.type.passiveEffect) {
        pc.body.type.passiveEffect(pc.body);
    }
    
    // Neck:
    if (pc.neck && pc.neck.type.passiveEffect) {
        pc.neck.type.passiveEffect(pc.neck);
    }
    
    // Status Effects:
    for (i = 0; i < pc.statusEffects.length; i += 1) {
        pc.statusEffects[i].effect();
    }
    
    // Cap health:
    if (pc.currentHp > pc.maxHp) {
        pc.currentHp = pc.maxHp;
    }
    
    // Cap food:
    if (pc.currentFood > pc.maxFood) {
        pc.currentFood = pc.maxFood;
    }

    if (pc.weapon.item.type.name === 'Sword'
            || pc.weapon.item.type.name === 'Spear'
            || pc.weapon.item.type.name === 'Axe'
            || pc.weapon.item.type.name === 'EnchantedAxe'
            || pc.weapon.item.type.name === 'EnchantedSword'
            || pc.weapon.item.type.name === 'EnchantedSpear') {
        pc.damage = pc.weapon.item.type.damage + pc.damageBonus;
    } else {
        pc.damage = pc.weapon.item.type.damage;
    }


};

// ADD CHARACTER STATUS EFFECT:
// ************************************************************************************************
gameState.addCharacterStatusEffect = function (character, name, effect, duration) {
    character.statusEffects.push({name: name, effect: effect, duration: duration});
};

// PLAYER_CHARACTER_GAIN_EXP:
// ************************************************************************************************
gameState.playerCharacterGainExp = function (amount) {
    var pc = gameState.playerCharacter;
    
    pc.exp += amount;
    
    if (pc.exp >= this.expPerLevel[pc.level + 1]) {
        pc.level += 1;
        pc.currentHp += 2;
        pc.maxHp += 2;
        gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                   gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'LEVEL UP', '#ffff00');
    } else if (amount > 0) {
        gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                   gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, '+' + amount + ' EXP', '#ffff00');
    }
};

// PLAYER CHARACTER EXP PERCENT:
// ************************************************************************************************
gameState.playerCharacterExpPercent = function () {
    var expToLevel = this.playerCharacter.exp - this.expPerLevel[this.playerCharacter.level],
        totalExpToLevel = this.expPerLevel[this.playerCharacter.level + 1] - this.expPerLevel[this.playerCharacter.level];
    return Math.floor(expToLevel / totalExpToLevel * 100);
    
};
// PLAYER_CHARACTER_UPDATE_TURN:
// ************************************************************************************************
gameState.playerCharacterUpdateTurn = function () {
    var i;
    
    // Update stats:
    gameState.updatePlayerCharacterStats();
    
    // Regan health:
    this.hpRegenTime -= 1;
    if (this.hpRegenTime <= 0) {
        this.hpRegenTime = this.hpRegenRate;
        
        if (this.currentHp < this.maxHp && this.currentFood > 0) {
            this.currentHp += Math.floor(this.maxHp / 10);
            
            if (this.currentHp > this.maxHp) {
                this.currentHp = this.maxHp;
            }
        }
    }
    
    // Eat food (don't die):  
    if (this.currentFood > 0) {
        this.currentFood -= 1;
    } else {
        if (this.starveTimer === 3) {
            this.starveTimer = 0;
            this.takeDamage(1, 'You starved to death');
        } else {
            this.starveTimer += 1;
        }
    }
    
    // Show hunger messages:
    if (this.currentFood === 100) {
        gameState.createDamageText(gameState.getPositionFromTileIndex(this.tileIndex).x,
                                   gameState.getPositionFromTileIndex(this.tileIndex).y - 12, 'HUNGRY', '#ff0000');

    } else if (this.currentFood === 50) {
        gameState.createDamageText(gameState.getPositionFromTileIndex(this.tileIndex).x,
                                   gameState.getPositionFromTileIndex(this.tileIndex).y - 12, 'VERY HUNGRY', '#ff0000');
    }
    
    // Tick status effects:
    for (i = this.statusEffects.length - 1; i >= 0; i -= 1) {
        this.statusEffects[i].duration -= 1;
        
        if (this.statusEffects[i].duration === 0) {
            gameState.createDamageText(gameState.getPositionFromTileIndex(this.tileIndex).x,
                                       gameState.getPositionFromTileIndex(this.tileIndex).y - 12,
                                       this.statusEffects[i].name + ' FADED', '#ffffff');
            this.statusEffects.splice(i, 1);
        }
    }
    
    // Take damage from lava:
    if (gameState.isAdjacentToLava(this.tileIndex)) {
        this.takeDamage(2, 'you were burned to death by lava');
    }
    
    // Update global turn:
    gameState.updateGlobalTurn();
};

// PLAYER_CHARACTER_CHOOSE_ACTION:
// ************************************************************************************************
gameState.playerCharacterChooseAction = function () {
    var path, tileIndex, click, pc = gameState.playerCharacter;
    
    if (this.state === 'WAITING' && this.clickQueue.length > 0) {
        // If its possible to complete the click queue ahead of schedule:
        if (gameState.tryToCompleteClickQueue()) {
            this.clickQueue = [];
            return;
        }
        
        click = this.clickQueue.pop();
        
        if (click.type === 'WAIT') {
            gameState.endTurn();
            return;
        }
        
        tileIndex = click.tileIndex;
        
        // Attacking:
        if (gameState.canPlayerCharacterAttack(tileIndex)) {
            gameState.playerCharacterAttack(tileIndex);
        
        // Opening door:
        } else if (gameState.canPlayerCharacterOpenDoor(tileIndex)) {
            gameState.playerCharacterOpenDoor(tileIndex);
        
        // Click stairs:
        } else if (gameState.canPlayerCharacterClickStairs(tileIndex)) {
            gameState.playerCharacterClickStairs(tileIndex);
            
        // Pray at alter:
        } else if (gameState.canPlayerCharacterPray(tileIndex)) {
            gameState.playerCharacterPray(tileIndex);
        
        // Moving:
        } else if (gameState.canPlayerCharacterMoveTo(tileIndex)) {
            gameState.playerCharacterMoveTo(tileIndex);
        }
    }
};

gameState.tryToCompleteClickQueue = function () {
    if (gameState.playerCharacter.clickQueue[0].type === 'WAIT') {
        return false;
    }
    
    var tileIndex = gameState.playerCharacter.clickQueue[0].tileIndex;
        
    // Attacking:
    if (gameState.canPlayerCharacterAttack(tileIndex)) {
        gameState.playerCharacterAttack(tileIndex);
        return true;

    // Opening door:
    } else if (gameState.canPlayerCharacterOpenDoor(tileIndex)) {
        gameState.playerCharacterOpenDoor(tileIndex);
        return true;

    // Click stairs:
    } else if (gameState.canPlayerCharacterClickStairs(tileIndex)) {
        gameState.playerCharacterClickStairs(tileIndex);
        return true;
        
    // Pray at alter:
    } else if (gameState.canPlayerCharacterPray(tileIndex)) {
        gameState.playerCharacterPray(tileIndex);
        return true;

    // Moving:
    } else if (gameState.canPlayerCharacterMoveTo(tileIndex)) {
        gameState.playerCharacterMoveTo(tileIndex);
        return true;
    }
    
    return false;
};



// UPDATE_CHARACTER_SPRITE:
// ************************************************************************************************
gameState.updateCharacterSprite = function () {
    var position = {x: this.tileIndex.x * gameState.tileSize,
                    y: this.tileIndex.y * gameState.tileSize},
        speed;
    
    if (this.type.name !== 'Bat'
            && (gameState.getTile(this.tileIndex).tileType.name === 'Water' || gameState.getTile(this.tileIndex).tileType.name === 'VineFloor')) {
        speed = 2;
    } else {
        speed = this.type.speed === 'fast' ? 4 : 2;
    }
    
    // Tween sprite X:
    if (this.sprite.x - 16 < position.x) {
        this.sprite.x += speed;
    } else if (this.sprite.x - 16 > position.x) {
        this.sprite.x -= speed;
    }
    
    // Tween sprite Y:
    if (this.sprite.y - 16 < position.y) {
        this.sprite.y += speed;
    } else if (this.sprite.y - 16 > position.y) {
        this.sprite.y -= speed;
    }
    
    // Update sprite facing:
    if (this.facing === 'RIGHT') {
        this.sprite.scale.setTo(gameState.scaleFactor, gameState.scaleFactor);
    } else {
        this.sprite.scale.setTo(-gameState.scaleFactor, gameState.scaleFactor);
    }
    
    // Position HP Sprite:
    if (this.hpSprite) {
        this.hpSprite.x = this.sprite.x - 24;
        this.hpSprite.y = this.sprite.y + 8;
        this.hpSprite.setText(this.currentHp);
    }
    
    // Position Damage Sprite:
    if (this.damageSprite) {
        this.damageSprite.x = this.sprite.x + 8;
        this.damageSprite.y = this.sprite.y + 8;
        this.damageSprite.setText(this.damage);
    }
    
    // Set sprite visibility based on visibility of tile:
    if (gameState.getTile(this.tileIndex).visible) {
        this.sprite.visible = true;
        
        // Crates and mushrooms don't have hp sprites:
        if (this.hpSprite) {
            this.hpSprite.visible = true;
            this.damageSprite.visible = true;
        }
        
        // Show sleep sprite:
        if (this.isAsleep && this.sleepSprite) {
            this.sleepSprite.visible = true;
        }
    } else {
        this.sprite.visible = false;
        
        // Crates and mushrooms don't have hp sprites:
        if (this.hpSprite) {
            this.hpSprite.visible = false;
            this.damageSprite.visible = false;
        }
        
        // Hide sleep sprite:
        if (this.sleepSprite) {
            this.sleepSprite.visible = false;
        }
    }
    
    // Set sprite index based on tile type:
    if (gameState.getTile(this.tileIndex).tileType.name === 'Water' && this.type.name !== 'Bat') {
        if (this.sprite.key !== 'HalfTileset') {
            this.sprite.loadTexture('HalfTileset');
            this.sprite.frame = 50 + this.type.imageIndex;
        }
    } else {
        if (this.sprite.key !== 'Tileset') {
            this.sprite.loadTexture('Tileset');
            this.sprite.frame = this.type.imageIndex;
        }
    }
    
    // End turn if the sprite has arived at its destination:
    if (this.state === 'MOVING' && this.sprite.x === position.x + 16 && this.sprite.y === position.y + 16) {
        this.state = 'WAITING';
        gameState.endTurn();
    }
};

gameState.stickCharacterSprite = function () {
    this.sprite.x = this.tileIndex.x * gameState.tileSize + 16;
    this.sprite.y = this.tileIndex.y * gameState.tileSize + 16;
};

// CAN_PLAYER_CHARACTER_MOVE_TO:
// ************************************************************************************************
gameState.canPlayerCharacterMoveTo = function (tileIndex) {
    var pc = gameState.playerCharacter;
    
    if (this.getTile(pc.tileIndex).tileType.name === 'Water' || this.getTile(pc.tileIndex).tileType.name === 'VineFloor') {
        return this.isTileIndexPassable(tileIndex) && this.getTileDistance(tileIndex, this.playerCharacter.tileIndex) <= 1.0;
    } else {
        return this.isTileIndexPassable(tileIndex) && this.getTileDistance(tileIndex, this.playerCharacter.tileIndex) <= 1.5;
    }
};

// PLAYER_CHARACTER_MOVE_TO:
// ************************************************************************************************
gameState.playerCharacterMoveTo = function (tileIndex) {
    this.setPlayerCharacterTileIndex(tileIndex);
    this.playerCharacter.state = 'MOVING';
};

// SET_PLAYER_CHARACTER_TILE_INDEX:
// ************************************************************************************************
gameState.setPlayerCharacterTileIndex = function (tileIndex) {
    var pc = gameState.playerCharacter,
        item;
    
    // Remove from previous tile:
    this.getTile(pc.tileIndex).character = null;
    
    if (tileIndex.x < pc.tileIndex.x) {
        pc.facing = 'LEFT';
    } else if (tileIndex.x > pc.tileIndex.x) {
        pc.facing = 'RIGHT';
    }
    
    // Set new tileIndex:
    pc.tileIndex.x = tileIndex.x;
    pc.tileIndex.y = tileIndex.y;
    
    // Enter new tile:
    this.getTile(pc.tileIndex).character = pc;
    
    // Call enterFunc if it exists:
    if (this.getTile(tileIndex).tileType.enterFunc) {
        this.getTile(tileIndex).tileType.enterFunc();
    }
    
    // Pick up any items:
    item = this.getTile(this.playerCharacter.tileIndex).item;
    
    if (item && item.type.name === 'AmuletOfYendor') {
        this.winGame();
    }
    
    // Try to add to weapon stack:
    if (item && item.type === pc.weapon.item.type && item.type.stackable) {
        pc.weapon.amount += item.amount;
        gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                   gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, item.type.niceName, '#ffffff');
        this.destroyItem(item);
        
        
        
    // Try to add to inventory:
    } else if (item && this.canAddItemToInventory(pc.inventory, item)) {
        
        // Stackable items always picked up:
        if (item.type.stackable) {
            this.addItemToInventory(pc.inventory, {type: item.type}, item.amount);
            gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                       gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, item.type.niceName, '#ffffff');
            this.destroyItem(item);
            
        // Pick up item as long as not double:
        } else if (this.countItemInInventory(pc.inventory, item) === 0
                   && (pc.weapon.item.type.name === 'Fists' || pc.weapon.item.type !== item.type)
                   && (!pc.body || pc.body.type !== item.type)
                   && (!pc.neck || pc.neck.type !== item.type)) {
            this.addItemToInventory(pc.inventory, {type: item.type}, item.amount);
            gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                       gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, item.type.niceName, '#ffffff');
            

            this.playerCharacterCleanInventory();
            this.destroyItem(item);
        }
        
        
    }
    
    // Calc LoS:
    this.calculateLoS();
};

// PLAYER_CHARACTER_CLEAN_INVENTORY:
// ************************************************************************************************
gameState.playerCharacterCleanInventory = function () {
    var pc = this.playerCharacter;
    
    // If the pc has plate armor then remove any leather or chain:
    if (this.countItemInInventory(pc.inventory, {type: this.itemTypes.PlateArmor}) > 0
            || (pc.body && pc.body.type === this.itemTypes.PlateArmor)) {
            
        // Remove chain from body:
        if (pc.body && pc.body.type === this.itemTypes.ChainArmor) {
            pc.body = null;
        }
        // Remove chain from inventory:
        if (this.countItemInInventory(pc.inventory, {type: this.itemTypes.ChainArmor}) > 0) {
            this.removeItemFromInventory(pc.inventory, {type: this.itemTypes.ChainArmor}, 1);
        }
        
        // Remove leather from body:
        if (pc.body && pc.body.type === this.itemTypes.LeatherArmor) {
            pc.body = null;
        }
        // Remove leather from inventory:
        if (this.countItemInInventory(pc.inventory, {type: this.itemTypes.LeatherArmor}) > 0) {
            this.removeItemFromInventory(pc.inventory, {type: this.itemTypes.LeatherArmor}, 1);
        }
    }
    
    // If the player has chain armor then remove leather:
    if (this.countItemInInventory(pc.inventory, {type: this.itemTypes.ChainArmor}) > 0
            || (pc.body && pc.body.type === this.itemTypes.ChainArmor)) {
        // Remove leather from body:
        if (pc.body && pc.body.type === this.itemTypes.LeatherArmor) {
            pc.body = null;
        }
        // Remove leather from inventory:
        if (this.countItemInInventory(pc.inventory, {type: this.itemTypes.LeatherArmor}) > 0) {
            this.removeItemFromInventory(pc.inventory, {type: this.itemTypes.LeatherArmor}, 1);
        }
    }
       
    // If the player has an enchanted sword then remove normal sword:
    if (this.countItemInInventory(pc.inventory, {type: this.itemTypes.EnchantedSword}) > 0
            || (pc.weapon && pc.weapon.item.type === this.itemTypes.EnchantedSword)) {
    
        // Remove sword from weapon
        if (pc.weapon && pc.weapon.item.type === this.itemTypes.Sword) {
            pc.weapon.item.type = this.itemTypes.Fists;
        }
        // Remove sword from inventory:
        if (this.countItemInInventory(pc.inventory, {type: this.itemTypes.Sword}) > 0) {
            this.removeItemFromInventory(pc.inventory, {type: this.itemTypes.Sword}, 1);
        }
    }
    
    // If the player has an enchanted spear then remove normal spear:
    if (this.countItemInInventory(pc.inventory, {type: this.itemTypes.EnchantedSpear}) > 0
            || (pc.weapon && pc.weapon.item.type === this.itemTypes.EnchantedSpear)) {
    
        // Remove sword from weapon
        if (pc.weapon && pc.weapon.item.type === this.itemTypes.Spear) {
            pc.weapon.item.type = this.itemTypes.Fists;
        }
        // Remove spear from inventory:
        if (this.countItemInInventory(pc.inventory, {type: this.itemTypes.Spear}) > 0) {
            this.removeItemFromInventory(pc.inventory, {type: this.itemTypes.Spear}, 1);
        }
    }
    
    // If the player has an enchanted axe then remove normal axe:
    if (this.countItemInInventory(pc.inventory, {type: this.itemTypes.EnchantedAxe}) > 0
            || (pc.weapon && pc.weapon.item.type === this.itemTypes.EnchantedAxe)) {
    
        // Remove sword from weapon
        if (pc.weapon && pc.weapon.item.type === this.itemTypes.Axe) {
            pc.weapon.item.type = this.itemTypes.Fists;
        }
        // Remove sword from inventory:
        if (this.countItemInInventory(pc.inventory, {type: this.itemTypes.Axe}) > 0) {
            this.removeItemFromInventory(pc.inventory, {type: this.itemTypes.Axe}, 1);
        }
    }
    
};

// CAN_ATTACK_TILE_INDEX:
// ************************************************************************************************
gameState.canPlayerCharacterAttack = function (tileIndex) {
    var pc = gameState.playerCharacter;
    
    return this.isTileIndexInBounds(tileIndex)
            && this.getTileDistance(pc.tileIndex, tileIndex) <= pc.weapon.item.type.range
            && this.isRayClear(pc.tileIndex, tileIndex)
            && this.getTile(tileIndex).character !== null
            && this.getTile(tileIndex).character !== pc
            && this.getTile(tileIndex).character.isAlive
            && this.getTile(tileIndex).visible;
};

// PLAYER_CHARACTER_ATTACK_TILE_INDEX:
// ************************************************************************************************
gameState.playerCharacterAttack = function (tileIndex) {
    this.playerCharacter.weapon.item.type.effect(tileIndex, this.playerCharacter.weapon.item);
    
    // End Turn:
    gameState.endTurn();
};

// PLAYER_CHARACTER_TAKE_DAMAGE:
// ************************************************************************************************
gameState.playerCharacterTakeDamage = function (amount, deathText) {
    if (!deathText) {
        deathText = 'You were killed';
    }
    
    gameState.deathText = deathText + ' on level ' + gameState.dungeonLevel;
    
    gameState.updatePlayerCharacterStats();
    
    // Random chance do dodge:
    if (game.rnd.frac() <= 0.05) {
        gameState.createDamageText(gameState.getPositionFromTileIndex(this.tileIndex).x,
                                   gameState.getPositionFromTileIndex(this.tileIndex).y - 12, 'DODGED', '#ffffff');
        return 0;
    }
    
    // Random chance to block:
    if ((this.weapon.item.type.name === 'Sword' || this.weapon.item.type.name === 'EnchantedSword') && game.rnd.frac() <= 0.2) {
        gameState.createDamageText(gameState.getPositionFromTileIndex(this.tileIndex).x,
                                   gameState.getPositionFromTileIndex(this.tileIndex).y - 12, 'BLOCKED', '#ffffff');
        return 0;
    }
    
    this.currentHp -= amount;

    // Create damage text:
    gameState.createDamageText(gameState.getPositionFromTileIndex(this.tileIndex).x,
                               gameState.getPositionFromTileIndex(this.tileIndex).y - 12, '-' + amount, '#ff0000');

    if (this.currentHp <= 0) {
        gameState.score.unshift(gameState.deathText);
        localStorage.setItem('Score', JSON.stringify(gameState.score));
        game.state.start('lose');
    }

    return amount;
};

// HEAL_PLAYER:
// ************************************************************************************************
gameState.healPlayer = function (amount) {
    if (this.playerCharacter.currentHp + amount > this.playerCharacter.maxHp) {
        this.playerCharacter.currentHp = this.playerCharacter.maxHp;
    } else {
        this.playerCharacter.currentHp += amount;
    }
};

// CREATE_PLAYER_CHARACTER_INPUT:
// ************************************************************************************************
gameState.createPlayerCharacterInput = function () {
    // Clicking pointer:
    game.input.onDown.add(function () {
        if (gameState.instructionsSprite) {
            gameState.paused = false;
            gameState.instructionsSprite.destroy();
        }
        
        var pointerWorldPosition = {x: game.input.activePointer.x + game.camera.x, y: game.input.activePointer.y + game.camera.y},
            tileIndexClicked = this.getTileIndexFromPosition(pointerWorldPosition);
        
        if (this.game.input.activePointer.x < 470) {
            this.clickTileIndex(tileIndexClicked);
        }
    }, this);
};

// CLICK_TILE_INDEX:
// ************************************************************************************************
gameState.clickTileIndex = function (tileIndex) {
    var path, i, pc = gameState.playerCharacter;
    
    // Skip if its not the players turn:
    if (this.characterList[this.activeCharacterIndex] !== pc || this.projectileList.length > 0) {
        return;
    }
    
    // Skip if tileIndex is out of bounds:
    if (!this.isTileIndexInBounds(tileIndex)) {
        return;
    }
    
    // Zapping:
    if (this.canPlayerCharacterZap(tileIndex)) {
        this.playerCharacterZap(tileIndex);
        
    // Waiting:
    } else if (this.getTile(tileIndex) && this.getTile(tileIndex).character === pc) {
        this.waitClicked();
    
    // Else we push a list of clicks ending in the index:
    } else {
        path = this.calculatePath(pc.tileIndex, tileIndex);
        
        if (path && path.length > 0) {
            for (i = 0; i < path.length; i += 1) {
                pc.clickQueue[i] = {type: 'CLICK', tileIndex: path[i]};
            }
        // Attacking: (takes care of no path to target i.e. ice):
        } else if (this.canPlayerCharacterAttack(tileIndex)) {
            pc.clickQueue[0] = {type: 'CLICK', tileIndex: tileIndex};
        }
    }
};

// CAN_PLAYER_CHARACTER_ZAP:
// ************************************************************************************************
gameState.canPlayerCharacterZap = function (tileIndex) {
    return this.state === 'ZAP_STATE';
};

// PLAYER_CHARACTER_ZAP:
// ************************************************************************************************
gameState.playerCharacterZap = function (tileIndex) {
    var pc = gameState.playerCharacter;
    
    pc.activeWand.type.effect(tileIndex, pc.activeWand);
    this.state = 'GAME_STATE';
    this.endTurn();
};

// CAN_PLAYER_CHARACTER_CLICK_STAIRS:
// ************************************************************************************************
gameState.canPlayerCharacterClickStairs = function (tileIndex) {
    return this.getTileDistance(tileIndex, this.playerCharacter.tileIndex) <= 1.5
            && (this.getTile(tileIndex).tileType === this.tileTypes.UpStair
            || this.getTile(tileIndex).tileType === this.tileTypes.DownStair);
};

// PLAYER_CHARACTER_CLICK_STAIRS:
// ************************************************************************************************
gameState.playerCharacterClickStairs = function (tileIndex) {
    if (this.getTile(tileIndex).tileType === this.tileTypes.DownStair) {
        gameState.descendStairs();
    } else if (this.getTile(tileIndex).tileType === this.tileTypes.UpStair) {
        gameState.ascendStairs();
    }
};

// CAN_PLAYER_CHARACTER_OPEN_DOOR:
// ************************************************************************************************
gameState.canPlayerCharacterOpenDoor = function (tileIndex) {
    return this.isTileIndexInBounds(tileIndex)
            && this.getTileDistance(tileIndex, this.playerCharacter.tileIndex) <= 1.5
            && this.getTile(tileIndex).tileType === this.tileTypes.ClosedDoor;
};

// PLAYER_CHARACTER_OPEN_DOOR:
// ************************************************************************************************
gameState.playerCharacterOpenDoor = function (tileIndex) {
    // Opening trapped door:
    if (this.getTile(tileIndex).tileType === this.tileTypes.TrappedDoor) {
        this.createFire(gameState.playerCharacter.tileIndex, 3);
    }
    
    this.setTileType(tileIndex, this.tileTypes.OpenDoor);
    this.calculateLoS();
    
    // End Turn:
    this.endTurn();
};

// PLAYER_CHARACTER_PRAY::
// ************************************************************************************************
gameState.playerCharacterPray = function (tileIndex) {
    var pc = gameState.playerCharacter,
        alterTypeName = this.getTile(tileIndex).tileType.name;
    
    if (alterTypeName === 'WarriorAlter') {
        pc.god = 'Warrior';
        
        gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                   gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'WORSHIP THE WARRIOR', '#ffffff');
    } else if (alterTypeName === 'MageAlter') {
        pc.god = 'Mage';
        
        gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                   gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'WORSHIP THE MAGE', '#ffffff');
    } else if (alterTypeName === 'HunterAlter') {
        pc.god = 'Hunter';
        
        gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                   gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'WORSHIP THE HUNTER', '#ffffff');
    }
    
    gameState.updatePlayerCharacterStats();
};

// CAN PLAYER CHARACTER PRAY:
// ************************************************************************************************
gameState.canPlayerCharacterPray = function (tileIndex) {
    return this.getTileDistance(tileIndex, this.playerCharacter.tileIndex) <= 1.5
            && (this.getTile(tileIndex).tileType.name === 'WarriorAlter'
                || this.getTile(tileIndex).tileType.name === 'MageAlter'
                || this.getTile(tileIndex).tileType.name === 'HunterAlter');
    
};
// WIELD CLICKED:
// ************************************************************************************************
gameState.wieldClicked = function () {
    if (this.characterList[this.activeCharacterIndex] === this.playerCharacter) {
        var pc = gameState.playerCharacter,
            item = this.HUD.inventoryItemIcons.selectedItem,
            itemAmount = this.countItemInInventory(pc.inventory, item);

        // Put old item back in inventory:
        if (pc.weapon.item.type !== gameState.itemTypes.Fists) {
            gameState.addItemToInventory(pc.inventory, pc.weapon.item, pc.weapon.amount);
        }

        // Put new item in weapon slot:
        pc.weapon.item = item;
        pc.weapon.amount = itemAmount;

        // Remove item from inventory:
        gameState.removeItemFromInventory(gameState.playerCharacter.inventory, item, itemAmount);

        this.updateHUDSprites();

        gameState.updatePlayerCharacterStats();
    }
};

// WEAR CLICKED:
// ************************************************************************************************
gameState.wearClicked = function () {
    if (this.characterList[this.activeCharacterIndex] === this.playerCharacter) {
        var item = this.HUD.inventoryItemIcons.selectedItem;

        // Put old item back in inventory:
        if (gameState.playerCharacter.body) {
            gameState.addItemToInventory(gameState.playerCharacter.inventory, gameState.playerCharacter.body, 1);
        }

        // Put new item in body slot:
        gameState.playerCharacter.body = item;

        // Remove item from inventory:
        gameState.removeItemFromInventory(gameState.playerCharacter.inventory, item, 1);

        this.updateHUDSprites();

        gameState.updatePlayerCharacterStats();
    }
};

// EQUIP AMULET CLICKED:
// ************************************************************************************************
gameState.equipAmuletClicked = function () {
    if (this.characterList[this.activeCharacterIndex] === this.playerCharacter) {
        var item = this.HUD.inventoryItemIcons.selectedItem;

        // Put old item back in inventory:
        if (gameState.playerCharacter.neck) {
            gameState.addItemToInventory(gameState.playerCharacter.inventory, gameState.playerCharacter.neck, 1);
        }

        // Put new item in neck slot:
        gameState.playerCharacter.neck = item;

        // Remove item from inventory:
        gameState.removeItemFromInventory(gameState.playerCharacter.inventory, item, 1);

        this.updateHUDSprites();

        gameState.updatePlayerCharacterStats();
    }
};

// DROP_CLICKED:
// ************************************************************************************************
gameState.dropClicked = function () {
    if (this.characterList[this.activeCharacterIndex] === this.playerCharacter) {
        var item = this.HUD.inventoryItemIcons.selectedItem;
        this.createItem(this.playerCharacter.tileIndex, item.type, item.mod, item.charges, this.countItemInInventory(this.playerCharacter.inventory, item));
        this.removeItemFromInventory(this.playerCharacter.inventory, item, this.countItemInInventory(this.playerCharacter.inventory, item));
    }
};

// DRINK_CLICKED:
// ************************************************************************************************
gameState.drinkClicked = function () {
    if (this.characterList[this.activeCharacterIndex] === this.playerCharacter) {
        var item = this.HUD.inventoryItemIcons.selectedItem;
        item.type.effect(item);
        this.endTurn();
    }
};

// READ CLICKED:
// ************************************************************************************************
gameState.readClicked = function () {
    if (this.characterList[this.activeCharacterIndex] === this.playerCharacter) {
        var item = this.HUD.inventoryItemIcons.selectedItem;
        item.type.effect(item);
        this.endTurn();
    }
};

// EAT_CLICKED:
// ************************************************************************************************
gameState.eatClicked = function () {
    if (this.characterList[this.activeCharacterIndex] === this.playerCharacter) {
        var item = this.HUD.inventoryItemIcons.selectedItem;
        item.type.effect(item);
        this.endTurn();
    }
};

// ZAP_CLICKED:
// ************************************************************************************************
gameState.zapClicked = function () {
    var pc = gameState.playerCharacter;
    
    if (this.characterList[this.activeCharacterIndex] === this.playerCharacter) {
        this.state = 'ZAP_STATE';
        pc.activeWand = this.HUD.inventoryItemIcons.selectedItem;
    }
};

// CANCEL ZAP CLICKED:
// ************************************************************************************************
gameState.cancelZapClicked = function () {
    var pc = gameState.playerCharacter;
    
    if (this.characterList[this.activeCharacterIndex] === this.playerCharacter && this.state === 'ZAP_STATE') {
        this.state = 'GAME_STATE';
    }
};

// WAIT_CLICKED:
// ************************************************************************************************
gameState.waitClicked = function () {
    var pc = gameState.playerCharacter;
    
    if (this.characterList[this.activeCharacterIndex] === pc) {
        pc.clickQueue.push({type: 'WAIT'});
        gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                   gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'WAIT', '#ffffff');

    }
};

// REST_CLICKED:
// ************************************************************************************************
gameState.restClicked = function () {
    var i, pc = gameState.playerCharacter, turnsToHeal;

    if (this.characterList[this.activeCharacterIndex] === pc && pc.currentHp < pc.maxHp && this.state === 'GAME_STATE') {
   
        gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                   gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'REST', '#ffffff');
        
        for (i = 0; i < pc.hpRegenTime; i += 1) {
            pc.clickQueue.push({type: 'WAIT'});
        }
    }
};