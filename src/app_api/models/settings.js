var mongoose = require( 'mongoose' );

var settingsSchema = new mongoose.Schema({
	settings: { //Object of system settings
		type: Object,
		required: true
	}
});

mongoose.model('Settings', settingsSchema);