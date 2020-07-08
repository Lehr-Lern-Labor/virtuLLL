/*const AvatarView = require("./AvatarView.js");
var TypeChecker = require('../../../utils/TypeChecker.js')


module.exports = */
class ParticipantAvatarView extends AvatarView {

    #participantId;
    #spriteSheet = new SpriteSheet('CharacterSpriteSheetBody.png', 64, 128);
    #topClothing = new SpriteSheet('TopClothingBlueShirtSpriteSheet.png', 64, 128);
    #bottomClothing = new SpriteSheet('BottomBlackTrousersSpriteSheet.png', 64, 128);
    #shoes = new SpriteSheet('ShoesBlackSpriteSheet.png', 64, 128);
    #walkingDownRightAnimation;
    #walkingUpRightAnimation;
    #walkingDownLeftAnimation;
    #walkingUpLeftAnimation;
    #standingUpLeftAnimation;
    #standingUpRightAnimation;
    #standingDownLeftAnimation;
    #standingDownRightAnimation;
    #currentAnimation
    #walking = false;

    constructor(position, direction, participantId) {
        super(position, direction);
        TypeChecker.isInt(participantId)
        this.#participantId = participantId;
        this.#walkingDownRightAnimation = new SpriteAnimation(this.#spriteSheet, this.#topClothing, this.#bottomClothing, this.#shoes, 3, 1, 4);
        this.#walkingUpRightAnimation = new SpriteAnimation(this.#spriteSheet, this.#topClothing, this.#bottomClothing, this.#shoes, 3, 11, 14);
        this.#walkingDownLeftAnimation = new SpriteAnimation(this.#spriteSheet, this.#topClothing, this.#bottomClothing, this.#shoes, 3, 6, 9);
        this.#walkingUpLeftAnimation = new SpriteAnimation(this.#spriteSheet, this.#topClothing, this.#bottomClothing, this.#shoes, 3, 16, 19);
        this.#standingUpLeftAnimation = new SpriteAnimation(this.#spriteSheet, this.#topClothing, this.#bottomClothing, this.#shoes, 15, 15, 15);
        this.#standingUpRightAnimation = new SpriteAnimation(this.#spriteSheet, this.#topClothing, this.#bottomClothing, this.#shoes, 15, 10, 10); 
        this.#standingDownLeftAnimation = new SpriteAnimation(this.#spriteSheet, this.#topClothing, this.#bottomClothing, this.#shoes, 15, 5, 5);
        this.#standingDownRightAnimation = new SpriteAnimation(this.#spriteSheet, this.#topClothing, this.#bottomClothing, this.#shoes, 15, 0, 0);
        this.#currentAnimation = this.#standingDownRightAnimation;


    }

    getParticipantId() {
        return this.#participantId;
    }

    update() {
        this.#currentAnimation.update();
    }

    updateCurrentAnimation() {
        var direction = super.getDirection();
        if (this.#walking === true) {
            if (direction === 'UPLEFT') {
                this.#currentAnimation = this.#walkingUpLeftAnimation;
            } else if (direction === 'UPRIGHT') {
                this.#currentAnimation = this.#walkingUpRightAnimation;
            } else if (direction === 'DOWNLEFT') {
                this.#currentAnimation = this.#walkingDownLeftAnimation;
            } else if (direction === 'DOWNRIGHT') {
                this.#currentAnimation = this.#walkingDownRightAnimation;
            }

        } else {
            if (direction === 'UPLEFT') {
                this.#currentAnimation = this.#standingUpLeftAnimation;
            } else if (direction === 'UPRIGHT') {
                this.#currentAnimation = this.#standingUpRightAnimation;
            } else if (direction === 'DOWNLEFT') {
                this.#currentAnimation = this.#standingDownLeftAnimation;
            } else if (direction === 'DOWNRIGHT') {
                this.#currentAnimation = this.#standingDownRightAnimation;
            }
        }
    }

    updateWalking(isMoving) {
        this.#walking = isMoving;
    }

    draw() {
        this.#currentAnimation.draw(100, 100); //TODO pass position of avatar
    }
}
