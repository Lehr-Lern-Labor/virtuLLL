if (typeof module === 'object' && typeof exports === 'object') {
    GameView = require('../views/js/GameView')
}

class ClientController {

    #port;
    socket;
    #currentRoom;
    #ownParticipant;
    #ownBusinessCard;

    #gameView;

    /**
     * creates an instance of ClientController only if there is not an instance already.
     * Otherwise the existing instance will be returned.
     * 
     * @param {GameView} gameView 
     * @param {ParticipantClient} participant
     * @param {currentRoom} currentRoom
     * @param {WebSocket} socket
     * @param {number} port
     */


    constructor() { //TODO: instanciate ParticipantClient
        if (!!ClientController.instance) {
            return ClientController.instance;
        }

        ClientController.instance = this;

        this.#gameView = new GameView();

        //TODO: add Participant List from Server
        return this;
    }

    getPort() {
        return this.#port;
    }

    setPort(port) {
        this.#port = port;
    }

    getSocket() {
        return this.socket;
    }

    setSocket(socket) {
        this.socket = socket;
    }

    getCurrentRoom() {
        return this.#currentRoom;
    }

    getGameView() {
        return this.#gameView;
    }


    /* #################################################### */
    /* ###################### SOCKET ###################### */
    /* #################################################### */

    //checks if there is an existing socket. Throws an error if there is no socket.
    socketReady() {
        if (!this.socket) {
            //TODO: exception
        }
        return true;
    }

    /*Initializes the initial view for the player*/
    initGameView() {
        var assetPaths = this.#currentRoom.getAssetPaths();
        var map = this.#currentRoom.getMap();
        var objectMap = this.#currentRoom.getObjectMap();
        var typeOfRoom = this.#currentRoom.getTypeOfRoom();
        var listOfNPCs = this.#currentRoom.getListOfNPCs();

        if (map !== null) {
            this.#gameView.drawStatusBar();
            this.#gameView.initRoomView(assetPaths, map, objectMap, listOfNPCs, typeOfRoom);
        }

        this.#gameView.drawProfileBox(this.#ownParticipant.getUsername())
        this.#gameView.initOwnAvatarView(this.#ownParticipant, typeOfRoom);
        this.#gameView.initCanvasEvents();

        //this.#gameView.initOwnAvatarView(this.#ownParticipant);
        //TODO this.#gameView.initAnotherAvatarViews(participants);

        //Game View is now fully initialised
        this.#gameView.setGameViewInit(true);

    }

    switchRoomGameView() {

        //disables update of gameview
        this.#gameView.setGameViewInit(false);

        var assetPaths = this.#currentRoom.getAssetPaths();
        var map = this.#currentRoom.getMap();
        var objectMap = this.#currentRoom.getObjectMap();
        var typeOfRoom = this.#currentRoom.getTypeOfRoom();
        var listOfNPCs = this.#currentRoom.getListOfNPCs();

        if (map !== null) {
            this.#gameView.initRoomView(assetPaths, map, objectMap, listOfNPCs, typeOfRoom);
        }

        this.#gameView.resetAnotherAvatarViews();
        this.#gameView.updateOwnAvatarRoom(typeOfRoom);
        this.#gameView.initCanvasEvents();
        this.#gameView.setGameViewInit(true);

    }

    /*opens a new socket connection between the client and the server and initializes the events to be handled.
    Throws an error if there is already an existing socket */
    // We also need reconnection handling
    openSocketConnection() {
        if (this.#port && !this.socket) {

            /* WARNING: WEBSOCKETS ONLY CONFIGURATION*/
            /*
            *Arguments prevent initial http polling and start the websocket directly.
            *Without the arguments the client starts a http connection and upgrades later to websocket protocol.
            *This caused a disconnect from the server and therefore a server scrash. 
            */
            this.socket = io({
                transports: ['websocket'],
                upgrade: false,
                'reconnection': true,
                'reconnectionDelay': 0,
                'reconnectionAttempts': 120
            });
            this.socket.on('connect', (socket) => {
                this.#gameView.updateConnectionStatus(ConnectionState.CONNECTED);
            });

            this.socket.on('pong', (ms) => {
                this.#gameView.updatePing(ms);
            });

            this.socket.on('disconnect', () => {
                this.#gameView.updateConnectionStatus(ConnectionState.DISCONNECTED);
                this.socket.close();
            });

            this.setUpSocket();
            this.socket.emit('new participant');

        }
        else {
            // TODO: error state
        }
    }

