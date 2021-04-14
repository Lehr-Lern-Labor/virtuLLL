const TypeChecker = require('../../client/shared/TypeChecker.js');
const TypeOfRoom = require('../../client/shared/TypeOfRoom.js');
const AssetPaths = require('../../client/shared/AssetPaths.js');
const Room = require('../models/Room.js');
const GameObjectService = require('../services/GameObjectService.js');
const Settings = require('../utils/ServerSettings.js');
const DoorService = require('../services/DoorService.js');
const Position = require('./Position.js');
const NPCService = require('../services/NPCService.js');
const ReceptionRoomDecorator = require('./ReceptionRoomDecorator.js');
const FoyerRoomDecorator = require('./FoyerRoomDecorator.js');
const FoodcourtRoomDecorator = require('./FoodcourtRoomDecorator.js');
const EscapeRoomDecorator = require('./EscapeRoomDecorator.js');
const GameObjectType = require('../../client/shared/GameObjectType.js');
const GlobalStrings = require('../../client/shared/GlobalStrings.js');
const RoomDimensions = require('../utils/RoomDimensions.js');
const GameObjectInfo = require('../../client/shared/GameObjectInfo.js');

/**
 * 
 */
module.exports = class RoomFactory {
    #objService;
    #doorService;
    #npcService;

    constructor() {
        if(!!RoomFactory.instance) {
            return RoomFactory.instance;
        }

        this.#objService = new GameObjectService();
        this.#doorService = new DoorService();
        this.#npcService = new NPCService();

        RoomFactory.instance = this;
    }

    /**
     * 
     * @param {*} roomData 
     * @returns 
     */
    buildRoomFrom(roomData) {
        TypeChecker.isEnumOf(roomData.TYPE, TypeOfRoom);

        console.log("done w/ type-checking")
        // switch statement should be replaced by polymorphism
        switch(roomData.TYPE) {
            case TypeOfRoom.RECEPTION:
                return new ReceptionRoomDecorator(new Room(roomData.ID,roomData.TYPE, RoomDimensions.RECEPTION_WIDTH, RoomDimensions.RECEPTION_LENGTH)).getRoom();
            case TypeOfRoom.FOYER:
                return new FoyerRoomDecorator(new Room(roomData.ID,roomData.TYPE, RoomDimensions.FOYER_WIDTH, RoomDimensions.FOYER_LENGTH)).getRoom();
            case TypeOfRoom.FOODCOURT:
                return new FoodcourtRoomDecorator(new Room(roomData.ID,roomData.TYPE, RoomDimensions.FOODCOURT_WIDTH, RoomDimensions.FOODCOURT_LENGTH)).getRoom();
            case TypeOfRoom.ESCAPEROOM:
                return new EscapeRoomDecorator(new Room(roomData.ID,roomData.TYPE, RoomDimensions.ESCAPEROOM_WIDTH, RoomDimensions.ESCAPEROOM_LENGTH)).getRoom();
            case TypeOfRoom.CUSTOM:
                console.log("about to build by plan")
                return this.#buildByPlan(roomData);
            default:
                // This should never be reached
                throw new Error("Default option in the roomFactory switch-statement triggered. This should never happen. Please report bug to developer.");

        }
    }

    /**
     * 
     * @param {*} roomData 
     * @returns 
     */
    #buildByPlan = function(roomData) {
        let room = new Room(roomData.ID, roomData.TYPE, roomData.WIDTH, roomData.LENGTH);

        let listOfMapElements = [];
        let listOfGameObjects = [];
        let listOfDoors = [];
        let listOfNPCs = [];

        console.log("Building by plan - done w/ init")

        // these methods still need proper handling for when some arguments are missing.

        // TODO
        // - Make sure methods behave correctly when arguments are
        //   missing
        // - Add shape-handling & support for doors not placed on
        //   outer walls
        // - Allow for objects to be placed in a line easily

        // ADD TILES
        for (var i = 0; i < room.getLength(); i++) {
            for (var j = 0; j < room.getWidth(); j++) {
                listOfMapElements.push(this.#objService.createCustomObject(roomData.ID, GameObjectType.TILE, i, j, false));
            }
        }

        // ADD LEFT WALLS
        for (var i = 0; i < room.getLength(); i++) {
            listOfMapElements.push(this.#objService.createCustomObject(roomData.ID, GameObjectType.LEFTWALL, i, -1, false));
        }

        // ADD RIGHT WALLS
        for (var j = 0; j < room.getWidth(); j++) {
            listOfMapElements.push(this.#objService.createCustomObject(roomData.ID, GameObjectType.RIGHTWALL, room.getLength(), j, false));
        }

        console.log("added walls and tiles")

        // REDO the next two methods.
        // TODO desired interaction
        // - For each map element, the user only needs to specify
        //   the type, the position, whether or not the object is
        //   supposed to be clickable and if yes, the data necessary
        //   to construct the iFrame
        //   (does this not break stuff like the plant?) (done)
        // - the type is then "decoded" into the size, the necessary
        //   asset paths, whether the object is solid usw.
        //   (how to handle multi-part objects?)
        // - how to handle custom options for "standard" objects?
        // - how to handle more custom objects?
        // - how to allow for objects with multiple styles?

        // offer three options for positions:
        // - [xPos, yPos] (done)
        // - An array of positions formatted as above (done)
        // - An area (how to implement)

        // ADD MAPELEMENTS
        // this includes windows, schedule usw.
        // objData = {type, position, isClickable, iFrameData, variation}
        roomData.MAPELEMENTS.forEach(objData => {
            console.log("building object " + objData.type)
            if (Array.isArray(objData.position[0])) {
                console.log("has multiple positions")
                objData.position.forEach( position => {
                    // copy objData
                    let creationData = Object.assign( {}, objData )
                    console.log("copied objData")
                    // set positions to proper value
                    creationData.position = position;
                    console.log("set position")
                    this.#createObjectsFromData(roomData.ID, creationData, listOfMapElements);
                })
            } else {
                console.log("has single position")
                this.#createObjectsFromData(roomData.ID, objData, listOfMapElements);
            }
        })

        console.log("added map elements")

        // ADD OBJECTS
        // tables, plants, food and more
        // objData = {type, position, isClickable, iFrameData, variation}
        roomData.OBJECTS.forEach(objData => {
            if (Array.isArray(objData.position[0])) {
                objData.position.forEach( position => {
                    // copy objData
                    let creationData = Object.assign( {}, objData )
                    // set positions to proper value
                    creationData.position = position;
                    this.#createObjectsFromData(roomData.ID, creationData, listOfMapElements);
                })
            } else {
                this.#createObjectsFromData(roomData.ID, objData, listOfMapElements);
            }   
        })

        console.log("added objects")

        // ADD DOORS
        // doorData = {wallSide, logo, positionOfDoor,
        //            positionOnExit, directionOnExit, isOpen,
        //            closedMessage, codeToOpen}
        // TODO:
        // - allow for logos above door to not be passed
        roomData.DOORS.forEach(doorData => {     
            if(doorData.logo === undefined) {
                doorData.logo = "default";
            }
            let logo = this.#getDoorLogo(doorData.logo, doorData.wallSide);
            if (doorData.isOpen === undefined) {
                listOfDoors.push(
                    this.#doorService.createCustomDoor(logo,
                        doorData.wallSide,
                        new Position(roomData.ID,
                            doorData.positionOfDoor[0],
                            doorData.positionOfDoor[1]),
                        new Position(doorData.positionOnExit[0],
                            doorData.positionOnExit[1],
                            doorData.positionOnExit[2]),
                        doorData.directionOnExit,
                        true,
                        "", // closedMessage
                        "") // codeToOpen
                );         
            } else {
                // this requires error handling for when a door
                // is defined as closed but there is no message
                // or code to open defined
                listOfDoors.push(
                    this.#doorService.createCustomDoor(logo,
                        doorData.wallSide,
                        new Position(roomData.ID,
                            doorData.positionOfDoor[0],
                            doorData.positionOfDoor[1]),
                        new Position(doorData.positionOnExit[0],
                            doorData.positionOnExit[1],
                            doorData.positionOnExit[2]),
                        doorData.directionOnExit,
                        doorData.isOpen,
                        doorData.closedMessage,
                        doorData.codeToOpen)
                );
            }   

            // Create tile inside of door
            // if door is on the left side, same x, one less y
            // if door is on the right side, same y, one more x
            var xPos = doorData.positionOfDoor[0];
            var yPos = doorData.positionOfDoor[1];
            if (wallSide = GlobalStrings.LEFT) {
                yPos--;
            } else if (wallSide = GlobalStrings.RIGHT) {
                xPos++;
            } else {
                // TODO error handling
            }
           listOfMapElements.push(this.#objService.createCustomObject(roomData.ID, GameObjectType[wallSide + "TILE"], xPos, yPos, false))

        })

        console.log("added doors")

        // ADD NPCS
        roomData.NPCS.forEach(npcData => {
            listOfNPCs.push(
                this.#npcService.createCustomNPC(
                    npcData.name, // npc name
                    roomData.ID,  // roomID of position
                    npcData.position[0], // x coordinate of position
                    npcData.position[1], // y coordinate of position
                    npcData.direction,   // direction npc is facing
                    npcData.dialog       // what the npc says when
                                         // talked to
                )
            )
        })

        console.log("added npcs")

        room.setMapElements(listOfMapElements);
        room.setGameObjects(listOfGameObjects);
        room.setNPCs(listOfNPCs);
        room.setDoors(listOfDoors);
        room.buildOccMap();

        console.log("done w/ building")

        return room;
    }

    /**
     * 
     * @param {*} logoName 
     * @param {*} logoVariant 
     * @returns 
     */
    #getDoorLogo = function (logoName, logoVariant) {
        // TODO type-checking
        let logo = this.#doorLogos[logoName];
        return logo[logoVariant];
    }

    // This is a temporary solution that is not very good
    // but it will hopefully make creating a door a bit
    // more user-friendly and flexible.
    // Basically, the reason this is here is so when
    // adding doors while creating a floorplan, the user
    // does not need to give the entire assetPath-key for
    // the logo.
    #doorLogos = Object.freeze({
        default: {
            [GlobalStrings.LEFT]: "leftnonedoor_default",
            [GlobalStrings.RIGHT]: "rightnonedoor_default"
        },
        foyer: {
            [GlobalStrings.LEFT]: "leftfoyerdoor_default",
            [GlobalStrings.RIGHT]: "rightfoyerdoor_default"
        },
        reception: {
            [GlobalStrings.LEFT]: "leftreceptiondoor_default",
            [GlobalStrings.RIGHT]: "rightreceptiondoor_default"
        },
        lecture: {
            [GlobalStrings.LEFT]: "leftlecturedoor_default",
            [GlobalStrings.RIGHT]: "rightlecturedoor_default"
        },
        foodcourt: {
            [GlobalStrings.LEFT]: "leftfoodcourtdoor_default",
            [GlobalStrings.RIGHT]: "rightfoodcourtdoor_default"
        }
    });

    // This is a very hacky solution, it is not nice at all!
    // No polymorphism, tons of conditionals
    // TO-DO do some refactoring and turn this into not shit
    #createObjectsFromData = function (roomId, objData, listToPushInto) {
        // TODO support for custom options
        if (objData.isClickable == undefined) {
            objData.isClickable = false;
            objData.iFrameData = undefined;
        }
        console.log("checked clickability")
        // This is the only place where this class needs to
        // access the GameObjectInfo, which doesn't sit well
        // with me...
        if (GameObjectInfo.getInfo(objData.type, "hasAdditionalParts")) {
            let parts = GameObjectInfo.getInfo(objData.type, "parts");
            parts.forEach( partData => {
                this.#createObjectsFromData(roomId, {
                    type: partData.type,
                    position: [ objData.position[0] + partData.offset_x, objData.position[1] + partData.offset_y ],
                    isClickable: objData.isClickable,
                    iFrameData: objData.iFrameData,
                    variation: partData.variation
                }, listToPushInto)
            })
        }
        if (GameObjectInfo.getInfo(objData.type, "isMultiPart")) {
            console.log("has multiple parts")
            var size = GameObjectInfo.getInfo(objData.type, "size");
            var width = GameObjectInfo.getInfo(objData.type, "width");
            var length = GameObjectInfo.getInfo(objData.type, "length");
            console.log("got all info")
            for (let x = 0; x < size[0]; x += width) {
                for (let y = 0; y < size[1]; y += length) {
                    listToPushInto.push(this.#objService.createObjectVariation(roomId,
                    objData.type,
                    objData.position[0] + x,
                    objData.position[1] + y,
                    objData.isClickable,
                    objData.iFrameData,
                    [x, y]))
                }
            }
        } else if (GameObjectInfo.getInfo(objData.type, "hasVariation")) {
            // if no variation defined, set to default,
            // else do nothing
            objData.variation === undefined ? objData.variation = 0 : {};
            listToPushInto.push(this.#objService.createObjectVariation(
                roomId,
                objData.type,
                objData.position[0],
                objData.position[1],
                objData.isClickable,
                objData.iFrameData,
                [0, objData.variation]
            ));           
        } else {
            listToPushInto.push(this.#objService.createCustomObject(
                roomId,
                objData.type,
                objData.position[0],
                objData.position[1],
                objData.isClickable,
                objData.iFrameData
            ));
        }      
    }

}