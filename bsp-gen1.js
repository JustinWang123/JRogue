/*global console, game, gameState, NUM_TILES_X, NUM_TILES_Y*/
'use strict';

// GENERATE_BSP:
// *****************************************************************************
gameState.generateBSP1 = function () {
    var tileTypeMap,
        x,
        y,
        i,
        baseArea,
        numAreas = 4,
        areaSize = this.numTilesX / numAreas,
        createRoom,
        connectAreas,
        isLeaf,
        partitionArea,
        randomOpenIndex,
        areaSizeFunc,
        createTraps,
        createStairs,
        isIndexAdjacentOpen,
        createSpecialArea,
        createTempleArea;
    
    // IS INDEX ADJACENT OPEN:
    // *************************************************************************
    isIndexAdjacentOpen = function (tileIndex) {

        if (gameState.isTileIndexInBounds({x: tileIndex.x + 1, y: tileIndex.y})
                && tileTypeMap[tileIndex.x + 1][tileIndex.y].type === 'Floor') {
            return true;
        }
        if (gameState.isTileIndexInBounds({x: tileIndex.x - 1, y: tileIndex.y})
                && tileTypeMap[tileIndex.x - 1][tileIndex.y].type === 'Floor') {
            return true;
        }
        if (gameState.isTileIndexInBounds({x: tileIndex.x, y: tileIndex.y + 1})
                && tileTypeMap[tileIndex.x][tileIndex.y + 1].type === 'Floor') {
            return true;
        }
        if (gameState.isTileIndexInBounds({x: tileIndex.x, y: tileIndex.y - 1})
                && tileTypeMap[tileIndex.x][tileIndex.y - 1].type === 'Floor') {
            return true;
        }
        return false;
        
    };
    
    // IS LEAF:
    // *************************************************************************
    isLeaf = function (area) {
        return area.subArea1 === null || area.subArea2 === null;
    };
    
    // RANDOM OPEN INDEX:
    // *************************************************************************
    randomOpenIndex = function (box) {
        var x = game.rnd.integerInRange(box.startX, box.endX - 1),
            y = game.rnd.integerInRange(box.startY, box.endY - 1),
            count = 0;
        
        while (tileTypeMap[x][y].type === 'Wall') {
            x = game.rnd.integerInRange(box.startX, box.endX - 1);
            y = game.rnd.integerInRange(box.startY, box.endY - 1);
            count += 1;
            
            if (count > 1000) {
                console.log('randomOpenIndex failed at 1000');
            }
        }
        
        return {x: x, y: y};
    };
    
    // AREA_SIZE FUNC:
    // *************************************************************************
    areaSizeFunc = function (area) {
        if (area.width * area.height === gameState.numTilesX * gameState.numTilesY) {
            return 'Huge';
        } else if (area.width * area.height === gameState.numTilesX * (gameState.numTilesY / 2)) {
            return 'Large';
        } else if (area.width * area.height === (gameState.numTilesX / 2) * (gameState.numTilesY / 2)) {
            return 'Medium';
        } else if (area.width * area.height === (gameState.numTilesX / 4) * (gameState.numTilesY / 2)) {
            return 'Small';
        } else {
            return 'Tiny';
        }
    };
    
    // PARTITION AREA:
    // *************************************************************************
    partitionArea = function (area) {
        var width = area.endX - area.startX,
            height = area.endY - area.startY,
            centerX = area.startX + width / 2,
            centerY = area.startY + height / 2,
            x,
            y;
        
        area.center = {x: centerX, y: centerY};
        area.width = width;
        area.height = height;
        
        // Base case (minimum area size reached):
        if (((width <= areaSize && height <= areaSize) || game.rnd.frac() <= 0.20 * area.depth) && area.depth > 0) {
            area.subArea1 = null;
            area.subArea2 = null;
            
            // Set area size:
            area.size = areaSizeFunc(area);
            
            // Flag tiles as belonging to area:
            for (x = area.startX; x < area.endX; x += 1) {
                for (y = area.startY; y < area.endY; y += 1) {
                    tileTypeMap[x][y].area = area;
                }
            }
            
            gameState.areaList.push(area);
        // Partition vertically:
        } else if (width >= height && width > areaSize) {
            area.subArea1 = {startX: area.startX, startY: area.startY, endX: centerX, endY: area.endY, subArea1: null, subArea2: null, depth: area.depth + 1};
            area.subArea2 = {startX: centerX, startY: area.startY, endX: area.endX, endY: area.endY, subArea1: null, subArea2: null, depth: area.depth + 1};
            partitionArea(area.subArea1);
            partitionArea(area.subArea2);
        // Partition Horizontally:
        } else if (height > areaSize) {
            area.subArea1 = {startX: area.startX, startY: area.startY, endX: area.endX, endY: centerY, subArea1: null, subArea2: null, depth: area.depth + 1};
            area.subArea2 = {startX: area.startX, startY: centerY, endX: area.endX, endY: area.endY, subArea1: null, subArea2: null, depth: area.depth + 1};
            partitionArea(area.subArea1);
            partitionArea(area.subArea2);
        }
    };
    
    // CREATE_ROOM:
    // *************************************************************************
    createRoom = function (area) {
        // Base case (leaf area reached):
        if (isLeaf(area)) {
            if (!gameState.createdTemple && gameState.dungeonLevel >= 4 && area.size === 'Tiny') {
                gameState.fillCustomRoom(tileTypeMap, area, 'temple');
                gameState.createdTemple = true;
                area.type = 'Dungeon';
                console.log('created temple successfully');
                
            } else if (area.width >= gameState.numTilesX / 2 && area.height >= gameState.numTilesY / 2) {
                gameState.fillCave(tileTypeMap, area);
                area.type = 'Cave';
            } else if (area.size === 'Tiny' && game.rnd.frac() <= 0.1) {
                gameState.fillCustomRoom(tileTypeMap, area);
                area.type = 'Dungeon';
            } else {
                gameState.fillRoom(tileTypeMap, area);
                area.type = 'Dungeon';
            }

        } else {
            createRoom(area.subArea1);
            createRoom(area.subArea2);
        }
    };
    
    // CONNECT AREAS:
    // *************************************************************************
    connectAreas = function (area) {
        // Base case (area is leaf):
        if (isLeaf(area)) {
            return;
        } else {
            connectAreas(area.subArea1);
            connectAreas(area.subArea2);
            
            // Higher depth areas are connected twice:
            if (area.depth === 0) {

                gameState.createHall(tileTypeMap, randomOpenIndex({startX: area.subArea1.center.x, startY: area.subArea1.startY, endX: area.subArea1.endX, endY: area.subArea1.center.y}),
                           randomOpenIndex({startX: area.subArea2.startX, startY: area.subArea2.startY, endX: area.subArea2.center.x, endY: area.subArea2.center.y}));
                gameState.createHall(tileTypeMap, randomOpenIndex({startX: area.subArea1.center.x, startY: area.subArea1.center.y, endX: area.subArea1.endX, endY: area.subArea1.endY}),
                           randomOpenIndex({startX: area.subArea2.startX, startY: area.subArea2.center.y, endX: area.subArea2.center.x, endY: area.subArea2.endY}));
                
                
            // Deeper areas are connected once:
            } else if (area.depth === 1) {
                gameState.createHall(tileTypeMap, randomOpenIndex({startX: area.subArea1.startX, startY: area.subArea1.center.y, endX: area.subArea1.center.x, endY: area.subArea1.endY}),
                           randomOpenIndex({startX: area.subArea2.startX, startY: area.subArea2.startY, endX: area.subArea2.center.x, endY: area.subArea2.center.y}));
                gameState.createHall(tileTypeMap, randomOpenIndex({startX: area.subArea1.center.x, startY: area.subArea1.center.y, endX: area.subArea1.endX, endY: area.subArea1.endY}),
                           randomOpenIndex({startX: area.subArea2.center.x, startY: area.subArea2.startY, endX: area.subArea2.endX, endY: area.subArea2.center.y}));
                
            } else if (area.depth === 2) {
                gameState.createHall(tileTypeMap, randomOpenIndex({startX: area.subArea1.center.x, startY: area.subArea1.startY, endX: area.subArea1.endX, endY: area.subArea1.center.y}),
                           randomOpenIndex({startX: area.subArea2.startX, startY: area.subArea2.startY, endX: area.subArea2.center.x, endY: area.subArea2.center.y}));
                if (game.rnd.frac() < 0.5) {
                    gameState.createHall(tileTypeMap, randomOpenIndex({startX: area.subArea1.center.x, startY: area.subArea1.center.y, endX: area.subArea1.endX, endY: area.subArea1.endY}),
                               randomOpenIndex({startX: area.subArea2.startX, startY: area.subArea2.center.y, endX: area.subArea2.center.x, endY: area.subArea2.endY}));
                }
            } else {
                gameState.createHall(tileTypeMap, randomOpenIndex(area.subArea1), randomOpenIndex(area.subArea2));
            }
        }
    };
    
    
    // CREATE STAIRS:
    // *************************************************************************
    createStairs = function (area) {
        var createStair;
        
        // CREATE STAIR:
        // *********************************************************************
        createStair = function (area, type) {
            var tileIndex;
            
            // Base case (create stairs):
            if (isLeaf(area)) {
                tileIndex = randomOpenIndex(area);
                while (!isIndexAdjacentOpen(tileIndex)) {
                    tileIndex = randomOpenIndex(area);
                }
                tileTypeMap[tileIndex.x][tileIndex.y].type = type;
                area.hasStairs = true;
                
            // Recursive Case (randomly recurse):
            } else {
                if (game.rnd.frac() < 0.5) {
                    createStair(area.subArea1, type);
                } else {
                    createStair(area.subArea2, type);
                }
            }
        };
        
        // Initial Split:
        if (game.rnd.frac() < 0.5) {
            createStair(area.subArea1, 'UpStair');
            createStair(area.subArea2, 'DownStair');
        } else {
            createStair(area.subArea1, 'DownStair');
            createStair(area.subArea2, 'UpStair');
        }
        
    };

    
    // CREATE TEMPLE AREA:
    // *************************************************************************
    createTempleArea = function () {
        var tileIndex, area, maxLoops = 0;

        area = gameState.randElem(gameState.areaList);
        gameState.createdTemple = true;

        while (area.type !== 'Dungeon') {
            area = gameState.randElem(gameState.areaList);
            maxLoops += 1;
            gameState.createdTemple = true;
            
            if (maxLoops > 20) {
                gameState.createdTemple = false;
                break;
                
            }
        }
        
        if (gameState.createdTemple) {
            tileIndex = randomOpenIndex(area);
            tileTypeMap[tileIndex.x][tileIndex.y].type = 'MageAlter';
            tileIndex = randomOpenIndex(area);
            tileTypeMap[tileIndex.x][tileIndex.y].type = 'WarriorAlter';
            tileIndex = randomOpenIndex(area);
            tileTypeMap[tileIndex.x][tileIndex.y].type = 'HunterAlter';
            console.log('successfully created temple');
        } else {
            console.log('failed to create temple');
        }
    };
    
    // PERFORM MAP GENERATION:
    // *************************************************************************
    // Initial Fill:
    tileTypeMap = [];
    for (x = 0;  x < this.numTilesX; x += 1) {
        tileTypeMap[x] = [];
        for (y = 0; y < this.numTilesY; y += 1) {
            tileTypeMap[x][y] = {type: 'Wall', area: null};
        }
    }
    
    // Area list:
    this.areaList = [];
    
    // Root area:
    baseArea = {startX: 0, startY: 0, endX: this.numTilesX, endY: this.numTilesY, subArea1: null, subArea2: null, depth: 0};
    
    console.log('partition areas');
    partitionArea(baseArea);
    
    console.log('creating rooms');
    createRoom(baseArea);
    
    console.log('connecting areas');
    connectAreas(baseArea);
    
    console.log('creating stairs');
    createStairs(baseArea);
    
    console.log('adding water and vines');
    // Add water and vines:
    for (i = 0; i < this.areaList.length; i += 1) {
        // Lava:
        if (this.areaList[i].type === 'Cave' && this.dungeonLevel >= 7 && game.rnd.frac() <= 0.4) {
            this.addFeatureToArea(tileTypeMap, this.areaList[i], 'Lava', 5);
        }
        
        // Water:
        if (this.areaList[i].type === 'Cave' && this.dungeonLevel < 7 && game.rnd.frac() <= 0.4) {
            this.addFeatureToArea(tileTypeMap, this.areaList[i], 'Water', 5);
        }
        
        // Vines:
        if (this.areaList[i].type === 'Dungeon' && game.rnd.frac() <= 0.1) {
            this.addFeatureToArea(tileTypeMap, this.areaList[i], 'VineFloor', game.rnd.integerInRange(3, 4));
        }
    }
    
    // Add Alters:
    /*
    if (this.dungeonLevel >= 4 && !this.createdTemple) {
        createTempleArea();
    }
    */
    
    return tileTypeMap;
};

