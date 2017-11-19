define(function (require) {
    'use strict';

    var _ = require('lodash');
    var enabled = true;
    var sequenceData = [];
    var participants = {};
    var participantNameCounter = 0;

    function Logger (participantName) {
        this.name = inferName(participantName);
        this.enabled = true;
        participants[this.name] = this;
    }

    Logger.prototype = {
        from: function (fromParticipant, commandName) {
            if (enabled) {
                capture(inferName(fromParticipant) + '->' + this.name + ': ' + inferCommand(commandName), this);
            }
        },

        to: function (toParticipant, commandName) {
            if (enabled) {
                capture(this.name + '->' + inferName(toParticipant) + ': ' + inferCommand(commandName), this);
            }
        },

        activate: function () {
            if (enabled) {
                capture('activate ' + this.name, this);
            }
        },

        deactivate: function () {
            if (enabled) {
                capture('deactivate ' + this.name, this);
            }
        },

        note: function (data) {
            if (enabled) {
                capture('note ' + this.name + '\n' + _.map(data, function (value, key) {
                    return key + ' = ' + value;
                }).join('\n') + 'note end ' + this.name, this);
            }
        },

        disable: function () {
            this.enabled = false;
        },

        enable: function () {
            this.enabled = true;
        }
    };

    Logger.logPrefix = '[seq]';
    Logger.logger = console.log;
    Logger.unknownCommand = 'n/a';
    Logger.unknownParticipantPrefix = 'Unknown';

    Logger.config = function (settings) {
        Logger.logPrefix = settings.logPrefix || '[seq]';
        Logger.logger = settings.logger || console.log;
        Logger.unknownCommand = settings.unknownCommand || 'n/a';
        Logger.unknownParticipantPrefix = settings.unknownParticipantPrefix || 'Unknown';
    };

    Logger.reset = function () {
        sequenceData = [];
        participants = [];
        participantNameCounter = 0;
    };

    Logger.getData = function (asString) {
        var lines = _(sequenceData).filter(function (data) {
            return (participants[data.origin] || {}).enabled;
        }).map('line').value();
        return asString ? lines.join('\n') : lines;
    };

    Logger.start = function () {
        enabled = true;
    };

    Logger.stop = function () {
        enabled = false;
    };

    return Logger;

    function inferName (object) {
        if (object) {
            if (_.isString(object)) {
                return object.trim();
            }
            if (_.isString(object.name)) {
                return object.name;
            }
        }
        return Logger.unknownParticipantPrefix + ' ' + ++participantNameCounter;
    }

    function inferCommand (commandName) {
        return (commandName || Logger.unknownCommand).trim();
    }

    function capture (line, origin) {
        sequenceData.push({line: line, origin: origin.name});
        if (origin.enabled) {
            Logger.logger(Logger.logPrefix || '', line);
        }
    }
});
