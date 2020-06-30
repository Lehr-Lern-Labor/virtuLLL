var PositionClient = require('./PositionClient.js')
var DirectionClient = require('./DirectionClient.js')
var TypeChecker = require('../../utils/TypeChecker.js')

module.exports = class ParticipantClient {
    
    #position;
    #direction;

    /**
     * Erstellt ParticipantClient Instanz
     * 
     * @author Klaudia
     * 
     * @param {Position} position 
     * @param {Direction} direction 
     */
    constructor(id, position, direction) 
    {
        TypeChecker.isInt(id);
        TypeChecker.isInstanceOf(position, PositionClient);
        TypeChecker.isEnumOf(direction, DirectionClient);

        this.#id = id;
        this.#position = position;
        this.#direction = direction;
    }

    getId()
    {
        return this.#id;
    }

    getPosition() 
    {
        return this.#position;
    }

    setPosition(position) 
    {
        TypeChecker.isInstanceOf(position, PositionClient);
        this.#position = position;
    }

    getDirection() 
    {
        return this.#direction;
    }

    setDirection(direction) 
    {
        TypeChecker.isEnumOf(direction, DirectionClient);
        this.#direction = direction;
    }
}