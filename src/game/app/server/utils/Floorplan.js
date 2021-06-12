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
        tutorial: "Herbert",
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
        NAME: "Foyer",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 16, 
        WIDTH: 15, 
        MAPELEMENTS: [
            {type: GameObjectType.RIGHTWINDOW, position: [[16, [6,7,8]]]},
            {type: GameObjectType.CONFERENCELOGO, position: [7, -1]}
        ],
        OBJECTS: [     
            // Türen
            {type: GameObjectType.BARRIER, variation: 3, position: [[3,5],0]},
            {type: GameObjectType.CARPET, variation: 7, position: [4,0]},
            
            {type: GameObjectType.EXPLANATION, variation: 0, position: [2,0], isClickable: true, story: ["Hier geht es zu den Workshops.", "Wenn du dich für einen Workshop angemeldet hast, hast du ein Passwort bekommen. Damit kannst du eintreten.","Andernfalls wird die Türe rechtzeitig geöffnet."]},
            
            // Sofaecke
            // {type: GameObjectType.TABLE, position: [5,13], isClickable: true, iFrameData: {title: "Das Lehr-Lern-Labor Informatik Karlsruhe", url: "https://media.lehr-lern-labor.info/home/", width: 1000, height: 600 }},
            // {type: GameObjectType.TABLE, position: [1, 9], isClickable: true, iFrameData: {title: "Gästebuch", url: "https://media.lehr-lern-labor.info/collab/p/GuestBook?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            // {type: GameObjectType.TEA, position: [5, 13]},
            // {type: GameObjectType.SOFA, variation: 1 * 3 + 0, position: [1,10]},
            // {type: GameObjectType.SOFA, variation: 1 * 3 + 1, position: [1,11]},
            // {type: GameObjectType.SOFA, variation: 1 * 3 + 2, position: [1,12]},
            // {type: GameObjectType.SOFA, variation: 2 * 3 + 0, position: [2,13]},
            // {type: GameObjectType.SOFA, variation: 2 * 3 + 1, position: [3,13]},
            // {type: GameObjectType.SOFA, variation: 2 * 3 + 2, position: [4,13]},
            
            {type: GameObjectType.TABLE, position: [7,12], isClickable: true, iFrameData: {title: "Das Lehr-Lern-Labor Informatik Karlsruhe", url: "https://media.lehr-lern-labor.info/home/", width: 1000, height: 600 }},
            {type: GameObjectType.TABLEDECORATION, position: [7, 12], variation: 4},
            {type: GameObjectType.CHAIR, variation: 8 * 4 + 0, position: [7,11]},
            {type: GameObjectType.CHAIR, variation: 8 * 4 + 1, position: [6,12]},
            {type: GameObjectType.CHAIR, variation: 8 * 4 + 2, position: [7,13]},
            {type: GameObjectType.CHAIR, variation: 8 * 4 + 3, position: [8,12]},
            
            {type: GameObjectType.TABLE, position: [3, 7], isClickable: true, iFrameData: {title: "Gästebuch", url: "https://media.lehr-lern-labor.info/collab/p/GuestBook?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TABLEDECORATION, position: [3, 7], variation: 6},
            {type: GameObjectType.CHAIR, variation: 8 * 4 + 0, position: [3, 6]},
            {type: GameObjectType.CHAIR, variation: 8 * 4 + 1, position: [2, 7]},
            {type: GameObjectType.CHAIR, variation: 8 * 4 + 2, position: [3, 8]},
            {type: GameObjectType.CHAIR, variation: 8 * 4 + 3, position: [4, 7]},
            
            // Counter
            {type: GameObjectType.COUNTER, position: [14, 5], variation: 3, isClickable: true, story: ["Klicke auf die Bodenfliese unter " + FloorplanConstants.NPCNAMES.tutorial + ". Er erklärt dir, was du tun kannst.","Auf geht's! <br>Herbert wartet auf dich!"]},
            {type: GameObjectType.COUNTER, position: [13, 5], variation: 7, isClickable: true, story: ["Klicke auf die Bodenfliese unter " + FloorplanConstants.NPCNAMES.tutorial + ". Er erklärt dir, was du tun kannst.","Auf geht's! <br>Herbert wartet auf dich!"]},
            {type: GameObjectType.COUNTER, position: [13,[6,7,8]], variation: 5, isClickable: true, story: ["Klicke auf die Bodenfliese unter " + FloorplanConstants.NPCNAMES.tutorial + ". Er erklärt dir, was du tun kannst.","Auf geht's! <br>Herbert wartet auf dich!"]},
            {type: GameObjectType.COUNTER, position: [13, 9], variation: 8, isClickable: true, story: ["Klicke auf die Bodenfliese unter " + FloorplanConstants.NPCNAMES.tutorial + ". Er erklärt dir, was du tun kannst.","Auf geht's! <br>Herbert wartet auf dich!"]},
            {type: GameObjectType.COUNTER, position: [14, 9], variation: 3, isClickable: true, story: ["Klicke auf die Bodenfliese unter " + FloorplanConstants.NPCNAMES.tutorial + ". Er erklärt dir, was du tun kannst.","Auf geht's! <br>Herbert wartet auf dich!"]},
            {type: GameObjectType.TABLEDECORATION, position: [13, 7], variation: 23},
            
            
        ],
        DOORS: [ 
             {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.LOUNGE_ID, 1, 0], directionOnExit: Direction.DOWNLEFT, isOpen: false, codeToOpen: "Lehr-Lern-Labor"},
             {wallSide: GlobalStrings.LEFT, positionOfDoor: [4, -1], positionOnExit: [Settings.EXHIBITION_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT},
        ],
        NPCS: [
            {name: FloorplanConstants.NPCNAMES.tutorial, position: [14, 7], direction: Direction.DOWNLEFT, dialog: NPCDialog.basicTutorialDialog},
        ]
    },
    
    EXHIBITION: {
        ID: Settings.EXHIBITION_ID,
        NAME: "Ausstellung",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 15,
        WIDTH: 15,
        MAPELEMENTS: [],
        OBJECTS: [],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.FOYER_ID, 4, 0], directionOnExit: Direction.DOWNRIGHT},
        ],
        NPCS: []
    },
    
    LOUNGE: {
        ID: Settings.LOUNGE_ID,
        NAME: "Lounge",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 15,
        WIDTH: 15,
        MAPELEMENTS: [],
        OBJECTS: [],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.FOYER_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT},
        ],
        NPCS: []
    },
    
    
})

if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = Floorplan;
}
