/*global game, gameState*/
'use strict';

// CREATE_PROJECTILE_TYPES:
// ************************************************************************************************
gameState.createProjectileTypes = function () {
    // Projectile Types:
    this.projectileTypes = {Javalin: {imageIndex: 108, damage: this.itemTypes.Javalin.damage},
                            Dart: {imageIndex: 107, damage: this.itemTypes.Dart.damage},
                            GoblinArrow: {deathText: 'You were killed by a Goblin Archer', imageIndex: 107, damage: this.npcTypes.GoblinArcher.damage},
                            WizardSpell: {deathText: 'You were killed by a Wizard', imageIndex: 109, damage: this.npcTypes.Wizard.damage},
                            ThrowingNet: {imageIndex: 46, damage: 0}};
};

// CREATE_PROJECTILE:
// ************************************************************************************************
gameState.createProjectile = function (fromCharacter, targetTileIndex, typeName) {
    var projectile = {},
        startTileIndex = fromCharacter.tileIndex,
        startPos = {x: startTileIndex.x * this.tileSize + this.tileSize / 2, y: startTileIndex.y * this.tileSize + this.tileSize / 2},
        endPos = {x: targetTileIndex.x * this.tileSize + this.tileSize / 2, y: targetTileIndex.y * this.tileSize + this.tileSize / 2},
        distance;
    
    
    distance = game.math.distance(startTileIndex.x * this.tileSize,
                                  startTileIndex.y * this.tileSize,
                                  targetTileIndex.x * this.tileSize,
                                  targetTileIndex.y * this.tileSize);
    projectile.normal = {x: (endPos.x - startPos.x) / distance,
                         y: (endPos.y - startPos.y) / distance};
    
    projectile.ignoreCharacter = fromCharacter;
    projectile.isAlive = true;
    projectile.type = this.projectileTypes[typeName];
    projectile.update = this.updateProjectile;
    projectile.targetTileIndex = targetTileIndex;
    
    // Create sprite:
    projectile.sprite = gameState.projectileSpritesGroup.create(startPos.x, startPos.y, 'Tileset');
    projectile.sprite.anchor.setTo(0.5, 0.5);
    projectile.sprite.smoothed = false;
    projectile.sprite.scale.setTo(this.scaleFactor, this.scaleFactor);
    projectile.sprite.frame = projectile.type.imageIndex;
    projectile.sprite.rotation = game.math.angleBetween(fromCharacter.tileIndex.x,
                                                         fromCharacter.tileIndex.y,
                                                         targetTileIndex.x,
                                                         targetTileIndex.y) + Math.PI / 2;
    // Push to list:
    this.projectileList.push(projectile);
};

// UPDATE PROJECTILE
// *******************************************************************************
gameState.updateProjectile = function () {
    var hitCharacter,
        damage,
        nextPos;
        
    // Hit characters:
    hitCharacter = gameState.getTile(gameState.getTileIndexFromPosition(this.sprite.position)).character;
    if (hitCharacter && hitCharacter !== this.ignoreCharacter) {
        if (this.type === gameState.projectileTypes.ThrowingNet) {
            gameState.createNet(hitCharacter.tileIndex);
        } else {
            hitCharacter.takeDamage(this.type.damage, this.type.deathText);
        }
        this.sprite.destroy();
        this.isAlive = false;
        return;
    }

    // Move:
    this.sprite.x += this.normal.x * 6;
    this.sprite.y += this.normal.y * 6;
};

// UPDATE_PROJECTILES:
// ************************************************************************************************
gameState.updateProjectiles = function () {
    var i;
    
    // Remove dead projectiles:
    for (i = this.projectileList.length - 1; i !== -1; i -= 1) {
        if (!this.projectileList[i].isAlive) {
            this.projectileList.splice(i, 1);
        }
    }
    
    for (i = 0; i < this.projectileList.length; i += 1) {
        this.projectileList[i].update();
    }
};

