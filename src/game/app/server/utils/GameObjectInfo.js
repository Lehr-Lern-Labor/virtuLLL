const GameObjectType = require('../../client/shared/GameObjectType.js');
const Settings = require('../utils/' + process.env.SETTINGS_FILENAME);

/**
 * Indexed by the contents of the GameObjectType-file,
 * this file makes the information need to generate
 * an object from just its type easily accessible.
 * 
 * Uses the values of the GameObjectType-properties as keys.
 * This needed to be in a separate file, as changing the
 * GameObjectType-file to contain this surplus of information
 * would break several client-side classes, and I can't be bothered
 * to fix them all.
 * 
 * Done as a static class for reasons of privacy. It is just nicer to
 * call a function instead of nested calls of object properties.
 * 
 * @author Eric Ritte, Klaudia Leo, Laura Traub, Niklas Schmidt, Philipp Schumacher
 * @version 1.0.0
 */
class GameObjectInfo { 
    /******************************************************************/
    /************* USER GUIDE -- READ BEFORE EDITING FILE *************/
    /******************************************************************/
    /** When adding the information for a new GameObjectType to      **/
    /** this file, please stick to the following instructions:       **/
    /**                                                              **/
    /**   (a) Make sure you have added an appropriate property       **/
    /**       to the /client/shared/GameObjectType.js file.          **/
    /**       While this is not strictly necessary, not doing        **/
    /**       so risks breaking the game engine, so consider         **/
    /**       yourself warned. This will serve as an identifier      **/
    /**       for the object you added and be used to add a copy     **/
    /**       of the object to a room in the Floorplan.              **/
    /**                                                              **/
    /**   (b) Make sure you have added an appropriate property       **/
    /**       to the /client/shared/AssetPaths.js file. This is      **/
    /**       strictly necessary, as the game engine needs it        **/
    /**       to draw the object in the client view.                 **/
    /**       ATTENTION: if the object isn't drawn in the proper     **/
    /**                  position, try adding an offset in the       **/
    /**                  /client/utils/GameObjectOffsets.js file     **/
    /**                                                              **/
    /**   (c) Add the information specifying your new object to      **/
    /**       the #INFORMATION-field as a new property.              **/
    /**         (i) For the key, chose the value of the property     **/
    /**             you added to the GameObjectType-file (if you     **/
    /**             did not add one, any string will suffice).       **/
    /**             So, if, for example, you added the property      **/
    /**             newObjectKey: "newObjectName",                   **/
    /**             to the GameObjectType-file, you should add       **/
    /**             [GameObjectType.newObjectKey]: {},               **/
    /**             to this one. You don't need to stick to the      **/
    /**             categories,  but it helps keeping the file       **/
    /**             more clearly structured.                         **/
    /**        (ii) Add any of the following attributes to your      **/
    /**             new object (attributes marked with a * are       **/
    /**             MANDATORY):                                      **/
    /**              - isSolid*: Boolean                             **/
    /**              - width*: integer                               **/
    /**              - length*: integer                              **/
    /**              - assetName*: String                            **/
    /**                         OR String[]                          **/
    /**                         OR String[][] (see below)            **/
    /**              - hasVariation: Boolean  (see below)            **/
    /**              - isMultiPart: Boolean   (see below)            **/
    /**              - hasAdditionalParts: Boolean (see below)       **/
    /**              - size: integer[2]            (see below)       **/
    /**              - parts: Object[]             (see below)       **/
    /**                                                              **/
    /**   (d) Some notes on the more advanced options:               **/
    /**       hasVariation: If this flag is set, the assetName must  **/
    /**                     be an array of strings. When adding an   **/
    /**                     in the floorplan, you can then specify   **/
    /**                     a variation by giving a valid index.     **/
    /**                     A different image will be drawn.         **/
    /**        isMultiPart: If this flag is set, the size-attribute  **/
    /**                     must be added to the object, and the     **/
    /**                     assetName must be of type String[i][j_i] **/
    /**                     with i = size[0], j_i <= size[1].        **/
    /**                     (so the length of the arrays need not be **/
    /**                     the same for all)                        **/
    /**                     This will cause an array Object[i][j_i]  **/
    /**                     to be drawn, each object with the same   **/
    /**                     type, width, length and solidity, but    **/
    /**                     the asset stored under the same indices  **/
    /** hasAdditionalParts: If this flag is set, the parts-attribute **/
    /**                     must be defined. It must be an array of  **/
    /**                     which each entry is an object following  **/
    /**                     the scheme:                              **/
    /**                     {                                        **/
    /**                       type*: String,     # GameObjectType    **/
    /**                       offset_x: integer, # relative position **/
    /**                                            x-axis            **/
    /**                       offset_y: integer, # relative position **/
    /**                                            y-axis            **/
    /**                       variation: integer # if well-defined   **/
    /**                                            for this type     **/
    /**                     }                                        **/
    /**                    No other options are currently available  **/
    /**                    for the additional parts.                 **/
    /**         WARNING: AN OBJECT-TYPE MAY NEVER HAVE ITSELF AS AN  **/
    /**                  ADDITIONAL PART!!!                          **/
    /**                                                              **/
    /** NOTE: While it won't necessarily break the game, no two of   **/
    /**       the advanced options should be used in conjunction.    **/
    /**       (unless you know what you're doing)                    **/
    /**                                                              **/
    /** NOTE: The strings in the assetName must be property-keys     **/
    /**       from the /client/shared/AssetPaths-file.               **/
    /****__________________________________________________________****/

