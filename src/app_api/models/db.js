var mongoose = require('mongoose');
var gracefulShutdown;
var dbURI = 'mongodb://localhost/nativeqda-dev';
if (process.env.NODE_ENV === 'production') {
	dbURI = process.env.MONGODB_URI;
}

var reconnectTimeout = 5000;	// ms
var firstConnectAttempt = true;

function connect() {
	mongoose.connect(dbURI, {
		server: { 
			auto_reconnect: true	// If a connection has already been made to the DB and is lost, the DB will listen and reconnect if possible.
		} 
	});
}

// CONNECTION EVENTS
mongoose.connection.on('error', function(err){
	console.log('Mongoose connection error: ' + err);
	mongoose.disconnect();	// If error, disconnect from the DB. The server will then attempt to connect/reconnect again.
});

mongoose.connection.on('connected', function(e){
	console.log('Mongoose connected to ' + dbURI);
	firstConnectAttempt = false;	// If a connection is successful, set to false so the auto_reconnect option can reconnect 
});									// automatically without interuption from the timeout loop in on disconnected below.

mongoose.connection.on('disconnecting', function(){
	console.log('Mongoose disconnecting');
});

mongoose.connection.on('disconnected', function(){
	console.log('Mongoose disconnected');
	if(firstConnectAttempt) {	// If first connection attempt failed (e.g starting the server before the DB), the server attempts to connect every 5 seconds.
		console.log('Reconnecting in ' + reconnectTimeout/1000 + ' seconds...');
		setTimeout(function() {
			connect();
		}, reconnectTimeout);
	}
});

mongoose.connection.on('reconnected', function(){
	console.log('Mongoose reconnected to ' + dbURI);
});

connect();

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
	mongoose.connection.close(function() {
		console.log('Mongoose disconnected through ' + msg);
		callback();
	});
};
// For nodemon restarts
process.once('SIGUSR2', function() {
	gracefulShutdown('nodemon restart', function() {
		process.kill(process.pid, 'SIGUSR2');
	});
});
// For app termination
process.on('SIGINT', function() {
	gracefulShutdown('app termination', function() {
		process.exit(0);
	});
});
// For Heroku app termination
process.on('SIGTERM', function() {
	gracefulShutdown('Heroku app termination', function() {
		process.exit(0);
	});
});

// BRING IN YOUR SCHEMAS & MODELS
require('./users');
require('./events');
require('./datasets');
require('./files');
require('./analysis');
require('./surveys');
require('./settings');