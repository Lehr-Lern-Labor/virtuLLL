class DoorView extends GameMapElementView {
    #DOORTYPE;
    #eventManager;

    /**
     * @constructor Creates an instance of DoorView
     * 
     * @param {Image} doorImage door image
     * @param {PositionClient} position door position
     * @param {TypeOfDoor} doorType door type
     * @param {number} doorScreenPositionOffset door screen position offset
     * @param {String} name door name
     * @param {EventManager} eventManager event manager instance
     */
    constructor(doorImage, position, doorType, doorScreenPositionOffset, name, eventManager) {
        super(doorImage, position, doorScreenPositionOffset, name);

        this.#DOORTYPE = doorType;
        this.#eventManager = eventManager;
    }

    /**
     * Gets door type
     * 
     * @return door type
     */
    getDoorType() {
        return this.#DOORTYPE;
    }

    /**
     * Called if participant clicks a door
     * 
     * @param {number} targetRoomId target room ID
     */
    onclick(targetRoomId) {
        if (this.#DOORTYPE === TypeOfDoor.LECTURE_DOOR) {
            this.#eventManager.handleLectureDoorClick();
        } else {
            this.#eventManager.handleDoorClick(targetRoomId);
        }
    }
}