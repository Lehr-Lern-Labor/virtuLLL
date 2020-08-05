const chai = require('chai');
const assert = chai.assert;
const Achievement = require('../../../game/app/server/models/Achievement.js');
const TypeOfTask = require('../../../game/app/utils/TypeOfTask.js');

//example achievement
var id = '1a2b';
var title = 'Achievement collector';
var icon = 'star';
var description = 'collect all achievements';
var currentLevel = 1;
var color = '#C9B037';
var awardPoints = 10;
var maxLevel = 3;
var taskType = TypeOfTask.RECEPTIONVISIT;

achievement = new Achievement(id, title, icon, description, currentLevel, color, awardPoints, maxLevel, taskType);

describe('Achievement getter functions', function() {
    it('test getTaskType', function() {
        assert.equal(achievement.getTaskType(), taskType);
    })  

    it('test getCurrentLevel', function() {
        assert.equal(achievement.getCurrentLevel(), currentLevel);
    })

    it('test getAwardPoints', function() {
        assert.equal(achievement.getAwardPoints(), awardPoints);
    })
})

describe('Achievement setter functions', function() {
    it('test setCurrentLevel', function() {
        achievement.setCurrentLevel(2);
        assert.equal(achievement.getCurrentLevel(), 2);
    })

    it('test setColor', function() {
        achievement.setColor('#FFFFFF');
        assert.equal(achievement.getColor(), '#FFFFFF');
    })

    it('test setAwardPoints', function() {
        achievement.setAwardPoints(20);
        assert.equal(achievement.getAwardPoints(), 20);
    })
})

describe('Achievement equals function', function() {
    it('test equals', function() {
        let achievementToCompare = new Achievement(2, 'Network Guru', 'icon', 'chat with different people', 2, '#FFFFFF', 20, 3, TypeOfTask.ASKQUESTIONINLECTURE);
        assert.equal(achievement.equals(achievementToCompare), false);
        assert.equal(achievement.equals(achievement), true);
    })
})