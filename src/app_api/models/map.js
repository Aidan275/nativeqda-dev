var mongoose = require( 'mongoose' );

markerInfoSchema = new mongoose.Schema({
	fileID: {
		type: String,	/* ID of the file in the database */
		required: true
	},
	coords: {
		type: {
			type: String,
			default:'Point' 
		},
		coordinates: {	/* Standard GPS/Map coords */
			type: [Number],
			"default": [0,0]
		}
	}
});

var markerLinksSchema = new mongoose.Schema({
	name: {	/* Name of the link as it appears to the user */
		type: String
	},
	description: {	/* Description of the link as it appears to the user */
		type: String
	},
	dateCreated: {	/* Datetime the link was added */
		type: Date,
		"default": Date.now
	},
	createdBy: {	/* Users first name who created the link */
		type: String,
	},
	userID: {
		type: String,	/* Users ID who created the link */
	},
	precedent: {
		type: markerInfoSchema	/* Marker/file that precedes the dependent marker/file */
	},

	dependent: {
		type: markerInfoSchema	/* Dependent marker/file */
	}
});

mongoose.model('markerLinks', markerLinksSchema);