    setUpSocket() {
        this.socket.on('initOwnParticipantState', this.handleFromServerInitOwnParticipant.bind(this));
        //this.socket.on('currentGameStateYourID', this.handleFromServerUpdateID.bind(this)); //First Message from server
        this.socket.on('currentGameStateYourRoom', this.handleFromServerUpdateRoom.bind(this));
        this.socket.on('currentGameStateYourPosition', this.handleFromServerUpdatePosition.bind(this)); //Called when server wants to update your position
        this.socket.on('roomEnteredByParticipant', this.handleFromServerRoomEnteredByParticipant.bind(this));
        //this.socket.on('collisionDetetcionAnswer', this.handleFromServerCollisionDetectionAnswer.bind(this));
        this.socket.on('movementOfAnotherPPantStart', this.handleFromServerStartMovementOther.bind(this)); // onKeyDown, start recalculating position
        this.socket.on('movementOfAnotherPPantStop', this.handleFromServerStopMovementOther.bind(this));  // onKeyUp, check if position fits server 
        this.socket.on('remove player', this.handleFromServerRemovePlayer.bind(this)); // handles remove event
        this.socket.on('currentLectures', this.handleFromServerCurrentLectures.bind(this));
        this.socket.on('currentSchedule', this.handleFromServerCurrentSchedule.bind(this));
        this.socket.on('lectureEntered', this.handleFromServerLectureEntered.bind(this));
        this.socket.on('lectureFull', this.handleFromServerLectureFull.bind(this));
        this.socket.on('businessCard', this.handleFromServerBusinessCard.bind(this));
        this.socket.on('friendList', this.handleFromServerFriendList.bind(this));
        this.socket.on('friendRequestList', this.handleFromServerFriendRequestList.bind(this));
        this.socket.on('rankList', this.handleFromServerRankList.bind(this));
        this.socket.on('newAllchatMessage', this.handleFromServerNewAllchatMessage.bind(this)); // handles new message in allchat
        this.socket.on('initAllchat', this.handleFromServerInitAllchat.bind(this)); // called on entering a new room to load the allchat
        this.socket.on('lectureMessageFromServer', this.handleFromServerNewLectureChatMessage.bind(this));
        this.socket.on('updateLectureChat', this.handleFromServerUpdateLectureChat.bind(this));
        this.socket.on('update token', this.handleFromServerUpdateToken.bind(this));
        this.socket.on('force close lecture', this.handleFromServerForceCloseLecture.bind(this));
        this.socket.on('New notification', this.handleFromServerNewNotification.bind(this));
        this.socket.on('New global announcement', this.handleFromServerNewGlobalAnnouncement.bind(this));
        this.socket.on('remove yourself', this.handleFromServerRemoved.bind(this));
        this.socket.on('hideAvatar', this.handleFromServerHideAvatar.bind(this));
        this.socket.on('showAvatar', this.handleFromServerShowAvatar.bind(this));
        this.socket.on('achievements', this.handleFromServerAchievements.bind(this));
        this.socket.on('updateSuccessesBar', this.handleFromServerUpdateSuccessesBar.bind(this));
        this.socket.on('acceptedFriendRequest', this.handleFromServerAcceptedFriendRequest.bind(this));
        this.socket.on('rejectedFriendRequest', this.handleFromServerRejectedFriendRequest.bind(this));
        this.socket.on('removedFriend', this.handleFromServerRemovedFriend.bind(this));
        this.socket.on('showNPCStory', this.handleFromServerShowNPCStory.bind(this));
        this.socket.on('chatParticipantList', this.handleFromServerChatParticipantList.bind(this))
        this.socket.on('gameEntered', this.handleFromServerGameEntered.bind(this));
        this.socket.on('gotNewChat', this.handleFromServerGotNewChat.bind(this));
        this.socket.on('gotNewGroupChat', this.handleFromServerGotNewGroupChat.bind(this));
        this.socket.on('gotNewChatMessage', this.handleFromServerGotNewChatMessage.bind(this));
        this.socket.on('evalAnswer', function (data) {   //Displays evaluated input.
            console.log(data);
        });
        this.socket.on('newChat', this.handleFromServerNewChat.bind(this));
        this.socket.on('newAchievement', this.handleFromServerNewAchievement.bind(this));
        this.socket.on('newFriendRequestReceived', this.handleFromServerNewFriendRequest.bind(this));
        this.socket.on('chatList', this.handleFromServerShowChatList.bind(this));
        this.socket.on('chatThread', this.handleFromServerShowChatThread.bind(this));
        this.socket.on('newChatMessage', this.handleFromServerNewChatMessage.bind(this));
        this.socket.on('inviteFriends', this.handleFromServerInviteFriends.bind(this));
    }

