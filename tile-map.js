/*global Phaser, game, console, gameState */
'use strict';

// CREATE_TILE_TYPES:
// ************************************************************************************************
gameState.createTileTypes = function () {
    this.tileTypes = {Empty:              {name: 'Empty',              niceName: '', imageIndex: 0,  passable: false, transparent: false, enterFunc: null},
                      Wall:               {name: 'Wall',               niceName: 'Dungeon Wall', imageIndex: 1,  passable: false, transparent: false, enterFunc: null},
                      Floor:              {name: 'Floor',              niceName: 'Dungeon Floor', imageIndex: 2,  passable: true,  transparent: true,  enterFunc: null},
                      DownStair:          {name: 'DownStair',          niceName: 'Stairs Down', imageIndex: 10,  passable: false, transparent: true,  enterFunc: this.descendStairs},
                      ClosedDoor:         {name: 'ClosedDoor',         niceName: 'Closed Door', imageIndex: 3,  passable: false, transparent: false, enterFunc: null},
                      OpenDoor:           {name: 'OpenDoor',           niceName: 'Open Door', imageIndex: 4,  passable: true,  transparent: true,  enterFunc: null},
                      CaveWall:           {name: 'CaveWall',           niceName: 'Cave Wall', imageIndex: 5, passable: false, transparent: false, enterFunc: null},
                      CaveFloor:          {name: 'CaveFloor',          niceName: 'Cave Floor', imageIndex: 6, passable: true,  transparent: true,  enterFunc: null},
                      Water:              {name: 'Water',              niceName: 'Water', imageIndex: 7, passable: true,  transparent: true,  enterFunc: null},
                      VineFloor:          {name: 'VineFloor',          niceName: 'Vines', imageIndex: 9, passable: true,  transparent: true,  enterFunc: null},
                      MageAlter:          {name: 'MageAlter',          niceName: 'Alter of the Mage: 50% chance to recover scrolls', imageIndex: 12, passable: false,  transparent: true,  enterFunc: null},
                      WarriorAlter:       {name: 'WarriorAlter',       niceName: 'Alter of the Warrior: +5HP +1ATK', imageIndex: 13, passable: false,  transparent: true,  enterFunc: null},
                      HunterAlter:        {name: 'HunterAlter',        niceName: 'Alter of the Hunter: 75% chance to recover ranged weapons', imageIndex: 11, passable: false,  transparent: true,  enterFunc: null},
                      Lava:               {name: 'Lava',               niceName: 'Lava', imageIndex: 8, passable: false, transparent: true, enterFunc: null}};
};

