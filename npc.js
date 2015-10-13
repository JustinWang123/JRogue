/*global game, gameState, LARGE_GREEN_FONT, LARGE_RED_FONT, LARGE_WHITE_FONT*/
'use strict';

// CREATE_NPC_TYPES:
// ************************************************************************************************
gameState.createNPCTypes = function () {
    var meleeAttack,
        arrowAttack,
        poisonAttack,
        firstLevelTypes,
        earlyGameTypes,
        midGameTypes,
        endGameTypes,
        spellAttack;
    
    // MELEE ATTACK:
    // ********************************************************************************************
    meleeAttack = function (actingCharacter) {
        gameState.playerCharacter.takeDamage(actingCharacter.type.damage, 'You were killed by a ' + actingCharacter.type.niceName);
    };
    
    // ARROW ATTACK:
    // ********************************************************************************************
    arrowAttack = function (actingCharacter) {
        gameState.createProjectile(actingCharacter, gameState.playerCharacter.tileIndex, 'GoblinArrow');
    };
    
    // SPELL ATTACK:
    // ********************************************************************************************
    spellAttack = function (actingCharacter) {
        gameState.createProjectile(actingCharacter, gameState.playerCharacter.tileIndex, 'WizardSpell');
    };
    
    this.npcTypes = {Rat:           {name: 'Rat',           niceName: 'Rat', imageIndex: 51, maxHp: 8, damage: 2, range: 1.5, speed: 'fast', attack: meleeAttack, dropRate: 0.10, exp: 1},
                     Bat:           {name: 'Bat',           niceName: 'Bat', imageIndex: 52, maxHp: 8, damage: 2, range: 1.5, speed: 'fast', attack: meleeAttack, dropRate: 0.10, exp: 2},
                     GoblinArcher:  {name: 'GoblinArcher',  niceName: 'Goblin Archer', imageIndex: 53, maxHp: 12, damage: 2, range: 8.0, speed: 'fast', attack: arrowAttack, dropRate: 0.15, exp: 4},
                     OrcWarrior:    {name: 'OrcWarrior',    niceName: 'Orc Warrior', imageIndex: 54, maxHp: 16, damage: 4, range: 1.5, speed: 'fast', attack: meleeAttack, dropRate: 0.15, exp: 4},
                     Snake:         {name: 'Snake',         niceName: 'Snake', imageIndex: 55, maxHp: 12, damage: 10, range: 1.5, speed: 'slow', attack: meleeAttack, dropRate: 0.20, exp: 8},
                     Slime:         {name: 'Slime',         niceName: 'Slime', imageIndex: 56, maxHp: 40, damage: 4, range: 1.5, speed: 'slow', attack: meleeAttack, dropRate: 0.05, exp: 2},
                     Knight:        {name: 'Knight',        niceName: 'Knight', imageIndex: 58, maxHp: 40, damage: 12, range: 1.5, speed: 'slow', attack: meleeAttack, dropRate: 0.25, exp: 16},
                     EvilEye:       {name: 'EvilEye',       niceName: 'Evil Eye', imageIndex: 59, maxHp: 8, damage: 4, range: 1.5, speed: 'fast', attack: meleeAttack, dropRate: 0.10, exp: 4},
                     Crate:         {name: 'Crate',         niceName: 'Crate', imageIndex: 60, maxHp: 8, damage: 0, range: 0, speed: 'none', attack: null, dropRate: 0.5, exp: 0},
                     Wizard:        {name: 'Wizard',        niceName: 'Wizard', imageIndex: 61, maxHp: 16, damage: 5, range: 8.0, speed: 'slow', attack: spellAttack, dropRate: 0.20, exp: 8}};
    
    
    firstLevelTypes = [{name: 'Rat', percent: 50},
                       {name: 'Bat', percent: 50}];
    
    earlyGameTypes = [{name: 'Rat', percent: 40},
                      {name: 'Bat', percent: 40},
                      {name: 'GoblinArcher', percent: 17},
                      {name: 'OrcWarrior', percent: 1},
                      {name: 'Snake', percent: 1},
                      {name: 'EvilEye', percent: 1},
                      {name: 'Slime', percent: 0},
                      {name: 'Knight', percent: 0}];
    
    
    midGameTypes = [{name: 'Rat', percent: 15},
                    {name: 'Bat', percent: 15},
                    {name: 'GoblinArcher', percent: 20},
                    {name: 'OrcWarrior', percent: 20},
                    {name: 'Snake', percent: 20},
                    {name: 'EvilEye', percent: 8},
                    {name: 'Slime', percent: 1},
                    {name: 'Knight', percent: 1}];
    
    endGameTypes = [{name: 'Bat', percent: 15},
                    {name: 'Wizard', percent: 25},
                    {name: 'OrcWarrior', percent: 15},
                    {name: 'Snake', percent: 15},
                    {name: 'EvilEye', percent: 10},
                    {name: 'Slime', percent: 10},
                    {name: 'Knight', percent: 10}];
    
    this.sleepPercentTable = [0, 0.40, 0.35, 0.30, 0.25, 0.20, 0.15, 0.10, 0.05, 0.05, 0.05, 0.05, 0.05];
    
    this.levelNPCs = [null,
                      firstLevelTypes, earlyGameTypes, earlyGameTypes, earlyGameTypes,
                      midGameTypes, midGameTypes, midGameTypes, midGameTypes,
                      endGameTypes, endGameTypes, endGameTypes, endGameTypes];
    this.levelNPCAmount = [null,
                           2, 2, 3, 3,
                           3, 3, 4, 4,
                           4, 4, 4, 4];
                      


};

