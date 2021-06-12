/**
 * Messages that will be emitted when a user tries to enter a closed door
 * @module DoorClosedMessages
 * 
 * @author Eric Ritte, Klaudia Leo, Laura Traub, Niklas Schmidt, Philipp Schumacher
 * @version 1.0.0
 */
 module.exports = Object.freeze({
    STANDARDDOORCLOSED: {
        header: "Door closed",
        body: "This door is currently closed for you."
    },
    FIRSTDOORCLOSED: {
        header: "Workshops",
        body:   "Derzeit finden keine Workshops statt. " + 
				"Wenn du dich zu einem Workshop angemeldet hast, wird die Tür rechtzeitig für dich aufgeschlossen. " +
				"Komme wieder, wenn ein Workshop stattfindet."
    },
    FOODCOURTDOORCLOSED: {
        header: "Door closed",
        body: "Greet our Chef before you leave!"
    }
});