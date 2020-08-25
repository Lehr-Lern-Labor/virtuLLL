const TypeChecker = require('../../client/shared/TypeChecker.js');
const Position = require('./Position.js');
const Direction = require('../../client/shared/Direction.js');
const TypeOfDoor = require('../../client/shared/TypeOfDoor.js');

module.exports = class Door {

    #id;
    #typeOfDoor;
    #name;
    #mapPosition;
    #enterPositions;
    #targetPosition;
    #direction;

    /**
     * @author Philipp
     * 
     * @param {number} id 
     * @param {String} name
     * @param {TypeOfDoor} typeOfDoor
     * @param {Position} mapPosition
     * @param {Array of Position} enterPositions
     * @param {Position} targetPosition 
     * @param {Direction} direction
     */
    constructor(id, typeOfDoor, name, mapPosition, enterPositions, targetPosition, direction) {
        TypeChecker.isInt(id);
        TypeChecker.isEnumOf(typeOfDoor, TypeOfDoor);
        TypeChecker.isString(name);
        TypeChecker.isInstanceOf(mapPosition, Position);
        TypeChecker.isInstanceOf(enterPositions, Array);
        enterPositions.forEach(enterPosition => {
            TypeChecker.isInstanceOf(enterPosition, Position);
        });

        //these 2 arguments are only defined when door is not a lecture door
        if (typeOfDoor !== TypeOfDoor.LECTURE_DOOR) {
            TypeChecker.isInstanceOf(targetPosition, Position);
            TypeChecker.isEnumOf(direction, Direction);
        }

        this.#id = id;
        this.#typeOfDoor = typeOfDoor;
        this.#name = name;
        this.#mapPosition = mapPosition;
        this.#enterPositions = enterPositions;
        this.#targetPosition = targetPosition;
        this.#direction = direction;
    }

    getId() {
        return this.#id;
    }

    getStartingRoomId() {
        return this.#mapPosition.getRoomId();
    }

    getTargetRoomId() {
        if (this.#targetPosition) {
            return this.#targetPosition.getRoomId();
        } else {
            return undefined;
        }
    }

    getTypeOfDoor() {
        return this.#typeOfDoor;
    }

    getName() {
        return this.#name;
    }

    getMapPosition() {
        return this.#mapPosition;
    }

    getEnterPositions() {
        return this.#enterPositions;
    }

    getTargetPosition() {
        return this.#targetPosition;
    }

    getDirection() {
        if (this.#direction) {
            return this.#direction;
        } else {
            return undefined;
        }
    }

    /**
     * Checks if position is a valid enter position for this door
     * 
     * @param {Position} position 
     */
    isValidEnterPosition(position) {
        TypeChecker.isInstanceOf(position, Position);

        for (var i = 0; i < this.#enterPositions.length; i++) {
            if (position.getRoomId() === this.#enterPositions[i].getRoomId() &&
                position.getCordX() === this.#enterPositions[i].getCordX() &&
                position.getCordY() === this.#enterPositions[i].getCordY()) {
                return true;
            }
        }
        return false;
    }
}