// GET_RANDOM_NPC_NAME:
gameState.getRandomNPCName = function () {
    return ['Rat', 'Bat', 'GoblinArcher', 'OrcWarrior', 'Snake', 'Slime', 'Knight', 'Wizard', 'EvilEye'][game.rnd.integerInRange(0, 6)];
};

// CREATE_NPC:
// ************************************************************************************************
gameState.createNPC = function (tileIndex, typeName, isAsleep) {
    var npc = {isAlive: true,
               isAgroed: false,
               type: this.npcTypes[typeName],
               tileIndex: {x: tileIndex.x, y: tileIndex.y},
               destIndex: {x: tileIndex.x, y: tileIndex.y},
               currentHp: this.npcTypes[typeName].maxHp,
               damage: this.npcTypes[typeName].damage,
               hasAgroedPlayer: false,
               isAsleep: isAsleep};
    
    // Place in tileMap:
    this.setNPCTileIndex(npc, npc.tileIndex);
    
    // Set functions:
    npc.chooseAction = this.npcChooseAction;
    npc.updateTurn = this.npcUpdateTurn;
    npc.updateSprite = this.updateCharacterSprite;
    npc.takeDamage = this.npcTakeDamage;
    
    if (typeName === 'GoblinArcher') {
        npc.chooseAction = this.archerChooseAction;
    }
    if (typeName === 'Rat') {
        npc.chooseAction = this.ratChooseAction;
    }
    if (typeName === 'Bat') {
        npc.chooseAction = this.batChooseAction;
    }
    if (typeName === 'EvilEye') {
        npc.chooseAction = this.evilEyeChooseAction;
    }
    if (typeName === 'Crate') {
        npc.chooseAction = function () { gameState.endTurn(); };
    }
    if (typeName === 'Wizard') {
        npc.chooseAction = this.wizardChooseAction;
    }
    
    // Create sprite:
    npc.sprite = this.characterSpritesGroup.create(npc.tileIndex.x * this.tileSize + 16,
                                                   npc.tileIndex.y * this.tileSize + 16,
                                                   'Tileset');
    npc.sprite.smoothed = false;
    npc.sprite.scale.setTo(this.scaleFactor, this.scaleFactor);
    npc.sprite.frame = npc.type.imageIndex;
    npc.sprite.anchor.setTo(0.5, 0.5);
    
    if (typeName !== 'Crate') {
        // Create hp sprite:
        npc.hpSprite = game.add.text(0, 0, '0', LARGE_GREEN_FONT);
        this.characterSpritesGroup.add(npc.hpSprite);

        // Create damage sprite:
        npc.damageSprite = game.add.text(0, 0, '0', LARGE_RED_FONT);
        this.characterSpritesGroup.add(npc.damageSprite);
    }
    
    if (isAsleep) {
        npc.sleepSprite = game.add.text(npc.sprite.x, npc.sprite.y - 24, 'ZZZ', LARGE_WHITE_FONT);
        npc.sleepSprite.anchor.setTo(0.5, 0.5);
    }
    
    // Push to lists:
    this.characterList.push(npc);
    this.npcList.push(npc);
    
    return npc;
};

