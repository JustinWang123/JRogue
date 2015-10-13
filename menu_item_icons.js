/*global console, game, gameState, LARGE_WHITE_FONT, INVENTORY_SIZE*/

'use strict';

// CREATE_ITEM_ICONS_MENU:
// --------------------------------------------------------------------------------
gameState.createItemIconsMenu = function (position, itemList, slotClickedFunc, numSlots) {
    var itemIconsMenu,
        i,
        sprite,
        button,
        x,
        y;
    
    // Item Icons Menu:
    itemIconsMenu = {};
    
    // Item List:
    itemIconsMenu.itemList = itemList;
    itemIconsMenu.selectedIndex = null;
    itemIconsMenu.selectedItem = null;
    
    // Menu Group:
    itemIconsMenu.group = game.add.group();

    // ITEM_SLOT_CLICKED:
    // ----------------------------
    itemIconsMenu.itemSlotClicked = function (button) {
        if (button.slot < this.itemList.length && gameState.state === 'GAME_STATE') {

            itemIconsMenu.selectedIndex = button.slot;
            itemIconsMenu.selectedItem = itemIconsMenu.itemList[itemIconsMenu.selectedIndex].item;

            // CLICK ITEM:
            if (this.selectedItem.type.slot === 'body') {
                gameState.wearClicked();
            } else if (this.selectedItem.type.slot === 'neck') {
                gameState.equipAmuletClicked();
            } else if (this.selectedItem.type.slot === 'food') {
                gameState.eatClicked();
            } else if (this.selectedItem.type.slot === 'wand') {
                gameState.zapClicked();
            } else if (this.selectedItem.type.slot === 'weapon') {
                gameState.wieldClicked();
            } else if (this.selectedItem.type.slot === 'scroll') {
                gameState.readClicked();
            } else if (this.selectedItem.type.slot === 'potion') {
                gameState.drinkClicked();
            }
            
            // For equip / unequip
            if (button.slot < this.itemList.length) {
                itemIconsMenu.selectedIndex = button.slot;
                itemIconsMenu.selectedItem = itemIconsMenu.itemList[itemIconsMenu.selectedIndex].item;
            } else {
                this.selectedIndex = null;
                this.selectedItem = null;
            }
            
        } else {
            this.selectedIndex = null;
            this.selectedItem = null;
        }
    };
    
    i = 0;
    itemIconsMenu.itemIcons = [];
    itemIconsMenu.itemCountText = [];
    for (y = 0; y < 3; y += 1) {
        for (x = 0; x < 3; x += 1) {
            // Item slot:
            button = this.createButton(position.x + x * 44, position.y + y * 44, 'ItemSlot', itemIconsMenu.itemSlotClicked, itemIconsMenu);
            button.slot = i;
            itemIconsMenu.group.add(button);

            button.onInputOver.add(function () {
                if (this.slot < gameState.playerCharacter.inventory.length) {
                    itemIconsMenu.selectedIndex = this.slot;
                    itemIconsMenu.selectedItem = itemIconsMenu.itemList[itemIconsMenu.selectedIndex].item;

                    if (itemIconsMenu.selectedItem.type.slot === 'scroll') {
                        gameState.HUD.mouseOverReadButton = true;
                    }
                }
            }, button);

            button.onInputOut.add(function () {
                itemIconsMenu.selectedIndex = null;
                itemIconsMenu.selectedItem = null;
                gameState.HUD.mouseOverReadButton = false;
            }, button);
            
            // Item icons:
            itemIconsMenu.itemIcons[i] = this.createSprite(position.x + 4 + x * 44, position.y + 4 + y * 44, 'Tileset');
            itemIconsMenu.group.add(itemIconsMenu.itemIcons[i]);
            
            itemIconsMenu.itemCountText[i] = game.add.text(position.x + 16 + x * 44, position.y + 20 + y * 42, '10', LARGE_WHITE_FONT);
            itemIconsMenu.group.add(itemIconsMenu.itemCountText[i]);
            
            // Inc i:
            i += 1;
        }
    }
    
    
    // Selection Box:
    itemIconsMenu.slotSelectBox = this.createSprite(0, 0, 'ItemSlotSelect');
    itemIconsMenu.group.add(itemIconsMenu.slotSelectBox);
    
    
    // ITEM_ICONS_MENU_REFRESH:
    // ------------------------------------------------------------------
    itemIconsMenu.refresh = function () {
        // Set item icons to match itemList:
        for (i = 0; i < numSlots; i += 1) {
            if (i < this.itemList.length) {
                this.itemIcons[i].frame = this.itemList[i].item.type.imageIndex;
                this.itemIcons[i].visible = true;
                
                // Set item count text visible:
                if (this.itemList[i].amount > 1) {
                    this.itemCountText[i].setText(this.itemList[i].amount);
                    this.itemCountText[i].visible = true;
                } else {
                    this.itemCountText[i].visible = false;
                }
            } else {
                this.itemIcons[i].visible = false;
                this.itemCountText[i].visible = false;
            }
        }
          
        // Position slot select:
        if (this.selectedIndex !== null) {
            this.slotSelectBox.x = this.itemIcons[this.selectedIndex].x - 4;
            this.slotSelectBox.y = this.itemIcons[this.selectedIndex].y - 4;
            this.slotSelectBox.visible = true;
            
        } else {
            this.slotSelectBox.visible = false;
        }
    };
    
    return itemIconsMenu;
};

// CREATE_INVENTORY_ITEM_ICONS:
// -----------------------------------------------------------------------
gameState.createInventoryItemIcons = function (x, y) {
    return this.createItemIconsMenu({x: x, y: y}, this.playerCharacter.inventory, null, INVENTORY_SIZE);
};

