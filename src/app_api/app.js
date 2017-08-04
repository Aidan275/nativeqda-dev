// app.js

'use strict';

// ============== MODULES ============== //

require('dotenv').load();
var express = require('express');
var app = express();
var secure = require('express-force-https');
var debug = require('debug')('Express4');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var passport = require('passport');

var port = process.env.PORT || 3000;
var environment = process.env.NODE_ENV;

require('./models/db');
require('./config/passport');

var routesApi = require('./routes/index');

app.use(secure);
app.use(favicon(__dirname + '/favicon.ico'));
app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(cookieParser());
app.use(passport.initialize());
app.use('/api', routesApi);

switch (environment){
    case 'production':
        console.log('------- PRODUCTION ENVIRONTMENT -------');
        console.log('Serving from: ' + path.join(__dirname, '../../dist'));
        app.use(express.static(path.join(__dirname, '../../dist')));		// For the bundled/minified/compressed assets (e.g. ng-app.min.js, vendor.min.js, vendor.min.css, images, etc.)
		app.use(express.static(path.join(__dirname, '../../dist/app')));	// For serving the static html files requested from AngularJS (e.g. home.view.html, data.view.html) ... i think
		app.get('/api/*', function(req, res) {
			res.sendStatus(404);
		});
		app.get('*', function(req, res) {
		    res.sendFile(path.join(__dirname, '../..', 'dist', 'index.html'));
		});
        break;
    case 'build':
        console.log('------- BUILD ENVIRONEMNT WITH DIST FILES -------');
        console.log('Serving from: ' + path.join(__dirname, '../../dist'));
        app.use(express.static(path.join(__dirname, '../../dist')));		// For the bundled/minified/compressed assets (e.g. ng-app.min.js, vendor.min.js, vendor.min.css, images, etc.)
		app.use(express.static(path.join(__dirname, '../../dist/app')));	// For serving the static html files requested from AngularJS (e.g. home.view.html, data.view.html) ... i think
		app.get('/api/*', function(req, res) {
			res.sendStatus(404);
		});
		app.get('*', function(req, res) {
		    res.sendFile(path.join(__dirname, '../..', 'dist', 'index.html'));
		});
        break;
    case 'development':
    default:
        console.log('------- LOCAL DEVELOPMENT ENVIRONMENT -------');
        console.log('Serving from: ' + path.join(__dirname, '../../src'));
		app.use(express.static(path.join(__dirname, '../../')));				// For vendor assets in node_modules and AngularJS JS files (external vendor assets downloaded using NPM - jquery, ng-tables, angular, moment, bootstrap, etc.) 
		app.use(express.static(path.join(__dirname, '../app_client')));			// For serving the static html files requested from AngularJS (e.g. home.view.html, data.view.html) ... i think
		app.get('/api/*', function(req, res) {
			res.sendStatus(404);
		});
		app.get('*', function(req, res) {
   			res.sendFile(path.join(__dirname, '../app_client', 'index.html'));
   		});
        break;
}

// ======================== //
// ==== Error Handlers ==== //
// ======================== //

// Catch unauthorised errors (e.g. missing authorization token)
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401);
        res.json({"message" : err.name + ": " + err.message});
    }
});

// Development error handler
// Will print stacktrace
if (environment === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// ======================== //
// ===== Start Server ===== //
// ======================== //

console.log('Starting up Node...');
console.log('Port: ' + port);
console.log('Environment: ' + environment);

app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});

