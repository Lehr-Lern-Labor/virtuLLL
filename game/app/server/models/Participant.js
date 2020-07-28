var Position = require('./Position.js')
var ParticipantController = require('../../server/controller/ParticipantController.js')
var TypeChecker = require('../../utils/TypeChecker.js')
const Settings = require('../../utils/Settings.js');
const Direction = require('../models/Direction.js')
const BusinessCard = require('./BusinessCard.js')
const FriendList = require('./FriendList.js');
const Achievement = require('./Achievement.js');
const Chat = require('./Chat.js');
const Task = require('./Task.js');

module.exports = class Participant {

    #id;
    #accountId;
    #businessCard;
    #position;
    #direction;
    #friendList;
    #receivedRequestList;
    #sentRequestList;
    #isMod;
    #taskTypeMapping;
    #achievements;
    #awardPoints;
    #chatList;

    /**
     * 
     * @param {String} id 
     * @param {String} accountId 
     * @param {BusinessCard} businessCard 
     * @param {Position} position 
     * @param {Direction} direction 
     * @param {FriendList} friendList 
     * @param {FriendList} receivedRequestList 
     * @param {FriendList} sentRequestList 
     * @param {Array of Achievement} achievements 
     * @param {boolean} isMod 
     * @param {int} awardPoints
     * @param {Array of Chat} chatList 
     */
    constructor(id, accountId, businessCard, position, direction, friendList, receivedRequestList, sentRequestList, achievements, tasks, isMod, awardPoints, chatList)
    {
        //Typechecking

        TypeChecker.isString(id);
        TypeChecker.isString(accountId);
        TypeChecker.isInstanceOf(businessCard, BusinessCard);
        TypeChecker.isInstanceOf(position, Position);
        TypeChecker.isEnumOf(direction, Direction);

        //Currently disable because not included yet
        
        TypeChecker.isInstanceOf(friendList, FriendList);
        TypeChecker.isInstanceOf(receivedRequestList, FriendList);
        TypeChecker.isInstanceOf(sentRequestList, FriendList);
        TypeChecker.isInstanceOf(achievements, Array);
        achievements.forEach(achievement => {
            TypeChecker.isInstanceOf(achievements, Achievement);
        });
        TypeChecker.isBoolean(isMod);
        TypeChecker.isInt(awardPoints);
        TypeChecker.isInstanceOf(chatList, Array);
        chatList.forEach(chat => {
            TypeChecker.isInstanceOf(chat, Chat);
        });
        


        this.#id = id;
        this.#accountId = accountId;
        this.#businessCard = businessCard;
        this.#position = position;
        this.#direction = direction;
        this.#friendList = friendList; //this.#friendList = new FriendList(this.#id, []);  //TESTING
        this.#receivedRequestList = receivedRequestList; //this.#receivedRequestList = new FriendList(this.#id, []); //TESTING
        this.#sentRequestList = sentRequestList; //this.#sentRequestList = new FriendList(this.#id, []);  //TESTING
        this.#taskTypeMapping = {};
        tasks.forEach((x) => {
            this.#taskTypeMapping[x.getTaskType()] = 0;
        });

        this.#achievements = achievements; 
        this.#isMod = isMod; //this.#isMod = true;  //TESTING
        this.#awardPoints = awardPoints; //this.#points = 0;
        this.#chatList = chatList; //this.#chatList = [];
    }

    getId() 
    {
        return this.#id;
    }

    getPosition() 
    {
        return this.#position;
    }

    getDirection() {
        return this.#direction;
    }

    getAccountId()
    {
        return this.#accountId;
    }

    getBusinessCard()
    {
        return this.#businessCard;
    }

    getFriendList() {
        return this.#friendList;
    }

    getReceivedRequestList() {
        return this.#receivedRequestList;
    }

    getSentRequestList() {
        return this.#sentRequestList;
    }

    getAchievements() {
        return this.#achievements;
    }

    isModerator() {
        return this.#isMod;
    }

    getAchievements() {
        return this.#achievements;
    }

    getChatList() {
        return this.#chatList
    }

    setPosition(position) 
    {
        TypeChecker.isInstanceOf(position, Position);
        this.#position = position;
    }

    setDirection(direction) 
    {
        TypeChecker.isEnumOf(direction, Direction);
        this.#direction = direction;
    }

    /**
     * Method called, when this ppant sends a friend request to ppant with this businessCard
     * @param {BusinessCard} businessCard 
     */
    addSentFriendRequest(businessCard) {
        TypeChecker.isInstanceOf(businessCard, BusinessCard);
        let ppandId = businessCard.getParticipantId();
        if (!this.#sentRequestList.includes(ppantId) && !this.#friendList.includes(ppantId)) {
            this.#sentRequestList.addBusinessCard(businessCard);
        }
    }

    /**
     * Called when outgoing friend request to ppant with ppantId was accepted
     * @param {String} ppantId 
     */
    sentFriendRequestAccepted(ppantId) {
        TypeChecker.isString(ppantId);
        if (this.#sentRequestList.includes(ppantId)) {
            let busCard = this.#sentRequestList.getBusinessCard(ppantId);
            this.#friendList.addBusinessCard(busCard);
            this.#sentRequestList.removeBusinessCard(ppantId);
        }
    }

    /**
     * Called when outgoing friend request to ppant with ppantId was declined
     * @param {String} ppantId 
     */
    sentFriendRequestDeclined(ppantId) {
        TypeChecker.isString(ppantId);
        if (this.#sentRequestList.includes(ppantId)) {
            this.#sentRequestList.removeBusinessCard(ppantId);
        }
    }

    /**
     * Method called to add a FriendRequest
     * @param {BusinessCard} businessCard 
     */
    addFriendRequest(businessCard) {
        TypeChecker.isInstanceOf(businessCard, BusinessCard);
        let ppantId = businessCard.getParticipantId();
        if (!this.#receivedRequestList.includes(ppantId) && !this.#friendList.includes(ppantId)) {
            this.#receivedRequestList.addBusinessCard(businessCard);
        }
    }

    /**
     * Accept FriendRequest from ppantId, if a request exists
     * @param {String} ppantId 
     */
    acceptFriendRequest(ppantId) {
        TypeChecker.isString(ppantId);
        if (this.#receivedRequestList.includes(ppantId)) {
            let busCard = this.#receivedRequestList.getBusinessCard(ppantId);
            this.#friendList.addBusinessCard(busCard);
            this.#receivedRequestList.removeBusinessCard(ppantId);
        }
    }

    /**
     * Declines FriendRequest from ppantId, if a request exists
     * @param {String} ppantId 
     */
    declineFriendRequest(ppantId) {
        TypeChecker.isString(ppantId);
        if (this.#receivedRequestList.includes(ppantId)) {
            this.#receivedRequestList.removeBusinessCard(ppantId);
        }
    }

    /**
     * Removes ppant with ppantId from FriendList, if he is part of it
     * @param {String} ppantId 
     */
    removeFriend(ppantId) {
        TypeChecker.isString(ppantId);
        if (this.#friendList.includes(ppantId)) {
            this.#friendList.removeBusinessCard(ppantId);
        }
    }

    getTaskTypeMappingCounts() {
        return this.#taskTypeMapping;
    }


    addTask(task) {
        TypeChecker.isInstanceOf(task, Task);

        // increase the task counter and assign award points accordingly
        this.#taskTypeMapping[task.getTaskType()] = this.#taskTypeMapping[task.getTaskType()] + 1;
        this.addAwardPoints(task.getAwardPoints());
    }

    addAwardPoints(awardPoints) {
        this.#awardPoints += awardPoints;
    }

    setAchievements(achievements) {
        this.#achievements = achievements;
    }

    getAchievements() {
        return this.#achievements;
    }

    getAwardPoints() {
        return this.#awardPoints;
    }
}
