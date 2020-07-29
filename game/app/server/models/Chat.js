var TypeChecker = require('../../utils/TypeChecker.js');

module.exports = class Chat {
    #chatId;
    #ownerId;
    #participantList;
    #messageList;
    #maxNumMessages;

    constructor(chatId, ownerId) {
        TypeChecker.isString(chatId);
        TypeChecker.isString(ownerId);

        this.#chatId = chatId;
        this.#ownerId = ownerId;
        
        this.#messageList = []; // creating an empty message list
        this.#participantList = []; // creating an empty participant list
        this.#participantList.push(ownerId);
        
        /* instead of several constructors, we could write a wrapper method
         * in the service-class or somewhere that creates a new chat and then
         * "fills it up" with the data supplied from the database.
         * - (E) */
    }
    /*
    *Multiple constructors are not allowed.
    constructor(idChat, idOwner, participantList, messageList) {
        this.#idChat = idChat;
        this.#idOwner = idOwner;
        this.#participantList = participantList;
        this.#messageList = messageList;
    }*/

    addMessage(msg) {
        // Intentionally left blank - to implement in child classes
    }

    addParticipant(ppantId) {
        // Intentionally left blank - to implement in child classes
    }

    getId() {
        return this.#chatId;
    }

    getMessageL() {
        return this.#messageList;
    }

    getParticipantL() {
        return this.#participantList;
    }

    notifyMessageAll(participantId) {
        //TODO
    }

    notifyParticipantAll(participantId) {
        //TODO
    }

    removeMessage(msgId) {
        TypeChecker.isString(msgId);

        this.#messageList.forEach(msg => {
            if (msg.getId() === msgId) {
                let index = this.#messageList.indexOf(msg);
                this.#messageList.splice(index, 1);
            }
        });
    }
    

    removeParticipant(participantId) {
        TypeChecker.isString(participantId);

        this.#participantList.forEach(participant => {

            if (participant.getId() === participantId) {
                let index = this.#participantList.indexOf(participant);
                this.#participantList.splice(index, 1);
            }
        });
    }

    getNumParticipants() {
        return this.#participantList.length;
    }

    setMaxNumMessages(maxNumMsg) {
        this.#maxNumMessages = maxNumMsg;
    }

    getMaxNumMessages() {
        return this.#maxNumMessages;
    }
    
    generateNewMsgId(senderId) {
        return this.#chatId + "." + senderId + "." + this.#messageList.length;
    };

}
