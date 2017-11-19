define(function (require) {
    'use strict';

    var SequenceLogger = require('sequence').Logger;
    var bus = require('./bus');

    function Controller (id, max) {
        this.id = id;
        this.max = max;
        this.iterations = 0;
        this.seq = new SequenceLogger('Controller ' + this.id);
    }

    Controller.prototype = {
        start: function () {
            this.duration = Math.ceil(500 + Math.random() * 1000);
            this.seq.to(bus, 'timerUpdate', this.duration);
            this.subscription = bus.subscribe('timerUpdate.' + this.duration, function () {
                this.seq.from(bus, 'timerUpdate');
                this.iterations++;
                this.seq.note({iterations: this.iterations, last: !!this.last});
                if (this.iterations >= this.max) {
                    this.restart();
                }
            }.bind(this), {duration: this.duration});
        },

        stop: function () {
            this.seq.to(bus, 'unsubscribe', this.duration);
            this.subscription.unsubscribe();
        },

        restart: function () {
            this.stop();
            if (this.last) {
                return;
            }
            this.iterations = 0;
            this.max = 1;
            this.last = true;
            this.start();
        }
    };

    return Controller;
});
