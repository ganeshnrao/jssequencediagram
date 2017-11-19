define(function (require) {
    'use strict';

    var _ = require('lodash');

    function Bus () {
        this.name = 'Bus';
        this.counter = 0;
        this.topics = {};
        this.metaTopics = {};
    }

    Bus.prototype = {
        postMessage: function (topic, message) {
            invoke(this.topics[topic], message);
        },

        subscribe: function (topic, callback, context) {
            var metaTopic = topic.split('.')[0];
            invoke(this.metaTopics[metaTopic], {action: 'subscribe', context: context});
            this.topics[topic] = this.topics[topic] || {};
            this.topics[topic][++this.counter] = callback;
            var index = this.counter;
            return {
                unsubscribe: function () {
                    invoke(this.metaTopics[metaTopic], {action: 'unsubscribe', context: context});
                    if (this.topics[topic]) {
                        delete this.topics[topic][index];
                        if (_.size(this.topics[topic]) === 0) {
                            delete this.topics[topic];
                        }
                    }
                }.bind(this)
            };
        },

        metaSubscribe: function (topicString, callback) {
            var topic = topicString.split('.')[0];
            this.metaTopics[topic] = this.metaTopics[topic] || {};
            this.metaTopics[topic][++this.counter] = callback;
            var index = this.counter;
            return {
                unsubscribe: function () {
                    if (this.metaTopics[topic]) {
                        delete this.metaTopics[topic][index];
                        if (_.size(this.metaTopics[topic]) === 0) {
                            delete this.metaTopics[topic];
                        }
                    }
                }.bind(this)
            };
        }
    };

    function invoke (object, args) {
        _.forIn(object, function (callback) {
            callback(args);
        });
    }

    return new Bus();
});