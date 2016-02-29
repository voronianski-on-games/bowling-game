(function (root, VDGame) {
    'use strict';

    function VDApp (options) {
        options = options || {};

        if (!options.el) {
            throw new Error('Element selector string `el` option is required');
        }

        var $el = document.querySelector(options.el);
        if (!$el) {
            throw new Error('There is no DOM element with selector `' + $el + '`');
        }

        var privateMethods = {};
        var publicMethods = {};

        // child views
        var gameView;

        privateMethods.cleanViews = function () {
            while ($el.firstChild) {
                $el.removeChild($el.firstChild);
            }
        };

        privateMethods.renderGameView = function () {
            privateMethods.cleanViews();
            $el.appendChild(gameView.render());
        };

        privateMethods.restartGame = function () {
            privateMethods.cleanViews();
            publicMethods.render();
        };

        publicMethods.render = function () {
            gameView = VDGameView({
                onRandomRollClick: privateMethods.renderGameView,
                onPinClick: privateMethods.renderGameView,
                onRestartClick: privateMethods.restartGame
            });
            $el.appendChild(gameView.render());
        };

        return publicMethods;
    }

    function VDGameView (handlers) {
        handlers = handlers || {};

        var privateMethods = {};
        var publicMethods = {};

        var game = VDGame();

        privateMethods.onRandomRollClick = function () {
            if (game.isFinished()) {
                return;
            }
            game.randomRoll();
            if (typeof handlers.onRandomRollClick === 'function') {
                handlers.onRandomRollClick();
            }
        };

        privateMethods.onPinClick = function (num) {
            if (game.isFinished()) {
                return;
            }
            game.roll(num);
            if (typeof handlers.onPinClick === 'function') {
                handlers.onPinClick(num);
            }
        };

        privateMethods.onRestartClick = function () {
            if (typeof handlers.onRestartClick === 'function') {
                handlers.onRestartClick();
            }
        };

        privateMethods.renderTitle = function () {
            var $title = document.createElement('h2');
            $title.className = 'mb3 mt0';
            $title.textContent = 'Bowling Game Calculator';
            return $title;
        };

        privateMethods.getFrameRollText = function (rollIndex, frame) {
            var emptyText = '&nbsp;';
            var strikeText = 'X';
            var spareText = '/';

            if (!frame) {
                return emptyText;
            }

            var roll = frame.getRollByIndex(rollIndex);
            var isValidRoll = typeof roll === 'number' && !isNaN(roll);
            if (frame.isLast()) {
                if (roll === VDGame.MAX_PINS) return strikeText;
                if (rollIndex === 2) {
                    var sum = roll + frame.getRollByIndex(1);
                    if (sum === VDGame.MAX_PINS) return spareText
                };
            } else {
                if (rollIndex === 1) {
                    if (frame.isStrike()) return emptyText;
                }
                if (rollIndex === 2) {
                    if (frame.isSpare()) return spareText;
                    if (frame.isStrike()) return strikeText;
                }
            }
            if (isValidRoll) return roll;
            return emptyText;
        }

        privateMethods.renderFrameBox = function (i) {
            var frameIndex = i+1;
            var frame = game.getFrame(frameIndex);
            var isLast = frameIndex === VDGame.MAX_PINS;

            var $frameBox = document.createElement('div');
            $frameBox.className = 'vd-framebox';

            if (isLast) {
                $frameBox.className += ' last';
            }

            $frameBox.innerHTML = '\
                <div class="vd-framebox-number">' + frameIndex +'</div>\
                <div class="vd-framebox-results">\
                    <div class="vd-framebox-rolls">\
                        <div class="vd-framebox-rolls-1">' + privateMethods.getFrameRollText(1, frame) + '</div>\
                        <div class="vd-framebox-rolls-2">' + privateMethods.getFrameRollText(2, frame) + '</div>'
                        + (isLast ? '<div class="vd-framebox-rolls-3">' + privateMethods.getFrameRollText(3, frame) + '</div>' : '') +
                    '</div>\
                    <div class="vd-framebox-total">' + (frame && frame.isFinished() ? frame.getTotalScore() : '&nbsp;') + '</div>\
                </div>';

            return $frameBox;
        };

        privateMethods.renderFrames = function () {
            var $frames = document.createElement('div');
            $frames.className = 'vd-frames clearfix bg-silver';

            var domFragment = document.createDocumentFragment();
            for (var i = 0, len = VDGame.MAX_FRAMES; i < len; i++) {
                var $frameBox = privateMethods.renderFrameBox(i);
                domFragment.appendChild($frameBox);
            }
            $frames.appendChild(domFragment);

            return $frames;
        };

        privateMethods.renderTotalScore = function () {
            var $score = document.createElement('div');
            $score.className = 'h5 bold center mt2';
            $score.textContent = 'TOTAL SCORE: ' + game.getTotalScore();
            return $score;
        };

        privateMethods.renderButtons = function () {
            var $btns = document.createElement('div');

            var domFragment = document.createDocumentFragment();
            for (var i = 0, len = VDGame.MAX_PINS; i <= len; i++) {
                var $pinBtn = document.createElement('button');
                $pinBtn.type = 'button';
                $pinBtn.className = 'btn btn-outline h6 mt2 mb2 mr1 fuchsia';
                $pinBtn.textContent = i;
                var leftPins = game.getFrame().getLeftPins();
                if (game.isFinished() || i > leftPins) {
                    $pinBtn.disabled = true;
                }
                $pinBtn.addEventListener('click', privateMethods.onPinClick.bind(null, i), false);
                domFragment.appendChild($pinBtn);
            }

            var $rollBtn = document.createElement('button');
            $rollBtn.type = 'button';
            $rollBtn.className = 'btn btn-primary mt2 mb2 mr1 bg-fuchsia';
            $rollBtn.textContent = 'Random roll';
            if (game.isFinished()) {
                $rollBtn.disabled = true;
            }
            $rollBtn.addEventListener('click', privateMethods.onRandomRollClick, false);
            domFragment.appendChild($rollBtn);

            var $restartBtn = document.createElement('button');
            $restartBtn.type = 'button';
            $restartBtn.className = 'btn btn-outline mt2 mb2 fuchsia';
            $restartBtn.textContent = 'Restart?';
            $restartBtn.addEventListener('click', privateMethods.onRestartClick, false);
            domFragment.appendChild($restartBtn)

            $btns.appendChild(domFragment);

            return $btns;
        };

        publicMethods.render = function (props) {
            props = props || {};

            var $el = document.createElement('div');

            var $title = privateMethods.renderTitle();
            $el.appendChild($title);

            var $frames = privateMethods.renderFrames();
            $el.appendChild($frames);

            var $score = privateMethods.renderTotalScore();
            $el.appendChild($score);

            var $btns = privateMethods.renderButtons();
            $el.appendChild($btns);

            return $el;
        };

        return publicMethods;
    }

    root.VDApp = VDApp;

})(this, this.VDGame);