// DESTROY_NPC:
// ************************************************************************************************
gameState.destroyNPC = function (npc) {
    npc.isAlive = false;
    npc.sprite.destroy();
    
    // Crates and mushrooms don't have hp sprites:
    if (npc.hpSprite) {
        npc.hpSprite.destroy();
        npc.damageSprite.destroy();
    }
    
    if (npc.sleepSprite) {
        npc.sleepSprite.destroy();
    }
    gameState.getTile(npc.tileIndex).character = null;
};

// DESTROY_ALL_NPCS:
// ************************************************************************************************
gameState.destroyAllNPCs = function () {
    var i;
    
    for (i = 0; i < this.npcList.length; i += 1) {
        gameState.destroyNPC(this.npcList[i]);
    }
    
    this.npcList = [];
};

// UPDATE_NPC_STATS:
// ************************************************************************************************
gameState.updateNPCStats = function (npc) {
};

// EVIL EYE CHOOSE ACTION:
// ************************************************************************************************
gameState.evilEyeChooseAction = function () {
    var npc = this;
    
    // Dead npcs skip their turn:
    if (!npc.isAlive) {
        gameState.endTurn();
        return;
    }
    
    // Frozen npcs skip their turn:
    if (gameState.getTile(npc.tileIndex).ice) {
        npc.hasAgroedPlayer = true;
        npc.isAsleep = false;
        
        if (npc.sleepSprite) {
            npc.sleepSprite.visible = false;
        }
        gameState.endTurn();
        return;
    }
    
    // NPC's detect player:
    if (gameState.canNPCSeePlayer(npc)) {
        npc.hasAgroedPlayer = true;
        npc.isAsleep = false;
        
        if (npc.sleepSprite) {
            npc.sleepSprite.visible = false;
        }
    }
    
    // Non agroed npcs skip their turn:
    if (!npc.hasAgroedPlayer) {
        gameState.endTurn();
        return;
    }
    
    // Attack player when in range and clear line of sight:
    if (gameState.getTileDistance(gameState.playerCharacter.tileIndex, npc.tileIndex) <= npc.type.range && gameState.canNPCSeePlayer(npc)) {
        npc.takeDamage(4);
        gameState.hasNPCActed = true;
        gameState.endTurn();
        return;
    }
    
    // If the npc can see the player then 'remember' his tileIndex:
    if (gameState.canNPCSeePlayer(npc)) {
        npc.destIndex.x = gameState.playerCharacter.tileIndex.x;
        npc.destIndex.y = gameState.playerCharacter.tileIndex.y;
        
        // Also shout to nearby enemies:
        gameState.npcShout(npc);
    }
    
    gameState.moveNPC(npc);
    
    // End Turn:
    gameState.endTurn();
};
// BAT CHOOSE ACTION:
// ************************************************************************************************
gameState.batChooseAction = function () {
    var npc = this;
    
    // Dead npcs skip their turn:
    if (!npc.isAlive) {
        gameState.endTurn();
        return;
    }
    
    // Frozen npcs skip their turn:
    if (gameState.getTile(npc.tileIndex).ice) {
        npc.hasAgroedPlayer = true;
        npc.isAsleep = false;
        
        if (npc.sleepSprite) {
            npc.sleepSprite.visible = false;
        }
        gameState.endTurn();
        return;
    }
    
    // NPC's detect player:
    if (gameState.canNPCSeePlayer(npc)) {
        npc.hasAgroedPlayer = true;
        npc.isAsleep = false;
        
        if (npc.sleepSprite) {
            npc.sleepSprite.visible = false;
        }
    }
    
    // Non agroed npcs skip their turn:
    if (!npc.hasAgroedPlayer) {
        gameState.endTurn();
        return;
    }
    // Bats can move one space before attacking:
    gameState.moveNPC(npc);
    
    // Attack player when in range and clear line of sight:
    if (gameState.getTileDistance(gameState.playerCharacter.tileIndex, npc.tileIndex) <= npc.type.range && gameState.canNPCSeePlayer(npc)) {
        gameState.npcAttackPlayer(npc);
        npc.destIndex.x = gameState.playerCharacter.tileIndex.x;
        npc.destIndex.y = gameState.playerCharacter.tileIndex.y;
        
        // Randomly move away:
        if (game.rnd.frac() < 0.5) {
            gameState.moveNPCRandom(npc);
        }
        
        gameState.hasNPCActed = true;
        gameState.endTurn();
        return;
    }
    
    // If the npc can see the player then 'remember' his tileIndex:
    if (gameState.canNPCSeePlayer(npc)) {
        npc.destIndex.x = gameState.playerCharacter.tileIndex.x;
        npc.destIndex.y = gameState.playerCharacter.tileIndex.y;
        
        // Also shout to nearby enemies:
        gameState.npcShout(npc);
    }
    
    gameState.moveNPC(npc);
    
    // End Turn:
    gameState.endTurn();
};

