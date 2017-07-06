var mongoose = require( 'mongoose' );

var datasetSchema = new mongoose.Schema({
	name: {
		type: String, 
		required: true
	},
	desc: {
		type: String, 
		required: true
	},
	size: {
		type: Number
	},
	key: {
		type: String,
		required: true
	},
	url: {
		type: String
	},
	createdBy: {
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
	files: [{
		type: String, 
		required: true
	}],
});

mongoose.model('Dataset', datasetSchema);