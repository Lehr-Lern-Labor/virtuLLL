const Direction = require('../../client/shared/Direction');
const GameObjectType = require('../../client/shared/GameObjectType');
const GlobalStrings = require('../../client/shared/GlobalStrings');
const TypeOfRoom = require('../../client/shared/TypeOfRoom');
const DoorClosedMessages = require('./messages/DoorClosedMessages');
const NPCDialog = require('./NPCDialog');
const Settings = require('./' + process.env.SETTINGS_FILENAME);

/**
 * @module Floorplan
 * 
 * @author Eric Ritte, Klaudia Leo, Laura Traub, Niklas Schmidt, Philipp Schumacher
 * @version 1.0.0
 */

/**
 * This field is not necessary for any functionality outside
 * of this module. It simply exists to offer an easy way to define
 * constant values that can be used throughout the entire floorplan,
 * e.g. when one wants to create a room layout where objects are
 * placed relative to the size of the entire room.
 * 
 * Since these do not get exported, they are not visible throughout
 * the program during runtime.
 */
const FloorplanConstants = Object.freeze({
    NPCNAMES: {
        tutorial: "BasicTutorial",
        foyer: "FoyerHelper",
        food: "Chef"
    }
})

const Floorplan = Object.freeze({

    /**************************************************************************/
    /**************** READ BEFORE YOU START PERUSING THE GUIDE ****************/
    /**************************************************************************/
    /**                                                                      **/
    /**   After finishing the floorplan but before starting the conference,  **/
    /**   make sure that the start position defined in the Settings.js file  **/
    /**   (server-side version) is a legal position for the  conference you  **/
    /**   just specified, that is to say make sure it exists.                **/
    /**                                                                      **/
    /**************************************************************************/
    

    /**************************************************************************/
    /************************** HOW TO USE THIS FILE **************************/
    /**************************************************************************/
    /**                                                                      **/
    /**  You can add an additional room to the conference by adding an       **/
    /**  entry adhering to the following scheme to this file:                **/
    /**                                                                      **/
    /**  <key>: {                                                            **/
    /**    ID: <Integer>,    # Needs to be an unique integer, as it is used  **/
    /**                      # by the software to identify the room. In the  **/
    /**                      # next update, will be changed to string.       **/
    /**    NAME: <String>,   # Can be anything you want. Will be displayed   **/
    /**                      # in the client though.                         **/
    /**    TYPE: TypeOfRoom.CUSTOM,   # Must be TypeOfRoom.CUSTOM, as it     **/
    /**                               # only exists for legacy reasons.      **/
    /**    LENGTH: <Integer>,   # The x-axis, goes along the left wall       **/
    /**    WIDTH: <Integer>,    # The y-axis, goes along the right wall      **/
    /**    MAPELEMENTS: [],   # Array of objects adhering to proper scheme,  **/
    /**                       # for more detail see below.                   **/
    /**    OBJECTS: [],       # Array of objects adhering to proper scheme,  **/
    /**                       # for more detail see below.                   **/
    /**    DOORS: [],         # Array of objects adhering to proper scheme,  **/
    /**                       # for more detail see below.                   **/
    /**    LECTUREDOORS: [],  # If this is a conference without video        **/
    /**                       # storage and lectures, these can be ignored.  **/
    /**                       # Array of objects adhering to proper scheme,  **/
    /**                       # for more detail see below.                   **/
    /**    NPCS: [],          # Array of objects adhering to proper scheme,  **/
    /**                       # for more detail see below.                   **/
    /**  }                                                                   **/
    /**                                                                      **/
    /**  NOTE The key can be whatever you like. It is not used anywhere for  **/
    /**       anything except help you remember what room you're currently   **/
    /**       creating.                                                      **/
    /**                                                                      **/
    /**  NOTE A room does not need to contain any map elements, objects,     **/
    /**       doors or npcs. But why wouldn't it?                            **/
    /**                                                                      **/
    /**************************************************************************/

    /**************************************************************************/
    /************************ HOW TO ADD A MAPELEMENT *************************/
    /**************************************************************************/
    /**                                                                      **/
    /**  Map elements are anything that functions like a wall or tile, such  **/
    /**  as windows, the schedule, the kit logo etc., but not doors.         **/
    /**  While any type of map element can be a type of game object and vice **/
    /**  versa, map elements can not be made clickable.                      **/
    /**                                                                      **/
    /**  Options:                                                            **/
    /**    type: GameObjectType.<type>,   # Any legal type of GameObject.    **/
    /**    position: <Integer[2]>         # [x coordinate, y coordinate]     **/
    /**           OR <[Integer, Integer[n]]>  # [x coord, list of y coords]  **/
    /**                                       # will draw object copy in any **/
    /**                                       # position that can be written **/
    /**                                       # [x coord, entry of list]     **/
    /**           OR <[Integer[n], Integer]>  # Analogous to above           **/
    /**           OR Array containing any combination of the above           **/
    /**                  # Object copies will be drawn in any position       **/
    /**                  # given by some entry                               **/
    /**    variation: <Integer>    # Some types of map elements and objects  **/
    /**                            # exist in several variations, meaning    **/
    /**                            # several different assets can be drawn   **/
    /**                            # in their position. If there are no      **/
    /**                            # variations available, this option will  **/
    /**                            # be ignored                              **/
    /**                                                                      **/
    /**  NOTE See below for a complete list of all available types of map    **/
    /**       elements, their variations and possible configurations.        **/
    /**                                                                      **/
    /**************************************************************************/

    /**************************************************************************/
    /************************* HOW TO ADD AN OBJECT ***************************/
    /**************************************************************************/
    /**                                                                      **/
    /**  Since game objects can also be map elements, everything from the    **/
    /**  above section still holds true. However, since game objects can be  **/
    /**  made clickable, they offer additional options.                      **/
    /**  Objects can either display a text message (story) or an iFrame (an  **/
    /**  external website openend inside of the app) on click.               **/
    /**  If both are defined, the iFrame takes precedence.                   **/
    /**                                                                      **/
    /**  Options:                                                            **/
    /**    isClickable: <Boolean>,  # Self-explanatory.                      **/
    /**    iFrameData: <Object>,    # Must be an object containg             **/
    /**                             #   title: <String>,   (header)          **/
    /**                             #   url: <String>,                       **/
    /**                             #   width: <Integer>,  (in pixel)        **/
    /**                             #   height: <Integer>  (in pixel)        **/
    /**                             # Any additonal value is ignored.        **/
    /**    story: <String[]>        # Each array entry gets its own textbox. **/
    /**                                                                      **/
    /**************************************************************************/

    /**************************************************************************/
    /*************************** HOW TO ADD A DOOR ****************************/
    /**************************************************************************/
    /**                                                                      **/
    /**  Options:                                                            **/
    /**    wallSide: GlobalStrings.LEFT,    # On which wall the door is      **/
    /**           OR GlobalStrings.RIGHT,   # supposed to be placed          **/
    /**        logo: DoorLogos.<key>,       # What logo is displayed above   **/
    /**                                     # the door. Current options are  **/
    /**                                     # FOYER, FOODCOURT, RECEPTION    **/
    /**                                     # LECTURE or DEFAULT. If none    **/
    /**                                     # is specified, DEFAULT is used. **/
    /**    position: [xCoord, yCoord],   # The position at which the door is **/
    /**                                  # placed.                           **/
    /**    positionOnExit: [roomId, xCoord, yCoord],   # roomId MUST be id   **/
    /**                                                # of a room that is   **/
    /**                                                # part of the confer- **/
    /**                                                # ence.               **/
    /**    directionOnExit: Direction.<key>,   # What direction the avatar   **/
    /**                                        # will face upon entering the **/
    /**                                        # target room.                **/
    /**                                        # <key> may be DOWNRIGHT,     **/
    /**                                        # DOWNLEFT, UPRIGHT or UPLEFT **/
    /**    isOpen: <Boolean>,   # Whether the door is open or not. If it is  **/
    /**                         # closed, participants may not enter it. If  **/
    /**                         # not defined, will be set to true.          **/
    /**    closedMessage: { header: <String>,   # The message that will be   **/
    /**                     body: <String> },   # displayed if a participant **/
    /**                                         # attempts to enter the door **/
    /**                                         # while it is closed. If not **/
    /**                                         # defined, is set to default **/
    /**                                         # message.                   **/
    /**    codeToOpen: <String>    # It this is defined, trying to enter the **/
    /**                            # door while it is closed will open an    **/
    /**                            # input prompt where participants can     **/
    /**                            # enter this code to unlock the door. The **/
    /**                            # door will only be unlocked for them and **/
    /**                            # for nobody else.                        **/
    /**                                                                      **/
    /**  NOTE If the door is placed on the right wall, the xCoord should be  **/
    /**       the length of the room. If it is placed on the left wall, the  **/
    /**       yCoord should be -1. Otherwise, the door will be placed inside **/
    /**       of the room and look weird (though it should work fine).       **/
    /**                                                                      **/
    /**  NOTE The last three options can be set during runtime by a modera-  **/
    /**       tor using commands.                                            **/
    /**                                                                      **/
    /**************************************************************************/

    /**************************************************************************/
    /************************ HOW TO ADD A LECTUREDOOR ************************/
    /**************************************************************************/
    /**                                                                      **/
    /** Note: Lecture doors can be completely ignored if this is a           **/
    /**       conference without video storage and lectures.                 **/
    /**                                                                      **/
    /** Options:                                                             **/
    /**   LectureDoors have basically the same options as normal Doors.      **/
    /**   The only difference is, that it is not possible to define          **/
    /**   a positionOnExit and a directionOnExit.                            **/
    /**                                                                      **/
    /**************************************************************************/

    /**************************************************************************/
    /*************************** HOW TO ADD AN NPC ****************************/
    /**************************************************************************/
    /**                                                                      **/
    /**  Options:                                                            **/
    /**    name: <String>,    # Name of the NPC. Purely for display purpose. **/
    /**    position: <Integer[2]>,   # See above. One option only!           **/
    /**    direction: Direction.<key>,   # Which way the NPC is facing.      **/
    /**                                  # <key> may be DOWNRIGHT, DOWNLEFT, **/
    /**                                  # UPRIGHT or UPLEFT                 **/
    /**    dialog: <String>     # What the NPC says when spoken to. If this  **/
    /**         OR <String[]>   # is an array, the contents will be what the **/
    /**                         # NPC says. If it is just a string, it will  **/
    /**                         # be used as a key to load an appropriate    **/
    /**                         # entry from the NPCDialog.js file. If it    **/
    /**                         # not a legal key, the NPC will say that it  **/
    /**                         # wasn't assigned dialog.                    **/
    /**                                                                      **/
    /**************************************************************************/
    

    FOYER: {
        ID: Settings.FOYER_ID, 
        NAME: "Reception",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 25, 
        WIDTH: 25, 
        MAPELEMENTS: [
        ],
        OBJECTS: [            
            // Tables
            {type: GameObjectType.TABLE, position: [1,1],  isClickable: true, variation: 0},    // Table default
            
            {type: GameObjectType.TABLE, position: [1,3],  isClickable: true, variation: 1},    // Table x
            {type: GameObjectType.TABLE, position: [2,3],  isClickable: true, variation: 2},
            {type: GameObjectType.TABLE, position: [3,3],  isClickable: true, variation: 3},
            
            {type: GameObjectType.TABLE, position: [1,5],  isClickable: true, variation: 4},    // Table y
            {type: GameObjectType.TABLE, position: [1,6],  isClickable: true, variation: 5},
            {type: GameObjectType.TABLE, position: [1,7],  isClickable: true, variation: 6},
            
            // Counters
            {type: GameObjectType.COUNTER, position: [5,1],  isClickable: true, variation: 0},  // Counter default
            
            {type: GameObjectType.COUNTER, position: [5,3],  isClickable: true, variation: 1},  // Counter x
            {type: GameObjectType.COUNTER, position: [6,3],  isClickable: true, variation: 2},
            {type: GameObjectType.COUNTER, position: [7,3],  isClickable: true, variation: 3},
            
            {type: GameObjectType.COUNTER, position: [5,5],  isClickable: true, variation: 4},  // Counter y
            {type: GameObjectType.COUNTER, position: [5,6],  isClickable: true, variation: 5},
            {type: GameObjectType.COUNTER, position: [5,7],  isClickable: true, variation: 6},
            
            {type: GameObjectType.COUNTER, position: [5, 9],  isClickable: true, variation: 7}, // Counter circle
            {type: GameObjectType.COUNTER, position: [5,10],  isClickable: true, variation: 5},
            {type: GameObjectType.COUNTER, position: [5,11],  isClickable: true, variation: 8},
            {type: GameObjectType.COUNTER, position: [6,11],  isClickable: true, variation: 2},
            {type: GameObjectType.COUNTER, position: [7,11],  isClickable: true, variation: 9},
            {type: GameObjectType.COUNTER, position: [7,10],  isClickable: true, variation: 5},
            {type: GameObjectType.COUNTER, position: [7, 9],  isClickable: true, variation:10},
            {type: GameObjectType.COUNTER, position: [6, 9],  isClickable: true, variation: 2},
            
            // Cupboards
            {type: GameObjectType.CUPBOARD, position: [19, 0],  isClickable: true, variation: 0},
            {type: GameObjectType.CUPBOARD, position: [20, 0],  isClickable: true, variation: 1},
            {type: GameObjectType.CUPBOARD, position: [21, 0],  isClickable: true, variation: 2},
            {type: GameObjectType.CUPBOARD, position: [22, 0],  isClickable: true, variation: 3},
            {type: GameObjectType.CUPBOARD, position: [23, 0],  isClickable: true, variation: 4},
            
            {type: GameObjectType.CUPBOARD, position: [24, 1],  isClickable: true, variation: 5},
            {type: GameObjectType.CUPBOARD, position: [24, 2],  isClickable: true, variation: 6},
            {type: GameObjectType.CUPBOARD, position: [24, 3],  isClickable: true, variation: 7},
            {type: GameObjectType.CUPBOARD, position: [24, 4],  isClickable: true, variation: 8},
            {type: GameObjectType.CUPBOARD, position: [24, 5],  isClickable: true, variation: 9},
            
            {type: GameObjectType.CUPBOARD, position: [18, 0],  isClickable: true, variation: 12},
            {type: GameObjectType.CUPBOARD, position: [18, 6],  isClickable: true, variation: 13},
            {type: GameObjectType.CUPBOARD, position: [24, 6],  isClickable: true, variation: 14},
            {type: GameObjectType.CUPBOARD, position: [24, 0],  isClickable: true, variation: 15},
            
            {type: GameObjectType.CUPBOARD, position: [18, [1,5]],  isClickable: true, variation: 11},
            {type: GameObjectType.CUPBOARD, position: [[19,23], 6],  isClickable: true, variation: 10},
            
            {type: GameObjectType.SIDEBOARD, position: [19, 7],  isClickable: true, variation: 0},
            {type: GameObjectType.SIDEBOARD, position: [20, 7],  isClickable: true, variation: 1},
            {type: GameObjectType.SIDEBOARD, position: [21, 7],  isClickable: true, variation: 2},
            {type: GameObjectType.SIDEBOARD, position: [22, 7],  isClickable: true, variation: 3},
            {type: GameObjectType.SIDEBOARD, position: [23, 7],  isClickable: true, variation: 4},
            
            {type: GameObjectType.SIDEBOARD, position: [24, 8],  isClickable: true, variation: 5},
            {type: GameObjectType.SIDEBOARD, position: [24, 9],  isClickable: true, variation: 6},
            {type: GameObjectType.SIDEBOARD, position: [24,10],  isClickable: true, variation: 7},
            {type: GameObjectType.SIDEBOARD, position: [24,11],  isClickable: true, variation: 8},
            {type: GameObjectType.SIDEBOARD, position: [24,12],  isClickable: true, variation: 9},
            
            {type: GameObjectType.SIDEBOARD, position: [18, 7],  isClickable: true, variation: 12},
            {type: GameObjectType.SIDEBOARD, position: [18,13],  isClickable: true, variation: 13},
            {type: GameObjectType.SIDEBOARD, position: [24,13],  isClickable: true, variation: 14},
            {type: GameObjectType.SIDEBOARD, position: [24, 7],  isClickable: true, variation: 15},
            
            {type: GameObjectType.SIDEBOARD, position: [18, [8,12]],  isClickable: true, variation: 11},
            {type: GameObjectType.SIDEBOARD, position: [[19,23], 13],  isClickable: true, variation: 10},
            
            // Chairs
            {type: GameObjectType.CHAIR, position: [ 9, 1],  isClickable: true, variation: 0 * 4 + 0},
            {type: GameObjectType.CHAIR, position: [11, 1],  isClickable: true, variation: 0 * 4 + 1},
            {type: GameObjectType.CHAIR, position: [13, 1],  isClickable: true, variation: 0 * 4 + 2},
            {type: GameObjectType.CHAIR, position: [15, 1],  isClickable: true, variation: 0 * 4 + 3},
            
            {type: GameObjectType.CHAIR, position: [ 9, 2],  isClickable: true, variation: 1 * 4 + 0},
            {type: GameObjectType.CHAIR, position: [11, 2],  isClickable: true, variation: 1 * 4 + 1},
            {type: GameObjectType.CHAIR, position: [13, 2],  isClickable: true, variation: 1 * 4 + 2},
            {type: GameObjectType.CHAIR, position: [15, 2],  isClickable: true, variation: 1 * 4 + 3},
            
            {type: GameObjectType.CHAIR, position: [ 9, 3],  isClickable: true, variation: 2 * 4 + 0},
            {type: GameObjectType.CHAIR, position: [11, 3],  isClickable: true, variation: 2 * 4 + 1},
            {type: GameObjectType.CHAIR, position: [13, 3],  isClickable: true, variation: 2 * 4 + 2},
            {type: GameObjectType.CHAIR, position: [15, 3],  isClickable: true, variation: 2 * 4 + 3},
            
            {type: GameObjectType.CHAIR, position: [ 9, 4],  isClickable: true, variation: 3 * 4 + 0},
            {type: GameObjectType.CHAIR, position: [11, 4],  isClickable: true, variation: 3 * 4 + 1},
            {type: GameObjectType.CHAIR, position: [13, 4],  isClickable: true, variation: 3 * 4 + 2},
            {type: GameObjectType.CHAIR, position: [15, 4],  isClickable: true, variation: 3 * 4 + 3},
            
            {type: GameObjectType.CHAIR, position: [ 9, 5],  isClickable: true, variation: 4 * 4 + 0},
            {type: GameObjectType.CHAIR, position: [11, 5],  isClickable: true, variation: 4 * 4 + 1},
            {type: GameObjectType.CHAIR, position: [13, 5],  isClickable: true, variation: 4 * 4 + 2},
            {type: GameObjectType.CHAIR, position: [15, 5],  isClickable: true, variation: 4 * 4 + 3},
            
            {type: GameObjectType.CHAIR, position: [ 9, 6],  isClickable: true, variation: 5 * 4 + 0},
            {type: GameObjectType.CHAIR, position: [11, 6],  isClickable: true, variation: 5 * 4 + 1},
            {type: GameObjectType.CHAIR, position: [13, 6],  isClickable: true, variation: 5 * 4 + 2},
            {type: GameObjectType.CHAIR, position: [15, 6],  isClickable: true, variation: 5 * 4 + 3},
            
            {type: GameObjectType.CHAIR, position: [ 9, 7],  isClickable: true, variation: 6 * 4 + 0},
            {type: GameObjectType.CHAIR, position: [11, 7],  isClickable: true, variation: 6 * 4 + 1},
            {type: GameObjectType.CHAIR, position: [13, 7],  isClickable: true, variation: 6 * 4 + 2},
            {type: GameObjectType.CHAIR, position: [15, 7],  isClickable: true, variation: 6 * 4 + 3},
            
            {type: GameObjectType.CHAIR, position: [ 9, 8],  isClickable: true, variation: 7 * 4 + 0},
            {type: GameObjectType.CHAIR, position: [11, 8],  isClickable: true, variation: 7 * 4 + 1},
            {type: GameObjectType.CHAIR, position: [13, 8],  isClickable: true, variation: 7 * 4 + 2},
            {type: GameObjectType.CHAIR, position: [15, 8],  isClickable: true, variation: 7 * 4 + 3},
            
            {type: GameObjectType.CHAIR, position: [ 9, 9],  isClickable: true, variation: 8 * 4 + 0},
            {type: GameObjectType.CHAIR, position: [11, 9],  isClickable: true, variation: 8 * 4 + 1},
            {type: GameObjectType.CHAIR, position: [13, 9],  isClickable: true, variation: 8 * 4 + 2},
            {type: GameObjectType.CHAIR, position: [15, 9],  isClickable: true, variation: 8 * 4 + 3},
            
            {type: GameObjectType.CHAIR, position: [ 9,10],  isClickable: true, variation: 9 * 4 + 0},
            {type: GameObjectType.CHAIR, position: [11,10],  isClickable: true, variation: 9 * 4 + 1},
            {type: GameObjectType.CHAIR, position: [13,10],  isClickable: true, variation: 9 * 4 + 2},
            {type: GameObjectType.CHAIR, position: [15,10],  isClickable: true, variation: 9 * 4 + 3},
            
            
            {type: GameObjectType.TABLE, position: [21,10],  isClickable: true, variation: 0},
            {type: GameObjectType.CHAIR, position: [21, 9],  isClickable: true, variation: 8 * 4 + 0},
            {type: GameObjectType.CHAIR, position: [20,10],  isClickable: true, variation: 8 * 4 + 1},
            {type: GameObjectType.CHAIR, position: [21,11],  isClickable: true, variation: 8 * 4 + 2},
            {type: GameObjectType.CHAIR, position: [22,10],  isClickable: true, variation: 8 * 4 + 3},
            
        ],
        DOORS: [ 
        ],
        NPCS: [
        ]
    },

    /**************************************************************************/
    /***************** COMPLETE LIST OF AVAILABLE OBJECT TYPES ****************/
    /**************************************************************************/
    /**                                                                      **/
    /**  See the GameObjectInfo.js file for instructions on how to add your  **/
    /**  own types of objects.                                               **/
    /**                                                                      **/
    /**        type     |         description         |     variations       **/
    /**  ---------------|-----------------------------|--------------------  **/
    /**   LEFTSCHEDULE  | A 1 x 3 schedule table.     |        none          **/
    /**                 | Should be placed as part    |                      **/
    /**                 | of the left wall.           |                      **/
    /**  ---------------|-----------------------------|--------------------  **/
    /**   LEFTWINDOW    | A 1 x 1 window. Should be   | 0: without sill      **/
    /**                 | placed as part of the left  | 1: with sill         **/
    /**                 | wall.                       |                      **/
    /**  ---------------|-----------------------------|--------------------  **/
    /**   RIGHTWINDOW   | A 1 x 1 window. Should be   | 0: without sill      **/
    /**                 | placed as part of the right | 1: with sill         **/
    /**                 | wall.                       |                      **/
    /**  ---------------|-----------------------------|--------------------  **/
    /**   PICTUREFRAME  | A 1 x 3 set of pictures.    |        none          **/
    /**                 | Should be placed as part of |                      **/
    /**                 | the right wall.             |                      **/
    /**  ---------------|-----------------------------|--------------------  **/
    /**   CONFERENCELOGO| A 1 x 5 logo. Should be     |        none          **/
    /**                 | placed as part of the left  |                      **/
    /**                 | wall. */
    /**  ---------------|-----------------------------|--------------------  **/
    /**   PLANT         | A small 1 x 1 potted plant. |        none          **/
    /**  ---------------|-----------------------------|--------------------  **/
    /**   CHAIR         | A small 1 x 1 chair.        | 0: facing DOWNRIGHT  **/
    /**                 |                             | 1: facing UPLEFT     **/
    /**                 |                             | 2: facing DOWNLEFT   **/
    /**                 |                             | 3: facing UPRIGHT    **/
    /**  ---------------|-----------------------------|--------------------  **/
    /**   SOFA          | A more luxurious 1 x 1 chair| 0: facing DOWNRIGHT  **/
    /**                 |                             | 1: facing DOWNLEFT   **/
    /**  ---------------|-----------------------------|--------------------  **/
    /**   LARGETABLE    | A large 1 x 3 table.        | 0: Turned right.     **/
    /**                 |                             | 1: Turned left.      **/
    /**  ---------------|-----------------------------|--------------------  **/
    /**   SMALLTABLE    | A small 1 x 1 table         |        none          **/
    /**  ---------------|-----------------------------|--------------------  **/
    /**   CANTEENCOUNTER| A small 1 x 3 counter with  |        none          **/
    /**                 | some food on it.            |                      **/
    /**  ---------------|-----------------------------|--------------------  **/
    /** RECEPTIONCOUNTER| A large 2 x 7 counter with  |        none          **/
    /**                 | a computer on it.           |                      **/
    /**  ---------------|-----------------------------|--------------------  **/
    /**   DRINKS        | A 1 x 2 vending machine     |        none          **/
    /**  ---------------|-----------------------------|--------------------  **/
    /**   TEA           | A small cup of tea. Should  |        none          **/
    /**                 | be placed on top of a table.|                      **/
    /**  ---------------|-----------------------------|--------------------  **/
    /**   SMALLFOOD     | A small plate of food.      | 0 to 3. All slightly **/
    /**                 | Should be placed on top of  | different placings.  **/
    /**                 | a table.                    |                      **/
    /**  ---------------|-----------------------------|--------------------  **/
    /**                                                                      **/
    /**************************************************************************/

    // FINAL NOTE:
    // Giving any of the "standard" RoomTypes, the RoomFactory will use
    // legacy code to build them according to the standard conference.
    // Using these requires that the rest of the conference contains the
    // proper rooms for the doors to exit into, so it's best to either
    // use all of them or none of them.
    //
    // !!! NO LONGER SUPPORTED - IF YOU USE IT AND IT BREAKS, WE CAN'T HELP !!!

    /*
    ROOM1: {
        TYPE: TypeOfRoom.RECEPTION,
        ID: Settings.RECEPTION_ID      
    },

    ROOM2: {
        TYPE: TypeOfRoom.FOYER,
        ID: Settings.FOYER_ID
    },

    ROOM3: {
        TYPE: TypeOfRoom.FOODCOURT,
        ID: Settings.FOODCOURT_ID
    },

    ROOM4: {
        TYPE: TypeOfRoom.ESCAPEROOM,
        ID: Settings.ESCAPEROOM_ID
    }
    */
    
})

if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = Floorplan;
}