// FILL_ROOM:
// *****************************************************************************
gameState.fillRoom = function (map, area) {
    var x,
        y,
        areaMargin = 1,
        minRoomWidth = area.width / 2,
        minRoomHeight = area.height / 2,
        startX,
        startY,
        endX,
        endY,
        width,
        height;
    
    startX = game.rnd.integerInRange(area.startX + areaMargin, area.endX - minRoomWidth - areaMargin - 1);
    startY = game.rnd.integerInRange(area.startY + areaMargin, area.endY - minRoomHeight - areaMargin - 1);
    endX = game.rnd.integerInRange(startX + minRoomWidth, area.endX - areaMargin);
    endY = game.rnd.integerInRange(startY + minRoomHeight, area.endY - areaMargin);
    
    width = endX - startX + 1;
    height = endY - startY + 1;
    
    for (x = startX; x < endX; x += 1) {
        for (y = startY; y < endY; y += 1) {
            map[x][y].type = 'Floor';
        }
    }
    
    // Pillar Rooms:
    if (width >= 6 && game.rnd.frac() <= 0.05) {
        for (y = startY + 1; y < endY - 1; y += 2) {
            map[startX + 1][y].type = 'Wall';
            map[endX - 2][y].type = 'Wall';
        }
        
    // Split Rooms:
    } else if (height >= 8 && game.rnd.frac() <= 0.4) {
        for (x = startX; x < endX; x += 1) {
            map[x][Math.floor(startY + Math.floor(height / 2)) - 1].type = 'Wall';
        }
        
        map[startX + Math.floor(width / 2)][startY + Math.floor(height / 2) - 1].type = 'Floor';
    }
    
    area.isRoomWall = function (x, y) {
        return (x === startX - 1 && y >= startY && y < endY)
            || (x === endX && y >= startY && y < endY)
            || (y === startY - 1 && x >= startX && x < endX)
            || (y === endY && x >= startX && x < endX);
    };
};

