require.config({
    baseUrl: '/exampleUsage/',
    paths: {
        lodash: '../node_modules/lodash/lodash.min',
        sequence: '../build/sequence'
    }
});

require(['./exampleUsage']);
