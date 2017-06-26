// app.js

'use strict';

// ============== MODULES ============== //

require('dotenv').load();
var express = require('express');
var app = express();
var debug = require('debug')('Express4');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uglifyJs = require("uglify-js");
var fs = require('fs');
var passport = require('passport');

var port = process.env.PORT || 3000;
var environment = process.env.NODE_ENV;

require('./models/db');
require('./config/passport');

var routesApi = require('./routes/index');

app.use(favicon(__dirname + '/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use('/api', routesApi);

switch (environment){
    case 'production':
        console.log('------- PRODUCTION ENVIRONTMENT -------');
        console.log('serving from: \n /dist \n /dist/app');
        app.use(express.static(path.join(__dirname, '../../dist')));		// For the bundled/minified/compressed assets (e.g. ng-app.min.js, vendor.min.js, vendor.min.css, images, etc.)
		app.use(express.static(path.join(__dirname, '../../dist/app')));	// For serving the static html files requested from AngularJS (e.g. home.view.html, data.view.html) ... i think
		app.get('*', function(req, res) {
		    res.sendFile(path.join(__dirname, '../..', 'dist', 'index.html'));
		});
        break;
    case 'build':
        console.log('------- BUILD ENVIRONEMNT WITH DIST FILES -------');
        console.log('serving from: \n /dist \n /dist/app');
        app.use(express.static(path.join(__dirname, '../../dist')));		// For the bundled/minified/compressed assets (e.g. ng-app.min.js, vendor.min.js, vendor.min.css, images, etc.)
		app.use(express.static(path.join(__dirname, '../../dist/app')));	// For serving the static html files requested from AngularJS (e.g. home.view.html, data.view.html) ... i think
		app.get('*', function(req, res) {
		    res.sendFile(path.join(__dirname, '../..', 'dist', 'index.html'));
		});
        break;
    case 'dev':
    default:
        console.log('------- LOCAL DEVELOPMENT ENVIRONMENT -------');
        console.log('serving from: \n / \n /src/app_client');
		app.use(express.static(path.join(__dirname, '../../')));				// For vendor assets in node_modules and AngularJS JS files (external vendor assets downloaded using NPM - jquery, ng-tables, angular, moment, bootstrap, etc.) 
		app.use(express.static(path.join(__dirname, '../app_client')));			// For serving the static html files requested from AngularJS (e.g. home.view.html, data.view.html) ... i think
		app.get('*', function(req, res) {
   			res.sendFile(path.join(__dirname, '../app_client', 'index.html'));
   		});
        break;
}

console.log('Starting up Node');
console.log('PORT=' + port);
console.log('NODE_ENV=' + environment);

app.listen(port, function() {
    console.log('Express server listening on port ' + port);
    console.log('env = ' + app.get('env') +
        '\n__dirname = ' + __dirname  +
        '\nprocess.cwd = ' + process.cwd());
});

