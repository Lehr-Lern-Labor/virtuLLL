/**
 * @enum other constants
 * 
 * @author Eric Ritte, Klaudia Leo, Laura Traub, Niklas Schmidt, Philipp Schumacher
 * @version 1.0.0
 */
const Settings = Object.freeze({
    /* Game UI constants */
    FONT_SIZE: 16, /* in px */
    HUD_FONT_SIZE: 20, /* in px */

    /* Movement-Speed Constants */
    MOVEMENTSPEED_X: 1,
    MOVEMENTSPEED_Y: 1,

    //Timeout time per step in ms, needed for Point&Click Movement
    TIMEOUT_PER_STEP: 40,

    /* StatusBar Constants */
    TIME_UNTIL_LEAVE: 60,

    /* Map constants */
    MAP_BLANK_TILES_WIDTH: 3,
    MAP_BLANK_TILES_LENGTH: 3,
    WALL_OFFSET: 1,

    SHOWLECTURE: 10 * 60 * 1000,

    /* View constants */
    TILE_WIDTH: 64,
    TILE_HEIGHT: 32,
    DEFAULT_OFFSET: { x: 0, y: 0 },
    LEFTWALL_OFFSET: { x: 0, y: 1 },
    RIGHTWALL_OFFSET: { x: -1, y: 1 },

    /* Object constants */
    SMALL_OBJECT_WIDTH: 1,
    SMALL_OBJECT_LENGTH: 1,

    /* Avatar constants */
    AVATAR_WIDTH: 64,
    AVATAR_HEIGHT: 128,

    //Needed for calculating because avatar asset gets shrunk when drawn. 
    AVATAR_SCALE_WIDTH: 1.5,
    AVATAR_SCALE_HEIGHT: 0.3125,

    PARTICIPANT_COLOR: 'antiquewhite',
    PARTICIPANT_NAME_COLOR: 'black',
    MODERATOR_COLOR: '#69AF2A',
    MODERATOR_NAME_COLOR: 'black',
    NPC_COLOR: 'firebrick',
    NPC_NAME_COLOR: 'white',

    /* Appearance of Avatars */

    // Skin color, e.g. White|Dark|Black
    AVATAR_BODY: 'White',
    // Type of Shirt, e.g. Shirt|Sleeveless|SweaterShirt|Sweatshirt|T-Shirt
    AVATAR_TOP: 'SweaterShirt', //color is added separately
    // Type + Color of Trousers, e.g. Trousers|Shorts + Black|Brown|Blue
    AVATAR_BOTTOM: 'TrousersBlack',
    // Type + Color of Shoes, e.g. (Shoes + Black|Brown|Blue)|(Sneakers + DefaultColors)
    AVATAR_SHOES: 'ShoesBrown',
    // Type + Color of Hair, e.g. Afro|Bob|Long|Ponytail|Short|Undercut + Blonde|Brown|Dark|Red
    AVATAR_HAIR: 'AfroBrown',



    //constants for arrow drawn above own Avatar
    ARROW_LENGTH: 20,
    ARROW_WIDTH: 7,

    //constants for div element toggle speed
    TOGGLE_SPEED: 200,

    TOOLTIP_TOP: {
        toggle: "tooltip",
        placement: "top",
        boundary: "window",
        template: '<div class="tooltip tooltip-top" role="tooltip"><div class="tooltip-inner"></div></div>'
    },
});

if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = Settings;
}