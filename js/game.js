(function (root) {
    'use strict';

    function VDGame (handlers) {
        handlers = handlers || {};

        var maxFrames = 10;
        var currentFrame = VDGameFrame(1);
        var frames = [currentFrame];

        var privateMethods = {};
        var publicMethods = {};

        privateMethods.nextFrame = function () {
            var nextFrameIndex = frames.length+1;
            if (currentFrame.isFinished() && nextFrameIndex <= maxFrames) {
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
                    var bonus = firstRollAfterResult + secondRollAfterResult;
                    strikeFrame.addBonus(bonus);
                }
            } else {
                secondRollAfterResult = nextFrameInGame.getRollByIndex(2);
                var bonus = firstRollAfterResult + secondRollAfterResult;
                strikeFrame.addBonus(bonus);
            }

            // console.log(firstRollAfterResult, secondRollAfterResult, bonus)
            // if (bonus) {
            // }
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

        publicMethods.getFrame = function (frameIndex) {
            return frames[frameIndex > 0 ? frameIndex-1 : frames.length-1];
        };

        publicMethods.getTotalScore = function () {
            return frames.reduce(function (memo, frame) {
                return memo + frame.getTotalScore();
            }, 0);
        };

        publicMethods.roll = function (pins) {
            privateMethods.nextFrame();
            currentFrame.roll(pins);
            privateMethods.updateFramesBonusPoints();
        };

        publicMethods.randomRoll = function () {
            // currentFrame.randomRoll(); ?
        };

        return publicMethods;
    }

    function VDGameFrame (index) {
        index = index || 1;

        var leftPins = 10;
        var rolls = [];
        var maxRolls = index === 10 ? 3 : 2;
        var spare = false;
        var strike = false;
        var bonus = 0;

        var publicMethods = {};

        publicMethods.isFinished = function () {
            return strike || maxRolls === rolls.length;
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
                if (index < 10) {
                    strike = true;
                } else {
                    leftPins += 10;
                }
            }
            if (doneRolls === 2 && leftPins === 0) {
                if (index < 10) {
                    spare = true;
                } else {
                    leftPins += 10;
                }
            }

            rolls.push(pins);
        };

        return publicMethods;
    }

    root.VDGame = VDGame;

})(this);
