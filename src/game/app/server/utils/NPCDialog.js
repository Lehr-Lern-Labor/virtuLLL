// TODO:
// This will be a file where all npcs dialog is stored
// this should also allow for easier translation
// maybe move it into the shared folder

/**
 * @enum NPC dialog file
 * 
 * @author Eric Ritte, Klaudia Leo, Laura Traub, Niklas Schmidt, Philipp Schumacher
 * @version 1.0.0
 */
 const NPCDialog = Object.freeze({
    foyerHelperDialog: ['Hey! Welcome to our Foyer!',
        'The door to my left leads to the lectures. Take a look and have fun! If you are on time and stay till the end, you can ask questions to the orator through the lecture chat.',
        'Enjoy your stay!'],
    basicTutorialDialog: ['Willkommen im <strong>virtuellen Lehr-Lern-Labor Informatik Karlsruhe</strong>.<br><br>' +
        'Mein Name ist Herbert und ich habe ein paar wichtige Hinweise für deinen Besuch hier im LLL.',
		'<strong>Die Steuerung</strong><br><br>' + 
		'Mit den Pfeil- oder WASD-Tasten kannst du dich fortbewegen. Du kannst auch auf eine Bodenfließe doppelklicken, um an die jeweilge Stelle zu gelangen.<br><br>' +
		'Um einen Raum zu betreten, klicke auf die entsprechende Bodenfließe oder laufe gegen die Tür. Du musst in der Nähe sein, um die Tür nutzen zu können.<br><br>' +
		'Wenn du auf die Bodenfließe unter einer anderen Person klickst, kannst du mit ihr interagieren.',
		'<strong>Videomeetings</strong><br><br>' +
		'Wenn du auf <i class="fa fa-video"></i> klickst, kannst du einem Videomeeting beitreten. Dem Lehr-Lern-Labor-Meeting können alle anwesenden Besucher beitreten.<br><br>'+
		'Wenn du das Meeting minimierst (<i class="fa fa-window-minimize"></i>), läuft es im Hintergrund weiter. Kamera und Mikrofon bleiben ein- bzw. ausgeschaltet.<br><br>"' +
		'Um ein Meeting zu verlassen, lege auf oder schließe das Meeting (<i class="fa fa-close"></i>).',
		'Manchmal triffst du auf NPCs, also nicht spielbare Charaktere, wie mich. Sie könnten wichtige Infos für dich haben.<br><br>' +
		'Einige Gegenstände kann man anklicken. Manche der Pop-Ups lassen sich mit <i class="fa fa-window-maximize"></i> im Vollbildmodus betrachten.',
		'Wenn du Fragen oder Probleme hast, kannst du dich an einen der Moderatoren wenden. Du erkennst sie an ihrem grünen Namensschild.<br><br>' +
		'Und jetzt wünsche ich dir viel Spaß bei deinem Besuch!'],
    chefDialog: ['Hello mate. Are you hungry?',
        'Come back later to eat some of my fresh food!'],

});

if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = NPCDialog;
}