// CREATE_LIGHTNING:
// ************************************************************************************************
gameState.createLightning = function (startTileIndex, endTileIndex, damage) {
    var startPos, endPos, normal, totalDistance, currentDistance, i, lightning, tiles;
    
    startPos = this.getPositionFromTileIndex(startTileIndex);
    endPos = this.getPositionFromTileIndex(endTileIndex);
    normal = this.getNormal(startPos, endPos);
    totalDistance = game.math.distance(startPos.x, startPos.y, endPos.x, endPos.y);
    currentDistance = 32;
    
    // Sprites:
    while (currentDistance < totalDistance) {
        lightning = {};
        lightning.isAlive = true;
        lightning.life = 6;
        
        // Create sprite:
        lightning.sprite = gameState.projectileSpritesGroup.create(startPos.x + normal.x * currentDistance,
                                                                   startPos.y + normal.y * currentDistance,
                                                                   'Tileset');
        lightning.sprite.anchor.setTo(0.5, 0.5);
        lightning.sprite.smoothed = false;
        lightning.sprite.scale.setTo(this.scaleFactor, this.scaleFactor);
        lightning.sprite.frame = 110;
        lightning.sprite.rotation = game.math.angleBetween(startPos.x, startPos.y, endPos.x, endPos.y) + Math.PI / 2;
        
        lightning.update = this.updateLightning;
        
        this.projectileList.push(lightning);
        currentDistance += 30;
    }
    
    // Damage:
    tiles = this.getTilesInRay(startPos, endPos);
    for (i = 0; i < tiles.length; i += 1) {
        // Damage characters:
        if (tiles[i].character && tiles[i].character !== gameState.playerCharacter) {
            tiles[i].character.takeDamage(damage, 'You were killed by a lightning bolt');
        }
        
        // Destroy walls:
        if (!gameState.isTileIndexPassable(tiles[i].tileIndex)) {
            tiles[i].tileType = gameState.tileTypes[gameState.areaTileTypes[gameState.getTile(tiles[i].tileIndex).areaTypeName].Floor];
        }
    }
};

// UPDATE_LIGHTNING:
// ************************************************************************************************
gameState.updateLightning = function () {
    if (this.life === 0) {
        this.sprite.destroy();
        this.isAlive = false;
    } else {
        this.life -= 1;
    }
};

// CREATE_FIRE:
// ************************************************************************************************
gameState.createFire = function (tileIndex, damage) {
    var startPos = gameState.getPositionFromTileIndex(tileIndex),
        fire = {};
    
    fire.tileIndex = {x: tileIndex.x, y: tileIndex.y};
    fire.damage = damage;
    fire.isAlive = true;
    
    // Create sprite:
    fire.sprite = gameState.projectileSpritesGroup.create(startPos.x, startPos.y, 'Tileset');
    fire.sprite.anchor.setTo(0.5, 0.5);
    fire.sprite.smoothed = false;
    fire.sprite.scale.setTo(this.scaleFactor, this.scaleFactor);
    fire.sprite.animations.add('Explode', [100, 101, 102, 103, 104], 10);
    fire.sprite.play('Explode');
    
    // Update:
    fire.update = this.updateFire;
    
    // Damage characters:
    if (this.getTile(tileIndex).character && this.getTile(tileIndex).character.isAlive) {
        this.getTile(tileIndex).character.takeDamage(damage, 'You burned to death');
    }
    
    // Destroy Vines:
    if (this.getTile(tileIndex).tileType.name === 'VineFloor') {
        this.getTile(tileIndex).tileType = this.tileTypes.Floor;
    }
    
    this.projectileList.push(fire);
};

// UPDATE_FIRE:
// ************************************************************************************************
gameState.updateFire = function () {
    
    if (this.sprite.frame === 101) {
        // Set adjacent vines on fire:
        if (gameState.isTileIndexInBounds({x: this.tileIndex.x + 1, y: this.tileIndex.y})
                && gameState.getTile({x: this.tileIndex.x + 1, y: this.tileIndex.y}).tileType.name === 'VineFloor') {
            gameState.createFire({x: this.tileIndex.x + 1, y: this.tileIndex.y}, this.damage);
        }
        if (gameState.isTileIndexInBounds({x: this.tileIndex.x - 1, y: this.tileIndex.y})
                && gameState.getTile({x: this.tileIndex.x - 1, y: this.tileIndex.y}).tileType.name === 'VineFloor') {
            gameState.createFire({x: this.tileIndex.x - 1, y: this.tileIndex.y}, this.damage);
        }
        if (gameState.isTileIndexInBounds({x: this.tileIndex.x, y: this.tileIndex.y + 1})
                && gameState.getTile({x: this.tileIndex.x, y: this.tileIndex.y + 1}).tileType.name === 'VineFloor') {
            gameState.createFire({x: this.tileIndex.x, y: this.tileIndex.y + 1}, this.damage);
        }
        if (gameState.isTileIndexInBounds({x: this.tileIndex.x, y: this.tileIndex.y - 1})
                && gameState.getTile({x: this.tileIndex.x, y: this.tileIndex.y - 1}).tileType.name === 'VineFloor') {
            gameState.createFire({x: this.tileIndex.x, y: this.tileIndex.y - 1}, this.damage);
        }
    } else if (this.sprite.frame === 104) {
        this.sprite.destroy();
        this.isAlive = false;
    }
};

