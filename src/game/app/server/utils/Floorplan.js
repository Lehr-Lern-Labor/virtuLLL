const Direction = require('../../client/shared/Direction');
const GameObjectType = require('../../client/shared/GameObjectType');
const GlobalStrings = require('../../client/shared/GlobalStrings');
const TypeOfRoom = require('../../client/shared/TypeOfRoom');
const DoorClosedMessages = require('./messages/DoorClosedMessages');
const NPCDialog = require('./NPCDialog');
const Settings = require('./Settings');

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
    
	
    EINGANGSHALLE: {
		ID: Settings.RECEPTION_ID,
		NAME: "Eingangshalle",
		TYPE: TypeOfRoom.CUSTOM,
		LENGTH: 16,
		WIDTH: 15,
		MAPELEMENTS: [
            {type: GameObjectType.RIGHTWINDOW, position: [[16, [6,7,8]]]},
            {type: GameObjectType.CONFERENCELOGO, position: [6, -1]}
		],
		OBJECTS: [
            {type: GameObjectType.RECEPTIONCOUNTER, position: [13, 4],  isClickable: true, story: ["Klicke auf die Bodenfliese unter " + FloorplanConstants.NPCNAMES.tutorial + ". Er erklärt dir, was du tun kannst.","Auf geht's! <br>Herbert wartet auf dich!"]},
            {type: GameObjectType.PLANT, position: [[15, 0], [15, 14]]},
            {type: GameObjectType.SMALLTABLE, position: [4,14], isClickable: true, iFrameData: {title: "Das Lehr-Lern-Labor Informatik Karlsruhe", url: "https://media.lehr-lern-labor.info/home/", width: 1000, height: 600 }},
            {type: GameObjectType.SMALLTABLE, position: [0,10], isClickable: true, iFrameData: {title: "Gästebuch", url: "https://media.lehr-lern-labor.info/collab/p/GuestBook?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TEA, position: [4, 14]},
            {type: GameObjectType.CHAIR, variation: 1, position: [[1,2,3],14]},
            {type: GameObjectType.CHAIR, variation: 3, position: [0,[11,12,13]]},
            {type: GameObjectType.PLANT, position: [4, 0], isClickable: true, story: ["Wenn der Workshop losgeht, darfst du eintreten.","Du musst dich noch ein bisschen gedulden.","Moderatoren haben einen Schlüssel."]},
        ],
		DOORS: [
		    {wallSide: GlobalStrings.LEFT, logo: GlobalStrings.RECEPTION,  positionOfDoor: [2, -1], positionOnExit: [1, 15, 2], directionOnExit: Direction.DOWNLEFT, isOpen: false, closedMessage: DoorClosedMessages.FIRSTDOORCLOSED }
		],
		NPCS: [
			{name: FloorplanConstants.NPCNAMES.tutorial, position: [14, 7], direction: Direction.DOWNLEFT, dialog: NPCDialog.basicTutorialDialog},
		]
	},
	
	THUMBNAIL: {
		ID: Settings.THUMBNAIL_ID,
		NAME: "Virtuelles Lehr-Lern-Labor Informatik",
		TYPE: TypeOfRoom.CUSTOM,
		LENGTH: 15,
		WIDTH: 15,
		MAPELEMENTS: [],
		OBJECTS: [
        ],
		DOORS: [
			{wallSide: GlobalStrings.LEFT, logo: GlobalStrings.RECEPTION,  positionOfDoor: [2, -1], positionOnExit: [Settings.BEISPIEL_ID, 2, 0], directionOnExit: Direction.DOWNRIGHT, isOpen: true }
		],
		NPCS: []
	},
	
	BEISPIEL: {
		ID: Settings.BEISPIEL_ID,
		NAME: "Beispiele",
		TYPE: TypeOfRoom.CUSTOM,
		LENGTH: 5,
		WIDTH: 5,
		MAPELEMENTS: [],
		OBJECTS: [
            {type: GameObjectType.SMALLTABLE, position: [0, 4], isClickable: true, iFrameData: {title: "Exponate", url: "https://media.lehr-lern-labor.info/workshops/binary/", width: 600, height: 300 }},
            {type: GameObjectType.SMALLTABLE, position: [0, 3], isClickable: true, iFrameData: {title: "Video", url: "https://www.youtube.com/embed/1Ckx4QT1KjA", width: 800, height: 450 }},
            {type: GameObjectType.SMALLTABLE, position: [0, 1], isClickable: true, iFrameData: {title: "Etherpad", url: "https://media.lehr-lern-labor.info/collab/p/ErgebnissammlungGirlsDay?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TEA, position: [0, 1]},
        ],
		DOORS: [
			{wallSide: GlobalStrings.LEFT, logo: GlobalStrings.RECEPTION,  positionOfDoor: [2, -1], positionOnExit: [Settings.THUMBNAIL_ID, 2, 0], directionOnExit: Direction.DOWNRIGHT, isOpen: true }
		],
		NPCS: []
	},
	
	LOUNGE: {
		ID: 1,
        NAME: "Lounge",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 16,
        WIDTH: 15,
		
		MAPELEMENTS: [
            {type: GameObjectType.RIGHTWINDOW, position: [[16, 11], [16, 9], [16, 10]]},
			{type: GameObjectType.CONFERENCELOGO, position: [7, -1]},
        ],
		OBJECTS: [
			{type: GameObjectType.SMALLTABLE, position: [13, 0], isClickable: true, iFrameData: {title: "Thunkable: Login und Vorschau", url: "https://www.youtube.com/embed/oJKgC9koLj4", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [11, 0], isClickable: true, iFrameData: {title: "Thunkable: Nutzeroberfläche Design", url: "https://www.youtube.com/embed/ZlIFm6-2Ad4", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [9, 0], isClickable: true, iFrameData: {title: "Thunkable: Nutzeroberfläche Programmierung", url: "https://www.youtube.com/embed/83UJ634oYpk", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [7, 0], isClickable: true, iFrameData: {title: "Appvorstellung", url: "https://www.youtube.com/embed/JYZtZWwigMc", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [15, 10], isClickable: true, iFrameData: {title: "Ergebnisse", url: "https://media.lehr-lern-labor.info/collab/p/ErgebnissammlungGirlsDay?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
			{type: GameObjectType.TEA, position: [15, 10]},
            {type: GameObjectType.SMALLTABLE, position: [2, [7, 12]]},
			{type: GameObjectType.SMALLTABLE, position: [7, [7, 12]]},
			{type: GameObjectType.SOFA, position: [[1, 2, 3, 6, 7, 8], 5], variation: 0},
			{type: GameObjectType.SOFA, position: [[1, 2, 3, 6, 7, 8], 10], variation: 0},
			{type: GameObjectType.SOFA, position: [4, [6, 7, 8, 11, 12, 13]], variation: 1},
			{type: GameObjectType.SOFA, position: [9, [6, 7, 8, 11, 12, 13]], variation: 1},
			{type: GameObjectType.TEA, position: [2, [7, 12]]},
			{type: GameObjectType.TEA, position: [7, [7, 12]]},
			{type: GameObjectType.DRINKS, position: [15, 7]},
			{type: GameObjectType.PLANT, position: [[15, 5], [15, 14]]}
		],	
		DOORS: [ 
            {wallSide: GlobalStrings.LEFT, logo: GlobalStrings.RECEPTION,  positionOfDoor: [1, -1], positionOnExit: [2, 4, 0], directionOnExit: Direction.DOWNRIGHT},
			{wallSide: GlobalStrings.LEFT, logo: GlobalStrings.RECEPTION,  positionOfDoor: [4, -1], positionOnExit: [3, 4, 0], directionOnExit: Direction.DOWNRIGHT},
			{wallSide: GlobalStrings.RIGHT, logo: GlobalStrings.RECEPTION,  positionOfDoor: [16, 2], positionOnExit: [0, 2, 0], directionOnExit: Direction.DOWNRIGHT}
        ],
        NPCS: [
            {name: "Spiele-App", position: [0, 0], direction: Direction.DOWNRIGHT, dialog: ["Zur Spiele-App","Hier lernst du, wie man mithilfe eines Canvas eine eigene Spiele-App entwickelt."]},
			{name: "Urlaubshelfer", position: [5, 0], direction: Direction.DOWNRIGHT, dialog: ["Zur Urlaubshelfer-App","Hier lernst du am Beispiel eines Urlaubshelfers, worauf man bei der Entwicklung einer eigenen App achten muss."]},
        ]
	},
	
	WORKSHOP_1: {
		ID: 2,
        NAME: "Spiele-App",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 15,
        WIDTH: 15,
		
		MAPELEMENTS: [
            {type: GameObjectType.RIGHTWINDOW, position: [15, [2, 3, 4, 6, 7, 8, 10, 11, 12]]},
            {type: GameObjectType.CONFERENCELOGO, position: [7, -1]},
        ],
		OBJECTS: [
			{type: GameObjectType.CHAIR, variation: 3, position: [1, 2]},
			{type: GameObjectType.SMALLTABLE, position: [2, 2], isClickable: true, iFrameData: {title: "Linksammlung", url: "https://media.lehr-lern-labor.info/collab/p/r.c315f0f3e1332774a48f51b019101c89?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TEA, position: [2, 2], isClickable: false},		
			{type: GameObjectType.SMALLTABLE, position: [13, 1], isClickable: true, iFrameData: {title: "Übersicht", url: "https://www.youtube.com/embed/H_j5OdGU-So", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [13, 5], isClickable: true, iFrameData: {title: "Spielbeginn", url: "https://www.youtube.com/embed/NqJUlsVDeGM", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [13, 9], isClickable: true, iFrameData: {title: "Spiellogik", url: "https://www.youtube.com/embed/REdrQlD2BQg", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [13, 13], isClickable: true, iFrameData: {title: "Interaktion", url: "https://www.youtube.com/embed/-rswoF26EYA", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [9, 13], isClickable: true, iFrameData: {title: "Steuerung", url: "https://www.youtube.com/embed/0IJ--pKwLLE", width: 800, height: 450 }},
			{type: GameObjectType.PLANT, position: [[0, 0], [14, 0], [0, 14], [14, 14]]}
		],
		DOORS: [ 
			{wallSide: GlobalStrings.LEFT, logo: GlobalStrings.RECEPTION,  positionOfDoor: [4, -1], positionOnExit: [1, 1, 0], directionOnExit: Direction.DOWNRIGHT}
		],
		NPCS: [
			{name: "Spiele-App", position: [2, 1], direction: Direction.DOWNRIGHT, dialog: ["An jedem Tisch gibt es ein Video. Das erste Video ist am Tisch oben vor dem Logo, danach geht es im Uhrzeigersinn weiter.","Die Videos bauen in der Regel nicht aufeinander auf, aber es macht Sinn die Reihenfolge ungefähr einzuhalten. <br><br><i>Du kannst dich schließlich noch nicht um ein Punktesystem kümmern, wenn in deinem Spiel noch nichts passiert...</i>"]},
        ]
	},
	
	WORKSHOP_2: {
		ID: 3,
        NAME: "Urlaubshelfer",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 15,
        WIDTH: 15,
		
		MAPELEMENTS: [
            {type: GameObjectType.RIGHTWINDOW, position: [15, [2, 3, 4, 6, 7, 8, 10, 11, 12]]},
            {type: GameObjectType.CONFERENCELOGO, position: [7, -1]},
        ],
		OBJECTS: [
			{type: GameObjectType.CHAIR, variation: 3, position: [1, 2]},
			{type: GameObjectType.SMALLTABLE, position: [2, 2], isClickable: true, iFrameData: {title: "Linksammlung", url: "https://media.lehr-lern-labor.info/collab/p/r.62ffb72e85b0bae0ac3abade1cb854c0?showControls=false&showChat=false&showLineNumbers=false&useMonospaceFont=false&noColors=true&chatAndUsers=false", width: 1000, height: 600 }},
            {type: GameObjectType.TEA, position: [2, 2]},		
			{type: GameObjectType.SMALLTABLE, position: [7, 1], isClickable: true, iFrameData: {title: "Übersicht", url: "https://www.youtube.com/embed/xanJap2i0j8", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [10, 1], isClickable: true, iFrameData: {title: "Navigator", url: "https://www.youtube.com/embed/xma_2R2XkO0", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [13, 1], isClickable: true, iFrameData: {title: "Icons", url: "https://www.youtube.com/embed/zwl9AqswzNM", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [13, 4], isClickable: true, iFrameData: {title: "Übersetzer - Design", url: "https://www.youtube.com/embed/gIZybH9KaCY", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [13, 5], isClickable: true, iFrameData: {title: "Übersetzer - Programm", url: "https://www.youtube.com/embed/6XWd9PcIu-M", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [13, 8], isClickable: true, iFrameData: {title: "Packliste - Design", url: "https://www.youtube.com/embed/viPpKw8rQ-4", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [13, 9], isClickable: true, iFrameData: {title: "Packliste - Programm", url: "https://www.youtube.com/embed/8Pnl0W-r7A4", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [13, 12], isClickable: true, iFrameData: {title: "Wetter - Design", url: "https://www.youtube.com/embed/SNnZ9rxJY1Y", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [13, 13], isClickable: true, iFrameData: {title: "Wetter - Programm", url: "https://www.youtube.com/embed/xtpjEZIztVU", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [10, 13], isClickable: true, iFrameData: {title: "Währungsrechner - Design", url: "https://www.youtube.com/embed/yJPLN_qBg7M", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [9, 13], isClickable: true, iFrameData: {title: "Währungsrechner - Programm", url: "https://www.youtube.com/embed/5Q0lnhDFrXI", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [6, 13], isClickable: true, iFrameData: {title: "Universal-Übersetzer - Design", url: "https://www.youtube.com/embed/u-6jJyV8c-4", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [5, 13], isClickable: true, iFrameData: {title: "Universal-Übersetzer - Programm", url: "https://www.youtube.com/embed/Xmcp6XyEB9c", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [2, 8], isClickable: true, iFrameData: {title: "Zusatz: Farben & Rahmen", url: "https://www.youtube.com/embed/KVm0rGnMSws", width: 800, height: 450 }},
			{type: GameObjectType.SMALLTABLE, position: [2, 5], isClickable: true, iFrameData: {title: "Zusatz: Layout", url: "https://www.youtube.com/embed/N_fLrzpNSyc", width: 800, height: 450 }},
			{type: GameObjectType.PLANT, position: [[0, 0], [14, 0], [0, 14], [14, 14]]}
		],
		DOORS: [ 
			{wallSide: GlobalStrings.LEFT, logo: GlobalStrings.RECEPTION,  positionOfDoor: [4, -1], positionOnExit: [1, 4, 0], directionOnExit: Direction.DOWNRIGHT}
		],
		NPCS: [
			{name: "Urlaubshelfer", position: [2, 1], direction: Direction.DOWNRIGHT, dialog: ["An jedem Tisch gibt es ein Video. Das erste Video ist am Tisch links vor dem Logo, danach geht es im Uhrzeigersinn weiter. Die letzten beiden Videos sind Zusatzvideos, falls du dich für wietere Layout-Möglichkeiten interessierst.","Du kannst dir die Videos passend zu den von dir gewählten Modulen anschauen."]},
		]
	},

/*    RECEPTION: {
        ID: Settings.RECEPTION_ID, 
        NAME: "Reception",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 13, 
        WIDTH: 13, 
        MAPELEMENTS: [
            {type: GameObjectType.RIGHTWINDOW, position: [[13, 5], [13, 6], [13, 7]]},
            {type: GameObjectType.CONFERENCELOGO, position: [5, -1]}
        ],
        OBJECTS: [
            {type: GameObjectType.RECEPTIONCOUNTER, position: [10, 3],  isClickable: true, iFrameData: {title: "KIT", url: "https://www.kit.edu/", width: 750, height: 500 }},
            {type: GameObjectType.PLANT, position: [[12, 0], [12, 12]]}
        ],
        DOORS: [ 
            {wallSide: GlobalStrings.LEFT, logo: GlobalStrings.FOYER,  positionOfDoor: [2, -1], positionOnExit: [Settings.FOYER_ID, 24, 21], directionOnExit: Direction.DOWNLEFT, isOpen: false, closedMessage: DoorClosedMessages.FIRSTDOORCLOSED }
        ],
        NPCS: [
            {name: FloorplanConstants.NPCNAMES.tutorial, position: [11, 6], direction: Direction.DOWNLEFT, dialog: NPCDialog.basicTutorialDialog}
        ]
    },

    FOYER: {
        ID: Settings.FOYER_ID,
        NAME: "Foyer",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 25,
        WIDTH: 25,
        MAPELEMENTS: [
            {type: GameObjectType.LEFTSCHEDULE, position: [5, -1], isClickable: Settings.VIDEOSTORAGE_ACTIVATED},
            {type: GameObjectType.LEFTWINDOW, position: [[22, -1], [23, -1], [24, -1]]},
            {type: GameObjectType.RIGHTWINDOW, position: [[25, 0], [25, 1], [25, 2], [25, 3], [25, 4], [25, 5], [25, 23]]},
            {type: GameObjectType.CONFERENCELOGO, position: [13, -1]},
            {type: GameObjectType.PICTUREFRAME, position: [25, 14]}
        ],
        OBJECTS: [
            {type: GameObjectType.PLANT, position: [24, 0], isClickable: true, story: ["I'm a plant.", "Please do not touch me.", "My precious leaves!"]},
            {type: GameObjectType.SOFA, position: [[22, 0], [23, 0]], variation: 0},
            {type: GameObjectType.SOFA, position: [24, [1, 2, 3, 4, 5]], variation: 1}
        ],
        DOORS: [
            {wallSide: GlobalStrings.RIGHT, logo: GlobalStrings.FOODCOURT,  positionOfDoor: [25, 9], positionOnExit: [Settings.FOODCOURT_ID, 2, 0], directionOnExit: Direction.DOWNRIGHT, isOpen: true},
            {wallSide: GlobalStrings.RIGHT, logo: GlobalStrings.RECEPTION,  positionOfDoor: [25, 21], positionOnExit: [Settings.RECEPTION_ID, 2, 0], directionOnExit: Direction.DOWNRIGHT, isOpen: true}
        ],
        LECTUREDOORS: [
            {wallSide: GlobalStrings.LEFT, logo: GlobalStrings.LECTURE, positionOfDoor: [2, -1]}
        ],
        NPCS: [
            {name: FloorplanConstants.NPCNAMES.foyer, position: [0, 0], direction: Direction.DOWNRIGHT, dialog: NPCDialog.foyerHelperDialog}
        ]
    },

    FOODCOURT: {
        ID: Settings.FOODCOURT_ID,
        NAME: "Food Court",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 19,
        WIDTH: 19,   
        MAPELEMENTS: [
            {type: GameObjectType.RIGHTWINDOW, position: [[19, 3], [19, 4], [19, 14], [19, 15]]},
            {type: GameObjectType.CONFERENCELOGO, position: [8, -1]},
        ],
        OBJECTS: [
            {type: GameObjectType.CANTEENCOUNTER, position: [17, 8]},
            {type: GameObjectType.CHAIR, variation: 0, position: [[2, 7, 12], 15]},
            {type: GameObjectType.CHAIR, variation: 1, position: [[2, 7, 12], 17]},
            {type: GameObjectType.CHAIR, variation: 2, position: [
                [3, [3, 4, 5, 9, 10, 11, 16]], 
                [8, [3, 4, 5, 9, 10, 11, 16]], 
                [13, [3, 4, 5, 9, 10, 11, 16]]
            ]},
            {type: GameObjectType.CHAIR, variation: 3, position: [
                [1, [3, 4, 5, 9, 10, 11, 16]], 
                [6, [3, 4, 5, 9, 10, 11, 16]], 
                [11, [3, 4, 5, 9, 10, 11, 16]]
            ]},
            {type: GameObjectType.LARGETABLE, position: [
                [2, [3, 9]], 
                [7, [3, 9]], 
                [12, [3, 9]]
            ]},
            {type: GameObjectType.SMALLTABLE, position: [[2, 16], [7, 16], [12, 16]]},
            {type: GameObjectType.SMALLFOOD, variation: 1, position: [[2, 10], [7, 9], [12, [4, 10]]]},
            {type: GameObjectType.SMALLFOOD, variation: 2, position: [[2, 5], [12, 3]]},
            {type: GameObjectType.SMALLFOOD, variation: 3, position: [[7, 4], [12, 9]]},
            {type: GameObjectType.DRINKS, position: [18, 0]},
            {type: GameObjectType.TEA, position: [[2, 11], [7, [3, 11, 16]], [12, 16]]}
        ],
        DOORS: [
            {wallSide: GlobalStrings.LEFT, logo: GlobalStrings.FOYER,  positionOfDoor: [2, -1], positionOnExit: [Settings.FOYER_ID, 24, 9], directionOnExit: Direction.DOWNLEFT, isOpen: false, closedMessage: DoorClosedMessages.FOODCOURTDOORCLOSED},
            {wallSide: GlobalStrings.RIGHT,  positionOfDoor: [19, 17], positionOnExit: [Settings.ESCAPEROOM_ID, 14, 15], directionOnExit: Direction.DOWNLEFT, isOpen: false, codeToOpen: "42"}
        ],
        NPCS: [
            {name: FloorplanConstants.NPCNAMES.food, position: [18, 9], direction: Direction.DOWNLEFT, dialog: NPCDialog.chefDialog}
        ]
    },

    ESCAPEROOM: {
        ID: Settings.ESCAPEROOM_ID,
        NAME: "Escape Room",
        TYPE: TypeOfRoom.CUSTOM,
        LENGTH: 15,
        WIDTH: 20,
        MAPELEMENTS: [],
        OBJECTS: [
            {type: GameObjectType.PLANT, position: [[14, 0], [14, 19]]},
            {type: GameObjectType.PLANT, position: [0, 2], isClickable: true, iFrameData: {title: "KIT", url: "https://www.kit.edu/", width: 750, height: 500 }},
            {type: GameObjectType.SMALLTABLE, position: [0, 0], isClickable: true, iFrameData: {title: "Binary", url: "https://media.lehr-lern-labor.info/workshops/binary/", width: 600, height: 300 }},
            {type: GameObjectType.SMALLTABLE, position: [0, 1]},
            {type: GameObjectType.TEA, position: [0, 1], isClickable: true, iFrameData: {title: "KIT", url: "https://www.kit.edu/", width: 750, height: 500 }},
            {type: GameObjectType.SOFA, variation: 1, position: [0, 3], isClickable: true, iFrameData: {title: "KIT", url: "https://www.kit.edu/", width: 750, height: 500 }},
            {type: GameObjectType.SMALLTABLE, position: [0, 4], isClickable: true, iFrameData: {title: "Table Video", url: "https://www.youtube.com/embed/x51zMg7roIs", width: 768, height: 432 }}
        ],
        DOORS: [
            {wallSide: GlobalStrings.RIGHT,  positionOfDoor: [15, 15], positionOnExit: [Settings.FOODCOURT_ID, 18, 17], directionOnExit: Direction.DOWNLEFT, isOpen: true}
        ],
        NPCS: []
    }
*/
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
    /**                 | wall.                       |                      **/
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