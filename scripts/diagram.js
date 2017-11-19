define(function (require) {
    'use strict';

    var _ = require('lodash');
    var css = require('text!../styles/sequenceDiagram.css');
    var includedCss = false;
    var Templates = {
        participant: _.template(require('text!./templates/participant.ejs')),
        command: _.template(require('text!./templates/command.ejs')),
        commandSet: _.template(require('text!./templates/commandSet.ejs'))
    };
    var Directions = {
        LeftToRight: 'ltr',
        RightToLeft: 'rtl',
        Internal: 'internal'
    };
    var Syntax = {
        command: {
            regex: /([a-z0-9\s]+)->([a-z0-9\s]+):(.+)/i,
            process: function (matches) {
                var from = matches[1].trim();
                var to = matches[2].trim();
                var commandName = matches[3].trim();
                this.participants[from] = this.participants[from] || {name: from};
                this.participants[to] = this.participants[to] || {name: to};
                this.commands.push({from: from, to: to, name: commandName});
            }
        },
        participant: {
            regex: /participant ([a-z0-9\s]+)/i,
            process: function (matches) {
                var name = matches[1].trim();
                this.participants[name] = {name: name};
            }
        },
        activation: {
            regex: /(activate|deactivate) ([a-z0-9\s]+)/i,
            process: function (matches) {
                var action = matches[1].trim().toLowerCase();
                var name = matches[2].trim();
                var participant = this.participants[name] = this.participants[name] || {name: name};
                this.commands.push({name: action, participant: participant});
            }
        }
    };

    function Diagram (container) {
        this.container = container;
    }

    Diagram.prototype = {
        process: function (lines) {
            this.participants = {};
            this.commands = [];
            _.forEach(lines, function (line) {
                _.forIn(Syntax, function (definition) {
                    var matches = line.match(definition.regex);
                    if (matches) {
                        definition.process.call(this, matches);
                        return false;
                    }
                }.bind(this));
            }.bind(this));
        },

        generate: function (lines) {
            this.process(lines);
            var left = 0;
            var top = 2;
            var rowHeight = 1.25;
            var columnWidth = 100 / _.size(this.participants);
            var previousTo;
            _.forIn(this.participants, function (participant) {
                participant.left = left;
                participant.width = columnWidth;
                left += columnWidth;
            }.bind(this));
            var commands = _.reduce(this.commands, function (commands, command) {
                if (command.name === 'activate') {
                    command.participant.top = top - rowHeight;
                } else if (command.name === 'deactivate') {
                    command.participant.height = top - (command.participant.top || 0);
                } else {
                    var from = this.participants[command.from];
                    var to = this.participants[command.to];
                    var direction = Directions.LeftToRight;
                    if (from.left > to.left) {
                        direction = Directions.RightToLeft;
                    } else if (from === to) {
                        direction = Directions.Internal;
                    }
                    var left = Math.min(from.left, to.left);
                    var right = Math.max(from.left, to.left);
                    top += rowHeight;
                    left = left + columnWidth * 0.5;
                    right = 100 - (right + columnWidth * 0.5);
                    var currentAction = Templates.command({
                        top: top,
                        left: left,
                        right: direction === Directions.Internal ? (100 - left - columnWidth) : right,
                        direction: direction,
                        name: command.name
                    });
                    if (previousTo === from) {
                        var lastCommand = _.last(commands);
                        if (lastCommand) {
                            lastCommand.push(currentAction);
                        } else {
                            commands.push([currentAction]);
                        }
                    } else {
                        commands.push([currentAction]);
                    }
                    previousTo = to;
                }
                return commands;
            }.bind(this), []);
            var participants = _.map(this.participants, Templates.participant);
            var commandSets = _.map(commands, Templates.commandSet);
            var html = '<div class="sequence-diagram">' + _.concat(participants, commandSets).join(' ') + '</div>';
            if (this.container) {
                this.container.innerHTML = html;
            }
            return html;
        }
    };

    Diagram.includeStyles = function () {
        if (!includedCss) {
            var style = document.createElement('style');
            style.innerHTML = css;
            document.querySelector('head').appendChild(style);
            includedCss = true;
        }
    };

    return Diagram;
});
