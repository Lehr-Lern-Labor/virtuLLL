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
        exhibit: "Karl",
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
        NAME: "Foyer",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 16, 
        WIDTH: 11, 
        MAPELEMENTS: [
            {type: GameObjectType.RIGHTWINDOW, position: [[16, [4,5,6]]]},
            {type: GameObjectType.CONFERENCELOGO, position: [7, -1]}
        ],
        OBJECTS: [     
            // Türen       
            {type: GameObjectType.LEFTDOORICON, variation: 1, position: [1,0]},
            {type: GameObjectType.EXPLANATION, variation: 0, position: [2,0], isClickable: true, story: ["Hier geht es zu den Workshops.", "Wenn du dich für einen Workshop angemeldet hast, hast du ein Passwort bekommen. Damit kannst du eintreten.","Andernfalls wird die Türe rechtzeitig geöffnet."]},
            {type: GameObjectType.LEFTDOORICON, variation: 2, position: [4,0]},
            {type: GameObjectType.EXPLANATION, variation: 0, position: [5,0], isClickable: true, story: ["Hier geht es zur Ausstellung.", "Denke daran, immer auf die passende Bodenfließe zu klicken, um mit Objekten oder anderen Personen zu interagieren."]},
            
            {type: GameObjectType.SEATINGAREA, position: [7,8], isClickable: true, iFrameData: {title: "Das Lehr-Lern-Labor Informatik Karlsruhe", url: "https://media.lehr-lern-labor.info/home/", width: 1000, height: 600 }},
            {type: GameObjectType.TABLEDECORATION, position: [7, 8], variation: 4},
            
            {type: GameObjectType.SEATINGAREA, position: [3, 5], isClickable: true, iFrameData: {title: "Gästebuch", url: "https://media.lehr-lern-labor.info/collab/p/GuestBook?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TABLEDECORATION, position: [3, 5], variation: 6},
            
            {type: GameObjectType.SEATINGAREA, position: [8, 2]},
            {type: GameObjectType.TABLEDECORATION, position: [8, 2], variation: 11},
            
            // Counter
            {type: GameObjectType.COUNTER, position: [14, 3], variation: 3, isClickable: true, story: ["Klicke auf die Bodenfliese unter " + FloorplanConstants.NPCNAMES.tutorial + ". Er erklärt dir, was du tun kannst.","Auf geht's! <br>Herbert wartet auf dich!"]},
            {type: GameObjectType.COUNTER, position: [13, 3], variation: 7, isClickable: true, story: ["Klicke auf die Bodenfliese unter " + FloorplanConstants.NPCNAMES.tutorial + ". Er erklärt dir, was du tun kannst.","Auf geht's! <br>Herbert wartet auf dich!"]},
            {type: GameObjectType.COUNTER, position: [13,[4,5,6]], variation: 5, isClickable: true, story: ["Klicke auf die Bodenfliese unter " + FloorplanConstants.NPCNAMES.tutorial + ". Er erklärt dir, was du tun kannst.","Auf geht's! <br>Herbert wartet auf dich!"]},
            {type: GameObjectType.COUNTER, position: [13, 7], variation: 8, isClickable: true, story: ["Klicke auf die Bodenfliese unter " + FloorplanConstants.NPCNAMES.tutorial + ". Er erklärt dir, was du tun kannst.","Auf geht's! <br>Herbert wartet auf dich!"]},
            {type: GameObjectType.COUNTER, position: [14, 7], variation: 3, isClickable: true, story: ["Klicke auf die Bodenfliese unter " + FloorplanConstants.NPCNAMES.tutorial + ". Er erklärt dir, was du tun kannst.","Auf geht's! <br>Herbert wartet auf dich!"]},
            {type: GameObjectType.TABLEDECORATION, position: [13, 5], variation: 23},
        ],
        DOORS: [ 
             {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.LOUNGE_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT, isOpen: false, codeToOpen: "Lehr-Lern-Labor"},
             {wallSide: GlobalStrings.LEFT, positionOfDoor: [4, -1], positionOnExit: [Settings.EXHIBITION_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT},
        ],
        NPCS: [
            {name: FloorplanConstants.NPCNAMES.tutorial, position: [14, 5], direction: Direction.DOWNLEFT, dialog: NPCDialog.basicTutorialDialog},
        ]
    },

    
    EXHIBITION: {
        ID: Settings.EXHIBITION_ID,
        NAME: "Ausstellung",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 15,
        WIDTH: 15,
        MAPELEMENTS: [],
        OBJECTS: [
            // Türen (Themenräume)
            {type: GameObjectType.LEFTDOORICON, variation: 0, position: [1,0]},
            
            {type: GameObjectType.LEFTDOORICON, variation: 3, position: [4,0]},
            {type: GameObjectType.EXPLANATION, variation: 0, position: [ 5,0], isClickable: true, story: ["Das Binärsystem", "In diesem Raum erfährst du, wie ein Computer rechnet."]},
            {type: GameObjectType.LEFTDOORICON, variation: 4, position: [7,0]},
            {type: GameObjectType.EXPLANATION, variation: 0, position: [ 8,0], isClickable: true, story: ["Logik", "In diesem Raum kannst du Rätsel lösen und einen eigenen Computer bauen."]},
            {type: GameObjectType.LEFTDOORICON, variation: 5, position: [10,0]},
            {type: GameObjectType.EXPLANATION, variation: 0, position: [11,0], isClickable: true, story: ["Programmieren", "In diesem Raum geht es um Prgorammieren und wie du lernen kannst zu programmieren."]},
            {type: GameObjectType.LEFTDOORICON, variation: 6, position: [13,0]},
            {type: GameObjectType.EXPLANATION, variation: 0, position: [14,0], isClickable: true, story: ["Algorithmen", "In diesem Raum erfährst du, wie Computer denken und was ein Kochrezept mit einem Computer zu tun hat."]},
            {type: GameObjectType.RIGHTDOORICON, variation: 7, position: [14,1]},
            {type: GameObjectType.EXPLANATION, variation: 1, position: [14,2], isClickable: true, story: ["Robotik", "In diesem Raum erfährst du einige Dinge über Robotik, kannst einen Roboter fernsteuern und lernst ARMAR kennen."]},
            
            // Sitzbereiche
            {type: GameObjectType.SEATINGAREA, position: [4,12]},
            {type: GameObjectType.TABLEDECORATION, position: [4,12], variation: 4},
            {type: GameObjectType.SEATINGAREA, position: [5,4]},
            {type: GameObjectType.TABLEDECORATION, position: [5,4], variation: 14, isClickable:true, iFrameData: {title: "FAQ", url: "https://media.lehr-lern-labor.info/collab/p/FAQ?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.SEATINGAREA, position: [8,8]},
            {type: GameObjectType.TABLEDECORATION, position: [8,8], variation: 3},
            
        ],
        DOORS: [
            {wallSide: GlobalStrings.LEFT,  positionOfDoor: [ 1, -1], positionOnExit: [Settings.FOYER_ID, 4, 0], directionOnExit: Direction.DOWNRIGHT},
            {wallSide: GlobalStrings.LEFT,  positionOfDoor: [ 4, -1], positionOnExit: [Settings.EXHIBITION_1_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT},
            {wallSide: GlobalStrings.LEFT,  positionOfDoor: [ 7, -1], positionOnExit: [Settings.EXHIBITION_2_ID, 5, 0], directionOnExit: Direction.DOWNRIGHT},
            {wallSide: GlobalStrings.LEFT,  positionOfDoor: [10, -1], positionOnExit: [Settings.EXHIBITION_3_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT},
            {wallSide: GlobalStrings.LEFT,  positionOfDoor: [13, -1], positionOnExit: [Settings.EXHIBITION_4_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT},
            {wallSide: GlobalStrings.RIGHT, positionOfDoor: [15,  1], positionOnExit: [Settings.EXHIBITION_5_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT},
        ],
        NPCS: [
            {name: FloorplanConstants.NPCNAMES.exhibit, position: [2, 0], direction: Direction.DOWNRIGHT, dialog: NPCDialog.exhibitionDialog},
        ]
    },
    
    EXHIBITION_1: {
        ID: Settings.EXHIBITION_1_ID,
        NAME: "Binärsystem",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 12,
        WIDTH: 7,
        MAPELEMENTS: [
            {type: GameObjectType.RIGHTWINDOW, position: [12, [2,3,4]]},
            {type: GameObjectType.CONFERENCELOGO, position: [3, -1]}
        ],
        OBJECTS: [
            {type: GameObjectType.TABLE, position: [2,4], variation: 4},
            {type: GameObjectType.TABLE, position: [2,5], variation: 6},
            {type: GameObjectType.EXPLANATION, variation: 5, position: [2,4], isClickable: true, story: [
                "Computer können nicht selbst denken. Aber trotzdem sind sie auf ein paar Gebieten besser als ein Mensch, z.B. wenn es darum geht, schnell zu rechnen.<br><br>Aber wie geht das?", 
                "In diesem Raum erfährst du, wie ein Computer rechnet - und zwar mit nur zwei Zuständen: Strom an und Strom aus bzw. 1 und 0.",
                "An den vorderen Tischen lernst du die Grundlagen und an den hinteren Tischen kannst du dein neues Wissen testen. <br><br>Viel Spaß!"]},
        
            {type: GameObjectType.COMPUTER, position: [3, 1], isClickable: true, iFrameData: {title: "Das Binärsystem", url: "https://www.youtube.com/embed/T8pt_GhohQs", width: 800, height: 450 }},
            {type: GameObjectType.COMPUTER, position: [3, 4], isClickable: true, iFrameData: {title: "Rechnen mit Strom", url: "https://www.youtube.com/embed/9l-l_dD6qPQ", width: 800, height: 450 }},
            {type: GameObjectType.COMPUTER, position: [6, 1], isClickable: true, iFrameData: {title: "Rechnen mit Dualzahlen", url: "https://www.youtube.com/embed/2YJxC_FwBLE", width: 800, height: 450 }},
            {type: GameObjectType.COMPUTER, position: [6, 4], isClickable: true, iFrameData: {title: "Welche Kärtchen werden benötigt? Klicke dann auf die gelbe Zahl.", url: "https://media.lehr-lern-labor.info/workshops/binary/", width: 600, height: 300 }},
            {type: GameObjectType.COMPUTER, position: [9, 1], isClickable: true, iFrameData: {title: "Korrigiere den Fehler!", url: "https://media.lehr-lern-labor.info/workshops/binary1/", width: 800, height: 500 }},
            {type: GameObjectType.COMPUTER, position: [9, 4], isClickable: true, iFrameData: {title: "Berechne.", url: "https://media.lehr-lern-labor.info/workshops/binary2/", width: 800, height: 500 }},
            
            {type: GameObjectType.TABLEDECORATION, position: [[6,5],[9,2],[9,5]], variation: 13},
        ],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.EXHIBITION_ID, 4, 0], directionOnExit: Direction.DOWNRIGHT},
        ],
        NPCS: []
    },
    
    EXHIBITION_2: {
        ID: Settings.EXHIBITION_2_ID,
        NAME: "Logik",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 11,
        WIDTH: 11,
        MAPELEMENTS: [
            {type: GameObjectType.RIGHTWINDOW, position: [12, [2,3,4]]},
        ],
        OBJECTS: [
            // Station 1
            {type: GameObjectType.SIDEBOARD, position: [ 7, 0], variation:  3, isClickable: true, iFrameData: {title: "Logik im Alltag", url: "https://www.youtube.com/embed/Tp9WzwUMjDs", width: 800, height: 450 }},
            {type: GameObjectType.SIDEBOARD, position: [ 8, 0], variation:  4},
            {type: GameObjectType.CUPBOARD,  position: [ 9, 0], variation:  3, isClickable: true, iFrameData: {title: "Aussagenlogik", url: "https://www.youtube.com/embed/inwIsNIaWJM", width: 800, height: 450 }},
            {type: GameObjectType.CUPBOARD,  position: [10, 0], variation: 15},
            {type: GameObjectType.CUPBOARD,  position: [10, 1], variation:  9},
            {type: GameObjectType.SIDEBOARD, position: [10, 2], variation:  5, isClickable: true, iFrameData: {title: "Aussagenlogik", url: "https://inf-schule.de/programmierung/funktional/konzepte/wahrheitswerte/aussagenlogik", width: 800, height: 450 }},
            {type: GameObjectType.SIDEBOARD, position: [10, 3], variation:  6},
            
            {type: GameObjectType.SEATINGAREA, position: [8,2], variation: 0},
            {type: GameObjectType.EXPLANATION, variation: 5, position: [8,2], isClickable: true, story: [
                "An dieser Station lernst du die Grundlagen der Logik in verschiedenen Fachbereichen kennen. klicke dazu auf die Schränke und Regale.", 
                "Wenn du die Begriffe <i>Wahrheitstabelle</i>, <i>UND</i>, <i>ODER</i> und <i>Negation</i> im logischen Zusammenhang kennst, kannst du zur nächsten Station weitergehen."]},
                
            // Station 2
            {type: GameObjectType.SIDEBOARD, position: [10, 7], variation:  7, isClickable: true, iFrameData: {title: "LogicTraffic", url: "https://logictraffic.ch/", width: 1000, height: 600 }},
            {type: GameObjectType.SIDEBOARD, position: [10, 8], variation:  8},
            {type: GameObjectType.CUPBOARD,  position: [10, 9], variation:  5},
            {type: GameObjectType.CUPBOARD,  position: [10,10], variation: 14},
            {type: GameObjectType.CUPBOARD,  position: [ 9,10], variation: 10},
            {type: GameObjectType.SIDEBOARD, position: [ 8,10], variation: 10},
            {type: GameObjectType.SIDEBOARD, position: [ 7,10], variation: 10},
            
            {type: GameObjectType.SEATINGAREA, position: [8,8], variation: 0},
            {type: GameObjectType.EXPLANATION, variation: 4, position: [8,8], isClickable: true, story: [
                "Hinter dem leeren Regal versteckt sich das Spiel LogicTraffic. Anhand einer Straßenkreuzung kannst du dein Können mit Wahrheitstabellen und aussagenlogischen Formeln unter Beweis stellen.", 
                "Wähle eine Situation aus (beginne am besten mit Situation 1) und entscheide für jede Sequenz, ob die die jeweilige Sequenz sicher ist. Dadurch wird die Wahrheitstabelle ausgefüllt.<br><br>" + 
                "Du kannst die Wahrheitstabelle auch direkt ausfüllen, indem du auf die Fragezeichen klickst.",
                "Wenn dir das zu einfach ist, öffne den Formeleditor rechts, gib die richtige Formel ein und überprüfe sie, indem du sie in die Wahrheitstabelle lädst."]},
                
            // Station 3
            {type: GameObjectType.SIDEBOARD, position: [ 3,10], variation: 10},
            {type: GameObjectType.SIDEBOARD, position: [ 2,10], variation: 10},
            {type: GameObjectType.CUPBOARD,  position: [ 1,10], variation: 10},
            {type: GameObjectType.CUPBOARD,  position: [ 0,10], variation: 13, isClickable: true, iFrameData: {title: "Schaltlogik", url: "https://www.youtube.com/embed/gdgB1BbI7vc", width: 800, height: 450 }},
            {type: GameObjectType.CUPBOARD,  position: [ 0, 9], variation: 11},
            {type: GameObjectType.SIDEBOARD, position: [ 0, 8], variation: 11},
            {type: GameObjectType.SIDEBOARD, position: [ 0, 7], variation: 11, isClickable: true, iFrameData: {title: "Nandgame", url: "https://media.lehr-lern-labor.info/redirect.html?text=Zum%20NAND-Game&url=https://nandgame.com/", width: 800, height: 450 }},
            
            {type: GameObjectType.SEATINGAREA, position: [2,8], variation: 0},
            {type: GameObjectType.EXPLANATION, variation: 7, position: [2,8], isClickable: true, story: [
                "Nun solltest du mit den Grundlagen der Aussagenlogik vertraut sein und wir können uns der Schaltlogik zuwenden.", 
                "Schau dir zuerst das Video in der Ecke über Schaltlogik an. Dann kannst du mit dem <i>Nandgame</i> beginnen.<br><br>" + 
                "Beim Nandgame beginnst du mit zwei einfachen Relais und baust daraus Schritt für Schritt einen ganzen Computer.<br><br>" +
                "<i>Falls du beim Nandgame nicht mehr weiterkommen solltest, gibt es <a href='https://youtube.com/playlist?list=PL-BzNEwVGF7I3kGs9APa3ANJ5jswfHy7D' target='_blank'>hier</a> eine Komplettlösung mit Erklärung.</i>"]},
                
            // Station 4
            {type: GameObjectType.SIDEBOARD, position: [ 0, 3], variation: 11},
            {type: GameObjectType.SIDEBOARD, position: [ 0, 2], variation: 11, isClickable: true, iFrameData: {title: "Logikrätsel", url: "https://www.logisch-gedacht.de/logikraetsel/", width: 800, height: 450 }},
            {type: GameObjectType.CUPBOARD,  position: [ 0, 1], variation: 11},
            {type: GameObjectType.CUPBOARD,  position: [ 0, 0], variation: 12},
            {type: GameObjectType.CUPBOARD,  position: [ 1, 0], variation:  3},
            {type: GameObjectType.SIDEBOARD, position: [ 2, 0], variation:  3, isClickable: true, iFrameData: {title: "Logik", url: "https://media.lehr-lern-labor.info/collab/p/Logik?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 800, height: 450 }},
            {type: GameObjectType.SIDEBOARD, position: [ 3, 0], variation:  4},
            
            {type: GameObjectType.SEATINGAREA, position: [2,2], variation: 0},
            {type: GameObjectType.EXPLANATION, variation: 6, position: [2,2], isClickable: true, story: [
                "Hier findest du eine Sammlung von Logik-Rätseln. Du wirst vermutlich keine Wahrheitstabellen brauchen, aber logisch denken musst du auf jeden Fall!", 
                "Außerdem kannst du noch einen Kommentar dalassen. Worüber würdest du gerne mehr wissen? Wo begegnet dir Logik im Alltag?"]},
                
            
            {type: GameObjectType.EXPLANATION, variation: 0, position: [6,0], isClickable: true, story: [
                "Computer arbeiten logisch. Das fängt mit den kleinsten Bauteilen und Schaltungen an und ist auch für die verwendete Software wichtig.<br><br>" + 
                "Aber nicht nur in der Informatik stößt man auf Logik. Auch in der Mathematik, der Physik oder der Philosophie (um nur ein paar Gebiete zu nennen) begegnet man Logik. Je nach Fachbereich wird sie unterschiedlich aufgeschrieben und anders angewendet, aber die Logik dahinter ist immer die gleiche.", 
                "In diesem Raum lernst du die Grundlagen der Logik kennen und kannst die Schaltung eines Computers von Grund auf selber bauen.",
                "Beginne am besten in der oberen linken Ecke und gehe dann im Uhrzeigersinn weiter. <br><br>Viel Spaß!"]},
        ],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [5, -1], positionOnExit: [Settings.EXHIBITION_ID, 7, 0], directionOnExit: Direction.DOWNRIGHT},
        ],
        NPCS: []
    },
    
    EXHIBITION_3: {
        ID: Settings.EXHIBITION_3_ID,
        NAME: "Programmieren",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 11,
        WIDTH: 11,
        MAPELEMENTS: [
            {type: GameObjectType.LEFTWINDOW, position: [[4,5,6,7,8], -1]},
        ],
        OBJECTS: [            
            {type: GameObjectType.EXPLANATION, variation: 0, position: [2,0], isClickable: true, story: [
                "Informatik ist mehr als Code, aber mit Code kann man sehr präzise aufschreiben, was man meint.<br><br>" + 
                "Daher ist es für einen Informatiker wichtig, programmieren zu können.",
                "An den Computern findest du ein paar kleine Herausforderungen und in der Sofaecke Hinweise, wie du anfangen kannst, programmieren zu lernen.<br><br>Viel Spaß!"]},
            
            {type: GameObjectType.TABLE, variation:1, position: [3,2], isClickable: true, iFrameData: {title: "Minecraft", url: "https://media.lehr-lern-labor.info/redirect.html?text=Minecraft&url=https://studio.code.org/s/mc/lessons/1/levels/1", width: 800, height: 450 }},            
            {type: GameObjectType.TABLE, variation:2, position: [4,2], isClickable: true, iFrameData: {title: "Minecraft Aquatic", url: "https://media.lehr-lern-labor.info/redirect.html?text=Minecraft%20Aquatic&url=https://studio.code.org/s/aquatic/lessons/1/levels/1", width: 800, height: 450 }},            
            {type: GameObjectType.TABLE, variation:3, position: [5,2], isClickable: true, iFrameData: {title: "Frozen", url: "https://media.lehr-lern-labor.info/redirect.html?text=Frozen&url=https://studio.code.org/s/frozen/lessons/1/levels/1", width: 800, height: 450 }},
            {type: GameObjectType.TABLE, variation:1, position: [6,2], isClickable: true, iFrameData: {title: "Sport", url: "https://media.lehr-lern-labor.info/redirect.html?text=Sport&url=https://studio.code.org/s/sports/lessons/1/levels/1", width: 800, height: 450 }},            
            {type: GameObjectType.TABLE, variation:2, position: [7,2], isClickable: true, iFrameData: {title: "Flappy Bird", url: "https://media.lehr-lern-labor.info/redirect.html?text=Flappy%20Bird&url=https://studio.code.org/flappy/1", width: 800, height: 450 }},            
            {type: GameObjectType.TABLE, variation:3, position: [8,2], isClickable: true, iFrameData: {title: "Scratch", url: "https://media.lehr-lern-labor.info/redirect.html?text=Scratch&url=https://scratch.mit.edu/projects/editor/", width: 800, height: 450 }},          
            {type: GameObjectType.TABLEDECORATION, variation:22, position: [[3,4,5,6,7,8],2]},
            {type: GameObjectType.CHAIR, variation:40, position: [[3,4,5,6,7,8],1]},
            
                        
            {type: GameObjectType.COUNTER, variation:4, position: [10,0]},
            {type: GameObjectType.COUNTER, variation:5, position: [10,[1,2,3]]},
            {type: GameObjectType.COUNTER, variation:9, position: [10,4]},
            {type: GameObjectType.COUNTER, variation:2, position: [[9,8,7,6,5,4],4]},
            {type: GameObjectType.COUNTER, variation:1, position: [3,4]},
            {type: GameObjectType.TABLEDECORATION, variation:0, position: [10,0]},
            {type: GameObjectType.TABLEDECORATION, variation:5, position: [10,4]},
            {type: GameObjectType.TABLEDECORATION, variation:14, position: [ 4,4]},
            
            
            {type: GameObjectType.SOFA, variation: 0, position: [7, 5]},
            {type: GameObjectType.SOFA, variation: 1, position: [8, 5]},
            {type: GameObjectType.SOFA, variation: 2, position: [9, 5]},
            {type: GameObjectType.SOFA, variation: 9, position: [10, 6]},
            {type: GameObjectType.SOFA, variation:10, position: [10,[7,8]]},
            {type: GameObjectType.SOFA, variation:11, position: [10, 9]},
            {type: GameObjectType.SOFA, variation: 8, position: [9,10]},
            {type: GameObjectType.SOFA, variation: 7, position: [8,10]},
            {type: GameObjectType.SOFA, variation: 6, position: [7,10]},
            {type: GameObjectType.TABLE, variation:4, position: [8,7], isClickable: true, iFrameData: {title: "Programmieren", url: "https://media.lehr-lern-labor.info/collab/p/r.10dfaf25e961e9b5b4a631705f151b07?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TABLE, variation:6, position: [8,8], isClickable: true, iFrameData: {title: "Programmieren", url: "https://media.lehr-lern-labor.info/collab/p/r.10dfaf25e961e9b5b4a631705f151b07?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TABLEDECORATION, variation:4, position: [8,8]},
            
            {type: GameObjectType.TABLE, variation:4, position: [2,7], isClickable: true, iFrameData: {title: "Kommentare", url: "https://media.lehr-lern-labor.info/collab/p/proggen?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TABLE, variation:6, position: [2,8], isClickable: true, iFrameData: {title: "Kommentare", url: "https://media.lehr-lern-labor.info/collab/p/proggen?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TABLEDECORATION, variation:7, position: [2,7]},
            {type: GameObjectType.CHAIR, variation:0, position: [2,6]},
            {type: GameObjectType.CHAIR, variation:1, position: [1,[7,8]]},
            {type: GameObjectType.CHAIR, variation:2, position: [2,9]},
            {type: GameObjectType.CHAIR, variation:3, position: [3,[7,8]]},
        ],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.EXHIBITION_ID,10, 0], directionOnExit: Direction.DOWNRIGHT},
        ],
        NPCS: []
    },
    
    EXHIBITION_4: {
        ID: Settings.EXHIBITION_4_ID,
        NAME: "Algorithmen",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 25,
        WIDTH: 20,
        MAPELEMENTS: [
        ],
        OBJECTS: [            
            {type: GameObjectType.EXPLANATION, variation: 0, position: [2,0], isClickable: true, story: [
                "Hast du schon mal nach einem Rezept gekocht oder gebacken?<br><br>" + 
                "Dann kennst du dich schon mit Algorithmen aus. Algorithmen sind Schritt-für-Schritt-Anleitungen, die in der Informatik eine große Rolle spielen. " + 
                "Computer sind sehr gut darin, nach einer vorgegebenen Anleitung, einem Algorithmus, vorzugehen, aber furchtbar schlecht darin, zu improvisieren.",
                "In diesem Raum erfährst du, was ein Algorithmus eigentlich ist und kannst dich im Labyrinth verlaufen. " + 
                "Hast du schonmal einen Algorithmus getanzt? Am Ende des Labyrinths geht es um Sortieralgorithmen - und wie man diese tanzt.<br><br>Viel Spaß!"]},

            {type: GameObjectType.EXPLANATION, variation: 3, position: [3,3], isClickable: true, iFrameData: {title: "Algorithmen", url: "https://www.youtube-nocookie.com/embed/BGL6ar9kuao?modestbranding=1", width: 800, height: 450 }},
            {type: GameObjectType.EXPLANATION, variation: 3, position: [3,7], isClickable: true, iFrameData: {title: "Ein Problem - mehrere Lösungswege", url: "https://www.youtube-nocookie.com/embed/FBUoEumkP2w?start=105&modestbranding=1", width: 800, height: 450 }},
            
            // Sortieralgorithmen
            {type: GameObjectType.CUPBOARD, variation: 0, position: [21,0]},
            {type: GameObjectType.CUPBOARD, variation: 1, position: [22,0]},
            {type: GameObjectType.CUPBOARD, variation: 3, position: [23,0]},
            {type: GameObjectType.CUPBOARD, variation:15, position: [24,0]},
            {type: GameObjectType.CUPBOARD, variation: 8, position: [24,1]},
            {type: GameObjectType.CUPBOARD, variation: 5, position: [24,2], isClickable: true, iFrameData: {title: "Battle der Sortieralgorithmen", url: "https://www.youtube-nocookie.com/embed/videoseries?modestbranding=1&list=PL2aHrV9pFqNS79ZKnGLw-RG5gH01bcjRZ", width: 800, height: 450 }},
            {type: GameObjectType.CUPBOARD, variation: 6, position: [24,3], isClickable: true, iFrameData: {title: "Sortieralgorithmen getanzt", url: "https://www.youtube-nocookie.com/embed/lyZQPjUT5B4?rel=0&modestbranding=1&playlist=lyZQPjUT5B4,ROalU379l3U0,Ns4TPTC8whw,ywWBy6J5gz8,XaqR3G_NVoo,CmPA7zE8mx0,Xw2D9aJRBY4", width: 800, height: 450 }},
            {type: GameObjectType.CUPBOARD, variation: 9, position: [24,4]},
            
            {type: GameObjectType.SEATINGAREA, position: [22,2], isClickable: true, iFrameData: {title: "Sortierwaage", url: "https://media.lehr-lern-labor.info/redirect.html?text=Sortierwaage&url=http://www.inspiration-informatik.de/anwendung/sorting-algorithms/index.html", width: 823, height: 463 }},
            // Labyrinth
            {type: GameObjectType.BARRIER, variation: 5, position: [[9,10],1]},
            {type: GameObjectType.BARRIER, variation: 5, position: [16,2]},
            {type: GameObjectType.BARRIER, variation: 5, position: [[4,5,16,17,24],5]},
            {type: GameObjectType.BARRIER, variation: 5, position: [17,7]},
            {type: GameObjectType.BARRIER, variation: 5, position: [24,8]},
            {type: GameObjectType.BARRIER, variation: 5, position: [[9,10],9]},
            {type: GameObjectType.BARRIER, variation: 5, position: [22,10]},
            {type: GameObjectType.BARRIER, variation: 5, position: [[12,14,15],13]},
            {type: GameObjectType.BARRIER, variation: 5, position: [12,14]},
            {type: GameObjectType.BARRIER, variation: 5, position: [[5,7,8,16,17],15]},
            {type: GameObjectType.BARRIER, variation: 5, position: [[7,8,9,23,24],16]},
            {type: GameObjectType.BARRIER, variation: 5, position: [[3,4,5,18,19],17]},
            {type: GameObjectType.BARRIER, variation: 5, position: [[3,4,5,6,7,18,19],18]},
            {type: GameObjectType.BARRIER, variation: 5, position: [14,19]},
            
            {type: GameObjectType.BARRIER, variation: 6, position: [ 0,[13,17,18,19]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [ 2,[13,14]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [ 3,[0,1,2,3,4,6,7,8,9,10,11]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [ 5,[2,8,9,10,11,12,13]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [ 6,[0,2,6,8,9,10,11,12]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [ 8,[2,4,8,12]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [ 9,[6,12,14]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [10,17]},
            {type: GameObjectType.BARRIER, variation: 6, position: [11,[2,3,4,5,6,10,11,12]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [13,[2,3,4,5,6,10,15,16]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [14,[6,8,10]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [15,[3,4,16,17,18]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [16,[8,9,10,11,12]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [17,[0,1]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [18,[8,9,10,11,12,13,14]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [20,[0,2,3,4,6,7,11,15,16]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [21,[6,7,9,13]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [22,17]},
            {type: GameObjectType.BARRIER, variation: 6, position: [23,[6,7,11,12,13]]},
            
            {type: GameObjectType.BARRIER, variation: 1, position: [13,1]},
            
            {type: GameObjectType.BARRIER, variation: 2, position: [19,1]},
            
            {type: GameObjectType.BARRIER, variation: 3, position: [[23,14],[15,0],[13,17],[11,7],[6,13],[2,15]]},
            
            {type: GameObjectType.BARRIER, variation: 4, position: [[23,18],[18,3],[18,5],[11,16],[11,18],[9,3],[8,18]]},
            
            {type: GameObjectType.BARRIER, variation: 2, position: [[2,12],[2,17],[4,14],[5,1],[5,7],[8,1],[8,7],[8,11],[13,9],[13,19],[14,5],[15,2],[15,15],[16,7],[17,17],[20,10],[20,14],[22,16],[23,5]]},
            {type: GameObjectType.BARRIER, variation: 1, position: [[2,12],[2,17],[4,14],[5,1],[5,7],[8,1],[8,7],[8,11],[13,9],[13,19],[14,5],[15,2],[15,15],[16,7],[17,17],[20,10],[20,14],[22,16],[23,5]]},
            
            {type: GameObjectType.BARRIER, variation: 2, position: [[2,18],[4,15],[5,3],[8,5],[8,9],[8,13],[10,18],[11,14],[13,7],[13,11],[17,3],[17,18],[20,8],[20,12],[22,18],[23,8]]},
            {type: GameObjectType.BARRIER, variation: 3, position: [[2,18],[4,15],[5,3],[8,5],[8,9],[8,13],[10,18],[11,14],[13,7],[13,11],[17,3],[17,18],[20,8],[20,12],[22,18],[23,8]]},
            
            {type: GameObjectType.BARRIER, variation: 3, position: [[0,14],[3,12],[5,14],[6,3],[6,17],[9,7],[9,15],[14,11],[16,13],[18,15],[20,18],[21,14]]},
            {type: GameObjectType.BARRIER, variation: 4, position: [[0,14],[3,12],[5,14],[6,3],[6,17],[9,7],[9,15],[14,11],[16,13],[18,15],[20,18],[21,14]]},
            
            {type: GameObjectType.BARRIER, variation: 1, position: [[0,12],[0,16],[6,5],[9,5],[9,11],[11,1],[11,9],[18,7],[21,5],[21,12],[23,10]]},
            {type: GameObjectType.BARRIER, variation: 4, position: [[0,12],[0,16],[6,5],[9,5],[9,11],[11,1],[11,9],[18,7],[21,5],[21,12],[23,10]]},
            
            {type: GameObjectType.BARRIER, variation: 3, position: [[15,5],[21,10]]},
            {type: GameObjectType.BARRIER, variation: 5, position: [[15,5],[21,10]]},
            
            {type: GameObjectType.BARRIER, variation: 6, position: [[6,1],[6,7],[9,13],[13,14],[14,7],[14,9],[15,19],[17,2],[20,1],[20,17],[21,8]]},
            {type: GameObjectType.BARRIER, variation: 4, position: [[6,1],[6,7],[9,13],[13,14],[14,7],[14,9],[15,19],[17,2],[20,1],[20,17],[21,8]]},
            
            {type: GameObjectType.BARRIER, variation: 5, position: [[6,15],[10,16],[13,13]]},
            {type: GameObjectType.BARRIER, variation: 1, position: [[6,15],[10,16],[13,13]]},
            
            {type: GameObjectType.BARRIER, variation: 2, position: [[3,5],[6,16],[8,3],[11,13],[20,5]]},
            {type: GameObjectType.BARRIER, variation: 6, position: [[3,5],[6,16],[8,3],[11,13],[20,5]]},
            
            {type: GameObjectType.EXPLANATION, variation: 2, position: [0,12], isClickable: true, story: [
                "Willkommen im Labyrinth!<br><br>" + 
                "Vor dir siehst du ein recht großes Labyrinth. Versuche zunächst, mit den Pfeiltasten ans andere Ende zu kommen.<br><br>"+
                "Wie gehst du vor? Probierst du einfach, den richtigen Weg zu finden oder hast du eine Strategie?",
                "Dein Avatar hat eine solche Strategie: Er wurde mit einem Algorithmus zur Wegefindung programmiert und kann so einen Weg zu Bodenfließen, Gegenständen oder eben durch das Labyrinth finden.<br><br>" + 
                "Probiere den Algorithmus aus, indem du auf einen anklickbaren Gegenstand am Ende des Labyrinths klickst."]},
             
            {type: GameObjectType.EXPLANATION, variation: 2, position: [23,5], isClickable: true, story: [
                "Jedes Problem hat seine eigene Lösung. Und für jede Lösung kann man auch einen passenden Algorithmus finden. (Auch wenn die Lösung je nach Problem anders aussieht oder die Lösung sogar ist, dass es keine Lösung gibt.)<br><br>" + 
                "An Sortierproblemen kann man gut sehen, wie unterschiedliche Algorithmen mit einem Problem umgehen.",
                "Auf dem Tisch findest du eine Waage. Versuche die Boxen zu sortieren. Wie viele Versuche brauchst du?<br><br>" +
                "Du kannst auch einen der Sortieralgorithmen verwenden, die du in den Videos an den Schränken kennen lernst. Bist du damit schneller?<br><br>Viel Spaß!"]},
        ],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.EXHIBITION_ID,13, 0], directionOnExit: Direction.DOWNRIGHT},
        ],
        NPCS: []
    },
    
    EXHIBITION_5: {
        ID: Settings.EXHIBITION_5_ID,
        NAME: "Robotik",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 10,
        WIDTH: 10,
        MAPELEMENTS: [
        ],
        OBJECTS: [            
            {type: GameObjectType.EXPLANATION, variation: 0, position: [2,0], isClickable: true, story: [
                "Roboter gibt es in den unterschiedlichsten Formen und Farben. Je nach Einsatzgebiet sind sie für unterschiedliche Aufgaben geeignet.",
                "Am KIT wird unter anderem an humanoiden Robotern geforscht, also Robotern, die dem Menschen ähneln. Wenn du mehr darüber wissen möchtest, unterhalte dich doch mit ARMAR IIIa oder ARMAR 6.",
                "Der kleine Roboter in der Mitte bringt dich ins Open Roberta Lab. Dort kannst du ganz einfach einen Roboter programmieren. Für einige Modelle gibt es auch Simulationsumgebungen, so dass du (auch ohne einen Roboter zu besitzen) siehst, wie dein Programm ausgeführt wird.",
                "Am KIT gibt es außerdem das Robot Learning Lab. Dort kannst du bequem von zu Hause aus einen Roboterarm am KIT bewegen. Schau dafür bei den beiden Computern vorbei."]},
            
            {type: GameObjectType.COUNTER, variation: 1, position: [3,0]},
            {type: GameObjectType.COUNTER, variation: 2, position: [[4,5,6,7,8],0]},
            {type: GameObjectType.COUNTER, variation:10, position: [9,0]},
            {type: GameObjectType.COUNTER, variation: 5, position: [9,[1,2,3,4,5]]},
            {type: GameObjectType.COUNTER, variation: 6, position: [9,6]},
            
            {type: GameObjectType.LEFTCOUNTERTOP, position: [3,0]},
            {type: GameObjectType.RIGHTCOUNTERTOP, position: [9,3]},
            {type: GameObjectType.TABLEDECORATION, variation: 24, position: [[6,0],[7,0],[9,5]]},
            {type: GameObjectType.TABLEDECORATION, variation: 17, position: [[9,1],[9,6]]},
            {type: GameObjectType.TABLEDECORATION, variation: 16, position: [9,2]},
            
            
            {type: GameObjectType.COUNTER, variation: 4, position: [0,7]},
            {type: GameObjectType.COUNTER, variation: 5, position: [0,8]},
            {type: GameObjectType.COUNTER, variation: 8, position: [0,9]},
            {type: GameObjectType.COUNTER, variation: 2, position: [1,9]},
            {type: GameObjectType.COUNTER, variation: 3, position: [2,9]},
            {type: GameObjectType.TABLEDECORATION, variation: 23, position: [0,8], isClickable: true, iFrameData: {title: "Das KUKA Robot Learning Lab am KIT", url: "https://www.youtube-nocookie.com/embed/mIP6MUoGlC4?rel=0&modestbranding=1&playlist=mIP6MUoGlC4,mg7xsTjYKpg", width: 800, height: 450 }},
            {type: GameObjectType.TABLEDECORATION, variation: 22, position: [1,9], isClickable: true, iFrameData: {title: "Das KUKA Robot Learning Lab am KIT", url: "https://rll.ipr.kit.edu/", width: 800, height: 450 }},
            
            {type: GameObjectType.FLOORDECORATION, variation: 5, position: [3,4], isClickable: true, iFrameData: {title: "Open Roberta Lab", url: "https://lab.open-roberta.org/", width: 800, height: 450 }},
            
        
        ],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.EXHIBITION_ID,14, 1], directionOnExit: Direction.DOWNLEFT},
        ],
        NPCS: [
            {name: "ARMAR IIIa", position: [6, 1], direction: Direction.UPLEFT, dialog: ["I-ICH BIN ARMAR IIIa",'<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/5x1G0nkSd9w" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>']},
            {name: "ARMAR 6", position: [8, 8], direction: Direction.DOWNLEFT, dialog: ["ICH B-BIN ARMAR 6",'<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/AYWtBlE0z7c" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>']},
        ]
    },
    
    LOUNGE: {
        ID: Settings.LOUNGE_ID,
        NAME: "Lounge",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 13,
        WIDTH: 15,
        MAPELEMENTS: [
            {type: GameObjectType.CONFERENCELOGO, position: [3, -1]}
        ],
        OBJECTS: [
            // Doors
            {type: GameObjectType.LEFTDOORICON, variation: 0, position: [1,0]},
            
            {type: GameObjectType.LEFTDOORICON, variation: 8, position: [10,0]},
            {type: GameObjectType.EXPLANATION, variation: 0, position: [11,0], isClickable: true, story: ["Workshop:<br><br><b>App-Entwicklung</b>"]},
            
            
            {type: GameObjectType.RIGHTDOORICON, variation: 9, position: [12,2]},
            {type: GameObjectType.EXPLANATION, variation: 1, position: [12,3], isClickable: true, story: ["<b>Science Camp Informatik</b>"]},
            
            {type: GameObjectType.RIGHTDOORICON, variation: 10, position: [12,9]},
            {type: GameObjectType.EXPLANATION, variation: 1, position: [12,10], isClickable: true, story: ["<b>Gamingarea</b>"]},
            
            // Chairs
            {type: GameObjectType.CHAIR, variation:  7, position: [ 3,[2,3,4,5,6,7]]},
            {type: GameObjectType.CHAIR, variation: 11, position: [ 5,[2,3,4,5,6,7]]},
            {type: GameObjectType.CHAIR, variation: 19, position: [ 7,[2,3,4,5,6,7]]},
            {type: GameObjectType.CHAIR, variation: 31, position: [ 9,[2,3,4,5,6,7]]},
            {type: GameObjectType.CHAIR, variation: 39, position: [11,[2,3,4,5,6,7]]},
            
            // Decoration
            {type: GameObjectType.FLOORDECORATION, variation: 2, position: [12,0]},
            
            {type: GameObjectType.FLOORDECORATION, variation: 2, position: [12,14]},
            {type: GameObjectType.DRINKS, variation: 2, position: [12,12]},
            
            {type: GameObjectType.SEATINGAREA, position: [ 2,10]},
            {type: GameObjectType.SEATINGAREA, position: [ 5,13]},
            {type: GameObjectType.SEATINGAREA, position: [ 9,11]},
            {type: GameObjectType.TABLEDECORATION, variation: 4, position: [ 2,10]},
            {type: GameObjectType.TABLEDECORATION, variation: 4, position: [ 5,13]},
            {type: GameObjectType.TABLEDECORATION, variation: 4, position: [ 9,11]},
        ],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.FOYER_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT},
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [10, -1], positionOnExit: [Settings.WS_APP_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT, isOpen: false},
            {wallSide: GlobalStrings.RIGHT, positionOfDoor: [13, 2], positionOnExit: [Settings.SC_INFO_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT, isOpen: false},
            {wallSide: GlobalStrings.RIGHT, positionOfDoor: [13, 9], positionOnExit: [Settings.GAMING_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT, isOpen: false},
        ],
        NPCS: []
    },
     
    GAMING: {
        ID: Settings.GAMING_ID,
        NAME: "Gamingarea",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 11,
        WIDTH: 8,
        MAPELEMENTS: [],
        OBJECTS: [   
            // Doors
            {type: GameObjectType.LEFTDOORICON, variation: 0, position: [1,0]},
            
            {type: GameObjectType.FLOORDECORATION, variation: 2, position: [0,0], isClickable: true, iFrameData: {title: "Station 1", url: "https://talk.lehr-lern-labor.info/Station1", width: 800, height: 450 }},
            {type: GameObjectType.FLOORDECORATION, variation: 2, position: [0,7], isClickable: true, iFrameData: {title: "Station 2", url: "https://talk.lehr-lern-labor.info/Station2", width: 800, height: 450 }},
            
            {type: GameObjectType.CARPET, variation: 0, position: [3,0], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 4, position: [4,0], isClickable: true, story: ["1","Wie viele Erbsen passen in ein leeres Glas?"]},
            {type: GameObjectType.CARPET, variation: 1, position: [5,0], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 6, position: [6,0], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 8, position: [7,0], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 4, position: [8,0], isClickable: true, story: ["7","Mit welchen Attributen bestimmt man die Höhe und Breite von Elementen auf einer Website?"]},
            {type: GameObjectType.CARPET, variation: 5, position: [9,0], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 7, position: [10,0], isClickable: true, story: ["15","Wofür steht die Abkürzung LLL?"]},
            {type: GameObjectType.CARPET, variation: 3, position: [3,1], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 1, position: [4,1], isClickable: true, story: ["12","Wie kann man JavaScript-Code in eine HTML-Datei einbetten?"]},
            {type: GameObjectType.CARPET, variation: 0, position: [5,1], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 4, position: [6,1], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 3, position: [7,1], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 2, position: [8,1], isClickable: true, story: ["5","Welches Märchen ist gemeint? Adlige in Wohngemeinschaft mit Bergarbeitern"]},
            {type: GameObjectType.CARPET, variation: 3, position: [9,1], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 2, position: [10,1], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 7, position: [3,2], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 2, position: [4,2], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 1, position: [5,2], isClickable: true, story: ["16","An welcher Uni befinden wir uns?"]},
            {type: GameObjectType.CARPET, variation: 0, position: [6,2], isClickable: true, story: ["20","Wofür steht die Abkürzung HTML?"]},
            {type: GameObjectType.CARPET, variation: 4, position: [7,2], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 6, position: [8,2], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 4, position: [9,2], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 8, position: [10,2], isClickable: true, story: ["8","Was ist eine Schleife?"]},
            {type: GameObjectType.CARPET, variation: 3, position: [3,3], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 1, position: [4,3], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 4, position: [5,3], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 7, position: [6,3], isClickable: true, story: ["11","Was bedeutet a++?"]},
            {type: GameObjectType.CARPET, variation: 0, position: [7,3], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 1, position: [8,3], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 5, position: [9,3], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 4, position: [10,3], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 8, position: [3,4], isClickable: true, story: ["3","Wer hat die meisten Halswirbel? Giraffe, Mensch oder Maus?"]},
            {type: GameObjectType.CARPET, variation: 6, position: [4,4], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 7, position: [5,4], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 5, position: [6,4], isClickable: true, story: ["9","Was bedeutet c < 3?"]},
            {type: GameObjectType.CARPET, variation: 1, position: [7,4], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 0, position: [8,4], isClickable: true, story: ["17","Wofür steht die Abkürzung KIT?"]},
            {type: GameObjectType.CARPET, variation: 3, position: [9,4], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 2, position: [10,4], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 5, position: [3,5], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 1, position: [4,5], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 0, position: [5,5], isClickable: true, story: ["6","Wie viele Milchzähne besitzt ein Erwachsener?"]},
            {type: GameObjectType.CARPET, variation: 7, position: [6,5], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 3, position: [7,5], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 6, position: [8,5], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 8, position: [9,5], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 4, position: [10,5], isClickable: true, story: ["13","Wie heißt der Vater eines Fohlens?"]},
            {type: GameObjectType.CARPET, variation: 1, position: [3,6], isClickable: true, story: ["18","Mit welchem HTML-Tag bindet man ein Bild ein?"]},
            {type: GameObjectType.CARPET, variation: 7, position: [4,6], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 4, position: [5,6], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 0, position: [6,6], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 2, position: [7,6], isClickable: true, story: ["2","Nenne 3 HTML-Tags."]},
            {type: GameObjectType.CARPET, variation: 8, position: [8,6], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 2, position: [9,6], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 3, position: [10,6], isClickable: true, story: ["14","Welche Farbe hat die Zipfelmütze von Papa-Schlumpf?"]},
            {type: GameObjectType.CARPET, variation: 6, position: [3,7], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 8, position: [4,7], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 1, position: [5,7], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 7, position: [6,7], isClickable: true, story: ["10","Wie heißt der Affe von Pippi Langstrumpf?"]},
            {type: GameObjectType.CARPET, variation: 3, position: [7,7], isClickable: true, story: ["19","Wofür steht der Selektor .foo?"]},
            {type: GameObjectType.CARPET, variation: 4, position: [8,7], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 0, position: [9,7], isClickable: true, story: ["X"]},
            {type: GameObjectType.CARPET, variation: 5, position: [10,7], isClickable: true, story: ["4","Um welche 3 Programmier- bzw. Skriptsprachen geht es im Science Camp InformatiK?"]},
        ],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.LOUNGE_ID, 12, 9], directionOnExit: Direction.DOWNLEFT},
        ],
        NPCS: []
    },
    
    // GAMING: {
        // ID: Settings.GAMING_ID,
        // NAME: "Gamingarea",
        // TYPE: TypeOfRoom.CUSTOM,
        // LENGTH: 11,
        // WIDTH: 11,
        // MAPELEMENTS: [],
        // OBJECTS: [   
            // // Doors
            // {type: GameObjectType.LEFTDOORICON, variation: 0, position: [1,0]},
            
            // {type: GameObjectType.CARPET, variation: 0, position: [[3,4,5,6,7,8,9,10],1]},
            // {type: GameObjectType.CARPET, variation: 0, position: [[3,4,5,6,7,8,9,10],2]},
            // {type: GameObjectType.CARPET, variation: 0, position: [[3,4,5,6,7,8,9,10],3]},
            // {type: GameObjectType.CARPET, variation: 2, position: [[3,4,5,6,7,8,9,10],4]},
            // {type: GameObjectType.CARPET, variation: 2, position: [[3,4,5,6,7,8,9,10],5]},
            // {type: GameObjectType.CARPET, variation: 2, position: [[3,4,5,6,7,8,9,10],6]},
            // {type: GameObjectType.CARPET, variation: 5, position: [[3,4,5,6,7,8,9,10],7]},
            // {type: GameObjectType.CARPET, variation: 5, position: [[3,4,5,6,7,8,9,10],8]},
            // {type: GameObjectType.CARPET, variation: 5, position: [[3,4,5,6,7,8,9,10],9]},
        // ],
        // DOORS: [
            // {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.LOUNGE_ID, 12, 9], directionOnExit: Direction.DOWNLEFT},
        // ],
        // NPCS: [
            // {name: "1", position: [10, 2], direction: Direction.DOWNLEFT, dialog: ["1"]},
            // {name: "2", position: [10, 5], direction: Direction.DOWNLEFT, dialog: ["2"]},
            // {name: "3", position: [10, 8], direction: Direction.DOWNLEFT, dialog: ["3"]},
        // ]
    // },
     
    WS_APP: {
        ID: Settings.WS_APP_ID,
        NAME: "App-Entwicklung",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 9,
        WIDTH: 10,
        MAPELEMENTS: [],
        OBJECTS: [            
            {type: GameObjectType.EXPLANATION, variation: 1, position: [8,2], isClickable: true, story: ["Spiele-App","Hier lernst du, wie man mithilfe eines Canvas eine eigene Spiele-App entwickelt."]},
            {type: GameObjectType.EXPLANATION, variation: 1, position: [8,5], isClickable: true, story: ["Urlaubshelfer","Hier lernst du am Beispiel eines Urlaubshelfers, worauf man bei der Entwicklung einer eigenen App achten muss."]},
        
            {type: GameObjectType.CUPBOARD, position: [ 3, 0], variation: 4, isClickable: true, iFrameData: {title: "Thunkable: Login und Vorschau", url: "https://www.youtube.com/embed/oJKgC9koLj4", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, position: [ 4, 0], variation: 2},
            {type: GameObjectType.CUPBOARD, position: [ 5, 0], variation: 3, isClickable: true, iFrameData: {title: "Thunkable: Nutzeroberfläche Design", url: "https://www.youtube.com/embed/ZlIFm6-2Ad4", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, position: [ 6, 0], variation: 2},
            {type: GameObjectType.CUPBOARD, position: [ 7, 0], variation: 4, isClickable: true, iFrameData: {title: "Thunkable: Nutzeroberfläche Programmierung", url: "https://www.youtube.com/embed/83UJ634oYpk", width: 800, height: 450 }},
			
            {type: GameObjectType.SEATINGAREA, position: [ 2, 3], isClickable: true, iFrameData: {title: "Appvorstellung", url: "https://www.youtube.com/embed/JYZtZWwigMc", width: 800, height: 450 }},
			{type: GameObjectType.TABLEDECORATION, position: [ 2, 3], variation: 15},
            
			{type: GameObjectType.SEATINGAREA, position: [3,8], isClickable: true, iFrameData: {title: "Ergebnisse", url: "https://media.lehr-lern-labor.info/collab/p/ErgebnissammlungGirlsDay?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TABLEDECORATION, position: [3,8], variation: 17},
			{type: GameObjectType.SEATINGAREA, position: [5,4], isClickable: true, iFrameData: {title: "Ergebnisse", url: "https://media.lehr-lern-labor.info/collab/p/ErgebnissammlungGirlsDay?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TABLEDECORATION, position: [5,4], variation: 17},
			{type: GameObjectType.SEATINGAREA, position: [7,7], isClickable: true, iFrameData: {title: "Ergebnisse", url: "https://media.lehr-lern-labor.info/collab/p/ErgebnissammlungGirlsDay?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TABLEDECORATION, position: [7,7], variation: 17}, 
        ],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.LOUNGE_ID, 10, 0], directionOnExit: Direction.DOWNRIGHT},
            {wallSide: GlobalStrings.RIGHT, positionOfDoor: [9, 1], positionOnExit: [Settings.WS_APP_1_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT},
            {wallSide: GlobalStrings.RIGHT, positionOfDoor: [9, 4], positionOnExit: [Settings.WS_APP_2_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT},
        ],
        NPCS: []
     },
     
    WS_APP_1: {
        ID: Settings.WS_APP_1_ID,
        NAME: "Spiele-App",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 6,
        WIDTH: 6,
        MAPELEMENTS: [],
        OBJECTS: [   
            {type: GameObjectType.EXPLANATION, variation: 0, position: [2,0], isClickable: true, story: ["An jedem Schrank und Regal gibt es ein Video. Das erste Video ist im Regal neben der Anleitung, danach geht es im Uhrzeigersinn weiter.","Die Videos bauen in der Regel nicht aufeinander auf, aber es macht Sinn die Reihenfolge ungefähr einzuhalten. <br><br><i>Du kannst dich schließlich noch nicht um ein Punktesystem kümmern, wenn in deinem Spiel noch nichts passiert...</i>"]},
			{type: GameObjectType.SEATINGAREA, position: [2,3], isClickable: true, iFrameData: {title: "Linksammlung", url: "https://media.lehr-lern-labor.info/collab/p/r.c315f0f3e1332774a48f51b019101c89?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.EXPLANATION, variation: 4, position: [2,3]},
			{type: GameObjectType.CUPBOARD, variation: 3, position: [ 3, 0], isClickable: true, iFrameData: {title: "Übersicht", url: "https://www.youtube.com/embed/H_j5OdGU-So", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 4, position: [ 4, 0], isClickable: true, iFrameData: {title: "Spielbeginn", url: "https://www.youtube.com/embed/NqJUlsVDeGM", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 15, position: [ 5, 0]},
            {type: GameObjectType.CUPBOARD, variation: 5, position: [ 5, 1], isClickable: true, iFrameData: {title: "Spiellogik", url: "https://www.youtube.com/embed/REdrQlD2BQg", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 6, position: [ 5, 2], isClickable: true, iFrameData: {title: "Interaktion", url: "https://www.youtube.com/embed/-rswoF26EYA", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 8, position: [ 5, 3], isClickable: true, iFrameData: {title: "Steuerung", url: "https://www.youtube.com/embed/0IJ--pKwLLE", width: 800, height: 450 }},
            {type: GameObjectType.SIDEBOARD, variation: 9, position: [ 5, 4]},
            {type: GameObjectType.SIDEBOARD, variation: 8, position: [ 5, 5]},
            
            {type: GameObjectType.FLOORDECORATION, variation:2, position: [0, 0]}
		],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.WS_APP_ID, 8, 1], directionOnExit: Direction.DOWNLEFT},
        ],
        NPCS: []
    },
     
    WS_APP_2: {
        ID: Settings.WS_APP_2_ID,
        NAME: "Urlaubshelfer",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 11,
        WIDTH: 8,
        MAPELEMENTS: [],
        OBJECTS: [            
            {type: GameObjectType.EXPLANATION, variation: 0, position: [2,0], isClickable: true, story: ["An jedem Schrank und Regal gibt es ein Video. Das erste Video ist im Regal neben der Anleitung, danach geht es im Uhrzeigersinn weiter. Die letzten beiden Videos sind Zusatzvideos, falls du dich für wietere Layout-Möglichkeiten interessierst.","Du kannst dir die Videos passend zu den von dir gewählten Modulen anschauen."]},
			{type: GameObjectType.SEATINGAREA, position: [5,4], isClickable: true, iFrameData: {title: "Linksammlung", url: "https://media.lehr-lern-labor.info/collab/p/r.62ffb72e85b0bae0ac3abade1cb854c0?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.EXPLANATION, variation: 4, position: [5,4], isSolid: true},
			{type: GameObjectType.CUPBOARD, variation: 3, position: [ 3, 0], isClickable: true, iFrameData: {title: "Übersicht", url: "https://www.youtube.com/embed/xanJap2i0j8", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 4, position: [ 4, 0], isClickable: true, iFrameData: {title: "Navigator", url: "https://www.youtube.com/embed/xma_2R2XkO0", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 3, position: [ 5, 0], isClickable: true, iFrameData: {title: "Icons", url: "https://www.youtube.com/embed/zwl9AqswzNM", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 0, position: [ 6, 0], isClickable: true, iFrameData: {title: "Übersetzer - Design", url: "https://www.youtube.com/embed/gIZybH9KaCY", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 1, position: [ 7, 0], isClickable: true, iFrameData: {title: "Übersetzer - Programm", url: "https://www.youtube.com/embed/6XWd9PcIu-M", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 0, position: [ 8, 0], isClickable: true, iFrameData: {title: "Packliste - Design", url: "https://www.youtube.com/embed/viPpKw8rQ-4", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 1, position: [ 9, 0], isClickable: true, iFrameData: {title: "Packliste - Programm", url: "https://www.youtube.com/embed/8Pnl0W-r7A4", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 15, position: [10, 0]},
            {type: GameObjectType.CUPBOARD, variation: 5, position: [10, 1], isClickable: true, iFrameData: {title: "Wetter - Design", url: "https://www.youtube.com/embed/SNnZ9rxJY1Y", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 6, position: [10, 2], isClickable: true, iFrameData: {title: "Wetter - Programm", url: "https://www.youtube.com/embed/xtpjEZIztVU", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 5, position: [10, 3], isClickable: true, iFrameData: {title: "Währungsrechner - Design", url: "https://www.youtube.com/embed/yJPLN_qBg7M", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 6, position: [10, 4], isClickable: true, iFrameData: {title: "Währungsrechner - Programm", url: "https://www.youtube.com/embed/5Q0lnhDFrXI", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 5, position: [10, 5], isClickable: true, iFrameData: {title: "Universal-Übersetzer - Design", url: "https://www.youtube.com/embed/u-6jJyV8c-4", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 6, position: [10, 6], isClickable: true, iFrameData: {title: "Universal-Übersetzer - Programm", url: "https://www.youtube.com/embed/Xmcp6XyEB9c", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 9, position: [10, 7], isClickable: true, iFrameData: {title: "Zusatz: Farben & Rahmen", url: "https://www.youtube.com/embed/KVm0rGnMSws", width: 800, height: 450 }},
			{type: GameObjectType.CUPBOARD, variation: 8, position: [10, 8], isClickable: true, iFrameData: {title: "Zusatz: Layout", url: "https://www.youtube.com/embed/N_fLrzpNSyc", width: 800, height: 450 }},
			{type: GameObjectType.FLOORDECORATION, variation:2, position: [0, 0]}
		
        ],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.WS_APP_ID, 8, 4], directionOnExit: Direction.DOWNLEFT},
        ],
        NPCS: []
     },
     
    SC_INFO: {
        ID: Settings.SC_INFO_ID,
        NAME: "Science Camp Informatik",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 10,
        WIDTH: 10,
        MAPELEMENTS: [
            {type: GameObjectType.RIGHTWINDOW, position: [[10, [6,7,8]]]},            
        ],
        OBJECTS: [   
            // Doors
            {type: GameObjectType.LEFTDOORICON, variation: 0, position: [1,0]},
            
            // Wochenplan
            {type: GameObjectType.EXPLANATION, position: [3,0], isClickable: true, story: [
                "<b>Montag</b><br><br>9 Uhr: Begrüßungsveranstaltung<br>15 Uhr: Meet-Up",
                "<b>Dienstag</b><br><br>ab 9 Uhr: neue Aufgaben<br>15 Uhr: Meet-Up",
                "<b>Mittwoch</b><br><br>9 Uhr: Studi-Café<br>15 Uhr: Meet-Up",
                "<b>Donnerstag</b><br><br>ab 9 Uhr: neue Aufgaben<br>15 Uhr: Meet-Up",
                "<b>Freitag</b><br><br>ab 9 Uhr: neue Aufgaben<br>15 Uhr: Abschlusspräsentation",
            ]},
            
            // Counter
            {type: GameObjectType.COUNTER, variation: 4, position: [0,6]},
            {type: GameObjectType.COUNTER, variation: 5, position: [0,7]},
            {type: GameObjectType.COUNTER, variation: 5, position: [0,8]},
            {type: GameObjectType.COUNTER, variation: 8, position: [0,9]},
            {type: GameObjectType.COUNTER, variation: 2, position: [1,9]},
            {type: GameObjectType.COUNTER, variation: 2, position: [2,9]},
            {type: GameObjectType.COUNTER, variation: 3, position: [3,9]},
            
            {type: GameObjectType.TABLEDECORATION, variation: 23, position: [0,7], isClickable: true, iFrameData: {title: "Linksammlung Science Camp Informatik", url: "https://media.lehr-lern-labor.info/collab/p/r.c94f2779adecc0d9be6553f505d350b3?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TABLEDECORATION, variation: 14, position: [2,9], isClickable: true, iFrameData: {title: "Website Science Camp", url: "https://media.lehr-lern-labor.info/workshops/scinfo/", width: 1000, height: 600 }},
            
            // Library
            {type: GameObjectType.CUPBOARD, variation: 3, position: [5,0], isClickable: true, iFrameData: {title: "Montag: Einführung & HTML", url: "https://www.youtube-nocookie.com/embed/U8xFYqEd6FE?rel=0&modestbranding=1&playlist=U8xFYqEd6FE,1Ckx4QT1KjA", width: 800, height: 450 }},
            {type: GameObjectType.CUPBOARD, variation: 4, position: [6,0], isClickable: true, iFrameData: {title: "Dienstag: CSS", url: "https://www.youtube-nocookie.com/embed/YO8ddOxEMpY?rel=0&modestbranding=1&playlist=YO8ddOxEMpY,tDrwQYFvdgU", width: 800, height: 450 }},
            {type: GameObjectType.CUPBOARD, variation: 0, position: [7,0]},
            {type: GameObjectType.CUPBOARD, variation: 1, position: [8,0]},
            {type: GameObjectType.CUPBOARD, variation:15, position: [9,0], isClickable: true, iFrameData: {title: "Mittwoch: Programmieren & Robotik", url: "https://www.youtube-nocookie.com/embed/hcvdmISCBHg?rel=0&modestbranding=1&playlist=hcvdmISCBHg,A3fvCWi8aKg,mIP6MUoGlC4,mg7xsTjYKpg", width: 800, height: 450 }},
            {type: GameObjectType.CUPBOARD, variation: 8, position: [9,1], isClickable: true, iFrameData: {title: "Donnerstag: JavaScript", url: "https://www.youtube-nocookie.com/embed/aZ08lPusehk?rel=0&modestbranding=1&playlist=aZ08lPusehk,lFhAOd5I3t4", width: 800, height: 450 }},
            {type: GameObjectType.CUPBOARD, variation: 5, position: [9,2]},
            {type: GameObjectType.CUPBOARD, variation: 6, position: [9,3]},
            {type: GameObjectType.CUPBOARD, variation: 7, position: [9,4]},
            
            // Seating
            {type: GameObjectType.SEATINGAREA, position: [7,7], isClickable: true, iFrameData: {title: "Feedback", url: "https://media.lehr-lern-labor.info/collab/p/SCinfo-Feedback?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TABLEDECORATION, variation: 4, position: [7,7]},
            
            
        ],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [1, -1], positionOnExit: [Settings.LOUNGE_ID, 12, 2], directionOnExit: Direction.DOWNLEFT},
        ],
        NPCS: []
    },
})

if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = Floorplan;
}
