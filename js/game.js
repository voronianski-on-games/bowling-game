(function (root) {
    'use strict';

    var MAX_FRAMES = 10;
    var MAX_PINS = 10;

    function VDGame (handlers) {
        handlers = handlers || {};

        var currentFrame = VDGameFrame(1);
        var frames = [currentFrame];

        var privateMethods = {};
        var publicMethods = {};

        privateMethods.nextFrame = function () {
            var nextFrameIndex = frames.length+1;
            if (currentFrame.isFinished() && nextFrameIndex <= MAX_FRAMES) {
                currentFrame = VDGameFrame(nextFrameIndex);
                frames.push(currentFrame);
            }
        };

        privateMethods.checkSpareBonus = function (spareFrame) {
            var frameIndex = spareFrame.getIndex();
            var nextFrameInGame = frames[frameIndex];
            if (!nextFrameInGame) {
                return;
            }

            var firstRollAfterResult = nextFrameInGame.getRollByIndex(1);
            spareFrame.addBonus(firstRollAfterResult);
        };

        privateMethods.checkStrikeBonus = function (strikeFrame) {
            var frameIndex = strikeFrame.getIndex();
            var nextFrameInGame = frames[frameIndex];
            if (!nextFrameInGame) {
                return;
            }

            var firstRollAfterResult = nextFrameInGame.getRollByIndex(1);
            var secondRollAfterResult = 0;
            if (nextFrameInGame.isStrike()) {
                var nextNextFrameInGame = frames[frameIndex+1];
                if (nextNextFrameInGame) {
                    secondRollAfterResult = nextNextFrameInGame.getRollByIndex(1);
                    strikeFrame.addBonus(firstRollAfterResult + secondRollAfterResult);
                }
            } else {
                secondRollAfterResult = nextFrameInGame.getRollByIndex(2);
                strikeFrame.addBonus(firstRollAfterResult + secondRollAfterResult);
            }
        };

        privateMethods.updateFramesBonusPoints = function () {
            if (!currentFrame.isFinished()) {
                return;
            }

            frames.forEach(function (frame) {
                if (frame.hadBonus()) {
                    return;
                }
                if (frame.isStrike()) {
                    privateMethods.checkStrikeBonus(frame);
                }
                if (frame.isSpare()) {
                    privateMethods.checkSpareBonus(frame);
                }
            });
        };

        publicMethods.isFinished = function () {
            var finshedFramesCount = frames.length;
            return finshedFramesCount === 10 && frames[finshedFramesCount-1].isFinished();
        };

        publicMethods.getFrame = function (frameIndex) {
            return frames[frameIndex > 0 ? frameIndex-1 : frames.length-1];
        };

        publicMethods.getTotalScore = function () {
            return frames.reduce(function (memo, frame) {
                return memo + frame.getTotalScore();
            }, 0);
        };

        publicMethods.roll = function (pins) {
            currentFrame.roll(pins);
            privateMethods.updateFramesBonusPoints();
            privateMethods.nextFrame();
        };

        publicMethods.randomRoll = function () {
            var pins = Math.floor(Math.random() * (currentFrame.getLeftPins() + 1));
            publicMethods.roll(pins);
        };

        return publicMethods;
    }

    function VDGameFrame (index) {
        index = index || 1;

        var leftPins = MAX_PINS;
        var rolls = [];
        var spare = false;
        var strike = false;
        var bonus = 0;

        var publicMethods = {};

        publicMethods.isFinished = function () {
            var rollsCount = rolls.length;
            if (publicMethods.isLast()) {
                return rollsCount === 3 || rollsCount === 2 && publicMethods.getTotalScore() < 10;
            } else {
                return strike || rollsCount === 2;
            }
        };

        publicMethods.isStrike = function () {
            return strike;
        };

        publicMethods.isSpare = function () {
            return spare;
        };

        publicMethods.getTotalScore = function () {
            var total = rolls.reduce(function (memo, roll) {
                return memo + roll;
            }, 0);

            return total + bonus;
        };

        publicMethods.addBonus = function (points) {
            bonus += points;
        };

        publicMethods.hadBonus = function () {
            return !!bonus;
        }

        publicMethods.getRollByIndex = function (index) {
            return rolls[index-1];
        };

        publicMethods.isLast = function () {
            return index === 10;
        };

        publicMethods.getLeftPins = function () {
            return leftPins;
        };

        publicMethods.getIndex = function () {
            return index;
        };

        publicMethods.roll = function (pins) {
            pins = pins || 0;

            if (pins > leftPins || pins < 0) {
                throw new Error('Number of pins in roll is not in range of 0-' + leftPins);
            }
            if (publicMethods.isFinished()) {
                return;
            }

            leftPins -= pins;

            var doneRolls = rolls.length+1;
            if (doneRolls === 1 && leftPins === 0) {
                if (publicMethods.isLast()) {
                    leftPins += 10;
                } else {
                    strike = true;
                }
            }
            if (doneRolls === 2 && leftPins === 0) {
                if (publicMethods.isLast()) {
                    leftPins += 10;
                } else {
                    spare = true;
                }
            }

            rolls.push(pins);
        };

        return publicMethods;
    }

    VDGame.MAX_FRAMES = MAX_FRAMES;
    VDGame.MAX_PINS = MAX_PINS;

    root.VDGame = VDGame;

})(this);