// CREATE_HALL:
// *************************************************************************
gameState.createHall = function (map, startTileIndex, endTileIndex) {
    var x, y, doesDoorFit, setDoor, isRoomWall, wide, setFloor;
  
    wide = game.rnd.frac() <= 0.4;
    
    // DOES DOOR FIT:
    // *************************************************************************
    doesDoorFit = function (x, y) {
        var isSolid;
        
        // IS SOLID:
        // *********************************************************************
        isSolid = function (x, y) {
            return map[x][y].type === 'Wall' || map[x][y].type === 'Door';
        };
        
        if (map[x + 1][y].type === 'Floor' && map[x - 1][y].type === 'Floor' && isSolid(x, y + 1) && isSolid(x, y - 1)) {
            return true;
        }
        
        if (isSolid(x + 1, y) && isSolid(x - 1, y) && map[x][y + 1].type === 'Floor' && map[x][y - 1].type === 'Floor') {
            return true;
        }
        
        return false;
    };
    
    // IS ROOM WALL:
    // *************************************************************************
    isRoomWall = function (x, y) {
        var i;
        for (i = 0; i < gameState.areaList.length; i += 1) {
            if (gameState.areaList[i].isRoomWall(x, y)
                    && x >= gameState.areaList[i].startX
                    && y >= gameState.areaList[i].startY
                    && x < gameState.areaList[i].endX
                    && y < gameState.areaList[i].endY) {
                return true;
            }
        }
        
        return false;
    };
    
    // SET DOOR:
    // *************************************************************************
    setDoor = function (x, y) {
        if (isRoomWall(x, y) && doesDoorFit(x, y)) {
            map[x][y].type = 'Door';

        }
    };
    
    // SET FLOOR:
    // *************************************************************************
    setFloor = function (x, y) {
        if (map[x][y].type === 'Wall') {
            map[x][y].type = 'Floor';
        }
    };
    
    // Carve hallway:
    // right:
    if (startTileIndex.x < endTileIndex.x) {
        for (x = startTileIndex.x; x <= endTileIndex.x; x += 1) {
            setFloor(x, startTileIndex.y);
            
            // Wide halls:
            if (wide === true && gameState.isTileIndexInBounds({x: x, y: startTileIndex.y - 1})) {
                setFloor(x, startTileIndex.y - 1);
            }
        }
    // left:
    } else {
        for (x = startTileIndex.x; x >= endTileIndex.x; x -= 1) {
            setFloor(x, startTileIndex.y);
            
            // Wide halls:
            if (wide === true && gameState.isTileIndexInBounds({x: x, y: startTileIndex.y - 1})) {
                setFloor(x, startTileIndex.y - 1);
            }
        }
    }

    // down:
    if (startTileIndex.y < endTileIndex.y) {
        for (y = startTileIndex.y; y <= endTileIndex.y; y += 1) {
            setFloor(endTileIndex.x, y);
            
            // Wide halls:
            if (wide === true && gameState.isTileIndexInBounds({x: endTileIndex.x - 1, y: y})) {
                setFloor(endTileIndex.x - 1, y);
            }
        }
    // up:
    } else {
        for (y = startTileIndex.y; y >= endTileIndex.y; y -= 1) {
            setFloor(endTileIndex.x, y);
            
            // Wide halls:
            if (wide === true && gameState.isTileIndexInBounds({x: endTileIndex.x - 1, y: y})) {
                setFloor(endTileIndex.x - 1, y);
            }
        }
        
    }
    
    // Add doors:
    // right:
    if (startTileIndex.x < endTileIndex.x) {
        for (x = startTileIndex.x; x <= endTileIndex.x; x += 1) {
            setDoor(x, startTileIndex.y);
        }
    // left:
    } else {
        for (x = startTileIndex.x; x >= endTileIndex.x; x -= 1) {
            setDoor(x, startTileIndex.y);
        }
    }

    // down:
    if (startTileIndex.y < endTileIndex.y) {
        for (y = startTileIndex.y; y <= endTileIndex.y; y += 1) {
            setDoor(endTileIndex.x, y);
        }
    // up:
    } else {
        for (y = startTileIndex.y; y >= endTileIndex.y; y -= 1) {
            setDoor(endTileIndex.x, y);
        }
    }
};

