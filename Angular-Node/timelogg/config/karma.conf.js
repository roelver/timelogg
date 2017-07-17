module.exports = function(config) {
    var testWebpackConfig = require('./webpack.test.js');

    var configuration = {
        basePath: '/',
        frameworks: ['jasmine'],
        exclude: [],
        files: [ { pattern: './config/karma.entry.js', watched: false } ],
        preprocessors: { './config/karma.entry.js': ['coverage', 'webpack', 'sourcemap'] },
        webpack: testWebpackConfig,
        coverageReporter: {
            type: 'in-memory'
        },
        coverageIstanbulReporter: {
          reports: [ 'html', 'lcovonly' ],
          fixWebpackSourcePaths: true
        },
        angularCli: {
          environment: 'dev'
        },
        remapCoverageReporter: {
            'text-summary': null,
            json: './coverage/coverage.json',
            html: './coverage/html'
        },
        webpackServer: { noInfo: true },
        reporters: ['mocha', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: [
            'Chrome'
        ],
        customLaunchers: {
            ChromeTravisCi: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },
        singleRun: false
    };

    if (process.env.TRAVIS){
        configuration.browsers = [
            'ChromeTravisCi',
            'PhantomJS'
        ];
    }

    config.set(configuration);
};