// RAT CHOOSE ACTION:
// ************************************************************************************************
gameState.ratChooseAction = function () {
    var npc = this;
    
    // Dead npcs skip their turn:
    if (!npc.isAlive) {
        gameState.endTurn();
        return;
    }
    
    // Frozen npcs skip their turn:
    if (gameState.getTile(npc.tileIndex).ice) {
        npc.hasAgroedPlayer = true;
        npc.isAsleep = false;
        
        if (npc.sleepSprite) {
            npc.sleepSprite.visible = false;
        }
        gameState.endTurn();
        return;
    }
    
    // NPC's detect player:
    if (gameState.canNPCSeePlayer(npc)) {
        npc.hasAgroedPlayer = true;
        npc.isAsleep = false;
        
        if (npc.sleepSprite) {
            npc.sleepSprite.visible = false;
        }
    }
    
    // Non agroed npcs skip their turn:
    if (!npc.hasAgroedPlayer) {
        gameState.endTurn();
        return;
    }
    
    // Randomly move away from player:
    if (game.rnd.frac() < 0.35 && gameState.canNPCSeePlayer(npc)) {
        gameState.moveNPCRandom(npc);
        gameState.endTurn();
        gameState.hasNPCActed = true;
        return;
    }
    
    // Attack player when in range and clear line of sight:
    if (gameState.getTileDistance(gameState.playerCharacter.tileIndex, npc.tileIndex) <= npc.type.range && gameState.canNPCSeePlayer(npc)) {
        gameState.npcAttackPlayer(npc);
        npc.destIndex.x = gameState.playerCharacter.tileIndex.x;
        npc.destIndex.y = gameState.playerCharacter.tileIndex.y;
        gameState.hasNPCActed = true;
        
        gameState.endTurn();
        return;
    }
    
    // If the npc can see the player then 'remember' his tileIndex:
    if (gameState.getTile(npc.tileIndex).visible
            && gameState.getTileDistance(gameState.playerCharacter.tileIndex, npc.tileIndex) <= gameState.playerCharacter.agroRange) {
        npc.destIndex.x = gameState.playerCharacter.tileIndex.x;
        npc.destIndex.y = gameState.playerCharacter.tileIndex.y;
        
        // Also shout to nearby enemies:
        gameState.npcShout(npc);
    }
    
    gameState.moveNPC(npc);
    
    // End Turn:
    gameState.endTurn();
};

