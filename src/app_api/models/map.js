var mongoose = require( 'mongoose' );

var markerLinksSchema = new mongoose.Schema({
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
	createdBy: {	/* Users first name who created the link */
		type: String,
		"default": "createdBy"
	},
	userID: {
		type: String,
		"default": "userID"	/* Users ID who created the link */
	},
	precedent: {	/* Marker/file that precedes the dependent marker/file */
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
	},
	dependent: {	/* Dependent marker/file */
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
	}
});

mongoose.model('markerLinks', markerLinksSchema);