    // TODO
    // - add custom-type object
 
    // All the info for each GameObjectType
    static #INFORMATION = Object.freeze({
        // DEMO
        [GameObjectType.DEMO]: {
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: "demo",
        },
        
        // Blank
        [GameObjectType.BLANK]: {
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: "blank",
        },

        // Tiles
        [GameObjectType.TILE]: {
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: "tile_default",
        },
        [GameObjectType.SELECTED_TILE]: {
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: "tile_selected",
        },
        [GameObjectType.LEFTTILE]: {
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: "tile_default",
        },
        [GameObjectType.RIGHTTILE]: {
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: "tile_default",
        },
        [GameObjectType.CARPET]: {
            hasVariation: true,
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [
                "carpet_yellow",
                "carpet_orange",
                "carpet_red",
                "carpet_pink",
                "carpet_purple",
                "carpet_blue",
                "carpet_tosca",
                "carpet_green",
                "carpet_white",
            ],
        },

        // Walls
        [GameObjectType.LEFTWALL]: {
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: "leftwall_default",
        },
        [GameObjectType.RIGHTWALL]: {
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: "rightwall_default",
        },
        
        // Barriers
        [GameObjectType.BARRIER]: {
            hasVariation: true,
            isSolid: true,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [
                "barrier_default",
                "barrier_0",
                "barrier_1",
                "barrier_2",
                "barrier_3",
                "barrier_x",
                "barrier_y",
            ],
        },    

        // Wall-like objects
        // Schedule, Windows, Logo, Picture Frames...
        [GameObjectType.LEFTSCHEDULE]: {
            // MULTIPART OBJECT
            isMultiPart: true,
            size: [3, 1],
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: ["leftschedule_default0", "leftschedule_default1", "leftschedule_default2"],
        },
        [GameObjectType.RIGHTWINDOW]: {
            hasVariation: true,
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: ["rightwindow_default0", "rightwindow_default1"]
        },
        [GameObjectType.LEFTWINDOW]: {
            hasVariation: true,
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: ["leftwindow_default0", "leftwindow_default1"]
        },
        [GameObjectType.PICTUREFRAME]: {
            isMultiPart: true,
            size: [1, 3],
            isSolid: true,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [["rightwallframe_default0", "rightwallframe_default1", 
            "rightwallframe_default2"]],
        },
        [GameObjectType.CONFERENCELOGO]: {
            // MULTIPART OBJECT
            /* How does this work?
             *   (i) Set flag (isMultiPart = true) 
             *  (ii) Set size-field (this is the size
             *       of the completed object, whereas
             *       width and length give part-size)
             * (iii) assetName needs to be array of
             *       arrays, size[0] * size[1].    */
            isMultiPart: true,
            size: [5, 1],
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: ["leftconferencelogo_default0",
                "leftconferencelogo_default1", "leftconferencelogo_default2",
                "leftconferencelogo_default3",
                "leftconferencelogo_default4"],
        },