    /* #################################################### */
    /* #################### EDIT VIEW ##################### */
    /* #################################################### */

    updateGame(timeStamp) {

        this.#gameView.update()
        this.#gameView.draw();
        this.#gameView.updateFPS(timeStamp);
    }

    /* #################################################### */
    /* ################## SEND TO SERVER ################## */
    /* #################################################### */

    //asks the server for an update of the current game state
    requestGameStateUpdate() {
        if (this.socketReady())
            this.socket.emit('requestGameStateUpdate');
    }

    sendToServerRequestMovStart(direction) {

        if (this.socketReady()) {
            TypeChecker.isEnumOf(direction, Direction);
            let currPos = this.#gameView.getOwnAvatarView().getGridPosition();
            let currPosX = currPos.getCordX();
            let currPosY = currPos.getCordY();
            let participantId = this.#ownParticipant.getId();
            this.socket.emit('requestMovementStart', direction, currPosX, currPosY);
        }
    }

    sendToServerRequestMovStop() {

        this.socketReady;
        let participantId = this.#ownParticipant.getId();

        this.socket.emit('requestMovementStop');

    }

    sendToServerAllchatMessage(text) {

        this.socketReady;
        if (this.socket.connected)
            this.socket.emit('sendMessage', text);
        else
            $('#allchatMessages').prepend($('<div>').text("Failed to send message. No connection to the server."));

    }

    sendToServerEvalInput(input) {

        this.socketReady;
        if (this.socket.connected)
            this.socket.emit('evalServer', input);
        else
            $('#allchatMessages').prepend($('<div>').text("Failed to send input. No connection to the server."));

    }

    sendToServerLectureChatMessage(text) {
        this.socketReady;
        if (this.socket.connected)
            this.socket.emit('lectureMessage', text);
        else
            $('#allchatMessages').prepend($('<div>').text("Failed to send message. No connection to the server."));

    }

    /* #################################################### */
    /* ############### RECEIVE FROM SERVER ################ */
    /* #################################################### */


    //Second message from server, gives you information of starting position, business card and participant id
    //After that, there is everything to init the game view
    handleFromServerInitOwnParticipant(initInfo) {
        var initPos = new PositionClient(initInfo.cordX, initInfo.cordY);

        this.#ownBusinessCard = new BusinessCardClient(
            initInfo.businessCard.id,
            initInfo.businessCard.username,
            initInfo.businessCard.title,
            initInfo.businessCard.surname,
            initInfo.businessCard.forename,
            initInfo.businessCard.job,
            initInfo.businessCard.company,
            initInfo.businessCard.email
        );

