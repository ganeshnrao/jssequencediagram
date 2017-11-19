({
    baseUrl: './scripts/',
    out: 'build/sequence.js',
    paths: {
        lodash: '../node_modules/lodash/lodash.min',
        text: '../node_modules/text/text'
    },
    wrap: true,
    include: ['./sequence'],
    optimizeCss: 'standard'
})