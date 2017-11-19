define(function (require) {
    'use strict';

    var bus = require('./bus');
    var SequenceLogger = require('sequence').Logger;

    function Timer (duration) {
        this.count = 0;
        this.duration = duration;
        this.seq = new SequenceLogger('Timer ' + this.duration);
        this.seq.activate();
        this.start();
    }

    Timer.prototype = {
        start: function () {
            this.timer = setInterval(this.onTimerUpdate.bind(this), this.duration);
        },

        onTimerUpdate: function () {
            this.seq.to(bus, 'timerUpdate');
            bus.postMessage('timerUpdate.' + this.duration, this.duration);
        },

        stop: function () {
            clearInterval(this.timer);
            delete  this.timer;
            this.seq.deactivate();
        }
    };

    return Timer;
});