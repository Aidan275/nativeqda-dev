var mongoose = require( 'mongoose' );

var surveySchema = new mongoose.Schema({
	surveyJSON: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	accessID: {
		type: String,
		required: true
	},
	dateCreated: {
		type: Date,
		"default": Date.now
	},
	lastModified: {
		type: Date,
		"default": Date.now
	},
	createdBy: {
		type: String,
		required: true
	}
});

mongoose.model('Survey', surveySchema);