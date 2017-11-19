define(function (require) {
    'use strict';

    require('./timerService');

    var bus = require('./bus');
    var SequenceLogger = require('sequence').Logger;
    var Controller = require('./controller');

    SequenceLogger.config({logPrefix: '[timers]'});

    var controllerA = new Controller('A', 1);
    var controllerB = new Controller('B', 1);
    var generated = document.querySelector('.generated');

    controllerA.start();
    controllerB.start();

    bus.subscribe('AllDone', function () {
        generated.innerText = SequenceLogger.getData(true);
    });
});