// CREATE NET:
// ************************************************************************************************
gameState.createNet = function (tileIndex) {
    var startPos = gameState.getPositionFromTileIndex(tileIndex),
        net = {};
    
    // Create sprite:
    net.sprite = gameState.projectileSpritesGroup.create(startPos.x, startPos.y, 'Tileset');
    net.sprite.anchor.setTo(0.5, 0.5);
    net.sprite.smoothed = false;
    net.sprite.scale.setTo(this.scaleFactor, this.scaleFactor);
    net.sprite.frame = 46;
    
    // Attributes:
    net.life = 6;
    net.tileIndex = tileIndex;
    net.isAlive = true;
    
    // Update:
    net.updateTurn = this.updateIceTurn;
    
    // Place on map:
    this.getTile(tileIndex).ice = net;
    
    this.iceList.push(net);
};

// CREATE_ICE:
// ************************************************************************************************
gameState.createIce = function (tileIndex) {
    var startPos = gameState.getPositionFromTileIndex(tileIndex),
        ice = {};
    
    // Create sprite:
    ice.sprite = gameState.projectileSpritesGroup.create(startPos.x, startPos.y, 'Tileset');
    ice.sprite.anchor.setTo(0.5, 0.5);
    ice.sprite.smoothed = false;
    ice.sprite.scale.setTo(this.scaleFactor, this.scaleFactor);
    ice.sprite.frame = 105;
    ice.sprite.alpha = 0.75;
    
    // Attributes:
    ice.life = 10;
    ice.tileIndex = tileIndex;
    ice.isAlive = true;
    
    // Update:
    ice.updateTurn = this.updateIceTurn;
    
    // Place on map:
    this.getTile(tileIndex).ice = ice;
    
    this.iceList.push(ice);
};

// UPDATE_ICE_TURN:
// ************************************************************************************************
gameState.updateIceTurn = function () {
    var i;
    
    this.life -= 1;
    
    // Spread ice to water:
    if (this.life === 8) {
        // Freeze adjacent water:
        if (gameState.isTileIndexInBounds({x: this.tileIndex.x + 1, y: this.tileIndex.y})
                && gameState.getTile({x: this.tileIndex.x + 1, y: this.tileIndex.y}).tileType.name === 'Water'
                && !gameState.getTile({x: this.tileIndex.x + 1, y: this.tileIndex.y}).ice) {
            gameState.createIce({x: this.tileIndex.x + 1, y: this.tileIndex.y});
        }
        if (gameState.isTileIndexInBounds({x: this.tileIndex.x - 1, y: this.tileIndex.y})
                && gameState.getTile({x: this.tileIndex.x - 1, y: this.tileIndex.y}).tileType.name === 'Water'
                && !gameState.getTile({x: this.tileIndex.x - 1, y: this.tileIndex.y}).ice) {
            gameState.createIce({x: this.tileIndex.x - 1, y: this.tileIndex.y});
        }
        if (gameState.isTileIndexInBounds({x: this.tileIndex.x, y: this.tileIndex.y + 1})
                && gameState.getTile({x: this.tileIndex.x, y: this.tileIndex.y + 1}).tileType.name === 'Water'
                && !gameState.getTile({x: this.tileIndex.x, y: this.tileIndex.y + 1}).ice) {
            gameState.createIce({x: this.tileIndex.x, y: this.tileIndex.y + 1});
        }
        if (gameState.isTileIndexInBounds({x: this.tileIndex.x, y: this.tileIndex.y - 1})
                && gameState.getTile({x: this.tileIndex.x, y: this.tileIndex.y - 1}).tileType.name === 'Water'
                && !gameState.getTile({x: this.tileIndex.x, y: this.tileIndex.y - 1}).ice) {
            gameState.createIce({x: this.tileIndex.x, y: this.tileIndex.y - 1});
        }
    }
    
    if (this.life === 0) {
        this.sprite.destroy();
        gameState.getTile(this.tileIndex).ice = null;
        this.isAlive = false;
    }
};

// DESTROY_ALL_ICE:
// ************************************************************************************************
gameState.destroyAllIce = function () {
    var i;
    
    for (i = 0; i < this.iceList.length; i += 1) {
        if (this.iceList.sprite) {
            this.iceList.sprite.destroy();
        }
    }
    
    this.iceList = [];
};

// CREATE_BLOOD:
// ************************************************************************************************
gameState.createBlood = function (tileIndex) {
    var bloodSprite;
    
    bloodSprite = this.bloodGroup.create(tileIndex.x * this.tileSize, tileIndex.y * this.tileSize, 'Tileset');
    bloodSprite.frame = 112;
    bloodSprite.smoothed = false;
    bloodSprite.scale.setTo(this.scaleFactor, this.scaleFactor);
    
    this.bloodList.push(bloodSprite);
};

// DESTROY ALL BLOOD:
// ************************************************************************************************
gameState.destroyAllBlood = function () {
    var i;
    
    for (i = 0; i < this.bloodList.length; i += 1) {
        this.bloodList[i].destroy();
    }
    
    this.bloodList = [];
};