require.config({
    baseUrl: '/editor/',
    paths: {
        lodash: '../node_modules/lodash/lodash.min',
        ace: '../node_modules/ace-builds/src/',
        sequence: '../build/sequence'
    }
});

require(['./editor']);