// CREATE_TILE_MAP:
// ************************************************************************************************
gameState.createTileMap = function () {
    var x,
        y,
        i,
        tileTypeMap,
        areaSize = this.numTilesX / this.numAreas,
        areas,
        index,
        rand;
    
    console.log('Creating dungeon level ' + this.dungeonLevel);
    
    this.areaTileTypes = {Cave: {Wall: 'CaveWall',
                            Door: 'CaveFloor',
                            Floor: 'CaveFloor',
                            UpStair: 'CaveFloor',
                            DownStair: 'DownStair',
                            Water: 'Water',
                            WarriorAlter: 'WarriorAlter',
                            MageAlter: 'MageAlter',
                            HunterAlter: 'HunterAlter',
                            Lava: 'Lava'},
                     
                     Dungeon: {Wall: 'Wall',
                               Door: 'ClosedDoor',
                               Floor: 'Floor',
                               UpStair: 'Floor',
                               DownStair: 'DownStair',
                               VineFloor: 'VineFloor',
                               WarriorAlter: 'WarriorAlter',
                               MageAlter: 'MageAlter',
                               HunterAlter: 'HunterAlter',
                               Water: 'Water'}};

    // Changing wall textures:
    if (this.dungeonLevel >= 9) {
        this.tileTypes.Wall.imageIndex = 18;
        this.tileTypes.ClosedDoor.imageIndex = 19;
        this.tileTypes.OpenDoor.imageIndex = 20;
        this.tileTypes.DownStair.imageIndex = 21;
    } else if (this.dungeonLevel >= 5) {
        this.tileTypes.Wall.imageIndex = 14;
        this.tileTypes.ClosedDoor.imageIndex = 15;
        this.tileTypes.OpenDoor.imageIndex = 16;
        this.tileTypes.DownStair.imageIndex = 17;
    }
    
    this.numMobsPerSize = {Huge: 24, Large: 12, Medium: 8, Small: 6, Tiny: 4};
    
    // Create tileTypeMap:
    tileTypeMap = this.generateBSP1();
    
    // Create empty map:
    this.tileMap = [];
    for (x = 0; x < this.numTilesX; x += 1) {
        this.tileMap[x] = [];
        for (y = 0; y < this.numTilesY; y += 1) {
            this.tileMap[x][y] = {tileType: this.tileTypes[this.areaTileTypes[tileTypeMap[x][y].area.type][tileTypeMap[x][y].type]],
                                  explored: false,
                                  visible: false,
                                  character: null,
                                  item: null,
                                  ice: null,
                                  areaTypeName: tileTypeMap[x][y].area.type,
                                  tileIndex: {x: x, y: y}};
            
            if (tileTypeMap[x][y].type === 'DownStair') {
                this.downStairsIndex = {x: x, y: y};
                
                if (this.dungeonLevel === this.lastDungeonLevel) {
                    this.tileMap[x][y].tileType = this.tileTypes[this.areaTileTypes[tileTypeMap[x][y].area.type].Floor];
                    this.createItem({x: x, y: y}, this.itemTypes.AmuletOfYendor, 1);
                }
                
            } else if (tileTypeMap[x][y].type === 'UpStair') {
                this.upStairsIndex = {x: x, y: y};
                this.upStairsArea = tileTypeMap[x][y].area;
            }
        }
    }
    
    // Create enemies in areas:
    for (i = 0; i < this.areaList.length; i += 1) {
        if (!(this.dungeonLevel === 1 && this.areaList[i] === this.upStairsArea)) {
            this.populateArea(this.areaList[i]);
        }
    }
    
    // Spawn crates:
    rand = game.rnd.integerInRange(0, 2);
    for (i = 0; i < rand; i += 1) {
        this.createNPC(this.getRandomPassableIndex(), 'Crate');
    }
};

// POPULATE_ROOM:
// ************************************************************************************************
gameState.populateArea = function (area) {
    var tileIndex,
        npcName,
        item,
        num,
        i,
        spawnItemPct,
        isAsleep,
        tileIndex2;
    
    // Randomly spawn npcs:
    if (game.rnd.frac() <= 0.60 || area.size === 'Huge' || area.size === 'Large' || area.size === 'Medium') {

        
        
        // 30% chance to be asleep:
        isAsleep = game.rnd.frac() <= this.sleepPercentTable[this.dungeonLevel] ? true : false;
        
        // Spawn 1 npc at a random open tileIndex:
        npcName = this.chooseRandom(this.levelNPCs[this.dungeonLevel]);
        tileIndex = this.getOpenIndexInArea(area);
        this.createNPC(tileIndex, npcName, isAsleep);
            
        // Spawn some friends in adjacent tileIndex:
        num = game.rnd.integerInRange(0, this.levelNPCAmount[this.dungeonLevel] - 1);
        for (i = 0; i < num; i += 1) {
            // Get a nearby tile index:
            tileIndex2 = this.getPassableIndexInBox({startX: tileIndex.x - 3,
                                                     endX: tileIndex.x + 3,
                                                     startY: tileIndex.y - 3,
                                                     endY: tileIndex.y + 3});
            if (tileIndex2) {
                npcName = this.chooseRandom(this.levelNPCs[this.dungeonLevel]);
                this.createNPC(tileIndex2, npcName, isAsleep);
            }
        }
    }
    
    // Randomy spawn items:
    if (this.dungeonLevel <= 9) {
        spawnItemPct = {Huge: 1.0, Large: 0.4, Medium: 0.3, Small: 0.2, Tiny: 0.1}[area.size];
    } else {
        spawnItemPct = {Huge: 1.0, Large: 0.6, Medium: 0.5, Small: 0.4, Tiny: 0.2}[area.size];
    }
    if (game.rnd.frac() <= spawnItemPct) {
        this.createRandomItem(this.getOpenIndexInArea(area));
    }
};

// GET_OPEN_INDEX_IN_AREA:
// ************************************************************************************************
gameState.getOpenIndexInArea = function (area) {
    var index;
    
    index = {x: game.rnd.integerInRange(area.startX, area.endX - 1),
             y: game.rnd.integerInRange(area.startY, area.endY - 1)};

    while (this.getTile(index).character || this.getTile(index).item || !this.isTileIndexPassable(index)) {
        index = {x: game.rnd.integerInRange(area.startX, area.endX - 1),
                 y: game.rnd.integerInRange(area.startY, area.endY - 1)};
    }

    return index;
};

