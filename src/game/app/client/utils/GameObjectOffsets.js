/**
 * All the offsets the GameObjectFactory needs to properly display the
 * asset images
 * 
 * @author Eric Ritte, Klaudia Leo, Laura Traub, Niklas Schmidt, Philipp Schumacher
 * @version 1.0.0
 */
const GameObjectOffsets = Object.freeze({
    [GameObjectType.BLANK]: Settings.DEFAULT_OFFSET, 
    // Tiles
    [GameObjectType.TILE]: Settings.DEFAULT_OFFSET,
    [GameObjectType.SELECTED_TILE]: Settings.DEFAULT_OFFSET,
    [GameObjectType.LEFTTILE]: Settings.DEFAULT_OFFSET,
    [GameObjectType.RIGHTTILE]: Settings.DEFAULT_OFFSET,
    // Walls
    [GameObjectType.LEFTWALL]: Settings.LEFTWALL_OFFSET,
    [GameObjectType.RIGHTWALL]: Settings.RIGHTWALL_OFFSET,
    // Wall-like objects
    // Schedule, Windows, Logo, Picture Frames...
    [GameObjectType.LEFTSCHEDULE]: Settings.LEFTWALL_OFFSET,
    [GameObjectType.RIGHTWINDOW]: Settings.RIGHTWALL_OFFSET,
    [GameObjectType.LEFTWINDOW]: Settings.LEFTWALL_OFFSET,
    [GameObjectType.PICTUREFRAME]: Settings.RIGHTWALL_OFFSET,
    [GameObjectType.CONFERENCELOGO]: Settings.LEFTWALL_OFFSET,
    // Doors
    [TypeOfDoor.LEFT_DOOR]: Settings.LEFTWALL_OFFSET,
    [TypeOfDoor.RIGHT_DOOR]:Settings.RIGHTWALL_OFFSET,
    [TypeOfDoor.LEFT_LECTUREDOOR]: Settings.LEFTWALL_OFFSET,
    [TypeOfDoor.RIGHT_LECTUREDOOR]:Settings.RIGHTWALL_OFFSET,
    
    // Icons
    [GameObjectType.LEFTDOORICON]: { x: 0, y: -98 },
    [GameObjectType.RIGHTDOORICON]: { x: 32, y: -100 },

    [GameObjectType.RIGHTWALLSCREEN]: { x: 32, y: 16 },
    
    // Seating
    // [GameObjectType.CHAIR]: { x: 15, y: -6 },
    // [GameObjectType.SOFA]: { x: 0, y: -4 },
    // Food & Drinks
    [GameObjectType.DRINKS]: { x: 14, y: 12 },
    [GameObjectType.TEA]: { x: -4, y: 20 },
    [GameObjectType.SMALLFOOD]: { x: -4, y: 20 },  
});

if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = GameObjectOffsets;
}