// FILL_CUSTOM_ROOM:
// *************************************************************************
gameState.fillCustomRoom = function (map, area, createTemple) {
    var customRoomTypes, tileTypes, x, y, roomIndex, templeRoom;
    
    area.isRoomWall = function (x, y) {
        return false;
    };
    
    customRoomTypes = [];
    
    customRoomTypes[0] = [[1, 1, 1, 1, 1, 1, 1, 1, 1],
                          [1, 0, 0, 0, 0, 0, 0, 0, 1],
                          [1, 0, 0, 0, 0, 0, 0, 0, 1],
                          [1, 0, 0, 1, 1, 1, 0, 0, 1],
                          [1, 0, 0, 1, 1, 1, 0, 0, 1],
                          [1, 0, 0, 1, 1, 1, 0, 0, 1],
                          [1, 0, 0, 0, 0, 0, 0, 0, 1],
                          [1, 0, 0, 0, 0, 0, 0, 0, 1],
                          [1, 1, 1, 1, 1, 1, 1, 1, 1]];
    
    customRoomTypes[1] = [[1, 1, 1, 1, 1, 1, 1, 1, 1],
                          [1, 0, 0, 0, 0, 0, 0, 0, 1],
                          [1, 0, 2, 2, 2, 2, 2, 0, 1],
                          [1, 0, 2, 2, 2, 2, 2, 0, 1],
                          [1, 0, 2, 2, 2, 2, 2, 0, 1],
                          [1, 0, 2, 2, 2, 2, 2, 0, 1],
                          [1, 0, 2, 2, 2, 2, 2, 0, 1],
                          [1, 0, 0, 0, 0, 0, 0, 0, 1],
                          [1, 1, 1, 1, 1, 1, 1, 1, 1]];
    
    templeRoom =         [[1, 1, 1, 1, 1, 1, 1, 1, 1],
                          [1, 0, 0, 0, 0, 0, 0, 0, 1],
                          [1, 0, 0, 0, 0, 0, 0, 0, 1],
                          [1, 0, 0, 0, 0, 0, 0, 0, 1],
                          [1, 0, 3, 0, 4, 0, 5, 0, 1],
                          [1, 0, 0, 0, 0, 0, 0, 0, 1],
                          [1, 0, 0, 0, 0, 0, 0, 0, 1],
                          [1, 0, 0, 0, 0, 0, 0, 0, 1],
                          [1, 1, 1, 1, 1, 1, 1, 1, 1]];
    
    roomIndex = game.rnd.integerInRange(0, customRoomTypes.length - 1);
    
    tileTypes = ['Floor', 'Wall', 'Water', 'MageAlter', 'HunterAlter', 'WarriorAlter'];
    
    for (y = 0; y < 9; y += 1) {
        for (x = 0; x < 9; x += 1) {
            if (createTemple) {
                map[area.startX + x][area.startY + y].type = tileTypes[templeRoom[y][x]];
            } else {
                map[area.startX + x][area.startY + y].type = tileTypes[customRoomTypes[roomIndex][y][x]];
            }
        }
    }
};

