var mongoose = require( 'mongoose' );

var datasetSchema = new mongoose.Schema({
	name: {type: String, required: true},
	createdBy: {type: String, required: true},
	dateCreated: {type: Date, "default": Date.now},
	desc: {type: String, required: true}
});

mongoose.model('Dataset', datasetSchema);