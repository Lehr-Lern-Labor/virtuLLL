/**
 * @enum game object type
 * 
 * @author Eric Ritte, Klaudia Leo, Laura Traub, Niklas Schmidt, Philipp Schumacher
 * @version 1.0.0
 */
const GameObjectType = Object.freeze({
        /*********************************/
        /** When new GameObjectType  is **/
        /** added here, don't forget to **/
        /** add  necessary  information **/
        /** for  easy  creation  to the **/
        /** GameObjectInfo-file!        **/
        /*********************************/

        // Blank
        BLANK: 'BLANK',
        // Tiles
        TILE: 'TILE',
        SELECTED_TILE: 'SELECTED_TILE',
        LEFTTILE: 'LEFTTILE',
        RIGHTTILE: 'RIGHTTILE',
        CARPET: 'CARPET',
        // Walls
        LEFTWALL: 'LEFTWALL',
        RIGHTWALL: 'RIGHTWALL',
        
        // Barriers
        BARRIER: 'BARRIER',
        
        // Wall-like objects
        // Schedule, Windows, Logo, Picture Frames...
        LEFTSCHEDULE: 'LEFTSCHEDULE',
        RIGHTWINDOW: 'RIGHTWINDOW',
        LEFTWINDOW: 'LEFTWINDOW',
        PICTUREFRAME: 'PICTUREFRAME',
        CONFERENCELOGO: 'CONFERENCELOGO',
        // Seating
        CHAIR: 'CHAIR',
        SOFA: 'SOFA',
        SEATINGAREA: 'SEATINGAREA',
        COMPUTER: 'COMPUTER',
        
        // Tables
        TABLE: 'TABLE',  
        
        // Counters
        COUNTER: 'COUNTER',
        
        // Cupboards
        CUPBOARD: 'CUPBOARD',
        SIDEBOARD: 'SIDEBOARD',
        
        // Decoration
        FLOORDECORATION: 'FLOORDECORATION',
        TABLEDECORATION: 'TABLEDECORATION',
        LEFTCOUNTERTOP: 'LEFTCOUNTERTOP',
        RIGHTCOUNTERTOP: 'RIGHTCOUNTERTOP',
        LEFTWALLSCREEN: 'LEFTWALLSCREEN',
        RIGHTWALLSCREEN: 'RIGHTWALLSCREEN',
        EXPLANATION: 'EXPLANATION',
        
        // Icons
        LEFTDOORICON: 'LEFTDOORICON',
        RIGHTDOORICON: 'RIGHTDOORICON',
        
        // Food & Drinks
        DRINKS: 'DRINKS',   
        SMALLFOOD: 'SMALLFOOD',
        TEA: 'TEA'         
});
    
if (typeof module === 'object' && typeof exports === 'object') {
        module.exports = GameObjectType;
}