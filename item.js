/*global game, gameState, console, PLAYER_CHARACTER_FOOD_TIME*/
'use strict';

// CREATE_ITEM_TYPES:
// ************************************************************************************************
gameState.createItemTypes = function () {
    var meleeEffect,
        axeEffect,
        healEffect,
        eatEffect,
        fireBallEffect,
        polymorphEffect,
        iceEffect,
        armorPassiveEffect,
        regenPassiveEffect,
        hungerPassiveEffect,
        strengthPotionEffect,
        strengthEffect,
        protectionPotionEffect,
        protectionEffect,
        projectileEffect,
        fireNova,
        blinkEffect,
        amuletOfStrengthEffect,
        lightningEffect;
    
    // MELEE EFFECT:
    // ********************************************************************************************
    meleeEffect = function (tileIndex, item) {
        var pc = gameState.playerCharacter,
            targetCharacter = gameState.getTile(tileIndex).character;
        
        targetCharacter.takeDamage(pc.damage);
    };
    
    // AXE EFFECT:
    // ********************************************************************************************
    axeEffect = function (tileIndex, item) {
        var pc = gameState.playerCharacter,
            targetCharacter,
            x,
            y;
        for (x = pc.tileIndex.x - 1; x <= pc.tileIndex.x + 1; x += 1) {
            for (y = pc.tileIndex.y - 1; y <= pc.tileIndex.y + 1; y += 1) {
                targetCharacter = gameState.getTile({x: x, y: y}).character;
                
                if (targetCharacter && targetCharacter !== pc) {
                    targetCharacter.takeDamage(pc.damage);
                }
            }
        }
        
        
    };
    
    // PROJECTILE EFFECT:
    // ********************************************************************************************
    projectileEffect = function (tileIndex, item) {
        var pc = gameState.playerCharacter,
            i;
        
        // Create arrow:
        gameState.createProjectile(pc, tileIndex, item.type.name);
        
        // Remove ammo:
        if (pc.god === 'Hunter' && game.rnd.frac() <= 0.5) {
            gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                       gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'SAVED ' + item.type.niceName, '#ffffff');
        } else {
            pc.weapon.amount -= 1;
        }
        
        if (pc.weapon.amount === 0) {
            // Look for a weapon in inventory:
            for (i = 0; i < pc.inventory.length; i += 1) {
                if (pc.inventory[i].item.type.slot === 'weapon') {
                    pc.weapon.item = {type: pc.inventory[i].item.type};
                    pc.weapon.amount = pc.inventory[i].amount;
                    
                    gameState.removeItemFromInventory(pc.inventory, pc.inventory[i].item, pc.inventory[i].amount);
                    break;
                }
            }
        }
    };
    
    // HEAL EFFECT:
    // ********************************************************************************************
    healEffect = function (item) {
        var pc = gameState.playerCharacter;
        
        gameState.healPlayer(pc.maxHp);

        gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                   gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'HEALED', '#00ff00');
        
        // Remove potion:
        gameState.removeItemFromInventory(pc.inventory, item, 1);
    };
    
    // STRENGTH POTION EFFECT:
    // ********************************************************************************************
    strengthPotionEffect = function (item) {
        var pc = gameState.playerCharacter;
        
        gameState.addCharacterStatusEffect(pc, 'STRENGTH', strengthEffect, 50);
        
        gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                   gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'STRENGTH', '#0000ff');
        
        // Remove potion:
        gameState.removeItemFromInventory(pc.inventory, item, 1);
    };
    
    // PROTECTION POTION EFFECT:
    // ********************************************************************************************
    protectionPotionEffect = function (item) {
        var pc = gameState.playerCharacter;
        
        gameState.addCharacterStatusEffect(pc, 'PROTECTION', protectionEffect, 50);
        gameState.updatePlayerCharacterStats();
        gameState.healPlayer(pc.maxHp);
        
        gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                   gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'PROTECTION', '#ffffff');
        
        // Remove potion:
        gameState.removeItemFromInventory(pc.inventory, item, 1);
    };
    
    // FIRE NOVA EFFECT:
    // ********************************************************************************************
    fireNova = function (item) {
        var pc = gameState.playerCharacter, x, y;
        
        // Check 9 squares:
        for (x = pc.tileIndex.x - 2; x <= pc.tileIndex.x + 2; x += 1) {
            for (y = pc.tileIndex.y - 2; y <= pc.tileIndex.y + 2; y += 1) {
                if (gameState.isTileIndexInBounds({x: x, y: y})) {
                    // Create fire:
                    if (gameState.isTileIndexPassable({x: x, y: y})
                            || (gameState.getTile({x: x, y: y}).character && gameState.getTile({x: x, y: y}).character !== pc)) {
                        gameState.createFire({x: x, y: y}, 16);

                    } else if (gameState.getTile({x: x, y: y}).character !== pc && game.rnd.frac() <= 0.75) {
                        gameState.getTile({x: x, y: y}).tileType = gameState.tileTypes[gameState.areaTileTypes[gameState.getTile({x: x, y: y}).areaTypeName].Floor];
                        gameState.createFire({x: x, y: y}, 16);
                    }
                }
            }
        }
        
        // Remove scroll:
        if (pc.god === 'Mage' && game.rnd.frac() <= 0.5) {
            gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                       gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'SAVED ' + item.type.niceName, '#ffffff');
        } else {
            gameState.removeItemFromInventory(pc.inventory, item, 1);
        }
    };
    
    // EAT EFFECT:
    // ********************************************************************************************
    eatEffect = function (item) {
        var pc = gameState.playerCharacter;
        
        pc.currentFood = pc.maxFood;
        
        gameState.healPlayer(pc.maxHp);

        // Remove food:
        gameState.removeItemFromInventory(pc.inventory, item, 1);
    };
    
    // FIRE BALL EFFECT:
    // ********************************************************************************************
    fireBallEffect = function (tileIndex, item) {
        var pc = gameState.playerCharacter, x, y, tileIndexIt;
        
        // Check 9 squares:
        for (x = -1; x < 2; x += 1) {
            for (y = -1; y < 2; y += 1) {
                tileIndexIt = {x: tileIndex.x + x, y: tileIndex.y + y};
                if (gameState.isTileIndexInBounds(tileIndexIt)) {
                    // Create fire:
                    if (gameState.isTileIndexPassable(tileIndexIt) || gameState.getTile(tileIndexIt).character) {
                        gameState.createFire(tileIndexIt, 16);

                    // Chance to shatter walls:
                    } else if (game.rnd.frac() <= 0.75) {

                        gameState.getTile(tileIndexIt).tileType = gameState.tileTypes[gameState.areaTileTypes[gameState.getTile(tileIndexIt).areaTypeName].Floor];
                        gameState.createFire(tileIndexIt, 16);
                    }
                }
            }
        }
        
        // Remove scroll:
        if (pc.god === 'Mage' && game.rnd.frac() <= 0.5) {
            gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                       gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'SAVED ' + item.type.niceName, '#ffffff');
        } else {
            gameState.removeItemFromInventory(pc.inventory, item, 1);
        }
    };
    
    //  LIGHTNING EFFECT:
    // ********************************************************************************************
    lightningEffect = function (tileIndex, item) {
        var pc = gameState.playerCharacter;
        
        gameState.createLightning(pc.tileIndex, tileIndex, 16);
        
        // Remove scroll:
        if (pc.god === 'Mage' && game.rnd.frac() <= 0.5) {
            gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                       gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'SAVED ' + item.type.niceName, '#ffffff');
        } else {
            gameState.removeItemFromInventory(pc.inventory, item, 1);
        }
    };
    
    // POLYMORPH EFFECT:
    // ********************************************************************************************
    polymorphEffect = function (tileIndex, item) {
        var pc = gameState.playerCharacter,
            npc = gameState.getTile(tileIndex).character,
            newTypeName;
        
        if (npc && npc !== pc) {
            gameState.destroyNPC(npc);
            
            // Get new type name:
            newTypeName = gameState.getRandomNPCName();
            while (newTypeName === npc.type.name) {
                newTypeName = gameState.getRandomNPCName();
            }
            
            gameState.createNPC(npc.tileIndex, newTypeName);
        }
        
        // Remove scroll:
        if (pc.god === 'Mage' && game.rnd.frac() <= 0.5) {
            gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                       gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'SAVED ' + item.type.niceName, '#ffffff');
        } else {
            gameState.removeItemFromInventory(pc.inventory, item, 1);
        }
    };
    
    // BLINK EFFECT:
    // ********************************************************************************************
    blinkEffect = function (tileIndex, item) {
        var pc = gameState.playerCharacter;
        
        if (gameState.isTileIndexPassable(tileIndex)) {
            gameState.setPlayerCharacterTileIndex(tileIndex);
            pc.stickSprite();
            
            // Remove scroll:
            if (pc.god === 'Mage' && game.rnd.frac() <= 0.5) {
                gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                           gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'SAVED ' + item.type.niceName, '#ffffff');
            } else {
                gameState.removeItemFromInventory(pc.inventory, item, 1);
            }
        }
    };
    
    // ICE EFFECT:
    // ********************************************************************************************
    iceEffect = function (tileIndex, item) {
        var pc = gameState.playerCharacter, x, y, tileIndexIt;
        
        // Check 9 squares:
        for (x = -1; x < 2; x += 1) {
            for (y = -1; y < 2; y += 1) {
                tileIndexIt = {x: tileIndex.x + x, y: tileIndex.y + y};
                // Create Ice:
                if (gameState.isTileIndexPassable(tileIndexIt) || (gameState.isTileIndexInBounds(tileIndexIt) && gameState.getTile(tileIndexIt).character)) {
                    gameState.createIce(tileIndexIt);
                }
            }
        }

        // Remove scroll:
        if (pc.god === 'Mage' && game.rnd.frac() <= 0.5) {
            gameState.createDamageText(gameState.getPositionFromTileIndex(pc.tileIndex).x,
                                       gameState.getPositionFromTileIndex(pc.tileIndex).y - 12, 'SAVED ' + item.type.niceName, '#ffffff');
        } else {
            gameState.removeItemFromInventory(pc.inventory, item, 1);
        }
    };
    
    // ARMOR PASSIVE EFFECT:
    // ********************************************************************************************
    armorPassiveEffect = function (item) {
        gameState.playerCharacter.maxHp += this.armor;
    };
    
    // AMULET OF STRENGTH EFFECT:
    // ********************************************************************************************
    amuletOfStrengthEffect = function (item) {
        gameState.playerCharacter.damageBonus += 1;
    };
    
    // REGEN PASSIVE EFFECT:
    // ********************************************************************************************
    regenPassiveEffect = function (item) {
        gameState.playerCharacter.hpRegenRate -= 2;
        if (gameState.playerCharacter.hpRegenRate < 1) {
            gameState.playerCharacter.hpRegenRate = 1;
        }
    };
    
    // HUNGER PASSIVE EFFECT:
    // ********************************************************************************************
    hungerPassiveEffect = function (item) {
        gameState.playerCharacter.maxFood += 250;
    };
    
    // STORM STRENGTH EFFECT:
    // ********************************************************************************************
    strengthEffect = function () {
        gameState.playerCharacter.damageBonus += 3;
    };
    
    // PROTECTION EFFECT:
    // ********************************************************************************************
    protectionEffect = function () {
        gameState.playerCharacter.maxHp += 10;
    };
    
    
    
    this.itemTypes = {Fists:                {name: 'Fists',  imageIndex: 0,  damage: 1, range: 1, armor: 0, effect: meleeEffect,  slot: 'weapon', dropAmount: 0},
                      
                      // Weapons:
                      Sword:                {name: 'Sword',                 niceName: 'Sword', imageIndex: 25, damage: 6, range: 1.5, effect: meleeEffect,  slot: 'weapon', dropAmount: 1, stackable: false},
                      Spear:                {name: 'Spear',                 niceName: 'Spear', imageIndex: 26, damage: 4, range: 2.0, effect: meleeEffect,  slot: 'weapon', dropAmount: 1, stackable: false},
                      Axe:                  {name: 'Axe',                   niceName: 'Axe', imageIndex: 27, damage: 6, range: 1.5, effect: axeEffect,  slot: 'weapon', dropAmount: 1, stackable: false},
                      Dart:                 {name: 'Dart',                  niceName: 'Dart', imageIndex: 28, damage: 4, range: 8.0, effect: projectileEffect, slot: 'weapon', dropAmount: 10, stackable: true},
                      Javalin:              {name: 'Javalin',               niceName: 'Javalin', imageIndex: 29, damage: 8, range: 8.0, effect: projectileEffect, slot: 'weapon', dropAmount: 4, stackable: true},
                      ThrowingNet:          {name: 'ThrowingNet',           niceName: 'Throwing Net', imageIndex: 46, damage: 0, range: 8.0, effect: projectileEffect, slot: 'weapon', dropAmount: 6, stackable: true},
                      
                      // Enchanted Weapons:
                      EnchantedSword:       {name: 'EnchantedSword',        niceName: 'Enchanted Sword', imageIndex: 30, damage: 7, range: 1.5, effect: meleeEffect,  slot: 'weapon', dropAmount: 1, stackable: false},
                      EnchantedSpear:       {name: 'EnchantedSpear',        niceName: 'Enchanted Spear', imageIndex: 31, damage: 5, range: 2.0, effect: meleeEffect,  slot: 'weapon', dropAmount: 1, stackable: false},
                      EnchantedAxe:         {name: 'EnchantedAxe',          niceName: 'Enchanted Axe', imageIndex: 32, damage: 7, range: 1.5, effect: axeEffect,  slot: 'weapon', dropAmount: 1, stackable: false},
                      
                      // Potions:
                      HealingPotion:        {name: 'HealingPotion',         niceName: 'Healing Potion', imageIndex: 33, effect: healEffect,             slot: 'potion', dropAmount: 1, stackable: true},
                      ProtectionPotion:     {name: 'ProtectionPotion',      niceName: 'Protection Potion', imageIndex: 35, effect: protectionPotionEffect, slot: 'potion', dropAmount: 1, stackable: true},
                      StrengthPotion:       {name: 'StrengthPotion',        niceName: 'Strength Potion', imageIndex: 36, effect: strengthPotionEffect,   slot: 'potion', dropAmount: 1, stackable: true},
                      
                      // Food:
                      Food:                 {name: 'Food',                  niceName: 'Food', imageIndex: 37, effect: eatEffect, slot: 'food', dropAmount: 1, stackable: true},
                      
                      // Scrolls:
                      ScrollOfFireNova:     {name: 'ScrollOfFireNova',      niceName: 'Scroll Of FireNova', imageIndex: 38, effect: fireNova, slot: 'scroll', dropAmount: 2, stackable: true},
                      
                      // Targeted scrolls:
                      ScrollOfFireBall:     {name: 'ScrollOfFireBall',      niceName: 'Scroll Of FireBall', imageIndex: 38, range: 8, effect: fireBallEffect,   slot: 'wand', dropAmount: 2, stackable: true},
                      ScrollOfIce:          {name: 'ScrollOfIce',           niceName: 'Scroll Of Ice', imageIndex: 38, range: 8, effect: iceEffect,        slot: 'wand', dropAmount: 2, stackable: true},
                      ScrollOfPolymorph:    {name: 'ScrollOfPolymorph',     niceName: 'Scroll Of Polymorph', imageIndex: 38, range: 8, effect: polymorphEffect,  slot: 'wand', dropAmount: 2, stackable: true},
                      ScrollOfBlink:        {name: 'ScrollOfBlink',         niceName: 'Scroll Of Blink', imageIndex: 38, range: 8, effect: blinkEffect,      slot: 'wand', dropAmount: 2, stackable: true},
                      ScrollOfLightning:    {name: 'ScrollOfLightning',     niceName: 'Scroll Of Lightning', imageIndex: 38, range: 8, effect: lightningEffect,  slot: 'wand', dropAmount: 2, stackable: true},
                      
                      // Armor:
                      LeatherArmor:         {name: 'LeatherArmor',          niceName: 'Leather Armor', imageIndex: 39, armor: 4, slot: 'body', dropAmount: 1, stackable: false, passiveEffect: armorPassiveEffect},
                      ChainArmor:           {name: 'ChainArmor',            niceName: 'Chain Armor', imageIndex: 40, armor: 6, slot: 'body', dropAmount: 1, stackable: false, passiveEffect: armorPassiveEffect},
                      PlateArmor:           {name: 'PlateArmor',            niceName: 'Plate Armor', imageIndex: 41, armor: 10, slot: 'body', dropAmount: 1, stackable: false, passiveEffect: armorPassiveEffect},

                      // Amulet:
                      AmuletOfProtection:   {name: 'AmuletOfProtection',    niceName: 'Amulet Of Protection', imageIndex: 42, armor: 5, slot: 'neck', dropAmount: 1, stackable: false, passiveEffect: armorPassiveEffect},
                      AmuletOfRegeneration: {name: 'AmuletOfRegeneration',  niceName: 'Amulet Of Regeneration', imageIndex: 43, slot: 'neck',           dropAmount: 1, stackable: false, passiveEffect: regenPassiveEffect},
                      AmuletOfSustinence:   {name: 'AmuletOfSustinence',    niceName: 'Amulet Of Sustinence', imageIndex: 44, slot: 'neck',           dropAmount: 1, stackable: false, passiveEffect: hungerPassiveEffect},
                      AmuletOfStrength:     {name: 'AmuletOfStrength',      niceName: 'Amulet Of Strength', imageIndex: 45, slot: 'neck',           dropAmount: 1, stackable: false, passiveEffect: amuletOfStrengthEffect},
                     
                      // Amulet of Yendor:
                      AmuletOfYendor:       {name: 'AmuletOfYendor',        niceName: 'Amulet Of Yendor', imageIndex: 47, slot: 'neck',           dropAmount: 1, stackable: false, passiveEffect: null}};
                      
    
    // Item Descriptions:
    this.itemTypes.Sword.desc =                 'SWORD: 6DMG, CAN BLOCK ATTACKS.';
    this.itemTypes.Spear.desc =                 'SPEAR: 4DMG, CAN HIT ENEMIES 2 TILES AWAY.';
    this.itemTypes.Axe.desc =                   'AXE: 6DMG, HITS ALL ADJACENT ENEMIES.';
    this.itemTypes.Dart.desc =                  'DART: 4DMG, RANGED ATTACK.';
    this.itemTypes.Javalin.desc =               'JAVALIN: 8DMG, RANGED ATTACK.';
    this.itemTypes.ThrowingNet.desc =           'THROWING NET: ENTRAPS ENEMY FOR 5 TURNS.';
    this.itemTypes.EnchantedSword.desc =        'ENCHANTED SWORD: 7DMG, CAN BLOCK ATTACKS. ';
    this.itemTypes.EnchantedSpear.desc =        'ENCHANTED SPEAR: 5DMG, CAN HIT ENEMIES 2 TILES AWAY';
    this.itemTypes.EnchantedAxe.desc =          'ENCHANTED AXE: 7DMG, HITS ALL ADJACENT ENEMIES.';
    this.itemTypes.HealingPotion.desc =         'HEALING POTION: COMPLETELY HEALS ALL HIT POINTS.';
    this.itemTypes.StrengthPotion.desc =        'STRENGTH POTION: TEMPORARILY RAISES YOUR ATTACK.';
    this.itemTypes.ProtectionPotion.desc =      'PROTECTION POTION: TEMPORARILY RAISES YOUR MAX HP.';
    this.itemTypes.Food.desc =                  'FOOD: RESTORES HUNGER AND COMPLETLY HEALS YOU.';
    this.itemTypes.ScrollOfFireNova.desc =      'SCROLL OF FIRE NOVA: BURNS ALL ENEMIES AROUND YOU.';
    this.itemTypes.ScrollOfFireBall.desc =      'SCROLL OF FIRE BALL: BURNS ALL ENEMIES IN A 3X3 AREA.';
    this.itemTypes.ScrollOfIce.desc =           'SCROLL OF ICE: FREEZES ALL ENEMIES IN A 3X3 AREA.';
    this.itemTypes.ScrollOfPolymorph.desc =     'SCROLL OF POLYMORPH: TRANSFORMS A SINGLE ENEMY.';
    this.itemTypes.ScrollOfBlink.desc =         'SCROLL OF BLINK: SHORT RANGE TARGETED TELEPORTATION.';
    this.itemTypes.ScrollOfLightning.desc =     'SCROLL OF LIGHTNING: CREATES A BOLT OF LIGHTNING.';
    this.itemTypes.LeatherArmor.desc =          'LEATHR ARMOR: +4HP.';
    this.itemTypes.ChainArmor.desc =            'CHAIN ARMOR: +6HP.';
    this.itemTypes.PlateArmor.desc =            'PLATE ARMOR: +10HP.';
    this.itemTypes.AmuletOfProtection.desc =    'AMULET OF PROTECTION: +5HP.';
    this.itemTypes.AmuletOfSustinence.desc =    'AMULET OF SUSTINENCE: RAISES YOUR MAX FOOD CAPACITY.';
    this.itemTypes.AmuletOfRegeneration.desc =  'AMULET OF REGENERATION: RAISES NATURAL HP REGENERATION.';
    this.itemTypes.AmuletOfStrength.desc =      'AMULET OF STRENGTH: +1ATK';
    this.itemTypes.AmuletOfYendor.desc =        'AMULET OF YENDOR';
    
    // The drop rate for each item class:
    this.itemClassDropRate = [{name: 'Weapons', percent: 6},
                              {name: 'Armor', percent: 7},
                              {name: 'Amulets', percent: 6},
                              {name: 'Projectiles', percent: 19},
                              {name: 'Potions', percent: 19},
                              {name: 'Scrolls', percent: 19},
                              {name: 'Food', percent: 24}];
    
    
    // The drop rate for individual item types within a class:
    this.itemTypeDropRate = {};
    
    this.itemTypeDropRate.Projectiles = [{name: 'Dart', percent: 60},
                                         {name: 'ThrowingNet', percent: 20},
                                         {name: 'Javalin', percent: 20}];
    
    // Weapon drop rate:
    this.itemTypeDropRate.Weapons = [{name: 'Axe', percent: 45},
                                     {name: 'Sword', percent: 45},
                                     {name: 'EnchantedSword', percent: 4},
                                     {name: 'EnchantedSpear', percent: 3},
                                     {name: 'EnchantedAxe', percent: 3}];
    
    // Armor drop rate:
    this.itemTypeDropRate.Armor = [{name: 'LeatherArmor', percent: 70},
                                   {name: 'ChainArmor', percent: 20},
                                   {name: 'PlateArmor', percent: 10}];
    
    // Amulet drop rate:
    this.itemTypeDropRate.Amulets = [{name: 'AmuletOfProtection', percent: 25},
                                     {name: 'AmuletOfRegeneration', percent: 25},
                                     {name: 'AmuletOfSustinence', percent: 25},
                                     {name: 'AmuletOfStrength', percent: 25}];
    
    // Potion drop rate:
    this.itemTypeDropRate.Potions = [{name: 'HealingPotion', percent: 70},
                                     {name: 'StrengthPotion', percent: 15},
                                     {name: 'ProtectionPotion', percent: 15}];
    
    // Scroll drop rate:
    this.itemTypeDropRate.Scrolls = [{name: 'ScrollOfBlink', percent: 10},
                                     {name: 'ScrollOfFireBall', percent: 20},
                                     {name: 'ScrollOfIce', percent: 20},
                                     {name: 'ScrollOfFireNova', percent: 20},
                                     {name: 'ScrollOfPolymorph', percent: 10},
                                     {name: 'ScrollOfLightning', percent: 20}];
    
    // Food drop rate:
    this.itemTypeDropRate.Food = [{name: 'Food', percent: 100}];
    
   
};

