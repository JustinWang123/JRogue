/*global game, gameState, LARGE_BLACK_FONT, BLACK_FONT, WHITE_FONT*/

'use strict';

gameState.createMiniMap = function (startX, startY) {
    var mapTileSize = 4;

    // Map sprite:
    this.miniMapBMP = game.add.bitmapData(gameState.numTilesX * mapTileSize, gameState.numTilesY * mapTileSize);
    this.miniMapSprite = this.game.add.sprite(startX, startY, this.miniMapBMP);
    this.HUD.group.add(this.miniMapSprite);
    
};

gameState.refreshMiniMap = function () {
    var x, y, mapTileSize = 4;

    // Fill black:
    this.miniMapBMP.context.fillStyle = "rgb(0,0,0)";
    this.miniMapBMP.context.fillRect(0, 0, this.miniMapBMP.width, this.miniMapBMP.height);

    // Draw dots:
    for (x = 0; x < gameState.numTilesX; x += 1) {
        for (y = 0; y < gameState.numTilesY; y += 1) {
            
            // Unexplored (black):
            if (!gameState.tileMap[x][y].explored) {
                this.miniMapBMP.context.fillStyle = 'rgb(0,0,0)';
            
            // Player:
            } else if (x === gameState.playerCharacter.tileIndex.x && y === gameState.playerCharacter.tileIndex.y) {
                this.miniMapBMP.context.fillStyle = 'rgb(0,255,0)';
                
            // Enemy:
            } else if (gameState.tileMap[x][y].character && gameState.tileMap[x][y].visible) {
                this.miniMapBMP.context.fillStyle = 'rgb(255,0,0)';
                
            // Down Stair:
            } else if (gameState.tileMap[x][y].tileType === gameState.tileTypes.DownStair) {
                this.miniMapBMP.context.fillStyle = 'rgb(0,0,255)';
                
            // Door:
            } else if (gameState.tileMap[x][y].tileType === gameState.tileTypes.OpenDoor || gameState.tileMap[x][y].tileType === gameState.tileTypes.ClosedDoor) {
                this.miniMapBMP.context.fillStyle = 'rgb(140,90,34)';
                
            // Water:
            } else if (gameState.tileMap[x][y].tileType === gameState.tileTypes.Water) {
                this.miniMapBMP.context.fillStyle = 'rgb(65,90,130)';
            
            // Lava:
            } else if (gameState.tileMap[x][y].tileType === gameState.tileTypes.Lava) {
                this.miniMapBMP.context.fillStyle = 'rgb(223,0,0)';
                
            // Floor: (adding character so that non visible characters do not show up as walls)
            } else if (gameState.isTileIndexPassable({x: x, y: y}) || gameState.tileMap[x][y].character) {
                this.miniMapBMP.context.fillStyle = 'rgb(200,200,200)';
                
            // Wall:
            } else {
                this.miniMapBMP.context.fillStyle = 'rgb(128,128,128)';
            }
            
            /*
            // Player (green):
            } else if (gameState.playerFleet.currentTileIndex.x === this.startIndex.x + x
                       && gameState.playerFleet.currentTileIndex.y === this.startIndex.y + y) {
                this.mapBMP.context.fillStyle = 'rgb(106,239,23)';

            // Encounter (orange):
            } else if (gameState.tileMap[this.startIndex.x + x][this.startIndex.y + y].encounter) {
                this.mapBMP.context.fillStyle = 'rgb(175,107,17)'; // 'rgb(175,107,17)';
            // Space (purple):
            } else if (!gameState.tileMap[this.startIndex.x + x][this.startIndex.y + y].colony) {
                this.mapBMP.context.fillStyle = 'rgb(94,63,107)';
            // Imperial Colony (blue):
            } else if (gameState.tileMap[this.startIndex.x + x][this.startIndex.y + y].colony.faction === 'Imperial') {
                this.mapBMP.context.fillStyle = 'rgb(62,109,143)'; //'rgb(169,32,50)';
            // Hostile Colony (red):
            } else if (gameState.tileMap[this.startIndex.x + x][this.startIndex.y + y].colony.faction === 'Hostile') {
                this.mapBMP.context.fillStyle = 'rgb(169,32,50)'; // 'rgb(175,107,17)';
            }
            */
            this.miniMapBMP.context.fillRect(x * mapTileSize, y * mapTileSize, mapTileSize, mapTileSize);
        }
    }

    this.miniMapBMP.dirty = true;
};