// GET_RANDOM_PASSABLE_INDEX:
// ************************************************************************************************
gameState.getRandomPassableIndex = function () {
    var index = {x: game.rnd.integerInRange(0, this.numTilesX - 1),
                 y: game.rnd.integerInRange(0, this.numTilesY - 1)};
    
    while (!this.isTileIndexPassable(index) || this.getTile(index).visible) {
        index = {x: game.rnd.integerInRange(0, this.numTilesX - 1),
                 y: game.rnd.integerInRange(0, this.numTilesY - 1)};
    }
    
    return index;
};

// SAVE_TILE_MAP:
// ************************************************************************************************
gameState.saveTileMap = function () {
    var x,
        y,
        i,
        data;
    
    data = {};
    
    // Save npcs
    data.npcs = [];
    for (i = 0; i < this.npcList.length; i += 1) {
        if (this.npcList[i].isAlive) {
            data.npcs.push({typeName: this.npcList[i].type.name,
                            tileIndex: this.npcList[i].tileIndex,
                            currentHp: this.npcList[i].currentHp});
        }
    }
    
    // Save items:
    data.items = [];
    for (i = 0; i < this.itemList.length; i += 1) {
        if (this.itemList[i].isAlive) {
            data.items.push({typeName: this.itemList[i].type.name,
                             mod: this.itemList[i].mod,
                             charges: this.itemList[i].charges,
                             amount: this.itemList[i].amount,
                             tileIndex: this.itemList[i].tileIndex});
        }
    }
    
    data.tileMap = [];
    for (x = 0; x < this.numTilesX; x += 1) {
        data.tileMap[x] = [];
        for (y = 0; y < this.numTilesY; y += 1) {
            data.tileMap[x][y] = {typeName: this.tileMap[x][y].tileType.name,
                                  explored: this.tileMap[x][y].explored};
        }
    }
    
    data.downStairsIndex = this.downStairsIndex;
    data.upStairsIndex = this.upStairsIndex;
    
    console.log('Saving dungeon level ' + this.dungeonLevel);
    localStorage.setItem('DungeonLevel' + this.dungeonLevel, JSON.stringify(data));
};

// LOAD_TILE_MAP:
// ************************************************************************************************
gameState.loadTileMap = function (dungeonLevel) {
    var x,
        y,
        i,
        data,
        npc;
    
    console.log('Loading dungeon level ' + dungeonLevel);
    data = JSON.parse(localStorage.getItem('DungeonLevel' + dungeonLevel));
    
    // Load the tileMap:
    for (x = 0; x < this.numTilesX; x += 1) {
        for (y = 0; y < this.numTilesY; y += 1) {
            this.tileMap[x][y].tileType = this.tileTypes[data.tileMap[x][y].typeName];
            this.tileMap[x][y].character = null;
            this.tileMap[x][y].item = null;
            this.tileMap[x][y].explored = data.tileMap[x][y].explored;
        }
    }
    
    // load npcs:
    for (i = 0; i < data.npcs.length; i += 1) {
        npc = this.createNPC(data.npcs[i].tileIndex, data.npcs[i].typeName);
        npc.currentHp = data.npcs[i].currentHp;
    }
    
    // Load items:
    for (i = 0; i < data.items.length; i += 1) {
        this.createItem(data.items[i].tileIndex, this.itemTypes[data.items[i].typeName], data.items[i].mod, data.items[i].charges, data.items[i].amount);
    }
    
    this.downStairsIndex = data.downStairsIndex;
    this.upStairsIndex = data.upStairsIndex;
};

// CREATE_TILE_MAP_SPRITES:
// ************************************************************************************************
gameState.createTileMapSprites = function () {
    var x, y;
    
    this.tileMapSprites = [];
    for (x = 0; x < this.numScreenTilesX; x += 1) {
        this.tileMapSprites[x] = [];
        for (y = 0; y < this.numScreenTilesY; y += 1) {
            this.tileMapSprites[x][y] = this.tileMapSpritesGroup.create(x * this.tileSize, y * this.tileSize, 'Tileset');
            this.tileMapSprites[x][y].smoothed = false;
            this.tileMapSprites[x][y].scale.setTo(this.scaleFactor, this.scaleFactor);
            this.tileMapSprites[x][y].frame = this.tileMap[x][y].tileType.imageIndex;
        }
    }
};

