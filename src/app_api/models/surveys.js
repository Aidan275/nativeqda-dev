var mongoose = require( 'mongoose' );

var surveyResponseSchema = new mongoose.Schema({
	responseJSON: {
		type: String,
		required: true
	},
	dateCreated: {
		type: Date,
		"default": Date.now
	},
	fullName: {
		type: String,
		required: true
	},
	email: {			// Not sure if all these fields should be included here or at all... 
		type: String
	},
	age: {
		type: Number
	},
	gender: {
		type: String
	}
});

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
	},
	numResponses: {
		type: Number
	},
	responses: [surveyResponseSchema]
});

mongoose.model('Survey', surveySchema);
mongoose.model('SurveyResponse', surveyResponseSchema);