// FILL CAVE:
// *****************************************************************************
gameState.fillCave = function (map, area) {
    while (!this.fillCaveFunc(map, area)) {
        // pass
    }
    
    // IS ROOM WALL:
    // *************************************************************************
    area.isRoomWall = function (x, y) {
        return false;
    };
};

// ADD WATER TO CAVE:
// *****************************************************************************
gameState.addFeatureToArea = function (map, area, featureType, maxDepth) {
    var randomOpenIndex, floodFunc, index, fillSpaces;
    
    // RANDOM OPEN INDEX:
    // *************************************************************************
    randomOpenIndex = function (box) {
        var x = game.rnd.integerInRange(box.startX, box.endX - 1),
            y = game.rnd.integerInRange(box.startY, box.endY - 1);
        
        while (map[x][y].type === 'Wall') {
            x = game.rnd.integerInRange(box.startX, box.endX - 1);
            y = game.rnd.integerInRange(box.startY, box.endY - 1);
        }
        
        return {x: x, y: y};
    };
    
    // FLOOD FUNC:
    // *************************************************************************
    floodFunc = function (startX, startY) {
        var x, y, iterFunc, inBounds;
        
        // IN BOUNDS:
        // *********************************************************************
        inBounds = function (x, y) {
            return x >= area.startX &&  y >= area.startY && x < area.endX && y < area.endY;
        };
        
        // ITER FUNC:
        // *********************************************************************
        iterFunc = function (x, y, depth) {
            if (depth > maxDepth) {
                return;
            }
            
            map[x][y].type = featureType;
            
            if (inBounds(x + 1, y) && map[x + 1][y].type === 'Floor') {
                iterFunc(x + 1, y, depth + 1);
            }
            if (inBounds(x - 1, y) && map[x - 1][y].type === 'Floor') {
                iterFunc(x - 1, y, depth + 1);
            }
            if (inBounds(x, y + 1) && map[x][y + 1].type === 'Floor') {
                iterFunc(x, y + 1, depth + 1);
            }
            if (inBounds(x, y - 1) && map[x][y - 1].type === 'Floor') {
                iterFunc(x, y - 1, depth + 1);
            }
        };
        
        iterFunc(startX, startY, 0);
    };
    
    // FILL SPACES:
    // *************************************************************************
    fillSpaces = function () {
        var numWaterNeighbours, numWaterWallNeighbours, x, y;
        
        // NUM WATER WALL NEIGHBOURS:
        // *************************************************************************
        numWaterWallNeighbours = function (x, y) {
            var count = 0;
            count += gameState.isTileIndexInBounds({x: x + 1, y: y}) && (map[x + 1][y].type === featureType || map[x + 1][y].type === 'Wall') ? 1 : 0;
            count += gameState.isTileIndexInBounds({x: x - 1, y: y}) && (map[x - 1][y].type === featureType || map[x - 1][y].type === 'Wall') ? 1 : 0;
            count += gameState.isTileIndexInBounds({x: x, y: y + 1}) && (map[x][y + 1].type === featureType || map[x][y + 1].type === 'Wall') ? 1 : 0;
            count += gameState.isTileIndexInBounds({x: x, y: y - 1}) && (map[x][y - 1].type === featureType || map[x][y - 1].type === 'Wall') ? 1 : 0;
            return count;
        };
        
        // NUM WATER NEIGHBOURS:
        // *************************************************************************
        numWaterNeighbours = function (x, y) {
            var count = 0;
            count += gameState.isTileIndexInBounds({x: x + 1, y: y}) && map[x + 1][y].type === featureType ? 1 : 0;
            count += gameState.isTileIndexInBounds({x: x - 1, y: y}) && map[x - 1][y].type === featureType ? 1 : 0;
            count += gameState.isTileIndexInBounds({x: x, y: y + 1}) && map[x][y + 1].type === featureType ? 1 : 0;
            count += gameState.isTileIndexInBounds({x: x, y: y - 1}) && map[x][y - 1].type === featureType ? 1 : 0;
            return count;
        };
        
        for (x = area.startX; x < area.endX; x += 1) {
            for (y = area.startY; y < area.endY; y += 1) {
                if (map[x][y].type === 'Floor' && numWaterNeighbours(x, y) >= 1 && numWaterWallNeighbours(x, y) >= 3) {
                    map[x][y].type = featureType;
                }
            }
        }
    };
    
    
    
    index = randomOpenIndex(area);
    floodFunc(index.x, index.y);
    fillSpaces();
};