// CREATE_RANDOM_ITEM:
// ************************************************************************************************
gameState.createRandomItem = function (tileIndex) {
    var item, itemName, itemAmount;
    
    itemName = this.getRandomItemName();
    itemAmount = this.itemTypes[itemName].dropAmount;
    
 
                                              

    item = this.createItem(tileIndex, this.itemTypes[itemName], itemAmount);
    return item;
};


// GET_RANDOM_ITEM_NAME:
// ************************************************************************************************
gameState.getRandomItemName = function () {
    var itemClass = this.chooseRandom(this.itemClassDropRate),
        itemName = this.chooseRandom(this.itemTypeDropRate[itemClass]);
    
    return itemName;
};

// CHOOSE_RANDOM:
// ************************************************************************************************
gameState.chooseRandom = function (table) {
    var percentSum = 0,
        rand = game.rnd.integerInRange(0, 99),
        i;
    
    for (i = 0; i < table.length; i += 1) {
        percentSum += table[i].percent;
        if (rand < percentSum) {
            return table[i].name;
        }
    }
    
    console.log('chooseRandom() failed');
};

// CREATE_ITEM:
// ************************************************************************************************
gameState.createItem = function (tileIndex, type, amount) {
    var item = {isAlive: true,
                tileIndex: {x: tileIndex.x, y: tileIndex.y},
                type: type,
                amount: amount};
    
    // Items cannot be created on tiles already containing items:
    if (this.getTile(tileIndex).item) {
        return;
    }
    
    // Place on tileMap:
    this.getTile(tileIndex).item = item;
    
    // Create sprite:
    item.sprite = this.itemSpritesGroup.create(item.tileIndex.x * this.tileSize, item.tileIndex.y * this.tileSize, 'Tileset');
    item.sprite.smoothed = false;
    item.sprite.scale.setTo(this.scaleFactor, this.scaleFactor);
    item.sprite.frame = item.type.imageIndex;
    
    // Push to list:
    this.itemList.push(item);
    return item;
};

// DESTROY_ITEM:
// ************************************************************************************************
gameState.destroyItem = function (item) {
    item.isAlive = false;
    item.sprite.destroy();
    this.getTile(item.tileIndex).item = null;
};

// DESTROY_ALL_ITEMS:
// ************************************************************************************************
gameState.destroyAllItems = function () {
    var i;
    
    for (i = 0; i < this.itemList.length; i += 1) {
        this.destroyItem(this.itemList[i]);
    }
    
    this.itemList = [];
};