// UPDATE_TILE_MAP_SPRITES:
// ************************************************************************************************
gameState.updateTileMapSprites = function () {
    var x, y,
        cameraTileX = Math.floor(game.camera.x / this.tileSize),
        cameraTileY = Math.floor(game.camera.y / this.tileSize);

    for (x = 0; x < this.numScreenTilesX; x += 1) {
        for (y = 0; y < this.numScreenTilesY; y += 1) {
            this.tileMapSprites[x][y].x = ((cameraTileX + x) * this.tileSize);
            this.tileMapSprites[x][y].y = ((cameraTileY + y) * this.tileSize);

            // If in bounds:
            if (this.isTileIndexInBounds({x: cameraTileX + x, y: cameraTileY + y})) {
                this.tileMapSprites[x][y].visible = true;
                this.tileMapSprites[x][y].frame = this.tileMap[cameraTileX + x][cameraTileY + y].tileType.imageIndex;
                
                
                
                // If explored:
                if (this.tileMap[cameraTileX + x][cameraTileY + y].explored) {
                    // If explored and visible:
                    if (this.tileMap[cameraTileX + x][cameraTileY + y].visible) {
                        this.tileMapSprites[x][y].alpha = 1.0;
                        
                        // Make item visible:
                        if (this.tileMap[cameraTileX + x][cameraTileY + y].item) {
                            this.tileMap[cameraTileX + x][cameraTileY + y].item.sprite.visible = true;
                        }
                    // If explored and not visible:
                    } else {
                        this.tileMapSprites[x][y].alpha = 0.5;
                        // Hide item:
                        if (this.tileMap[cameraTileX + x][cameraTileY + y].item) {
                            this.tileMap[cameraTileX + x][cameraTileY + y].item.sprite.visible = false;
                        }
                    }
                // If not explored:
                } else {
                    this.tileMapSprites[x][y].visible = false;
                    
                    // Hide item:
                    if (this.tileMap[cameraTileX + x][cameraTileY + y].item) {
                        this.tileMap[cameraTileX + x][cameraTileY + y].item.sprite.visible = false;
                    }
                }
            // If not in bounds:
            } else {
                this.tileMapSprites[x][y].visible = false;
            }
        }
    }
};

// CALCULATE_LOS:
// ************************************************************************************************
gameState.calculateLoS = function () {
    var angle = 0,
        angleDelta = Math.PI / 20,
        distance = 0,
        stepDelta = 16,
        sightDistance = this.tileSize * 7,
        playerPosX = this.playerCharacter.tileIndex.x * this.tileSize + this.tileSize / 2,
        playerPosY = this.playerCharacter.tileIndex.y * this.tileSize + this.tileSize / 2,
        point,
        tileIndex,
        x,
        y;
    
    // Make all tiles not visible:
    for (x = 0; x < this.numTilesX; x += 1) {
        for (y = 0; y < this.numTilesY; y += 1) {
            this.tileMap[x][y].visible = false;
        }
    }
    
    point = new Phaser.Point(1, 0);
    for (angle = 0; angle < Math.PI * 2; angle += angleDelta) {
        point = Phaser.Point.rotate(point, 0, 0, angleDelta);
        for (distance = 0; distance < sightDistance; distance += stepDelta) {
            tileIndex = this.getTileIndexFromPosition({x: playerPosX + point.x * distance, y: playerPosY + point.y * distance});
            
            if (this.isTileIndexTransparent(tileIndex)) {
                this.setTileIndexExplored(tileIndex);
                this.setTileIndexVisible(tileIndex);
            } else {
                this.setTileIndexExplored(tileIndex);
                this.setTileIndexVisible(tileIndex);
                break;
            }
        }
    }
};

// IS_RAY_CLEAR:
// ************************************************************************************************
gameState.isRayClear = function (startTileIndex, endTileIndex) {
    var startPosition = this.getPositionFromTileIndex(startTileIndex),
        endPosition = this.getPositionFromTileIndex(endTileIndex),
        length = game.math.distance(startPosition.x, startPosition.y, endPosition.x, endPosition.y),
        normal = this.getNormal(startPosition, endPosition),
        currentPosition = startPosition,
        currentTileIndex,
        step = 8,
        currentDistance = 0;
    
    for (currentDistance = 0; currentDistance < length; currentDistance += step) {
        currentPosition = {x: startPosition.x + normal.x * currentDistance,
                           y: startPosition.y + normal.y * currentDistance};
        currentTileIndex = this.getTileIndexFromPosition(currentPosition);
        if (!this.isTileIndexTransparent(currentTileIndex)) {
            return false;
        }
    }
    
    return true;
};

