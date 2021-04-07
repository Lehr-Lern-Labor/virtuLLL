/**
 * The Notification Bar View
 * 
 * @author Eric Ritte, Klaudia Leo, Laura Traub, Niklas Schmidt, Philipp Schumacher
 * @version 1.0.0
 */
class NotificationBar extends Views {
    
    eventManager;
    
    /**
     * Creates an instance of NotificationBar
     * 
     * @param {EventManager} eventManager event manager
     */
    constructor(eventManager) {
        super();

        if (!!NotificationBar.instance) {
            return NotificationBar.instance;
        }

        NotificationBar.instance = this;

        this.eventManager = eventManager;

        $('#showNotifBar').hide();

        const TOGGLE_SPEED = 200;

        const notifBar = document.getElementById("notifBar")

        $('#showNotifBar').on('click', (event) => {
            event.preventDefault();
            notifBar.style.visibility = "visible";
            notifBar.style.zIndex = "5";

            $("#notifBar").animate({"right":"15px"}, TOGGLE_SPEED);
            $('#showNotifBar').hide();
            $('#hideNotifBar').show();
        })
        $('#hideNotifBar').on('click', (event) => {
            event.preventDefault();
            $("#notifBar").animate({"right":"-250px"}, TOGGLE_SPEED);
            
            setTimeout(() => {
                notifBar.style.visibility = "hidden";
                notifBar.style.zIndex = "0";
            }, TOGGLE_SPEED)
            
            $('#hideNotifBar').hide();
            $('#showNotifBar').show();
        })
    }

    /**
     * Draws new message notification
     * 
     * @param {String} senderUsername message sender username
     * @param {String} chatId chat ID
     */
    drawNewMessage(senderUsername, chatId) {
        const id = 'notifMessage' + senderUsername + chatId
        this.addNewNotificationDiv(id, `New message from ${senderUsername}.`)

        $('#' + id).on('click', (e) => {
            $('#' + id + 'Div').remove();
            return this.eventManager.handleChatThreadClicked(chatId);
        })
    }

    /**
     * Draws new chat notification
     * 
     * @param {String} senderUsername chat requester username
     * @param {String} chatId chat ID
     */
    drawNewChat(senderUsername, chatId) {
        const id = 'notifChat' + chatId
        this.addNewNotificationDiv(id, `${senderUsername} init chat with you.`)

        $('#' + id).on('click', (e) => {
            $('#' + id + 'Div').remove();
            return this.eventManager.handleChatThreadClicked(chatId);
        })
    }

    /**
     * Draws new group chat notification
     * 
     * @param {String} groupName chat group name
     * @param {String} creatorUsername inviter username
     * @param {String} chatId chat ID
     */
    drawNewGroupChat(groupName, creatorUsername, chatId) {
        const id = 'notifGroupChat' + chatId
        this.addNewNotificationDiv(id, `${creatorUsername} invited you to the group chat '${groupName}'.`)

        $('#' + id).on('click', (e) => {
            $('#' + id + 'Div').remove();
            return this.eventManager.handleChatThreadClicked(chatId);
        })
    }

    /**
     * Draws new friend request notification
     * 
     * @param {String} senderUsername requester username
     */
    drawNewFriendRequest(senderUsername) {
        const id = 'notifFriendRequest' + senderUsername
        this.addNewNotificationDiv(id, `New friend request from ${senderUsername}.`)

        $('#' + id).on('click', (e) => {
            $('#' + id + 'Div').remove();
            $('#nofriendrequest').empty();
            $('#friendRequestListModal .modal-body .list-group').empty()
            $('#friendRequestListModal').modal('show');
            $('#friendRequestListWait').show();
            return this.eventManager.handleFriendRequestListClicked();
        })
    }

    /**
     * Draws new friend notification
     * 
     * @param {String} friendUsername friend username
     */
    drawNewFriend(friendUsername) {
        const id = 'notifFriend' + friendUsername
        this.addNewNotificationDiv(id, `${friendUsername} accepted your friend request.`)

        $('#' + id).on('click', (e) => {
            $('#' + id + 'Div').remove();
            $('#friendListModal').modal('show');
            return this.eventManager.handleFriendListClicked();
        })
    }

    /**
     * Adds new notification div to the notif bar
     * 
     * @param {String} id notification id
     * @param {String} text notification text
     */
    addNewNotificationDiv(id, text) {
        if ($('#' + id + 'Div').length) {
            $('#' + id + 'Div').show();
        } else {
            $('#notifBar').prepend(`
                <div id="${id + 'Div'}" style="display:flex" class="list-group-item notifBarDiv">
                    <button class="self-align-end closeBtn friendRequestListButton" id="${"close" + id}" type="button"><i class="fa fa-close"></i></button>
                    <a id="${id}" role="button" data-toggle="modal" href="">
                        <div class="notifBarText wrapword">
                            <small>${text}</small>
                        </div>
                    </a>
                </div>
            `)
        }
        $('#notifBar').scrollTop(0);

        $('#close' + id).on('click', (e) => {
            $('#' + id + 'Div').remove();
        })
    }
}