// WIZARD CHOOSE ACTION:
// ************************************************************************************************
gameState.wizardChooseAction = function () {
    var npc = this;
    
    // Dead npcs skip their turn:
    if (!npc.isAlive) {
        gameState.endTurn();
        return;
    }
    // Frozen npcs skip their turn:
    if (gameState.getTile(npc.tileIndex).ice) {
        npc.hasAgroedPlayer = true;
        npc.isAsleep = false;
        
        if (npc.sleepSprite) {
            npc.sleepSprite.visible = false;
        }
        gameState.endTurn();
        return;
    }
    
    // NPC's detect player:
    if (gameState.canNPCSeePlayer(npc)) {
        npc.hasAgroedPlayer = true;
        npc.isAsleep = false;
        
        if (npc.sleepSprite) {
            npc.sleepSprite.visible = false;
        }
    }
    
    // Non agroed npcs skip their turn:
    if (!npc.hasAgroedPlayer) {
        gameState.endTurn();
        return;
    }
    
    // Shout if can see player:
    if (gameState.canNPCSeePlayer(npc)) {
        gameState.npcShout(npc);
    }
    
    // Move away if player gets to close:
    if (gameState.getTileDistance(gameState.playerCharacter.tileIndex, npc.tileIndex) <= 3 && gameState.getTile(npc.tileIndex).visible) {
        if (gameState.npcMoveAway(npc)) {
            gameState.endTurn();
            gameState.hasNPCActed = true;
            return;
        }
    }
    
    // Attack player when in range and clear line of sight:
    if (gameState.getTileDistance(gameState.playerCharacter.tileIndex, npc.tileIndex) <= npc.type.range
            && gameState.isRayClear(npc.tileIndex, gameState.playerCharacter.tileIndex)
            && gameState.canNPCSeePlayer(npc)) {
        gameState.npcAttackPlayer(npc);
        gameState.hasNPCActed = true;
        gameState.endTurn();
        return;
    }
    
    // Move towards player if out of range:
    // Make sure enemies arnt endlessly moving offscreen:
    if (gameState.getTileDistance(gameState.playerCharacter.tileIndex, npc.tileIndex) <= 12) {
        gameState.moveNPC(npc);
    }
    
    // End Turn:
    gameState.endTurn();
};

// ARCHER CHOOSE ACTION:
// ************************************************************************************************
gameState.archerChooseAction = function () {
    var npc = this;
    
    // Dead npcs skip their turn:
    if (!npc.isAlive) {
        gameState.endTurn();
        return;
    }
    // Frozen npcs skip their turn:
    if (gameState.getTile(npc.tileIndex).ice) {
        npc.hasAgroedPlayer = true;
        npc.isAsleep = false;
        
        if (npc.sleepSprite) {
            npc.sleepSprite.visible = false;
        }
        gameState.endTurn();
        return;
    }
    
    // NPC's detect player:
    if (gameState.canNPCSeePlayer(npc)) {
        npc.hasAgroedPlayer = true;
        npc.isAsleep = false;
        
        if (npc.sleepSprite) {
            npc.sleepSprite.visible = false;
        }
    }
    
    // Non agroed npcs skip their turn:
    if (!npc.hasAgroedPlayer) {
        gameState.endTurn();
        return;
    }
    
    // Shout if can see player:
    if (gameState.canNPCSeePlayer(npc)) {
        gameState.npcShout(npc);
    }
    
    // Move away if player gets to close:
    if (gameState.getTileDistance(gameState.playerCharacter.tileIndex, npc.tileIndex) <= 3 && gameState.getTile(npc.tileIndex).visible) {
        if (gameState.npcMoveAway(npc)) {
            gameState.endTurn();
            gameState.hasNPCActed = true;
            return;
        }
    }
    
    // Attack player when in range and clear line of sight:
    if (gameState.getTileDistance(gameState.playerCharacter.tileIndex, npc.tileIndex) <= npc.type.range
            && gameState.isRayClear(npc.tileIndex, gameState.playerCharacter.tileIndex)
            && gameState.canNPCSeePlayer(npc)) {
        gameState.npcAttackPlayer(npc);
        gameState.hasNPCActed = true;
        gameState.endTurn();
        return;
    }
    
    // End Turn:
    gameState.endTurn();
};