        // Seating
        [GameObjectType.CHAIR]: {
            hasVariation: true,
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [
                "chair_default_0",
                "chair_default_1",
                "chair_default_2",
                "chair_default_3",
                "chair_yellow_0",
                "chair_yellow_1",
                "chair_yellow_2",
                "chair_yellow_3",
                "chair_orange_0",
                "chair_orange_1",
                "chair_orange_2",
                "chair_orange_3",
                "chair_red_0",
                "chair_red_1",
                "chair_red_2",
                "chair_red_3",
                "chair_pink_0",
                "chair_pink_1",
                "chair_pink_2",
                "chair_pink_3",
                "chair_purple_0",
                "chair_purple_1",
                "chair_purple_2",
                "chair_purple_3",
                "chair_blue_0",
                "chair_blue_1",
                "chair_blue_2",
                "chair_blue_3",
                "chair_tosca_0",
                "chair_tosca_1",
                "chair_tosca_2",
                "chair_tosca_3",
                "chair_green_0",
                "chair_green_1",
                "chair_green_2",
                "chair_green_3",
                "chair_white_0",
                "chair_white_1",
                "chair_white_2",
                "chair_white_3",
                "chair_swivel_0",
                "chair_swivel_1",
                "chair_swivel_2",
                "chair_swivel_3",
            ],
        },
        [GameObjectType.CHAIRSOLID]: {
            hasVariation: true,
            isSolid: true,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [
                "chair_default_0",
                "chair_default_1",
                "chair_default_2",
                "chair_default_3",
                "chair_yellow_0",
                "chair_yellow_1",
                "chair_yellow_2",
                "chair_yellow_3",
                "chair_orange_0",
                "chair_orange_1",
                "chair_orange_2",
                "chair_orange_3",
                "chair_red_0",
                "chair_red_1",
                "chair_red_2",
                "chair_red_3",
                "chair_pink_0",
                "chair_pink_1",
                "chair_pink_2",
                "chair_pink_3",
                "chair_purple_0",
                "chair_purple_1",
                "chair_purple_2",
                "chair_purple_3",
                "chair_blue_0",
                "chair_blue_1",
                "chair_blue_2",
                "chair_blue_3",
                "chair_tosca_0",
                "chair_tosca_1",
                "chair_tosca_2",
                "chair_tosca_3",
                "chair_green_0",
                "chair_green_1",
                "chair_green_2",
                "chair_green_3",
                "chair_white_0",
                "chair_white_1",
                "chair_white_2",
                "chair_white_3",
                "chair_swivel_0",
                "chair_swivel_1",
                "chair_swivel_2",
                "chair_swivel_3",
            ],
        },
        [GameObjectType.SOFA]: {
            hasVariation: true,
            isSolid: true,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [
                "sofa_front_0",
                "sofa_middle_0",
                "sofa_back_0",
                "sofa_back_1",
                "sofa_middle_1",
                "sofa_front_1",
                "sofa_front_2",
                "sofa_middle_2",
                "sofa_back_2",
                "sofa_back_3",
                "sofa_middle_3",
                "sofa_front_3",
            ],
        },

        [GameObjectType.SEATINGAREA]: {
            hasAdditionalParts: true,
            isSolid: true,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: "table_default",
            parts: [                
                {type: GameObjectType.CHAIR, variation: 8 * 4 + 0, offset_y: -1, offset_x: 0},
                {type: GameObjectType.CHAIR, variation: 8 * 4 + 1, offset_x: -1, offset_y: 0},
                {type: GameObjectType.CHAIR, variation: 8 * 4 + 2, offset_y:  1, offset_x: 0},
                {type: GameObjectType.CHAIR, variation: 8 * 4 + 3, offset_x:  1, offset_y: 0},
            ],
        },
        
        [GameObjectType.COMPUTER]: {
            hasAdditionalParts: true,
            isSolid: true,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: "tabledecoration_computer_3",
            parts: [                
                {type: GameObjectType.TABLE, variation: 4, offset_x:  0, offset_y:  0},
                {type: GameObjectType.TABLE, variation: 6, offset_x:  0, offset_y:  1},
                {type: GameObjectType.CHAIR, variation: 10 * 4 + 3, offset_x:  1, offset_y: 0},
                {type: GameObjectType.CHAIR, variation: 10 * 4 + 3, offset_x:  1, offset_y: 1},
            ],
        },

        // Tables
        [GameObjectType.TABLE]: {
            hasVariation: true,
            isSolid: true,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [
                "table_default", 
                "table_front_x",
                "table_middle_x",
                "table_back_x",
                "table_back_y",
                "table_middle_y",
                "table_front_y",
            ],
        },

        // Counters
        [GameObjectType.COUNTER]: {
            hasVariation: true,
            isSolid: true,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [
                "counter_default", 
                "counter_front_x",
                "counter_middle_x",
                "counter_back_x",
                "counter_back_y",
                "counter_middle_y",
                "counter_front_y",
                "counter_corner_left",
                "counter_corner_front",
                "counter_corner_right",
                "counter_corner_back",
            ],
        },

        // Cupboards
        [GameObjectType.CUPBOARD]: {
            hasVariation: true,
            isSolid: true,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [
                "cupboard_left", 
                "cupboard_left_alt",
                "cupboard_left_shelf",
                "cupboard_left_books",
                "cupboard_left_books_alt",
                "cupboard_right",
                "cupboard_right_alt",
                "cupboard_right_shelf",
                "cupboard_right_books",
                "cupboard_right_books_alt",
                "cupboard_left_back",
                "cupboard_right_back",
                "cupboard_corner_left",
                "cupboard_corner_front",
                "cupboard_corner_right",
                "cupboard_corner_back",
            ],
        },
        [GameObjectType.SIDEBOARD]: {
            hasVariation: true,
            isSolid: true,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [
                "sideboard_left", 
                "sideboard_left_alt",
                "sideboard_left_shelf",
                "sideboard_left_books",
                "sideboard_left_books_alt",
                "sideboard_right",
                "sideboard_right_alt",
                "sideboard_right_shelf",
                "sideboard_right_books",
                "sideboard_right_books_alt",
                "sideboard_left_back",
                "sideboard_right_back",
                "sideboard_corner_left",
                "sideboard_corner_front",
                "sideboard_corner_right",
                "sideboard_corner_back",
            ],
        },
        