// ENTER_TRAP_DOOR:
// ************************************************************************************************
gameState.enterTrapDoor = function () {
    var data;
    
    gameState.saveTileMap();
    gameState.dungeonLevel += 1;
    gameState.destroyAllNPCs();
    gameState.destroyAllItems();
    gameState.characterList = [];
    gameState.characterList.push(gameState.playerCharacter);
    gameState.activeCharacterIndex = 0;
    
    // Either create a new map or load existing one:
    data = localStorage.getItem('DungeonLevel' + gameState.dungeonLevel);
    if (data) {
        gameState.loadTileMap(gameState.dungeonLevel);
    } else {
        gameState.createTileMap();
    }
    
    gameState.HUD.group.parent.bringToTop(gameState.HUD.group);
    gameState.setPlayerCharacterTileIndex(gameState.getRandomPassableIndex());
};

// DESCEND_STAIRS:
// ************************************************************************************************
gameState.descendStairs = function () {
    var data;
    
    gameState.dungeonLevel += 1;
    gameState.destroyAllNPCs();
    gameState.destroyAllItems();
    gameState.destroyAllIce();
    gameState.destroyAllBlood();
    gameState.characterList = [];
    gameState.characterList.push(gameState.playerCharacter);
    gameState.activeCharacterIndex = 0;
    
    gameState.createTileMap();

    
    gameState.HUD.group.parent.bringToTop(gameState.HUD.group);
    gameState.setPlayerCharacterTileIndex(gameState.getPassableAdjacentIndex(gameState.upStairsIndex));
    //gameState.setPlayerCharacterTileIndex(gameState.getPassableAdjacentIndex(gameState.downStairsIndex));
    this.playerCharacter.stickSprite();
};


// WIN_GAME:
// ************************************************************************************************
gameState.winGame = function () {
    gameState.score.unshift('You successfully retreived the Goblet of Yendor!');
    localStorage.setItem('Score', JSON.stringify(gameState.score));
    game.state.start('win');
};

gameState.calculatePath = function (fromIndex, toIndex, speed) {
    var currentTile,
        path = [],
        openTiles = [],
        closedTiles = [],
        isInOpenTiles,
        isInClosedTiles,
        addToOpenList,
        loopCount = 0;
    
    if (!speed) {
        speed = 'fast';
    }

    // IS IN OPEN TILES:
    isInOpenTiles = function (index) {
        var i;
        for (i = 0; i < openTiles.length; i += 1) {
            if (openTiles[i].index.x === index.x && openTiles[i].index.y === index.y) {
                return true;
            }
        }
        return false;
    };

    // IS IN CLOSED TILES:
    isInClosedTiles = function (index) {
        var i;
        for (i = 0; i < closedTiles.length; i += 1) {
            if (closedTiles[i].index.x === index.x && closedTiles[i].index.y === index.y) {
                return true;
            }
        }
        return false;
    };

    // ADD TO OPEN LIST:
    addToOpenList = function (index, parent) {
        if (!isInOpenTiles(index) && !isInClosedTiles(index) && gameState.isTileIndexPassable(index)) {
            openTiles.push({index: index, parent: parent});
        // Always add the goal
        } else if (index.x === toIndex.x && index.y === toIndex.y) {
            openTiles.push({index: index, parent: parent});
        }
    };

    // Push the start index and set its parent to null
    openTiles.push({index: fromIndex, parent: null});

    while (openTiles.length > 0) {
        // Pop the first element:
        currentTile = openTiles.shift();
        closedTiles.push(currentTile);

        // Add adjacent tiles that are not on open or closed list:
        addToOpenList({x: currentTile.index.x + 1, y: currentTile.index.y}, currentTile);
        addToOpenList({x: currentTile.index.x - 1, y: currentTile.index.y}, currentTile);
        addToOpenList({x: currentTile.index.x, y: currentTile.index.y + 1}, currentTile);
        addToOpenList({x: currentTile.index.x, y: currentTile.index.y - 1}, currentTile);
        
        if (gameState.getTile(currentTile.index).tileType.name !== 'Water'
                && gameState.getTile(currentTile.index).tileType.name !== 'VineFloor'
                && speed === 'fast') {
            addToOpenList({x: currentTile.index.x + 1, y: currentTile.index.y - 1}, currentTile);
            addToOpenList({x: currentTile.index.x - 1, y: currentTile.index.y - 1}, currentTile);
            addToOpenList({x: currentTile.index.x + 1, y: currentTile.index.y + 1}, currentTile);
            addToOpenList({x: currentTile.index.x - 1, y: currentTile.index.y + 1}, currentTile);
        }
        
        // Check if done:
        if (currentTile.index.x === toIndex.x && currentTile.index.y === toIndex.y) {
            // Create path
            while (currentTile.parent) {
                path.push(currentTile.index);
                currentTile = currentTile.parent;
            }
            break;
        }

        loopCount += 1;
        if (loopCount > 200) {
            console.log('loopCount exceeded');
            return null;
        }

    }
    return path;
};

