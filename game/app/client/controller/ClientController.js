class ClientController {

    #port;
    #socket;
    #currentRoom;
    #ownParticipant;
    #ownBusinessCard;
    #gameView;

    /**
     * creates an instance of ClientController only if there is not an instance already.
     * Otherwise the existing instance will be returned.
     * 
     * @param {number} port
     */
    constructor(port) {
        if (!!ClientController.instance) {
            return ClientController.instance;
        }

        ClientController.instance = this;

        TypeChecker.isInt(port);
        this.#port = port;
        this.#openSocketConnection();
        this.#gameView = new GameView();

        return this;
    }

    getPort() {
        return this.#port;
    }

    getSocket() {
        return this.#socket;
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
    #socketReady = function() {
        if (!this.#socket) {
            return false;
        }
        return true;
    }

    /*Initializes the initial view for the player*/
    #initGameView = function() {
        var assetPaths = this.#currentRoom.getAssetPaths();
        var map = this.#currentRoom.getMap();
        var objectMap = this.#currentRoom.getObjectMap();
        var typeOfRoom = this.#currentRoom.getTypeOfRoom();
        var listOfNPCs = this.#currentRoom.getListOfNPCs();

        if (map !== null) {
            this.#gameView.initRoomView(assetPaths, map, objectMap, listOfNPCs, typeOfRoom);
        }

        this.#gameView.drawStatusBar();
        this.#gameView.drawProfile(this.#ownParticipant.getUsername())
        this.#gameView.initOwnAvatarView(this.#ownParticipant);
        this.#gameView.initCanvasEvents();

        //Game View is now fully initialised
        this.#gameView.setGameViewInit(true);

    }

    #switchRoomGameView = function() {

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
        this.#gameView.initCanvasEvents();
        this.#gameView.setGameViewInit(true);

    }

    /*opens a new socket connection between the client and the server and initializes the events to be handled.
    Throws an error if there is already an existing socket */
    // We also need reconnection handling
    #openSocketConnection = function() {
        if (this.#port && !this.#socket) {

            /* WARNING: WEBSOCKETS ONLY CONFIGURATION*/
            /*
            *Arguments prevent initial http polling and start the websocket directly.
            *Without the arguments the client starts a http connection and upgrades later to websocket protocol.
            *This caused a disconnect from the server and therefore a server scrash. 
            */
            this.#socket = io({
                transports: ['websocket'],
                upgrade: false,
                'reconnection': true,
                'reconnectionDelay': 0,
                'reconnectionAttempts': 120
            });
            this.#socket.on('connect', (socket) => {
                this.#gameView.updateConnectionStatus(ConnectionState.CONNECTED);
            });

            this.#socket.on('pong', (ms) => {
                this.#gameView.updatePing(ms);
            });

            this.#socket.on('disconnect', () => {
                this.#gameView.updateConnectionStatus(ConnectionState.DISCONNECTED);
                this.#socket.close();
            });

            this.#setUpSocket();
            this.#socket.emit('new participant');

        }
        else {
            // TODO: error state
        }
    }

    #setUpSocket = function() {
        this.#socket.on('initOwnParticipantState', this.#handleFromServerInitOwnParticipant.bind(this));
        //this.#socket.on('currentGameStateYourID', this.handleFromServerUpdateID.bind(this)); //First Message from server
        this.#socket.on('currentGameStateYourRoom', this.#handleFromServerUpdateRoom.bind(this));
        this.#socket.on('currentGameStateYourPosition', this.#handleFromServerUpdatePosition.bind(this)); //Called when server wants to update your position
        this.#socket.on('roomEnteredByParticipant', this.#handleFromServerRoomEnteredByParticipant.bind(this));
        //this.#socket.on('collisionDetetcionAnswer', this.handleFromServerCollisionDetectionAnswer.bind(this));
        this.#socket.on('movementOfAnotherPPantStart', this.#handleFromServerStartMovementOther.bind(this)); // onKeyDown, start recalculating position
        this.#socket.on('movementOfAnotherPPantStop', this.#handleFromServerStopMovementOther.bind(this));  // onKeyUp, check if position fits server 
        this.#socket.on('remove player', this.#handleFromServerRemovePlayer.bind(this)); // handles remove event
        this.#socket.on('currentLectures', this.#handleFromServerCurrentLectures.bind(this));
        this.#socket.on('currentSchedule', this.#handleFromServerCurrentSchedule.bind(this));
        this.#socket.on('lectureEntered', this.#handleFromServerLectureEntered.bind(this));
        this.#socket.on('lectureFull', this.#handleFromServerLectureFull.bind(this));
        this.#socket.on('businessCard', this.#handleFromServerBusinessCard.bind(this));
        this.#socket.on('friendList', this.#handleFromServerFriendList.bind(this));
        this.#socket.on('friendRequestList', this.#handleFromServerFriendRequestList.bind(this));
        this.#socket.on('rankList', this.#handleFromServerRankList.bind(this));
        this.#socket.on('newAllchatMessage', this.#handleFromServerNewAllchatMessage.bind(this)); // handles new message in allchat
        this.#socket.on('initAllchat', this.#handleFromServerInitAllchat.bind(this)); // called on entering a new room to load the allchat
        this.#socket.on('lectureMessageFromServer', this.#handleFromServerNewLectureChatMessage.bind(this));
        this.#socket.on('updateLectureChat', this.#handleFromServerUpdateLectureChat.bind(this));
        this.#socket.on('update token', this.#handleFromServerUpdateToken.bind(this));
        this.#socket.on('force close lecture', this.#handleFromServerForceCloseLecture.bind(this));
        this.#socket.on('New notification', this.#handleFromServerNewNotification.bind(this));
        this.#socket.on('New global announcement', this.#handleFromServerNewGlobalAnnouncement.bind(this));
        this.#socket.on('remove yourself', this.#handleFromServerRemoved.bind(this));
        this.#socket.on('hideAvatar', this.#handleFromServerHideAvatar.bind(this));
        this.#socket.on('showAvatar', this.#handleFromServerShowAvatar.bind(this));
        this.#socket.on('achievements', this.#handleFromServerAchievements.bind(this));
        this.#socket.on('removeFromChatParticipantList', this.#handleFromServerRemoveFromChatParticipantList.bind(this));
        this.#socket.on('addToInviteFriends', this.#handleFromServerAddToInviteFriends.bind(this));
        this.#socket.on('removeFromInviteFriends', this.#handleFromServerRemoveFromInviteFriends.bind(this));
        this.#socket.on('updateSuccessesBar', this.#handleFromServerUpdateSuccessesBar.bind(this));
        this.#socket.on('acceptedFriendRequest', this.#handleFromServerAcceptedFriendRequest.bind(this));
        this.#socket.on('rejectedFriendRequest', this.#handleFromServerRejectedFriendRequest.bind(this));
        this.#socket.on('addToChatParticipantList', this.#handleFromServerAddToChatParticipantList.bind(this));
        this.#socket.on('removedFriend', this.#handleFromServerRemovedFriend.bind(this));
        this.#socket.on('showNPCStory', this.#handleFromServerShowNPCStory.bind(this));
        this.#socket.on('chatParticipantList', this.#handleFromServerChatParticipantList.bind(this))
        this.#socket.on('gameEntered', this.#handleFromServerGameEntered.bind(this));
        this.#socket.on('gotNewChat', this.#handleFromServerGotNewChat.bind(this));
        this.#socket.on('gotNewGroupChat', this.#handleFromServerGotNewGroupChat.bind(this));
        this.#socket.on('gotNewChatMessage', this.#handleFromServerGotNewChatMessage.bind(this));
        this.#socket.on('evalAnswer', function (data) {   //Displays evaluated input.
            console.log(data);
        });
        this.#socket.on('newChat', this.#handleFromServerNewChat.bind(this));
        this.#socket.on('newAchievement', this.#handleFromServerNewAchievement.bind(this));
        this.#socket.on('newFriendRequestReceived', this.#handleFromServerNewFriendRequest.bind(this));
        this.#socket.on('chatList', this.#handleFromServerShowChatList.bind(this));
        this.#socket.on('chatThread', this.#handleFromServerShowChatThread.bind(this));
        this.#socket.on('newChatMessage', this.#handleFromServerNewChatMessage.bind(this));
        this.#socket.on('inviteFriends', this.#handleFromServerInviteFriends.bind(this));
    }

    /* #################################################### */
    /* #################### EDIT VIEW ##################### */
    /* #################################################### */

    /**
     * 
     * @param {number} timeStamp 
     */
    updateGame(timeStamp) {
        TypeChecker.isNumber(timeStamp);

        this.#gameView.update()
        this.#gameView.draw();
        this.#gameView.updateFPS(timeStamp);
    }

    /* #################################################### */
    /* ################## SEND TO SERVER ################## */
    /* #################################################### */

    /**
     * 
     * @param {Direction} direction 
     */
    sendToServerRequestMovStart(direction) {
        if (this.#socketReady()) {
            TypeChecker.isEnumOf(direction, Direction);
            let currPos = this.#gameView.getOwnAvatarView().getGridPosition();
            let currPosX = currPos.getCordX();
            let currPosY = currPos.getCordY();
            this.#socket.emit('requestMovementStart', direction, currPosX, currPosY);
        }
    }

    sendToServerRequestMovStop() {
        if (this.#socketReady()) {
            this.#socket.emit('requestMovementStop');
        }
    }

    /**
     * 
     * @param {String} text 
     */
    sendToServerAllchatMessage(text) {
        if (this.#socketReady() && this.#socket.connected) {
            TypeChecker.isString(text);
            this.#socket.emit('sendMessage', text);
        }
        else
            $('#allchatMessages').prepend($('<div>').text("Failed to send message. No connection to the server."));
    }

    /**
     * 
     * @param {String} input 
     */
    sendToServerEvalInput(input) {
        if (this.#socketReady() && this.#socket.connected) {
            TypeChecker.isString(input)
            this.#socket.emit('evalServer', input);
        }
        else
            $('#allchatMessages').prepend($('<div>').text("Failed to send input. No connection to the server."));

    }

    /**
     * 
     * @param {String} text 
     */
    sendToServerLectureChatMessage(text) {

        if (this.#socketReady() && this.#socket.connected) {
            TypeChecker.isString(input)
            this.#socket.emit('lectureMessage', text);
        }
        else
            $('#lectureChatMessages').prepend($('<div>').text("Failed to send message. No connection to the server."));

    }

    /* #################################################### */
    /* ############### RECEIVE FROM SERVER ################ */
    /* #################################################### */


    //Second message from server, gives you information of starting position, business card and participant id
    //After that, there is everything to init the game view
    #handleFromServerInitOwnParticipant = function(initInfo) {
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
        this.#initGameView();

    }

    //Third message from Server, gives you information of starting room
    #handleFromServerUpdateRoom = function(roomId, typeOfRoom, assetPaths, listOfMapElementsData, listOfGameObjectsData, npcData, doorData, width, length, occupationMap) {

        //tranform MapElements to GameObjectClients
        var listOfMapElements = [];
        listOfMapElementsData.forEach(mapElement => {
            listOfMapElements.push(new GameObjectClient(mapElement.id, mapElement.type, mapElement.name, mapElement.width, mapElement.length,
                new PositionClient(mapElement.cordX, mapElement.cordY), mapElement.isClickable))
        });

        //transform GameObjects to GameObjectClients
        var listOfGameObjects = [];
        listOfGameObjectsData.forEach(element => {
            listOfGameObjects.push(new GameObjectClient(element.id, element.type, element.name, element.width, element.length,
                new PositionClient(element.cordX, element.cordY), element.isClickable));
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
            this.#switchRoomGameView();
        }
    }

    //updates own avatar position
    #handleFromServerUpdatePosition = function(posInfo) {
        var posUpdate = new PositionClient(posInfo.cordX, posInfo.cordY);
        var dirUpdate = posInfo.dir;

        this.#ownParticipant.setPosition(posUpdate);
        this.#ownParticipant.setDirection(dirUpdate);
        this.#gameView.updateOwnAvatarPosition(posUpdate);
        this.#gameView.updateOwnAvatarDirection(dirUpdate);
    }

    //Server does collision testing, so this method is only called when movement from other user is legit (P)
    /**
     * 
     * @param {String} ppantID 
     * @param {Direction} direction 
     * @param {number} newCordX 
     * @param {number} newCordY 
     */
    #handleFromServerStartMovementOther = function(ppantID, direction, newCordX, newCordY) {

        TypeChecker.isString(ppantID);
        TypeChecker.isEnumOf(direction, Direction);
        TypeChecker.isInt(newCordX);
        TypeChecker.isInt(newCordY);

        let newPos = new PositionClient(newCordX, newCordY);

        this.#gameView.updateAnotherAvatarDirection(ppantID, direction);
        this.#gameView.updateAnotherAvatarPosition(ppantID, newPos);
        this.#gameView.updateAnotherAvatarWalking(ppantID, true);

    }

    /**
     * 
     * @param {String} ppantID 
     */
    #handleFromServerStopMovementOther = function(ppantID) {
        TypeChecker.isString(ppantID);

        this.#gameView.updateAnotherAvatarWalking(ppantID, false);
    }

    #handleFromServerLectureEntered = function(lecture, hasToken, lectureChat) {
        this.#gameView.updateCurrentLecture(lecture, hasToken, lectureChat);
    }

    /**
     * 
     * @param {String} lectureId 
     */
    #handleFromServerLectureFull = function(lectureId) {
        TypeChecker.isString(lectureId);
        this.#gameView.updateCurrentLectures(lectureId);
    }

    /* TODO
     * Change argument from object into list (nicer to read)
     * - (E) */
    #handleFromServerRoomEnteredByParticipant = function(initInfo) {

        //var entrancePosition = this.#currentRoom; //TODO .getEntrancePosition
        //var entranceDirection = this.#currentRoom;//TODO .getEntranceDirection

        var initPos = new PositionClient(initInfo.cordX, initInfo.cordY);
        var participant = new ParticipantClient(initInfo.id, initInfo.username, initPos, initInfo.dir, initInfo.isVisible, initInfo.isModerator);
        this.#currentRoom.enterParticipant(participant);
        // the following line throws the same error as in the above method
        this.#gameView.initAnotherAvatarViews(participant);
    }

    /**
     * Removes disconnected Player from Model and View
     * 
     * @param {String} ppantId 
     */
    #handleFromServerRemovePlayer = function(ppantId) {
        TypeChecker.isString(ppantId);
        this.#currentRoom.exitParticipant(ppantId);
        this.#gameView.removeAnotherAvatarViews(ppantId);
    }

    // get the current lectures from the server to display in the UI for selection
    #handleFromServerCurrentLectures = function(lectures) {
        this.#gameView.initCurrentLectures(lectures);
    }

    #handleFromServerCurrentSchedule = function(lectures) {
        this.#gameView.initCurrentSchedule(lectures);
    }

    //Is called after server send the answer of avatarclick
    #handleFromServerBusinessCard = function(businessCardObject, rank, isModerator) {
        let businessCard = new BusinessCardClient(businessCardObject.id, businessCardObject.username,
            businessCardObject.title, businessCardObject.surname, businessCardObject.forename,
            businessCardObject.job, businessCardObject.company, businessCardObject.email);

        //check if ppant is a friend or not
        if (businessCard.getEmail() === undefined) {
            this.#gameView.initBusinessCardView(businessCard, false, rank, isModerator);
        } else {
            //rank is undefined because it is not drawn on friendBusinessCards
            this.#gameView.initBusinessCardView(businessCard, true, undefined, isModerator);
        }
    }

    #handleFromServerInviteFriends = function(friendListData, groupName, limit, chatId) {
        
        if (groupName)
            TypeChecker.isString(groupName);
        if (limit)
            TypeChecker.isInt(limit)
        if (chatId)
            TypeChecker.isString(chatId);
        var friendList = [];
        friendListData.forEach(data => {
            friendList.push(new BusinessCardClient(data.friendId, data.username, data.title, data.surname, data.forename, data.job, data.company, data.email));
        });
        this.#gameView.initInviteFriendsView(friendList, groupName, limit, chatId);
    }

    //Is called after server send the answer of friendlistclick
    #handleFromServerFriendList = function(friendListData) {
        var friendList = [];
        friendListData.forEach(data => {
            friendList.push(new BusinessCardClient(data.friendId, data.username, data.title, data.surname, data.forename, data.job, data.company, data.email));
        });
        this.#gameView.initFriendListView(friendList);
    }

    //Is called after server send the answer of friendrequestlistclick
    #handleFromServerFriendRequestList = function(friendRequestListData) {
        var friendRequestList = [];
        friendRequestListData.forEach(data => {
            friendRequestList.push(new BusinessCardClient(data.friendId, data.username, data.title, data.surname, data.forename, data.job, data.company, data.email));
        });

        this.#gameView.initFriendRequestListView(friendRequestList);
    }

    #handleFromServerNewFriendRequest = function(data, chatId) {
        var friendRequest = new BusinessCardClient(data.friendId, data.username, data.title, data.surname, data.forename, data.job, data.company, data.email);
        this.#gameView.addFriendRequest(friendRequest);
        this.#gameView.updateChatThread(chatId, false, true);
        this.#gameView.drawNewFriendRequest(data.username);
    }

    #handleFromServerAcceptedFriendRequest = function(data, chatId) {
        var friend = new BusinessCardClient(data.friendId, data.username, data.title, data.surname, data.forename, data.job, data.company, data.email);
        this.#gameView.addFriend(friend);
        this.#gameView.updateChatThread(chatId, true, false);
        this.#gameView.drawNewFriend(data.username);
    }

    /**
     * 
     * @param {String} chatId 
     */
    #handleFromServerRejectedFriendRequest = function(chatId) {
        TypeChecker.isString(chatId);
        this.#gameView.updateChatThread(chatId, false, false);
    }

    /**
     * 
     * @param {String} friendId 
     * @param {String} chatId 
     */
    #handleFromServerRemovedFriend = function(friendId, chatId) {
        TypeChecker.isString(friendId);
        TypeChecker.isString(chatId);
        this.#gameView.removeFriend(friendId);
        this.#gameView.updateChatThread(chatId, false, false);
    }

    #handleFromServerRankList = function(rankList) {
        //remark own participant's ranking
        let idx = rankList.findIndex(ppant => ppant.participantId === this.#ownParticipant.getId());
        if (idx > -1) {
            rankList[idx].self = true;
        }
        this.#gameView.initRankListView(rankList);
    }

    /**
     * 
     * @param {String[]} usernames 
     */
    #handleFromServerChatParticipantList = function(usernames) {
        TypeChecker.isInstanceOf(usernames, Array);
        usernames.forEach(username => {
            TypeChecker.isString(username);
        })
        this.#gameView.drawChatParticipantList(usernames);
    }

    /**
     * 
     * @param {String} username 
     */
    #handleFromServerAddToChatParticipantList = function(username) {
        TypeChecker.isString(username);
        this.#gameView.addToChatParticipantList(username);
    }

    /**
     * 
     * @param {String} username 
     */
    #handleFromServerRemoveFromChatParticipantList = function(username) {
        TypeChecker.isString(username);
        this.#gameView.removeFromChatParticipantList(username);
    }

    /**
     * 
     * @param {?Object} data 
     * @param {boolean} hasLeftChat 
     */
    #handleFromServerAddToInviteFriends = function(data, hasLeftChat) {
        if (data) {
            //Typechecking
            var businessCard = new BusinessCardClient(data.friendId, data.username, data.title, data.surname, data.forename, data.job, data.company, data.email);
        } else
            var businessCard = undefined;
            
        TypeChecker.isBoolean(hasLeftChat);   
        this.#gameView.addToInviteFriends(businessCard, hasLeftChat);
    }

    /**
     * 
     * @param {?String} participantId 
     * @param {boolean} isMemberOfChat 
     */
    #handleFromServerRemoveFromInviteFriends = function(participantId, isMemberOfChat) {
        if (participantId)
            TypeChecker.isString(participantId);

        TypeChecker.isBoolean(isMemberOfChat);
        this.#gameView.removeFromInviteFriends(participantId, isMemberOfChat);
    }

    // Adds a new message to the all-chat
    #handleFromServerNewAllchatMessage = function(message) {
        this.#gameView.appendAllchatMessage(message);
    }

    #handleFromServerNewLectureChatMessage = function(message) {
        this.#gameView.appendLectureChatMessage(message);
    }

    #handleFromServerUpdateLectureChat = function(messages) {
        this.#gameView.updateLectureChat(messages);
    };

    /**
     * 
     * @param {boolean} hasToken 
     */
    #handleFromServerUpdateToken = function(hasToken) {
        TypeChecker.isBoolean(hasToken);
        this.#gameView.updateLectureToken(hasToken);
    };

    #handleFromServerForceCloseLecture = function() {
        this.#gameView.closeLectureView();
    };

    /**
     * 
     * @param {?number} points 
     * @param {?number} rank 
     */
    #handleFromServerUpdateSuccessesBar = function(points, rank) {
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
    #handleFromServerInitAllchat = function(messages) {
        this.#gameView.initAllchatView(this.#currentRoom.getTypeOfRoom(), messages);
    }

    /**
     * 
     * @param {String} messageHeader 
     * @param {String} messageText 
     */
    #handleFromServerNewNotification = function(messageHeader, messageText) {
        TypeChecker.isString(messageHeader);
        TypeChecker.isString(messageText);
        this.#gameView.initGlobalChatView(messageHeader, messageText);
    }

    /**
     * 
     * @param {String} moderatorUsername 
     * @param {String} messageText 
     */
    #handleFromServerNewGlobalAnnouncement = function(moderatorUsername, messageText) {
        TypeChecker.isString(moderatorUsername);
        TypeChecker.isString(messageText);
        var timestamp = new DateParser(new Date()).parseOnlyTime();
        var messageHeader = "On " + timestamp + " moderator " + moderatorUsername + " announced:";
        this.#gameView.initGlobalChatView(messageHeader, messageText);
    }

    /**
     * 
     * @param {String} participantId 
     */
    #handleFromServerHideAvatar = function(participantId) {
        TypeChecker.isString(participantId);
        this.#gameView.hideAvatar(participantId);
    }

    /**
     * 
     * @param {String} participantId 
     */
    #handleFromServerShowAvatar = function(participantId) {
        TypeChecker.isString(participantId);
        this.#gameView.showAvatar(participantId);
    }

    #handleFromServerRemoved = function() {
        $('#viewBlocker').show();
    };

    #handleFromServerAchievements = function(achievements) {
        this.#gameView.initCurrentAchievementsView(achievements);
    }

    /**
     * 
     * @param {String} name 
     * @param {String[]} story 
     */
    #handleFromServerShowNPCStory = function(name, story) {
        TypeChecker.isString(name);
        TypeChecker.isInstanceOf(story, Array);
        story.forEach(element => {
            TypeChecker.isString(element);
        })
        this.#gameView.initNPCStoryView(name, story);
    }

    #handleFromServerNewAchievement = function(achievement) {
        this.#gameView.handleNewAchievement(achievement);
    }

    #handleFromServerShowChatList = function(chats) {
        this.#gameView.initChatListView(chats);
    };

    #handleFromServerShowChatThread = function(chat) {
        this.#gameView.initChatThreadView(chat, true);
    };

    /* This function is called when another user creates a new chat
     * with out user in it, ONCE THE FIRST MESSAGE HAS BEEN POSTED 
     * INTO THAT CHAT (or if a friend request has been send).
     * - (E) */
    #handleFromServerNewChat = function(chat, openNow) {
        this.#gameView.addNewChat(chat, openNow);
    };

    /**
     * 
     * @param {String} senderUsername 
     * @param {String} chatId 
     */
    #handleFromServerGotNewChat = function(senderUsername, chatId) {
        TypeChecker.isString(senderUsername);
        TypeChecker.isString(chatId);

        this.#gameView.drawNewChat(senderUsername, chatId);
    }

    /**
     * 
     * @param {String} groupName 
     * @param {String} creatorUsername 
     * @param {String} chatId 
     */
    #handleFromServerGotNewGroupChat = function(groupName, creatorUsername, chatId) {
        TypeChecker.isString(groupName);
        TypeChecker.isString(creatorUsername);
        TypeChecker.isString(chatId);

        this.#gameView.drawNewGroupChat(groupName, creatorUsername, chatId);
    }

    /**
     * 
     * @param {String} senderUsername 
     * @param {String} chatId 
     */
    #handleFromServerGotNewChatMessage = function(senderUsername, chatId) {
        TypeChecker.isString(senderUsername);
        TypeChecker.isString(chatId);
        this.#gameView.drawNewMessage(senderUsername, chatId);
    }

    //This function is called when a new chat message is created in either OneToOneChat or GroupChat.
    #handleFromServerNewChatMessage = function(chatId, message) {
        this.#gameView.addNewChatMessage(chatId, message);
    };

    #handleFromServerGameEntered = function() {
        alert("You have entered the conference with the same account. Redirect to homepage...")
        var redirect = $('#nav_leave_button').attr('href');
        window.location.href = redirect;
    }

    /* #################################################### */
    /* ################# HANDLE FROM VIEW ################# */
    /* #################################################### */

    /**
     * 
     * @param {number} targetRoomId 
     */
    handleFromViewEnterNewRoom(targetRoomId) {
        TypeChecker.isInt(targetRoomId);

        if (this.#socketReady()) {
            this.#socket.emit('enterRoom', targetRoomId);
        }
    }

    /**
     * 
     * @param {String} lectureId 
     */
    handleFromViewEnterLecture(lectureId) {
        TypeChecker.isString(lectureId);

        if (this.#socketReady()) {
            this.#socket.emit('enterLecture', lectureId);
        }
    }

    /**
     * 
     * @param {String} lectureId 
     * @param {boolean} lectureEnded 
     */
    handleFromViewLectureLeft(lectureId, lectureEnded) {
        TypeChecker.isString(lectureId);
        TypeChecker.isBoolean(lectureEnded);

        if (this.#socketReady()) {
            this.#socket.emit('leaveLecture', lectureId, lectureEnded);
        }
    }

    /**
     * 
     * @param {String} lectureId 
     */
    handleFromViewLectureDownload(lectureId) {
        TypeChecker.isString(lectureId);

        if (this.#socketReady()) {
            this.#socket.emit('lectureVideoDownload', lectureId);
        }
    }

    handleFromViewGetCurrentLectures() {
        if (this.#socketReady()) {
            this.#socket.emit('getCurrentLectures');
        }
    }

    handleFromViewShowSchedule() {
        if (this.#socketReady()) {
            this.#socket.emit('getSchedule');
        }
    }

    // called after clicking on achievement list
    handleFromViewShowAchievements() {
        if (this.#socketReady()) {
            this.#socket.emit('getAchievements');
        }
    }

    //called after click on friendlist button
    handleFromViewShowFriendList() {
        if (this.#socketReady()) {
            this.#socket.emit('getFriendList');
        }
    }

    /**
     * 
     * @param {String} groupName 
     * @param {String} chatId 
     */
    handleFromViewShowInviteFriends(groupName, chatId) {
        TypeChecker.isString(groupName);
            
        if (chatId)
            TypeChecker.isString(chatId);

        if (this.#socketReady()) {
            this.#socket.emit('getInviteFriends', groupName, chatId);
        }
    }

    //called after click on friendrequestlist button
    handleFromViewShowFriendRequestList() {
        if (this.#socketReady()) {
            this.#socket.emit('getFriendRequestList');
        }

    }

    /**
     * called after 'Add Friend' Button
     * 
     * @param {String} participantRepicientId 
     * @param {String} chatId 
     */
    handleFromViewNewFriendRequest(participantRepicientId, chatId) {
        TypeChecker.isString(participantRepicientId);
        TypeChecker.isString(chatId);

        if (this.#socketReady()) {
            this.#socket.emit('newFriendRequest', participantRepicientId, chatId);
        }
    }

    /**
     * called when a friend request is accepted
     * 
     * @param {BusinessCardClient} businessCard 
     */
    handleFromViewAcceptRequest(businessCard) {
        TypeChecker.isInstanceOf(businessCard, BusinessCardClient);

        if (this.#socketReady()) {
            var participantId = businessCard.getParticipantId();
            TypeChecker.isString(participantId);

            //Tells server to accept this request
            this.#socket.emit('handleFriendRequest', participantId, true);
            this.#gameView.updateFriendRequestListView(participantId, true);
            this.#gameView.addFriend(businessCard);
        }
    }

    /**
     * called when a friend request is declined
     * 
     * @param {String} participantId 
     */
    handleFromViewRejectRequest(participantId) {
        TypeChecker.isString(participantId);

        if (this.#socketReady()) {
            //Tells server to reject this request
            this.#socket.emit('handleFriendRequest', participantId, false);
            this.#gameView.updateFriendRequestListView(participantId, false);
        }
    }

    /**
     * called when this participants removes another from his friendlist
     * 
     * @param {String} friendId 
     */
    handleFromViewRemoveFriend(friendId) {
        TypeChecker.isString(friendId);

        if (this.#socketReady()) {
            this.#socket.emit('removeFriend', friendId);
            this.#gameView.removeFriend(friendId);
        }
    }

    /**
     * 
     * @param {String} chatId 
     */
    handleFromViewLeaveChat(chatId) {
        TypeChecker.isString(chatId);
        
        if (this.#socketReady()) {
            this.#socket.emit('removeParticipantFromChat', chatId);
            this.#gameView.removeChat(chatId);
        }
    }

    /**
     * 
     * @param {String} participantId
     */
    handleFromViewShowBusinessCard(participantId) {
        TypeChecker.isString(participantId);
        let ppant = this.#currentRoom.getParticipant(participantId);
        if (ppant === undefined) {
            throw new Error('Ppant with ' + participantId + ' is not in room');
        }
        if (this.#socketReady()) {
            //Emits to server target ID
            this.#socket.emit('getBusinessCard', participantId);
        }
    }

    handleFromViewShowProfile() {
        this.#gameView.initProfileView(this.#ownBusinessCard, this.#ownParticipant.getIsModerator());
    }

    /**
     * 
     * @param {number} npcId 
     */
    handleFromViewGetNPCStory(npcId) {
        TypeChecker.isInt(npcId);

        if (this.#socketReady()) {
            this.#socket.emit('getNPCStory', npcId);
        }
    }

    handleFromViewShowRankList() {
        if (this.#socketReady()) {
            this.#socket.emit('getRankList');
        }
    }

    /* Gets the list of chats the user is in - one-on-one and group - from the
     * server. The actual displaying is done in the method dealing with the 
     * response from the server.
     * - (E) */
    handleFromViewShowChatList() {
        if (this.#socketReady()) {
            this.#socket.emit('getChatList');
        }
    };

    /**
     * 
     * @param {String} chatID 
     */
    handleFromViewShowChatThread(chatID) {
        TypeChecker.isString(chatID);

        if (this.#socketReady()) {
            this.#socket.emit('getChatThread', chatID);
        }
    };

    /**
     * 
     * @param {String} chatId 
     */
    handleFromViewShowChatParticipantList(chatId) {
        TypeChecker.isString(chatId);

        if (this.#socketReady()) {
            this.#socket.emit('getChatParticipantList', chatId);
        }
    }

    /**
     * Triggers the createNewChat event and emits the id of the other chat participant to the server.
     * 
     * @param {String} participantId 
     */
    handleFromViewCreateNewChat(participantId) {
        TypeChecker.isString(participantId);

        if (this.#socketReady()) {
            this.#socket.emit('createNewChat', participantId);
        }
    }

    /**
     * 
     * @param {String} chatName 
     * @param {String[]} participantIdList 
     * @param {String} chatId 
     */
    handleFromViewCreateNewGroupChat(chatName, participantIdList, chatId) {
        TypeChecker.isString(chatName);
        TypeChecker.isInstanceOf(participantIdList, Array);
        participantIdList.forEach(ppantId => {
            TypeChecker.isString(ppantId);
        })
        if (chatId)
            TypeChecker.isString(chatId);

        if (this.#socketReady()) {
            this.#socket.emit('createNewGroupChat', chatName, participantIdList, chatId);
        }
    }

    /**
     * 
     * @param {String} chatId 
     * @param {String} messageText 
     */
    handleFromViewSendNewMessage(chatId, messageText) {
        TypeChecker.isString(chatId);
        TypeChecker.isString(messageText);

        if (this.#socketReady()) {
            this.#socket.emit('newChatMessage', chatId, messageText);
        }
    }

    handleFromViewClearInterval() {
        if (this.#socketReady()) {
            this.#socket.emit('clearInterval');
        }
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