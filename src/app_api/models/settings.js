var mongoose = require( 'mongoose' );

var settingsSchema = new mongoose.Schema({
	user: { //Email of user for their settings, NULL for system settings
		type: String, 
		required: true
	},
	settings: { //Object of user or system settings
		type: Object,
		required: true
	}
});

mongoose.model('settings', datasetSchema);