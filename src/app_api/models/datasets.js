var mongoose = require( 'mongoose' );

var datasetSchema = new mongoose.Schema({
	name: {
		type: String, 
		required: true
	},
	icon: { // Icon for dataset- using Font Awesome classes
		type: String,
		required: true,
		"default": "fa fa-database" // Defaults to database icon (change if find a better one)
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