// IS_ADJACENT_TO_LAVA:
// ************************************************************************************************
gameState.isAdjacentToLava = function (tileIndex) {
    var x, y;
    
    for (x = tileIndex.x - 1; x <= tileIndex.x + 1; x += 1) {
        for (y = tileIndex.y - 1; y <= tileIndex.y + 1; y += 1) {
            if (this.isTileIndexInBounds({x: x, y: y}) && this.tileMap[x][y].tileType.name === 'Lava') {
                return true;
            }
        }
    }
    return false;
    
};

// GET PASSABLE INDEX IN BOX:
// ************************************************************************************************
gameState.getPassableIndexInBox = function (box) {
    var x, y, count = 0;
    
    x = game.rnd.integerInRange(box.startX, box.endX);
    y = game.rnd.integerInRange(box.startY, box.endY);
    while (!this.isTileIndexPassable({x: x, y: y}) && count < 20) {
        x = game.rnd.integerInRange(box.startX, box.endX);
        y = game.rnd.integerInRange(box.startY, box.endY);
        count += 1;
    }
    
    if (this.isTileIndexPassable({x: x, y: y})) {
        return {x: x, y: y};
    } else {
        return null;
    }
    
};
// GET_PASSABLE_ADJACENT_INDEX:
// ************************************************************************************************
gameState.getPassableAdjacentIndex = function (tileIndex) {
    if (this.isTileIndexPassable({x: tileIndex.x + 1, y: tileIndex.y})) {
        return {x: tileIndex.x + 1, y: tileIndex.y};
    } else if (this.isTileIndexPassable({x: tileIndex.x - 1, y: tileIndex.y})) {
        return {x: tileIndex.x - 1, y: tileIndex.y};
    } else if (this.isTileIndexPassable({x: tileIndex.x, y: tileIndex.y + 1})) {
        return {x: tileIndex.x, y: tileIndex.y + 1};
    } else if (this.isTileIndexPassable({x: tileIndex.x, y: tileIndex.y - 1})) {
        return {x: tileIndex.x, y: tileIndex.y - 1};
    
    // Diagonals:
    } else if (this.isTileIndexPassable({x: tileIndex.x + 1, y: tileIndex.y + 1})) {
        return {x: tileIndex.x + 1, y: tileIndex.y + 1};
    } else if (this.isTileIndexPassable({x: tileIndex.x - 1, y: tileIndex.y + 1})) {
        return {x: tileIndex.x - 1, y: tileIndex.y + 1};
    } else if (this.isTileIndexPassable({x: tileIndex.x + 1, y: tileIndex.y - 1})) {
        return {x: tileIndex.x + 1, y: tileIndex.y - 1};
    } else if (this.isTileIndexPassable({x: tileIndex.x - 1, y: tileIndex.y - 1})) {
        return {x: tileIndex.x - 1, y: tileIndex.y - 1};
    } else {
        return null;
    }
};

