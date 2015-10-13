/*global game, gameState, INVENTORY_SIZE*/
'use strict';

// CREATE_INVENTORY:
// ************************************************************************************************
gameState.createInventory = function () {
    return [];
};

// CAN_ADD_ITEM_TO_INVENTORY:
// ************************************************************************************************
gameState.canAddItemToInventory = function (inventory, item) {
    if (inventory.length < INVENTORY_SIZE) {
        return true;
    }
    
    // A stack already exists:
    if (item.type.stackable && this.countItemInInventory(inventory, item) > 0) {
        return true;
    }
    
    return false;
};

// ADD_ITEM_TO_INVENTORY:
// ************************************************************************************************
gameState.addItemToInventory = function (inventory, item, amount) {
    var i;
    
    // Try to add to an existing stack:
    if (item.type.stackable) {
        for (i = 0; i < inventory.length; i += 1) {
            if (inventory[i].item.type === item.type) {
                inventory[i].amount += amount;
                return;
            }
        }
    }
            
    // Add new item stack:
    inventory.push({item: item, amount: amount});
};

// REMOVE_ITEM_FROM_INVENTORY:
// ************************************************************************************************
gameState.removeItemFromInventory = function (inventory, item, amount) {
    var i;
    for (i = 0; i < inventory.length; i += 1) {
        if (inventory[i].item.type === item.type) {
            // Remove items from stack:
            inventory[i].amount -= amount;

            // Destroy empty stacks:
            if (inventory[i].amount <= 0) {
                inventory.splice(i, 1);
            }
            return;
        }
    }
};

// REMOVE_ALL_ITEMS_FROM_INVENTORY:
// ************************************************************************************************
gameState.removeAllItemsFromInventory = function (inventory) {
    inventory.length = 0;
};

// COUNT_ITEM_IN_INVENTORY:
// ************************************************************************************************
gameState.countItemInInventory = function (inventory, item) {
    var i;

    for (i = 0; i < inventory.length; i += 1) {
        if (inventory[i].item.type === item.type) {
            return inventory[i].amount;
        }
    }

    return 0;
};