        this.#ownParticipant = new ParticipantClient(
            initInfo.id,
            this.#ownBusinessCard.getUsername(),
            initPos,
            initInfo.dir,
            initInfo.isVisible,
            initInfo.isModerator
        );
        this.#currentRoom.enterParticipant(this.#ownParticipant);
        this.initGameView();

    }

    //Third message from Server, gives you information of starting room
    handleFromServerUpdateRoom(roomId, typeOfRoom, assetPaths, listOfMapElementsData, listOfGameObjectsData, npcData, doorData, width, length, occupationMap) {

        //tranform MapElements to GameObjectClients
        var listOfMapElements = [];
        listOfMapElementsData.forEach(mapElement => {
            listOfMapElements.push(new GameObjectClient(mapElement.id, mapElement.type, mapElement.name, mapElement.width, mapElement.length,
                new PositionClient(mapElement.cordX, mapElement.cordY), mapElement.isSolid, mapElement.isClickable))
        });

        //transform GameObjects to GameObjectClients
        var listOfGameObjects = [];
        listOfGameObjectsData.forEach(element => {
            listOfGameObjects.push(new GameObjectClient(element.id, element.type, element.name, element.width, element.length,
                new PositionClient(element.cordX, element.cordY), element.isSolid, element.isClickable));
        });

        //transform NPCs to NPCClients
        var listOfNPCs = [];
        npcData.forEach(npc => {
            listOfNPCs.push(new NPCClient(npc.id, npc.name, new PositionClient(npc.cordX, npc.cordY), npc.direction));
        });

        //transform Doors to DoorClients
        var listOfDoors = [];
        doorData.forEach(door => {
            listOfDoors.push(new DoorClient(door.id, door.typeOfDoor, door.name, new PositionClient(door.cordX, door.cordY), door.targetRoomId));
        });

        //First room? 
        if (!this.#currentRoom) {
            this.#currentRoom = new RoomClient(roomId, typeOfRoom, assetPaths, listOfMapElements, listOfGameObjects, listOfNPCs, listOfDoors, width, length, occupationMap);

            //If not, only swap the room
        } else {
            this.#currentRoom.swapRoom(roomId, typeOfRoom, assetPaths, listOfMapElements, listOfGameObjects, listOfNPCs, listOfDoors, width, length, occupationMap);
            this.#currentRoom.enterParticipant(this.#ownParticipant);
            this.switchRoomGameView();
        }
    }

    //updates own avatar position
    handleFromServerUpdatePosition(posInfo) {
        var posUpdate = new PositionClient(posInfo.cordX, posInfo.cordY);
        var dirUpdate = posInfo.dir;

        this.#ownParticipant.setPosition(posUpdate);
        this.#ownParticipant.setDirection(dirUpdate);
        this.#gameView.updateOwnAvatarPosition(posUpdate);
        this.#gameView.updateOwnAvatarDirection(dirUpdate);
    }

    //Server does collision testing, so this method is only called when movement from other user is legit (P)
    handleFromServerStartMovementOther(ppantID, direction, newCordX, newCordY) {

        TypeChecker.isString(ppantID);
        TypeChecker.isEnumOf(direction, Direction);
        TypeChecker.isInt(newCordX);
        TypeChecker.isInt(newCordY);

        let newPos = new PositionClient(newCordX, newCordY);

        this.#gameView.updateAnotherAvatarDirection(ppantID, direction);
        this.#gameView.updateAnotherAvatarPosition(ppantID, newPos);
        this.#gameView.updateAnotherAvatarWalking(ppantID, true);

    }

    handleFromServerStopMovementOther(ppantID) {
        // TODO:
        // Typechecking
        // comparing position with the one saved in the server

        this.#gameView.updateAnotherAvatarWalking(ppantID, false);
    }

    handleFromServerLectureEntered(lecture, hasToken, lectureChat) {
        this.#gameView.updateCurrentLecture(lecture, hasToken, lectureChat);
    }

    handleFromServerLectureFull(lectureId) {
        this.#gameView.updateCurrentLectures(lectureId);
    }

    /* TODO
     * Change argument from object into list (nicer to read)
     * - (E) */
    handleFromServerRoomEnteredByParticipant(initInfo) {

        //var entrancePosition = this.#currentRoom; //TODO .getEntrancePosition
        //var entranceDirection = this.#currentRoom;//TODO .getEntranceDirection

        var initPos = new PositionClient(initInfo.cordX, initInfo.cordY);
        var participant = new ParticipantClient(initInfo.id, initInfo.username, initPos, initInfo.dir, initInfo.isVisible, initInfo.isModerator);
        this.#currentRoom.enterParticipant(participant);
        // the following line throws the same error as in the above method
        this.#gameView.initAnotherAvatarViews(participant, this.#currentRoom.getTypeOfRoom());
    }

    /*
    // Wird das noch gebraucht, wenn die collisionDetection nur client-seitig existiert? (E)
    handleFromServerCollisionDetectionAnswer(isOccupied) {
        if (isOccupied) {
            //TODO: Bewegung wird nicht zugelassen
        } else {
            //TODO: Avatar wird bewegt
        }
    }
    */

    // Removes disconnected Player from Model and View (P)
    handleFromServerRemovePlayer(ppantId) {
        //TypeChecker.isString(ppantId);

        this.#currentRoom.exitParticipant(ppantId);


        this.#gameView.removeAnotherAvatarViews(ppantId);

    }


    // get the current lectures from the server to display in the UI for selection
    handleFromServerCurrentLectures(lectures) {
        this.#gameView.initCurrentLectures(lectures);
    }

    handleFromServerCurrentSchedule(lectures) {
        this.#gameView.initCurrentSchedule(lectures);
    }

    //Is called after server send the answer of avatarclick
    handleFromServerBusinessCard(businessCardObject, rank, isModerator) {
        let businessCard = new BusinessCardClient(businessCardObject.id, businessCardObject.username,
            businessCardObject.title, businessCardObject.surname, businessCardObject.forename,
            businessCardObject.job, businessCardObject.company, businessCardObject.email);

        //check if ppant is a friend or not
        if (businessCard.getEmail() === undefined) {
            this.#gameView.initBusinessCardView(businessCard, false, rank, isModerator);
        } else {
            this.#gameView.initBusinessCardView(businessCard, true, rank, isModerator);
        }
    }

    handleFromServerInviteFriends(friendListData, groupName, limit, chatId) {
        var friendList = [];
        friendListData.forEach(data => {
            friendList.push(new BusinessCardClient(data.friendId, data.username, data.title, data.surname, data.forename, data.job, data.company, data.email));
        });
        this.#gameView.initInviteFriendsView(friendList, groupName, limit, chatId);
    }

    //Is called after server send the answer of friendlistclick
    handleFromServerFriendList(friendListData) {
        var friendList = [];
        friendListData.forEach(data => {
            friendList.push(new BusinessCardClient(data.friendId, data.username, data.title, data.surname, data.forename, data.job, data.company, data.email));
        });
        this.#gameView.initFriendListView(friendList);
    }

    //Is called after server send the answer of friendrequestlistclick
    handleFromServerFriendRequestList(friendRequestListData) {
        var friendRequestList = [];
        friendRequestListData.forEach(data => {
            friendRequestList.push(new BusinessCardClient(data.friendId, data.username, data.title, data.surname, data.forename, data.job, data.company, data.email));
        });

        this.#gameView.initFriendRequestListView(friendRequestList);
    }

    handleFromServerNewFriendRequest(data, chatId) {
        var friendRequest = new BusinessCardClient(data.friendId, data.username, data.title, data.surname, data.forename, data.job, data.company, data.email);
        this.#gameView.addFriendRequest(friendRequest);
        this.#gameView.updateChatThread(chatId, false, true);
        this.#gameView.drawNewFriendRequest(data.username);
    }

    handleFromServerAcceptedFriendRequest(data, chatId) {
        var friend = new BusinessCardClient(data.friendId, data.username, data.title, data.surname, data.forename, data.job, data.company, data.email);
        this.#gameView.addFriend(friend);
        this.#gameView.updateChatThread(chatId, true, false);
        this.#gameView.drawNewFriend(data.username);
    }

    handleFromServerRejectedFriendRequest(chatId) {
        this.#gameView.updateChatThread(chatId, false, false);
    }

    handleFromServerRemovedFriend(friendId, chatId) {
        this.#gameView.removeFriend(friendId);
        this.#gameView.updateChatThread(chatId, false, false);
    }

    handleFromServerRankList(rankList) {
        //remark own participant's ranking
        let idx = rankList.findIndex(ppant => ppant.participantId === this.#ownParticipant.getId());
        if (idx > -1) {
            rankList[idx].self = true;
        }
        this.#gameView.initRankListView(rankList);
    }

    handleFromServerChatParticipantList(usernames) {
        this.#gameView.drawChatParticipantList(usernames);
    }

    // Adds a new message to the all-chat
    handleFromServerNewAllchatMessage(message) {
        var timestamp = new DateParser(new Date(message.timestamp)).parseOnlyTime()

        var messageDiv = `
            <div>
                <small style="opacity: 0.3; float: right;">${timestamp}</small><br>
                <small><b>${message.username}</b></small>
                <small class="wrapword">${message.text}</small>
            </div>
        `;

        $('#allchatMessages').prepend(messageDiv);
        $('#lectureChatMessages').scrollTop(0);
    }

    handleFromServerNewLectureChatMessage(message) {
        this.#gameView.appendLectureChatMessage(message);
    }

    handleFromServerUpdateLectureChat(messages) {
        this.#gameView.updateLectureChat(messages);
    };

    handleFromServerUpdateToken(hasToken) {
        this.#gameView.updateLectureToken(hasToken);
    };

    handleFromServerForceCloseLecture() {
        this.#gameView.closeLectureView();
    };

    handleFromServerUpdateSuccessesBar(points, rank) {
        if (points) {
            TypeChecker.isInt(points);
        }

        if (rank) {
            TypeChecker.isInt(rank);
        }

        this.#gameView.updateSuccessesBar(points, rank);
    }

    // Called when a new room is entered.
    // The argument is an array of objects of the following structure:
    // { senderID: <String>, timestamp: <String>, text: <String> }
    handleFromServerInitAllchat(messages) {
        $('#allchatMessages').empty();
        messages.forEach((message) => {
            var timestamp = new DateParser(new Date(message.timestamp)).parseOnlyTime()

            var messageDiv = `
                <div>
                    <small style="opacity: 0.3; float: right;">${timestamp}</small><br>
                    <small><b>${message.username}</b></small>
                    <small class="wrapword">${message.text}</small>
                </div>
            `;

            $('#allchatMessages').prepend(messageDiv);
        })
        $('#allchatMessages').scrollTop(0);
    }

    handleFromServerNewNotification(messageHeader, messageText) {
        this.#gameView.initGlobalChatView(messageHeader, messageText);
    }

    handleFromServerNewGlobalAnnouncement(moderatorUsername, messageText) {
        var timestamp = new DateParser(new Date()).parseOnlyTime();
        var messageHeader = "On " + timestamp + " moderator " + moderatorUsername + " announced:";
        this.#gameView.initGlobalChatView(messageHeader, messageText);
    }

    handleFromServerHideAvatar(participantId) {
        this.#gameView.hideAvatar(participantId);
    }

    handleFromServerShowAvatar(participantId) {
        this.#gameView.showAvatar(participantId);
    }

    handleFromServerRemoved() {
        $('#viewBlocker').show();
    };

    handleFromServerShowNPCStory(name, story) {
        this.#gameView.initNPCStoryView(name, story);
    }

    handleFromServerNewAchievement(achievement) {
        this.#gameView.handleNewAchievement(achievement);
    }

    handleFromServerShowChatList(chats) {
        this.#gameView.initChatListView(chats);
    };

    handleFromServerShowChatThread(chat) {
        this.#gameView.initChatThreadView(chat, true);
    };

    /* This function is called when another user creates a new chat
     * with out user in it, ONCE THE FIRST MESSAGE HAS BEEN POSTED 
     * INTO THAT CHAT (or if a friend request has been send).
     * - (E) */
    handleFromServerNewChat(chat, openNow) {
        this.#gameView.addNewChat(chat, openNow);
    };

    handleFromServerGotNewChat(senderUsername, chatId) {
        this.#gameView.drawNewChat(senderUsername, chatId);
    }

    handleFromServerGotNewGroupChat(groupName, creatorUsername, chatId) {
        this.#gameView.drawNewGroupChat(groupName, creatorUsername, chatId);
    }

    handleFromServerGotNewChatMessage(senderUsername, chatId) {
        this.#gameView.drawNewMessage(senderUsername, chatId);
    }

    //This function is called when a new chat message is created in either OneToOneChat or GroupChat.
    handleFromServerNewChatMessage(chatId, message) {
        this.#gameView.addNewChatMessage(chatId, message);
    };

    handleFromServerGameEntered() {
        alert("You have entered the conference with the same account. Redirect to homepage...")
        var redirect = $('#nav_leave_button').attr('href');
        window.location.href = redirect;
    }

    /* #################################################### */
    /* ################# HANDLE FROM VIEW ################# */
    /* #################################################### */

    handleFromViewEnterNewRoom(targetRoomId) {
        this.socketReady;
        this.socket.emit('enterRoom', targetRoomId);
    }

    handleFromViewEnterLecture(lectureId) {
        this.socketReady;
        this.socket.emit('enterLecture', lectureId);
    }

    handleFromViewLectureLeft(lectureId, lectureEnded) {
        this.socketReady;
        this.socket.emit('leaveLecture', lectureId, lectureEnded);
    }

    handleFromViewLectureDownload(lectureId) {
        this.socketReady
        this.socket.emit('lectureVideoDownload', lectureId);
    }

    handleFromViewGetCurrentLectures() {
        this.socketReady
        this.socket.emit('getCurrentLectures');
    }

    handleFromViewShowSchedule() {
        this.socketReady
        this.socket.emit('getSchedule');
    }

    // called after clicking on achievement list
    handleFromViewShowAchievements() {
        this.socketReady
        this.socket.emit('getAchievements');

    }

    //called after click on friendlist button
    handleFromViewShowFriendList() {
        this.socketReady;
        this.socket.emit('getFriendList');
    }

    handleFromViewShowInviteFriends(groupName, chatId) {
        this.socketReady;
        this.socket.emit('getInviteFriends', groupName, chatId);
    }

    //called after click on friendrequestlist button
    handleFromViewShowFriendRequestList() {
        this.socketReady;
        this.socket.emit('getFriendRequestList');

    }

    //called after 'Add Friend' Button
    handleFromViewNewFriendRequest(participantRepicientId, chatId) {
        this.socketReady;
        this.socket.emit('newFriendRequest', participantRepicientId, chatId);
    }

    //called when a friend request is accepted
    handleFromViewAcceptRequest(businessCard) {
        this.socketReady;

        var participantId = businessCard.participantId;
        TypeChecker.isString(participantId);

        //Tells server to accept this request
        this.socket.emit('handleFriendRequest', participantId, true);
        this.#gameView.updateFriendRequestListView(participantId, true);
        this.#gameView.addFriend(new BusinessCardClient(participantId, businessCard.username, businessCard.title,
            businessCard.surname, businessCard.forename, businessCard.job, businessCard.company, businessCard.email))
    }

    //called when a friend request is declined
    handleFromViewRejectRequest(participantId) {
        this.socketReady;

        //Tells server to reject this request
        this.socket.emit('handleFriendRequest', participantId, false);
        this.#gameView.updateFriendRequestListView(participantId, false);
    }

    //called when this participants removes another from his friendlist
    handleFromViewRemoveFriend(friendId) {
        this.socketReady;
        this.socket.emit('removeFriend', friendId);
        this.#gameView.removeFriend(friendId);
    }

    handleFromViewLeaveChat(chatId) {
        this.socketReady;
        this.socket.emit('removeParticipantFromChat', chatId);
        this.#gameView.removeChat(chatId);
    }

    handleFromViewShowBusinessCard(participantId) {
        let ppant = this.#currentRoom.getParticipant(participantId);
        if (ppant === undefined) {
            throw new Error('Ppant with ' + participantId + ' is not in room');
        }
        this.socketReady;
        //Emits to server target ID
        this.socket.emit('getBusinessCard', participantId);
    }

    handleFromViewShowProfile() {
        this.#gameView.initProfileView(this.#ownBusinessCard, this.#ownParticipant.getIsModerator());
    }

    handleFromViewGetNPCStory(npcId) {
        this.socketReady;
        this.socket.emit('getNPCStory', npcId);
    }

    handleFromServerAchievements(achievements) {
        this.#gameView.initCurrentAchievementsView(achievements);
    }

    handleFromViewShowRankList() {
        this.socket.emit('getRankList');
    }

    /* Gets the list of chats the user is in - one-on-one and group - from the
     * server. The actual displaying is done in the method dealing with the 
     * response from the server.
     * - (E) */
    handleFromViewShowChatList() {
        this.socket.emit('getChatList');
    };

    handleFromViewShowChatThread(chatID) {
        this.socket.emit('getChatThread', chatID);
    };

    handleFromViewShowChatParticipantList(chatId) {
        this.socket.emit('getChatParticipantList', chatId);
    }

    /*Triggers the createNewChat event and emits  
    the id of the other chat participant to the server.*/
    handleFromViewCreateNewChat(participantId) {
        //if isFriend is undefined, checking isFriend is necessary  
        //isFriend not necessary, because server knows all friendLists
        this.socketReady;
        this.socket.emit('createNewChat', participantId);
    }

    handleFromViewCreateNewGroupChat(chatName, participantIdList, chatId) {
        this.socketReady
        this.socket.emit('createNewGroupChat', chatName, participantIdList, chatId);
    }

    handleFromViewSendNewMessage(chatId, messageText) {
        this.socketReady

        this.socket.emit('newChatMessage', chatId, messageText);
    }

    handleFromViewClearInterval() {
        this.socketReady
        this.socket.emit('clearInterval');
    }

    // Can we maybe merge these four functions into one?
    handleLeftArrowDown() {
        this.#gameView.updateOwnAvatarDirection(Direction.UPLEFT);
        //this.sendMovementToServer(Direction.UPLEFT);
        //TODO: Collision Check
        let currPos = this.#gameView.getOwnAvatarView().getGridPosition();
        let newPos = new PositionClient(currPos.getCordX(), currPos.getCordY() - Settings.MOVEMENTSPEED_Y);
        if (!this.#currentRoom.checkForCollision(newPos)) {
            this.#gameView.updateOwnAvatarPosition(newPos);
            this.#gameView.updateOwnAvatarWalking(true);
        }
        this.sendToServerRequestMovStart(Direction.UPLEFT);
    }

    handleRightArrowDown() {
        this.#gameView.updateOwnAvatarDirection(Direction.DOWNRIGHT);
        //this.sendMovementToServer(Direction.DOWNRIGHT);
        //TODO: Collision Check
        let currPos = this.#gameView.getOwnAvatarView().getGridPosition();
        let newPos = new PositionClient(currPos.getCordX(), currPos.getCordY() + Settings.MOVEMENTSPEED_Y);
        if (!this.#currentRoom.checkForCollision(newPos)) {
            this.#gameView.updateOwnAvatarPosition(newPos);
            this.#gameView.updateOwnAvatarWalking(true);
        }
        this.sendToServerRequestMovStart(Direction.DOWNRIGHT);
    }

    handleUpArrowDown() {
        this.#gameView.updateOwnAvatarDirection(Direction.UPRIGHT);
        //this.sendMovementToServer(Direction.UPRIGHT);
        //TODO: Collision Check
        let currPos = this.#gameView.getOwnAvatarView().getGridPosition();
        let newPos = new PositionClient(currPos.getCordX() + Settings.MOVEMENTSPEED_X, currPos.getCordY());
        if (!this.#currentRoom.checkForCollision(newPos)) {
            this.#gameView.updateOwnAvatarPosition(newPos);
            this.#gameView.updateOwnAvatarWalking(true);
        }
        this.sendToServerRequestMovStart(Direction.UPRIGHT);
    }

    handleDownArrowDown() {
        this.#gameView.updateOwnAvatarDirection(Direction.DOWNLEFT);
        //this.sendMovementToServer(Direction.DOWNLEFT);
        //TODO: Collision Check
        let currPos = this.#gameView.getOwnAvatarView().getGridPosition();
        let newPos = new PositionClient(currPos.getCordX() - Settings.MOVEMENTSPEED_X, currPos.getCordY());
        if (!this.#currentRoom.checkForCollision(newPos)) {
            this.#gameView.updateOwnAvatarPosition(newPos);
            this.#gameView.updateOwnAvatarWalking(true);
        }
        this.sendToServerRequestMovStart(Direction.DOWNLEFT);
    }

    handleArrowUp() {
        this.#gameView.updateOwnAvatarWalking(false);
        this.sendToServerRequestMovStop();
    }
}

if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = ClientController;
}
