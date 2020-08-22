if (typeof module === 'object' && typeof exports === 'object') {
    Views = require('./Views')
}

class NotificationBar extends Views {
    constructor() {
        super();
    }

    drawNewMessage(senderUsername, chatId) {
        if ($('#notifMessageDiv' + senderUsername + chatId).length) {
            $('#notifMessageDiv' + senderUsername + chatId).show();
        } else {
            $('#notifBar').prepend(`
                <div id="${"notifMessageDiv" + senderUsername + chatId}" style="display:flex">
                    <button class="self-align-end closeBtn" id="${"closeNotifMessage" + senderUsername + chatId}" type="button"><i class="fa fa-close"></i></button>
                    <a id="${"notifMessage" + senderUsername + chatId}" role="button" data-toggle="modal" href="">
                        <div class="notifBarDiv">
                            <small>New message from ${senderUsername}.</small>
                        </div>
                    </a>
                </div>
            `)
        }
        $('#notifBar').scrollTop(0);
        $('#closeNotifMessage' + senderUsername + chatId).on('click', function (event) {
            $('#notifMessageDiv' + senderUsername + chatId).hide();
        })

        $('#notifMessage' + senderUsername + chatId).on('click', function (event) {
            $('#notifMessageDiv' + senderUsername + chatId).hide();
            return new EventManager().handleChatThreadClicked(chatId);
        })
    }

    drawNewChat(senderUsername, chatId) {
        if ($('#notifChatDiv' + chatId).length) {
            $('#notifChatDiv' + chatId).show();
        } else {
            $('#notifBar').prepend(`
                <div id="${"notifChatDiv" + chatId}" style="display:flex">
                    <button class="self-align-end closeBtn" id="${"closeNotifChat" + chatId}" type="button"><i class="fa fa-close"></i></button>
                    <a id="${"notifChat" + chatId}" role="button" data-toggle="modal" href="">
                        <div class="notifBarDiv">
                            <small>${senderUsername} init chat with you.</small>
                        </div>
                    </a>
                </div>
            `)
        }
        $('#notifBar').scrollTop(0);
        $('#closeNotifChat' + chatId).on('click', function (event) {
            $('#notifChatDiv' + chatId).hide();
        })

        $('#notifChat' + chatId).on('click', function (event) {
            $('#notifChatDiv' + chatId).hide();
            return new EventManager().handleChatThreadClicked(chatId);
        })
    }

    drawNewGroupChat(groupName, creatorUsername, chatId) {
        if ($('#notifGroupChatDiv' + chatId).length) {
            $('#notifGroupChatDiv' + chatId).show()
        } else {
            $('#notifBar').prepend(`
                <div id="${"notifGroupChatDiv" + chatId}" style="display:flex">
                    <button class="self-align-end closeBtn" id="${"closeNotifGroupChat" + chatId}" type="button"><i class="fa fa-close"></i></button>
                    <a id="${"notifGroupChat" + chatId}" role="button" data-toggle="modal" href="">
                        <div class="notifBarDiv">
                            <small>${creatorUsername} invited you to the group chat '${groupName}'.</small>
                        </div>
                    </a>
                </div>
            `)
        }
        $('#notifBar').scrollTop(0);
        $('#closeNotifGroupChat' + chatId).on('click', function (event) {
            $('#notifGroupChatDiv' + chatId).hide();
        })

        $('#notifGroupChat' + chatId).on('click', function (event) {
            $('#notifGroupChatDiv' + chatId).hide();
            return new EventManager().handleChatThreadClicked(chatId);
        })
    }

    drawNewFriendRequest(senderUsername) {
        if ($('#notifFriendRequestDiv' + senderUsername).length) {
            $('#notifFriendRequestDiv' + senderUsername).show();
        } else {
            $('#notifBar').prepend(`
                <div id="${"notifFriendRequestDiv" + senderUsername}" style="display:flex">
                    <button class="self-align-end closeBtn" id="${"closeNotifFriendRequest" + senderUsername}" type="button"><i class="fa fa-close"></i></button>
                    <a id="${"notifFriendRequest" + senderUsername}" role="button" data-toggle="modal" href="">
                        <div class="notifBarDiv">
                            <small>New friend request from ${senderUsername}.</small>
                        </div>
                    </a>
                </div>
            `)
        }
        $('#notifBar').scrollTop(0);
        $('#closeNotifFriendRequest' + senderUsername).on('click', function (event) {
            $('#notifFriendRequestDiv' + senderUsername).hide();
        })

        $('#notifFriendRequest' + senderUsername).on('click', function (event) {
            $('#notifFriendRequestDiv' + senderUsername).hide();
            return new EventManager().handleFriendRequestListClicked();
        })
    }

    drawNewFriend(friendUsername) {
        if ($('#notifFriendDiv' + friendUsername).length) {
            $('#notifFriendDiv' + friendUsername).show();
        } else {
            $('#notifBar').prepend(`
                <div id="${"notifFriendDiv" + friendUsername}" style="display:flex">
                    <button class="self-align-end closeBtn" id="${"closeNotifFriend" + friendUsername}" type="button"><i class="fa fa-close"></i></button>
                    <a id="${"notifFriend" + friendUsername}" role="button" data-toggle="modal" href="">
                        <div class="notifBarDiv">
                            <small>${friendUsername} accepted your friend request.</small>
                        </div>
                    </a>
                </div>
            `)
        }
        $('#notifBar').scrollTop(0);

        $('#closeNotifFriend' + friendUsername).on('click', function (event) {
            $('#notifFriendDiv' + friendUsername).hide();
        })
        $('#notifFriend' + friendUsername).on('click', function (event) {
            $('#notifFriendDiv' + friendUsername).hide();
            return new EventManager().handleFriendListClicked();
        })
    }
}

if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = NotificationBar;
}