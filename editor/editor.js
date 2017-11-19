define(function (require) {
    'use strict';

    var ace = require('ace/ace');
    var _ = require('lodash');
    var Sequence = require('sequence');
    Sequence.Diagram.includeStyles();

    function App () {
        this.diagram = new Sequence.Diagram(document.querySelector('.container'));
        this.editor = ace.edit('editor');
        this.editor.setTheme('ace/theme/monokai');
        this.editor.getSession().setMode('ace/mode/asciidoc');
        this.editor.on('change', _.debounce(this.update.bind(this), 1000));
        this.load();
        this.update();
    }

    App.prototype = {
        save: function (newValue) {
            window.localStorage.setItem('sequenceCode', newValue || this.editor.getValue());
        },

        load: function () {
            this.editor.setValue(window.localStorage.getItem('sequenceCode') || '');
        },

        update: function () {
            var newValue = this.editor.getValue();
            this.diagram.generate(newValue.split('\n'));
            this.save(newValue);
        }
    };

    window.app = new App();
});