        // Floordecoration
        [GameObjectType.FLOORDECORATION]: {
            hasVariation: true,
            isSolid: true,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [
                "floordecoration_plant", 
                "floordecoration_palm",
                "floordecoration_palmtree",
                "floordecoration_guitar",
                "floordecoration_balls",
            ],
        },
        
        // Tabledecoration
        [GameObjectType.TABLEDECORATION]: {
            hasVariation: true,
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [
                "tabledecoration_plant", 
                "tabledecoration_palm",
                "tabledecoration_cactus",
                "tabledecoration_flowers",
                "tabledecoration_succulents",
                "tabledecoration_balls",
                "tabledecoration_paper_0",
                "tabledecoration_paper_1",
                "tabledecoration_paper_2",
                "tabledecoration_paper_3",
                "tabledecoration_pen_0",
                "tabledecoration_pen_1",
                "tabledecoration_pen_2",
                "tabledecoration_pen_3",
                "tabledecoration_tablet_x",
                "tabledecoration_tablet_y",
                "tabledecoration_coffee",
                "tabledecoration_coffeegroup",
                "tabledecoration_books_back",
                "tabledecoration_books_left",
                "tabledecoration_books_right",
                "tabledecoration_books",
                "tabledecoration_computer_0",
                "tabledecoration_computer_3",
                "tabledecoration_plates",
            ],
        },
        [GameObjectType.LEFTCOUNTERTOP]: {
            isMultiPart: true,
            size: [2, 1],
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [
                "tabledecoration_countertop_x_1", 
                "tabledecoration_countertop_x_2",
            ],
        },
        [GameObjectType.RIGHTCOUNTERTOP]: {
            isMultiPart: true,
            size: [1, 2],
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [[
                "tabledecoration_countertop_y_1", 
                "tabledecoration_countertop_y_2",
            ]],
        },
        
        // Explanation
        [GameObjectType.EXPLANATION]: {
            hasVariation: true,
            isSolid: false,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: [
                "explanation_left", 
                "explanation_right",
                "explanation_barrier_left", 
                "explanation_barrier_right",
                "explanation_0",
                "explanation_1",
                "explanation_2",
                "explanation_3",
            ],
        },

        // Food & Drinks
        [GameObjectType.DRINKS]: {
            isSolid: true,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: 2 * Settings.SMALL_OBJECT_LENGTH,
            assetName: "drinks_default",
        },
        [GameObjectType.TEA]: {
            isSolid: true,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: "tea_default",
        },
        [GameObjectType.SMALLFOOD]: {
            // OBJECT WITH VARIATIONS
            hasVariation: true,
            isSolid: true,
            width: Settings.SMALL_OBJECT_WIDTH,
            length: Settings.SMALL_OBJECT_LENGTH,
            assetName: ["koeriWurst_default", "koeriWurst_bothSides", "koeriWurst_upperSide", "koeriWurst_lowerSide"],
        },
    });

    /**
     * Takes a GameObjectType and a <key> as arguments and checks
     * if a property with the name <key> is stored for the passed
     * GameObjectType. If yes, it is returned. If no, throws error.
     * 
     * TypeChecking should be done by whoever calls this method!
     * 
     * @method module:GameObjectInfo#getInfo
     * 
     * @param {String} objectType 
     * @param {String} key 
     * @returns {*} The information saved for the passed GameObjectType
     *              under the passed key (if it exists).
     */
     static getInfo(objectType, key) {
        if (GameObjectInfo.#INFORMATION[objectType].hasOwnProperty(key)) {
            return GameObjectInfo.#INFORMATION[objectType][key];
        } else {
            throw new Error("The passed GameObjectType " + objectType + " does not have the property " + key);
        }
    } 
    
    /**
     * Takes a GameObjectType and a <key> as arguments and checks
     * if a property with the name <key> is stored for the passed
     * GameObjectType. If yes, returns true, if no, returns false.
     * 
     * @method module:GameObjectInfo#hasProperty
     * 
     * @param {String} objectType 
     * @param {String} key
     *  
     * @returns {Boolean} If the object specified by the passed type
     *                    has a property indexed by the passed key
     */
     static hasProperty(objectType, key) {
        return GameObjectInfo.#INFORMATION[objectType].hasOwnProperty(key)
     }
    
}

if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = GameObjectInfo;
}