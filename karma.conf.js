// Karma configuration
// Generated on Sun Sep 17 2017 09:23:38 GMT+1000 (AUS Eastern Standard Time)

module.exports = function(config) {
	config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["mocha", "chai", "sinon", "chai-sinon"],


    // list of files / patterns to load in the browser
    files: [
    "./src/app_client/test/lib/bindPolyfill.js",
    "./src/app_client/test/lib/specHelper.js",
    "./src/app_client/test/lib/mockData.js",

    "./node_modules/angular/angular.js",
    "./node_modules/angular-mocks/angular-mocks.js",
    "./node_modules/angular-route/angular-route.js",
    "./node_modules/angular-sanitize/angular-sanitize.js",
    "./node_modules/angular-animate/angular-animate.js",
    "./node_modules/jquery/dist/jquery.js",
    "./node_modules/bootstrap/dist/js/bootstrap.js",
    "./node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js",
    "./node_modules/moment/moment.js",
    "./node_modules/toastr/toastr.js",
    "./node_modules/ng-table/bundles/ng-table.js",
    "./node_modules/ng-tags-input/build/ng-tags-input.js",
    "./node_modules/ng-file-upload/dist/ng-file-upload-all.js",
    "./node_modules/ng-bs-animated-button/ng-bs-animated-button.js",
    "./node_modules/leaflet/dist/leaflet-src.js",
    "./node_modules/leaflet.markercluster/dist/leaflet.markercluster-src.js",
    "./node_modules/leaflet.gridlayer.googlemutant/Leaflet.GoogleMutant.js",
    "./node_modules/leaflet-polylinedecorator/dist/leaflet.polylineDecorator.js",
    "./node_modules/sidebar-v2/js/leaflet-sidebar.js",
    "./node_modules/pdfjs-dist/build/pdf.js",
    "./node_modules/pdfjs-dist/build/pdf.worker.js",
    "./src/app_client/assets/js/docxjs-1.0.0.min.js",
    "./node_modules/sweetalert/dist/sweetalert-dev.js",
    "./node_modules/angular-loading-overlay/dist/angular-loading-overlay.js",
    "./node_modules/d3/build/d3.js",
    "./node_modules/d3-svg-legend/d3-legend.js",
    "./src/app_client/assets/js/d3.layout.cloud.js",
    "./node_modules/intro.js/intro.js",
    "./node_modules/tinycolor2/dist/tinycolor-min.js",
    "./node_modules/angularjs-color-picker/dist/angularjs-color-picker.js",
    "./node_modules/slideout/dist/slideout.js",
    "./node_modules/knockout/build/output/knockout-latest.debug.js",
    "./node_modules/survey-knockout/survey.ko.js",
    "./node_modules/surveyjs-editor/surveyeditor.js",
    "./node_modules/nouislider/distribute/nouislider.js",
    "./node_modules/angular-touch/angular-touch.js",
    "./node_modules/angular-carousel/dist/angular-carousel.js",

    "./src/app_client/app.module.js",
    "./src/app_client/**/*.module.js",
    "./src/app_client/**/*.js",



    "./src/app_client/**/*.spec.js"
    ],


    // list of files to exclude
    exclude: [
    "./src/app_client/assets/**/*.js"
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: "dots", "progress"
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["mocha"],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ["PhantomJS"],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
})
}