// GET_NORMAL:
// ************************************************************************************************
gameState.getNormal = function (startPosition, endPosition) {
    var length = game.math.distance(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
    
    return {x: (endPosition.x - startPosition.x) / length,
            y: (endPosition.y - startPosition.y) / length};
};

// GET_TILE:
// ************************************************************************************************
gameState.getTile = function (tileIndex) {
    if (this.isTileIndexInBounds(tileIndex)) {
        return this.tileMap[tileIndex.x][tileIndex.y];
    } else {
        return null;
    }
};

// SET_TILE_TYPE:
// ************************************************************************************************
gameState.setTileType = function (tileIndex, tileType) {
    if (this.isTileIndexInBounds(tileIndex)) {
        this.tileMap[tileIndex.x][tileIndex.y].tileType = tileType;
    }
};

// SET_TILE_INDEX_EXPLORED:
// ************************************************************************************************
gameState.setTileIndexExplored = function (tileIndex) {
    if (this.isTileIndexInBounds(tileIndex)) {
        this.tileMap[tileIndex.x][tileIndex.y].explored = true;
    }
};

// SET_TILE_INDEX_VISIBLE:
// ************************************************************************************************
gameState.setTileIndexVisible = function (tileIndex) {
    if (this.isTileIndexInBounds(tileIndex)) {
        this.tileMap[tileIndex.x][tileIndex.y].visible = true;
    }
};

// GET_TILE_INDEX_FROM_POSITION:
// ************************************************************************************************
gameState.getTileIndexFromPosition = function (position) {
    return {x: Math.floor(position.x / this.tileSize), y: Math.floor(position.y / this.tileSize)};
};
    
// GET_POSITION_FROM_TILE_INDEX:
// ************************************************************************************************
gameState.getPositionFromTileIndex = function (tileIndex) {
    return {x: tileIndex.x * this.tileSize + this.tileSize / 2,
            y: tileIndex.y * this.tileSize + this.tileSize / 2};
};
    
// IS_TILE_INDEX_PASSABLE:
// ************************************************************************************************
gameState.isTileIndexPassable = function (tileIndex) {
    return this.isTileIndexInBounds(tileIndex)
            && this.getTile(tileIndex).tileType.passable
            && this.getTile(tileIndex).character === null
            && this.getTile(tileIndex).ice === null;
};

// IS_TILE_INDEX_TRANSPARENT:
// ************************************************************************************************
gameState.isTileIndexTransparent = function (tileIndex) {
    return this.isTileIndexInBounds(tileIndex) && this.getTile(tileIndex).tileType.transparent;
};

// IS_TILE_INDEX_IN_BOUNDS:
// ************************************************************************************************
gameState.isTileIndexInBounds = function (tileIndex) {
    return tileIndex.x >= 0 && tileIndex.x < this.numTilesX && tileIndex.y >= 0 && tileIndex.y < this.numTilesY;
};

// IS_ADJACENT:
// ************************************************************************************************
gameState.isAdjacent = function (tileIndex1, tileIndex2) {
    return (Math.abs(tileIndex1.x - tileIndex2.x) + Math.abs(tileIndex1.y - tileIndex2.y)) === 1;
};

// GET_TILE_DISTANCE:
// ************************************************************************************************
gameState.getTileDistance = function (tileIndex1, tileIndex2) {
    return game.math.distance(tileIndex1.x, tileIndex1.y, tileIndex2.x, tileIndex2.y);
};

// GET CHARACTERS IN RAY:
// ************************************************************************************************
gameState.getCharactersInRay = function (startPos, endPos) {
    var x = startPos.x,
        y = startPos.y,
        stepSize = 8,
        distance = 0,
        finalDistance = game.math.distance(startPos.x, startPos.y, endPos.x, endPos.y),
        normal = gameState.getNormal(startPos, endPos),
        npc,
        npcs = [];

    while (distance < finalDistance) {
        x += normal.x * stepSize;
        y += normal.y * stepSize;
        distance += stepSize;

        npc = this.getTile(this.getTileIndexFromPosition({x: x, y: y})).character;
        if (npc && !gameState.inArray(npc, npcs)) {
            npcs.push(npc);
        }
    }

    return npcs;
};

// GET TILES IN RAY:
// ************************************************************************************************
gameState.getTilesInRay = function (startPos, endPos) {
    var x = startPos.x,
        y = startPos.y,
        stepSize = 4,
        distance = 0,
        finalDistance = game.math.distance(startPos.x, startPos.y, endPos.x, endPos.y),
        normal = gameState.getNormal(startPos, endPos),
        tile,
        tiles = [];

    while (distance < finalDistance) {
        x += normal.x * stepSize;
        y += normal.y * stepSize;
        distance += stepSize;

        tile = this.getTile(this.getTileIndexFromPosition({x: x, y: y}));
        if (tile && !gameState.inArray(tile, tiles)) {
            tiles.push(tile);
        }
    }

    return tiles;
};