// NPC_CHOOSE_ACTION:
// ************************************************************************************************
gameState.npcChooseAction = function () {
    var npc = this, i;
    
    // Dead npcs skip their turn:
    if (!npc.isAlive) {
        gameState.endTurn();
        return;
    }
    
    // Frozen npcs skip their turn:
    if (gameState.getTile(npc.tileIndex).ice) {
        npc.hasAgroedPlayer = true;
        npc.isAsleep = false;
        
        if (npc.sleepSprite) {
            npc.sleepSprite.visible = false;
        }
        gameState.endTurn();
        return;
    }
    
    // NPC's detect player:
    if (gameState.canNPCSeePlayer(npc)) {
        npc.hasAgroedPlayer = true;
        npc.isAsleep = false;
        
        if (npc.sleepSprite) {
            npc.sleepSprite.visible = false;
        }
    }
    
    // Non agroed npcs skip their turn:
    if (!npc.hasAgroedPlayer) {
        gameState.endTurn();
        return;
    }
    
    // Attack player when in range and clear line of sight:
    if (gameState.getTileDistance(gameState.playerCharacter.tileIndex, npc.tileIndex) <= npc.type.range && gameState.canNPCSeePlayer(npc)) {
        gameState.npcAttackPlayer(npc);
        npc.destIndex.x = gameState.playerCharacter.tileIndex.x;
        npc.destIndex.y = gameState.playerCharacter.tileIndex.y;
        gameState.hasNPCActed = true;
        
        gameState.endTurn();
        return;
    }
    
    // If the npc can see the player then 'remember' his tileIndex:
    if (gameState.canNPCSeePlayer(npc)) {
        npc.destIndex.x = gameState.playerCharacter.tileIndex.x;
        npc.destIndex.y = gameState.playerCharacter.tileIndex.y;
        
        // Also shout to nearby enemies:
        gameState.npcShout(npc);
    }
    
    // Make sure enemies arnt endlessly moving offscreen:
    if (gameState.getTileDistance(gameState.playerCharacter.tileIndex, npc.tileIndex) <= 12) {
        gameState.moveNPC(npc);
    }
    
    // End Turn:
    gameState.endTurn();
};

// CAN_NPC_SEE_PLAYER:
// ************************************************************************************************
gameState.canNPCSeePlayer = function (npc) {
    var pc = gameState.playerCharacter;
    
    if (npc.isAsleep) {
        return gameState.getTile(npc.tileIndex).visible && gameState.getTileDistance(pc.tileIndex, npc.tileIndex) <= 2;
    } else {
        return gameState.getTile(npc.tileIndex).visible && gameState.getTileDistance(pc.tileIndex, npc.tileIndex) <= pc.agroRange;
    }
};

// NPC_MOVEMENT:
// ************************************************************************************************
gameState.moveNPC = function (npc) {
    var path;
    
    if (npc.tileIndex.x !== npc.destIndex.x || npc.tileIndex.y !== npc.destIndex.y) {
        path = this.calculatePath(npc.tileIndex, npc.destIndex, npc.type.speed);
        if (path && path.length > 0) {
            if (gameState.isTileIndexPassable(path[path.length - 1])) {
                gameState.setNPCTileIndex(npc, path[path.length - 1]);
            }
        } else {
            if (npc.tileIndex.x < npc.destIndex.x && gameState.isTileIndexPassable({x: npc.tileIndex.x + 1, y: npc.tileIndex.y})) {
                gameState.setNPCTileIndex(npc, {x: npc.tileIndex.x + 1, y: npc.tileIndex.y});
            } else if (npc.tileIndex.x > npc.destIndex.x && gameState.isTileIndexPassable({x: npc.tileIndex.x - 1, y: npc.tileIndex.y})) {
                gameState.setNPCTileIndex(npc, {x: npc.tileIndex.x - 1, y: npc.tileIndex.y});
            } else if (npc.tileIndex.y > npc.destIndex.y && gameState.isTileIndexPassable({x: npc.tileIndex.x, y: npc.tileIndex.y - 1})) {
                gameState.setNPCTileIndex(npc, {x: npc.tileIndex.x, y: npc.tileIndex.y - 1});
            } else if (npc.tileIndex.y < npc.destIndex.y && gameState.isTileIndexPassable({x: npc.tileIndex.x, y: npc.tileIndex.y + 1})) {
                gameState.setNPCTileIndex(npc, {x: npc.tileIndex.x, y: npc.tileIndex.y + 1});
            }
        }
        
        gameState.hasNPCActed = true;
    }
};

