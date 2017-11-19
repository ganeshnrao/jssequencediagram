define(function (require) {
    'use strict';

    var _ = require('lodash');
    var SequenceLogger = require('sequence').Logger;
    var bus = require('./bus');
    var Timer = require('./timer');

    function TimerService () {
        this.timers = {};
        this.seq = new SequenceLogger('TimerService');
        bus.metaSubscribe('timerUpdate.#', function (data) {
            this.seq.from(bus, data.action, data.context.duration);
            if (data.action === 'subscribe') {
                if (!this.timers[data.context.duration]) {
                    this.seq.to('Timer ' + data.context.duration, 'new');
                    this.timers[data.context.duration] = new Timer(data.context.duration);
                }
                this.timers[data.context.duration].count++;
            } else {
                this.timers[data.context.duration].count--;
                if (this.timers[data.context.duration].count <= 0) {
                    this.seq.to('Timer ' + data.context.duration, 'stop');
                    this.timers[data.context.duration].stop();
                    delete this.timers[data.context.duration];
                    if (_.isEmpty(this.timers)) {
                        bus.postMessage('AllDone');
                    }
                }
            }
        }.bind(this));
    };

    return new TimerService();
});