const Direction = require('../../client/shared/Direction');
const ShirtColor = require('../../client/shared/ShirtColor.js');
const DisplayName = require('../../client/shared/DisplayName.js');

/**
 * Settings for LLL conference
 * @module Settings
 * 
 * @author Eric Ritte, Klaudia Leo, Laura Traub, Niklas Schmidt, Philipp Schumacher
 * @version 1.0.0
 */
module.exports = Object.freeze({

    /* Room-IDs */
    FOYER_ID: 0,
    EXHIBITION_ID: 10,
    EXHIBITION_1_ID: 11,
    EXHIBITION_2_ID: 12,
    EXHIBITION_3_ID: 13,
    EXHIBITION_4_ID: 14,
    EXHIBITION_5_ID: 15,
    LOUNGE_ID: 20,
    GAMING_ID: 200,
    WS_APP_ID: 21,
    WS_APP_1_ID: 211,
    WS_APP_2_ID: 212,
    SC_INFO_ID: 22,  
    SC_INFO_EXHIBIT_ID: 221,    
    SC_SE_ID: 23,  
    SC_DIGI_ID: 24,  
	
    /* Start-Position Constants */
    STARTROOM_ID: 0,	
    STARTPOSITION_X: 12,
    STARTPOSITION_Y: 5,
    STARTDIRECTION: Direction.UPRIGHT,
    TYPE_OF_STARTROOM: 'CUSTOM',

    /* Chat Constants */
    MAXNUMMESSAGES_LECTURECHAT: 100,
    MAXNUMMESSAGES_ALLCHAT: 100,
    MAXNUMMESSAGES_GROUPCHAT: 100,
    MAXNUMMESSAGES_ONETOONECHAT: 100,
    MAXGROUPPARTICIPANTS: 255,

    /* Ranklist Constants */
    MAXNUMRANKLIST: 21,

    /* Object Constants */
    SMALL_OBJECT_WIDTH: 1,
    SMALL_OBJECT_LENGTH: 1,

    /* Conference Constants */
    CONFERENCE_ID: 'LLL',

    /* Meeting Constants */
    CONFERENCE_MEETINGNAME: 'Lehr-Lern-Labor',
    DEFAULT_MEETINGDOMAIN: '//talk.lehr-lern-labor.info/',

    /* Lecture Constants */
    SHOWLECTURE: 10 * 60 * 1000, //lecture is shown 10 minutes before lecture start 
    TOKENCOUNTERSTART: 5 * 60 * 1000,

    /* Moderator-Settings */
    CMDSTARTCHAR: "\\", // moved the actual commands into a separate file for easier handling,

    /* Movement-Speed Constants */
    MOVEMENTSPEED_X: 1,
    MOVEMENTSPEED_Y: 1,

    /* Shirt Color Default Settings */
    DEFAULT_SHIRTCOLOR_PPANT: ShirtColor.BLUE,
    DEFAULT_SHIRTCOLOR_NPC: ShirtColor.RED,

    /* Decides whether video storage is needed or not */
    VIDEOSTORAGE_ACTIVATED: false,

    /* Decides whether chat meeting is allowed or not */
    CHATMEETING_ACTIVATED: false,

    /* Decides which registration system is used */
    /* Advanced registration system includes username, title, surname, forename, job, company, email */
    /* Non advanced registration system just includes username and forename (+ registration time) */
    ADVANCED_REGISTRATION_SYSTEM: false,

    /* Name that is displayed above avatar and in meetings */
    DISPLAY_NAME: DisplayName.FORENAME,

    /* Suffix of account collection in DB: account collection name = accountsACCOUNTDB_SUFFIX */
    ACCOUNTDB_SUFFIX: "LLL",

    /* Decides which language is selected as default if clients preferred language is not available */
    DEFAULT_LANGUAGE: "de",

    /* Decides whether or not moderators have the power to see chats and meetings 
       from all exisiting groups, even if they are not part of them */
    MODS_SEE_EVERYTHING: true
});