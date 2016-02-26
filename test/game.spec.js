describe('game module', function () {
    var game;

    it('should be ok', function () {
        expect(VDGame).to.be.ok;
    });

    describe('when playing the game', function () {
        beforeEach(function () {
            game = VDGame();
        });

        function rollMany (n, pins) {
            for (var i = 0; i < n; i++) {
                game.roll(pins)
            }
        }

        function rollSpare () {
            game.roll(5);
            game.roll(5);
        }

        function rollStrike () {
            game.roll(10);
        }

        it('should start with 0 score', function () {
            expect(game.getTotalScore()).to.equal(0);
        });

        it('should update game score after each roll', function () {
            game.roll(1);
            game.roll(5);
            expect(game.getTotalScore()).to.equal(6);
        });

        it('should start new frame after each second roll', function () {
            expect(game.getFrame().getIndex()).to.equal(1);
            game.roll(2);
            game.roll(1);
            expect(game.getFrame().getIndex()).to.equal(1);
            game.roll(3);
            expect(game.getFrame().getIndex()).to.equal(2);
        });

        it('should start new frame if strike', function () {
            expect(game.getFrame().getIndex()).to.equal(1);
            rollStrike();
            game.roll(2);
            expect(game.getFrame().getIndex()).to.equal(2);
        });

        it('should count pins left for each roll in frame', function () {
            game.roll(1);
            game.roll(4);
            expect(game.getFrame().getLeftPins()).to.equal(5);
            game.roll(9);
            expect(game.getFrame().getLeftPins()).to.equal(1);
        });

        it('should not allow to roll more pins than possible in frame', function () {
            expect(game.roll.bind(null, 11)).to.throw(Error);
        });

        it('should not allow to roll more pins than left in frame', function () {
            game.roll(2);
            expect(game.roll.bind(null, 9)).to.throw(Error);
        });

        it('should mark frame as spare when necessary', function () {
            game.roll(3);
            expect(game.getFrame().isSpare()).to.equal(false);
            game.roll(4);
            expect(game.getFrame().isSpare()).to.equal(false);
            game.roll(1);
            expect(game.getFrame().isSpare()).to.equal(false);
            game.roll(9);
            expect(game.getFrame().isSpare()).to.equal(true);
        });

        it('should mark frame as strike when necessary', function () {
            game.roll(3);
            expect(game.getFrame().isStrike()).to.equal(false);
            game.roll(4);
            expect(game.getFrame().isStrike()).to.equal(false);
            rollStrike();
            expect(game.getFrame().isStrike()).to.equal(true);
        });

        it('should calculate bonus total score based on spare', function () {
            rollSpare();
            expect(game.getTotalScore()).to.equal(10);
            game.roll(6);
            game.roll(3);
            expect(game.getTotalScore()).to.equal(25);
            rollSpare();
            expect(game.getTotalScore()).to.equal(35);
            rollSpare();
            expect(game.getTotalScore()).to.equal(50);
        });

        it('should calculate bonus total score based on strike', function () {
            rollStrike();
            expect(game.getTotalScore()).to.equal(10);
            game.roll(6);
            game.roll(4);
            expect(game.getTotalScore()).to.equal(30);
        });

        it('should calculate bonus total score based on mix of strike and spare', function () {
            rollSpare();
            expect(game.getTotalScore()).to.equal(10);
            game.roll(1);
            game.roll(3);
            expect(game.getTotalScore()).to.equal(15);
            rollStrike();
            rollSpare();
            expect(game.getTotalScore()).to.equal(45);
        });

        it('should support last frame of the game', function () {
            rollMany(9, 0);
            expect(game.getTotalScore()).to.equal(0);
            rollSpare();
            expect(game.getTotalScore()).to.equal(10);
            game.roll(1);
            expect(game.getTotalScore()).to.equal(11);
        });

        it('should calculate proper gutter result', function () {
            rollMany(20, 0);
            expect(game.getTotalScore()).to.equal(0);
        });

        it('should calculate proper best result', function () {
            rollMany(12, 10);
            expect(game.getTotalScore()).to.equal(300);
        });
    });
});
