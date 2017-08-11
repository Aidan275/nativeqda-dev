var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

var markerLinkSchema = new mongoose.Schema({
	_creator: {	/* Reference to the user who created the link */
		type: Schema.Types.ObjectId, 
		ref: 'User' 
	}, 
	name: {	/* Name of the link as it appears to the user */
		type: String,
		"default": "Name"
	},
	description: {	/* Description of the link as it appears to the user */
		type: String,
		"default": "Description"
	},
	dateCreated: {	/* Datetime the link was added */
		type: Date,
		"default": Date.now
	},
	precedent: {	/* Reference to the precedent file */
		type: Schema.Types.ObjectId,
		ref: 'File' 
	},
	dependent: {	/* Reference to the dependent file */
		type: Schema.Types.ObjectId,
		ref: 'File' 
	}
});

mongoose.model('MarkerLink', markerLinkSchema);