// NPC MOVE AWAY:
// ************************************************************************************************
gameState.npcMoveAway = function (npc) {
    var pc = gameState.playerCharacter;
    
    if (npc.tileIndex.x > pc.tileIndex.x && gameState.isTileIndexPassable({x: npc.tileIndex.x + 1, y: npc.tileIndex.y})) {
        gameState.setNPCTileIndex(npc, {x: npc.tileIndex.x + 1, y: npc.tileIndex.y});
        return true;
    } else if (npc.tileIndex.x < pc.tileIndex.x && gameState.isTileIndexPassable({x: npc.tileIndex.x - 1, y: npc.tileIndex.y})) {
        gameState.setNPCTileIndex(npc, {x: npc.tileIndex.x - 1, y: npc.tileIndex.y});
        return true;
    } else if (npc.tileIndex.y < pc.tileIndex.y && gameState.isTileIndexPassable({x: npc.tileIndex.x, y: npc.tileIndex.y - 1})) {
        gameState.setNPCTileIndex(npc, {x: npc.tileIndex.x, y: npc.tileIndex.y - 1});
        return true;
    } else if (npc.tileIndex.y > pc.tileIndex.y && gameState.isTileIndexPassable({x: npc.tileIndex.x, y: npc.tileIndex.y + 1})) {
        gameState.setNPCTileIndex(npc, {x: npc.tileIndex.x, y: npc.tileIndex.y + 1});
        return true;
    }
    return false;
};

// NPC MOVE RANDOM:
// ************************************************************************************************
gameState.moveNPCRandom = function (npc) {
    var possibleMoves = [];
    
    if (gameState.isTileIndexPassable({x: npc.tileIndex.x + 1, y: npc.tileIndex.y + 1})) {
        possibleMoves.push({x: npc.tileIndex.x + 1, y: npc.tileIndex.y + 1});
    }
    if (gameState.isTileIndexPassable({x: npc.tileIndex.x, y: npc.tileIndex.y + 1})) {
        possibleMoves.push({x: npc.tileIndex.x, y: npc.tileIndex.y + 1});
    }
    if (gameState.isTileIndexPassable({x: npc.tileIndex.x - 1, y: npc.tileIndex.y + 1})) {
        possibleMoves.push({x: npc.tileIndex.x - 1, y: npc.tileIndex.y + 1});
    }
    if (gameState.isTileIndexPassable({x: npc.tileIndex.x + 1, y: npc.tileIndex.y})) {
        possibleMoves.push({x: npc.tileIndex.x + 1, y: npc.tileIndex.y});
    }
    if (gameState.isTileIndexPassable({x: npc.tileIndex.x - 1, y: npc.tileIndex.y})) {
        possibleMoves.push({x: npc.tileIndex.x - 1, y: npc.tileIndex.y});
    }
    if (gameState.isTileIndexPassable({x: npc.tileIndex.x + 1, y: npc.tileIndex.y - 1})) {
        possibleMoves.push({x: npc.tileIndex.x + 1, y: npc.tileIndex.y - 1});
    }
    if (gameState.isTileIndexPassable({x: npc.tileIndex.x, y: npc.tileIndex.y - 1})) {
        possibleMoves.push({x: npc.tileIndex.x, y: npc.tileIndex.y - 1});
    }
    if (gameState.isTileIndexPassable({x: npc.tileIndex.x - 1, y: npc.tileIndex.y - 1})) {
        possibleMoves.push({x: npc.tileIndex.x - 1, y: npc.tileIndex.y - 1});
    }
    
    if (possibleMoves.length > 0) {
        gameState.setNPCTileIndex(npc, gameState.randElem(possibleMoves));
    }
};

// NPC SHOUT:
// ************************************************************************************************
gameState.npcShout = function (npc) {
    var i;
    
    for (i = 0; i < gameState.npcList.length; i += 1) {
        if (gameState.getTileDistance(npc.tileIndex, gameState.npcList[i].tileIndex) <= 4
                && gameState.isRayClear(npc.tileIndex, gameState.npcList[i].tileIndex)) {
            gameState.npcList[i].destIndex.x = npc.destIndex.x;
            gameState.npcList[i].destIndex.y = npc.destIndex.y;
            gameState.npcList[i].hasAgroedPlayer = true;
            gameState.npcList[i].isAsleep = false;
            
            if (gameState.npcList[i].sleepSprite) {
                gameState.npcList[i].sleepSprite.visible = false;
            }
        }
    }
};



