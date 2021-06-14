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
            {type: GameObjectType.BARRIER, variation: 3, position: [[3,5],0]},
            {type: GameObjectType.CARPET, variation: 7, position: [4,0]},
            
            {type: GameObjectType.EXPLANATION, variation: 0, position: [2,0], isClickable: true, story: ["Hier geht es zu den Workshops.", "Wenn du dich für einen Workshop angemeldet hast, hast du ein Passwort bekommen. Damit kannst du eintreten.","Andernfalls wird die Türe rechtzeitig geöffnet."]},
            
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
            // Themenräume
            {type: GameObjectType.EXPLANATION, variation: 0, position: [ 5,0], isClickable: true, story: ["Das Binärsystem", "In diesem Raum erfährst du, wie ein Computer rechnet."]},
            {type: GameObjectType.EXPLANATION, variation: 0, position: [ 8,0], isClickable: true, story: ["Logik", "In diesem Raum kannst du Rätsel lösen und einen eigenen Computer bauen."]},
            {type: GameObjectType.EXPLANATION, variation: 0, position: [11,0], isClickable: true, story: ["Programmieren", "In diesem Raum geht es um Prgorammieren und wie du lernen kannst zu programmieren."]},
        
            // Grüner Teppich
            {type: GameObjectType.BARRIER, variation: 3, position: [[9,11],0]},
            {type: GameObjectType.CARPET, variation: 7, position: [10,0]},
            
            // Sitzbereiche
            {type: GameObjectType.SEATINGAREA, position: [4,12]},
            {type: GameObjectType.TABLEDECORATION, position: [4,12], variation: 4},
            {type: GameObjectType.SEATINGAREA, position: [5,4]},
            {type: GameObjectType.TABLEDECORATION, position: [5,4], variation: 14, isClickable:true, iFrameData: {title: "FAQ", url: "https://media.lehr-lern-labor.info/collab/p/FAQ?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.SEATINGAREA, position: [8,8]},
            {type: GameObjectType.TABLEDECORATION, position: [8,8], variation: 3},
            
        ],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [ 1, -1], positionOnExit: [Settings.FOYER_ID, 4, 0], directionOnExit: Direction.DOWNRIGHT},
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [ 4, -1], positionOnExit: [Settings.EXHIBITION_1_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT},
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [ 7, -1], positionOnExit: [Settings.EXHIBITION_2_ID, 5, 0], directionOnExit: Direction.DOWNRIGHT},
            {wallSide: GlobalStrings.LEFT, positionOfDoor: [10, -1], positionOnExit: [Settings.EXHIBITION_3_ID, 1, 0], directionOnExit: Direction.DOWNRIGHT},
        ],
        NPCS: [
            {name: FloorplanConstants.NPCNAMES.exhibit, position: [10, 2], direction: Direction.DOWNRIGHT, dialog: NPCDialog.kit21Dialog},
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
            {type: GameObjectType.EXPLANATION, variation: 2, position: [2,4], isClickable: true, story: [
                "Computer können nicht selbst denken. Aber trotzdem sind sie auf ein paar Gebieten besser als ein Mensch, z.B. wenn es darum geht, schnell zu rechnen.<br><br>Aber wie geht das?", 
                "In diesem Raum erfährst du, wie ein Computer rechnet - und zwar mit nur zwei Zuständen: Strom an und Strom aus bzw. 1 und 0.",
                "An den vorderen Tischen lernst du die Grundlagen und an den hinteren Tischen kannst du dein neues Wissen testen. <br><br>Viel Spaß!"]},
        
            {type: GameObjectType.COMPUTER, position: [3, 1], isClickable: true, iFrameData: {title: "Das Binärsystem", url: "https://www.youtube.com/embed/T8pt_GhohQs", width: 800, height: 450 }},
            {type: GameObjectType.COMPUTER, position: [3, 4], isClickable: true, iFrameData: {title: "Rechnen mit Strom", url: "https://www.youtube.com/embed/9l-l_dD6qPQ", width: 800, height: 450 }},
            {type: GameObjectType.COMPUTER, position: [6, 1], isClickable: true, iFrameData: {title: "Rechnen mit Dualzahlen", url: "https://www.youtube.com/embed/2YJxC_FwBLE", width: 800, height: 450 }},
            {type: GameObjectType.COMPUTER, position: [6, 4], isClickable: true, iFrameData: {title: "Welche Stellen werden benötigt? Klicke dann auf die gelbe Zahl.", url: "https://media.lehr-lern-labor.info/workshops/binary/", width: 600, height: 300 }},
            {type: GameObjectType.COMPUTER, position: [9, 1], isClickable: true, iFrameData: {title: "Korrigiere den Fehler!", url: "https://media.lehr-lern-labor.info/workshops/binary1/", width: 800, height: 400 }},
            {type: GameObjectType.COMPUTER, position: [9, 4], isClickable: true, iFrameData: {title: "Berechne.", url: "https://media.lehr-lern-labor.info/workshops/binary2/", width: 600, height: 500 }},
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
            {type: GameObjectType.EXPLANATION, variation: 2, position: [8,2], isClickable: true, story: [
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
            {type: GameObjectType.EXPLANATION, variation: 3, position: [8,8], isClickable: true, story: [
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
            {type: GameObjectType.SIDEBOARD, position: [ 0, 7], variation: 11, isClickable: true, iFrameData: {title: "Nandgame", url: "https://nandgame.com/", width: 800, height: 450 }},
            
            {type: GameObjectType.SEATINGAREA, position: [2,8], variation: 0},
            {type: GameObjectType.EXPLANATION, variation: 3, position: [2,8], isClickable: true, story: [
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
            {type: GameObjectType.SIDEBOARD, position: [ 2, 0], variation:  3, isClickable: true, iFrameData: {title: "Logikrätsel", url: "https://media.lehr-lern-labor.info/collab/p/Logik?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 800, height: 450 }},
            {type: GameObjectType.SIDEBOARD, position: [ 3, 0], variation:  4},
            
            {type: GameObjectType.SEATINGAREA, position: [2,2], variation: 0},
            {type: GameObjectType.EXPLANATION, variation: 3, position: [2,2], isClickable: true, story: [
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
            {type: GameObjectType.EXPLANATION, variation: 0, position: [11,0], isClickable: true, story: ["App-Entwicklung"]},
            {type: GameObjectType.FLOORDECORATION, variation: 2, position: [12,0]},
            
            {type: GameObjectType.FLOORDECORATION, variation: 2, position: [12,14]},
            {type: GameObjectType.DRINKS, variation: 2, position: [12,12]},
            
            {type: GameObjectType.CHAIR, variation:  7, position: [ 3,[2,3,4,5,6,7]]},
            {type: GameObjectType.CHAIR, variation: 11, position: [ 5,[2,3,4,5,6,7]]},
            {type: GameObjectType.CHAIR, variation: 19, position: [ 7,[2,3,4,5,6,7]]},
            {type: GameObjectType.CHAIR, variation: 31, position: [ 9,[2,3,4,5,6,7]]},
            {type: GameObjectType.CHAIR, variation: 39, position: [11,[2,3,4,5,6,7]]},
            
            
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
        ],
        NPCS: []
     },
     
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
            {type: GameObjectType.EXPLANATION, variation: 3, position: [2,3]},
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
            {type: GameObjectType.EXPLANATION, variation: 3, position: [5,4], isSolid: true},
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
})

if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = Floorplan;
}