// FILL CAVE FUNC:
// *****************************************************************************
gameState.fillCaveFunc = function (map, area) {
    var areaMap,
        areaMargin = 1,
        areaWidth = area.endX - area.startX - areaMargin * 2,
        areaHeight = area.endY - area.startY - areaMargin * 2,
        i,
        x,
        y,
        initialWeight = 0.40,
        inBounds,
        countWalls,
        iterateFunc1,
        iterateFunc2,
        floodFunc,
        floodResult,
        success = false;
    
    // IN BOUNDS:
    // *************************************************************************
    inBounds = function (x, y) {
        return x >= 0 &&  y >= 0 && x < areaWidth && y < areaHeight;
    };
    
    // COUNT WALLS:
    // *************************************************************************
    countWalls = function (mapIn, xIn, yIn, dist) {
        var x, y, count = 0;
        for (x = xIn - dist; x <= xIn + dist; x += 1) {
            for (y = yIn - dist; y <= yIn + dist; y += 1) {
                count += !inBounds(x, y) || mapIn[x][y] === 'Wall' ? 1 : 0;
            }
        }
        return count;
    };
    
    // ITERATE FUNC 1:
    // *************************************************************************
    iterateFunc1 = function (oldMap) {
        var newMap = [];
        for (x = 0;  x < areaWidth; x += 1) {
            newMap[x] = [];
            for (y = 0; y < areaHeight; y += 1) {
                newMap[x][y] = countWalls(oldMap, x, y, 1) >= 5 || countWalls(oldMap, x, y, 2) <= 2 ? 'Wall' : 'Floor';
            }
        }
        return newMap;
    };
    
    // ITERATE FUNC 2:
    // *************************************************************************
    iterateFunc2 = function (oldMap) {
        var newMap = [];
        for (x = 0;  x < areaWidth; x += 1) {
            newMap[x] = [];
            for (y = 0; y < areaHeight; y += 1) {
                newMap[x][y] = countWalls(oldMap, x, y, 1) >= 5 ? 'Wall' : 'Floor';
            }
        }
        return newMap;
    };
    
    // FLOOD FUNC:
    // *************************************************************************
    floodFunc = function (map, startX, startY) {
        var x, y, floodMap, count = 0, iterFunc;
        
        // Trivial case:
        if (map[startX][startY] === 'Wall') {
            return 0;
        }
        
        floodMap = [];
        for (x = 0; x < areaWidth; x += 1) {
            floodMap[x] = [];
            for (y = 0; y < areaHeight; y += 1) {
                floodMap[x][y] = map[x][y] === 'Wall' ? 1 : 0;
            }
        }
        
        iterFunc = function (x, y) {
            count += 1;
            floodMap[x][y] = 2;
            if (inBounds(x + 1, y) && floodMap[x + 1][y] === 0) {
                iterFunc(x + 1, y);
            }
            if (inBounds(x - 1, y) && floodMap[x - 1][y] === 0) {
                iterFunc(x - 1, y);
            }
            if (inBounds(x, y + 1) && floodMap[x][y + 1] === 0) {
                iterFunc(x, y + 1);
            }
            if (inBounds(x, y - 1) && floodMap[x][y - 1] === 0) {
                iterFunc(x, y - 1);
            }
        };
        
        iterFunc(startX, startY);
        //console.log(count);
        return {count: count, map: floodMap};
    };
    
    // FILL CAVE:
    // *************************************************************************
    // Initial Noise:
    areaMap = [];
    for (x = 0; x < areaWidth; x += 1) {
        areaMap[x] = [];
        for (y = 0; y < areaHeight; y += 1) {
            if (game.rnd.frac() <= initialWeight) {
                areaMap[x][y] = 'Wall';
            } else {
                areaMap[x][y] = 'Floor';
            }
        }
    }
    
    // First Iteration:
    for (i = 0; i < 4; i += 1) {
        areaMap = iterateFunc1(areaMap);
    }
    
    // Second Iteration:
    for (i = 0; i < 3; i += 1) {
        areaMap = iterateFunc2(areaMap);
    }
    
    for (i = 0; i < 50; i += 1) {
        x = game.rnd.integerInRange(0, areaWidth - 1);
        y = game.rnd.integerInRange(0, areaHeight - 1);
        floodResult = floodFunc(areaMap, x, y);
        
        // If we have found a large enough area then copy it into the area map (all other areas become solid):
        if (floodResult.count > areaWidth * areaHeight * 0.60) {
            for (x = 0; x < areaWidth; x += 1) {
                for (y = 0; y < areaHeight; y += 1) {
                    areaMap[x][y] = floodResult.map[x][y] === 2 ? 'Floor' : 'Wall';
                }
            }
            success = true;
            break;
        }
    }

    // Copy area map back to map:
    for (x = 0; x < areaWidth; x += 1) {
        for (y = 0; y < areaHeight; y += 1) {
            map[area.startX + areaMargin + x][area.startY + areaMargin + y].type = areaMap[x][y];
        }
    }
    
    return success;
};