// NPC_UPDATE_TURN:
// ************************************************************************************************
gameState.npcUpdateTurn = function () {
    var npc = this;
    
    // Don't update dead npcs:
    if (!npc.isAlive) {
        return;
    }
    
    gameState.updateNPCStats(npc);
    
    // Take damage from lava:
    if (gameState.getTile(npc.tileIndex).visible && gameState.isAdjacentToLava(this.tileIndex)) {
        this.takeDamage(2);
    }
    
    // Set visibility:
    if (gameState.getTile(npc.tileIndex).visible) {
        npc.sprite.visible = true;
    } else {
        npc.sprite.visible = false;
    }
};
// SET_NPC_TILE_INDEX:
// ************************************************************************************************
gameState.setNPCTileIndex = function (npc, tileIndex) {
    if (tileIndex.x < npc.tileIndex.x) {
        npc.facing = 'LEFT';
    } else if (tileIndex.x > npc.tileIndex.x) {
        npc.facing = 'RIGHT';
    }
    
    // Remove from previous tile:
    this.getTile(npc.tileIndex).character = null;
    
    // Set new tileIndex:
    npc.tileIndex.x = tileIndex.x;
    npc.tileIndex.y = tileIndex.y;
    
    // Enter new tile:
    this.getTile(npc.tileIndex).character = npc;
    
};

// NPC_ATTACK_PLAYER:
// ************************************************************************************************
gameState.npcAttackPlayer = function (npc) {
    npc.type.attack(npc);
};

// NPC_TAKE_DAMAGE:
// ************************************************************************************************
gameState.npcTakeDamage = function (amount) {
    var npc = this,
        newNpc,
        x,
        y,
        tileIndexIt;
    
    // Damaged npc's always agro player:
    npc.hasAgroedPlayer = true;
    npc.destIndex.x = gameState.playerCharacter.tileIndex.x;
    npc.destIndex.y = gameState.playerCharacter.tileIndex.y;
    npc.isAsleep = false;
    gameState.npcShout(npc);
    
    if (npc.sleepSprite) {
        npc.sleepSprite.visible = false;
    }
    
    gameState.updateNPCStats(npc);
    
    // Random Crit:
    if (game.rnd.frac() <= 0.05) {
        amount = amount * 2;
        
        // Crit text:
        gameState.createDamageText(gameState.getPositionFromTileIndex(npc.tileIndex).x,
                                   gameState.getPositionFromTileIndex(npc.tileIndex).y - 12,
                                   'CRITICAL', '#ff0000');
    } else {
        // Create damage text:
        gameState.createDamageText(gameState.getPositionFromTileIndex(npc.tileIndex).x,
                                   gameState.getPositionFromTileIndex(npc.tileIndex).y - 12,
                                   '-' + amount, '#ff0000');
    }
    
    // Damage:
    npc.currentHp -= amount;

    // Slime splitting:
    if (npc.type === gameState.npcTypes.Slime) {
        npc.sprite.frame = 57;

        if (gameState.getPassableAdjacentIndex(npc.tileIndex) && npc.currentHp > 1) {
            newNpc = gameState.createNPC(gameState.getPassableAdjacentIndex(npc.tileIndex), 'Slime');
            newNpc.sprite.frame = 57;
            newNpc.currentHp = Math.floor(npc.currentHp / 2);
            npc.currentHp = Math.floor(npc.currentHp / 2);
        }
    }
    
    // NPC Death:
    if (npc.currentHp <= 0) {
        gameState.destroyNPC(npc);

        // Evil Eye exploding:
        if (npc.type === gameState.npcTypes.EvilEye) {
            // Check 9 squares:
            for (x = -1; x < 2; x += 1) {
                for (y = -1; y < 2; y += 1) {
                    tileIndexIt = {x: npc.tileIndex.x + x, y: npc.tileIndex.y + y};
                    // Create fire:
                    if (gameState.isTileIndexPassable(tileIndexIt) || gameState.getTile(tileIndexIt).character) {
                        gameState.createFire(tileIndexIt, 12);
                    }
                }
            }
        }
        
        // Gain exp:
        gameState.playerCharacterGainExp(npc.type.exp);
        
        // Create blood:
        if (npc.type.name !== 'Crate') {
            gameState.createBlood(npc.tileIndex);
        }
        
        // Randomy spawn items:
        if (game.rnd.frac() < npc.type.dropRate) {
            gameState.createRandomItem(npc.tileIndex);
        }
    }
    
    
    // Damaging a mob will always reveal the players location:d
    npc.destIndex.x = gameState.playerCharacter.tileIndex.x;
    npc.destIndex.y = gameState.playerCharacter.tileIndex.y;
};