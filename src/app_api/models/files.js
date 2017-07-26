var mongoose = require( 'mongoose' );
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var filetypes = ["folder", "text", "document", "image", "video", "audio"];

var fileSchema = new mongoose.Schema({
	name: { //Name of the file as it appears to the user
		type: String,
		required: true
	},
	type: { //The type or category of file, not file extension.
		type: String,
		required: true,
		enum: filetypes //Must be one of strings in filetypes array
	},
	path: { //The 'folder' the file is in.
		type: String, //Reference the full filepath from root of the file. eg documents/project1/
		"default": "/" //forward slash means at the root of the filesystem
	},
	key: { //Amazon S3 key for the file
		type: String,
		required: true
	},
	textFileKey: { //Amazon S3 for the file converted to text (pdf/docx), otherwise the same as 'key'
		type: String
	},
	dateCreated: { //Datetime file was uploaded to system
		type: Date,
		"default": Date.now
	},
	lastModified: { //Datetime file was last edited
		type: Date,
		"default": Date.now
	},
	acl: { //Amazon S3 setting, public or private. 
		type: String,
		"default": 'private'
	},
	size: { //Size of file, in bytes
		type: Number
	},
	url: { //Amazon S3 URL to acccess/download the file
		type: String
	},
	createdBy: { //User who uploaded the file
		type: String,
		required: true
	},
	editedBy: { //User who last updated the file details, NULL if uploaded but never edited
		type: String,
		default: null
	},
	/*ACL of the file in the system. 
	Eg. Does User A want User B to read/edit the file. Also user groups/roles [See user data model].
	NULL means only the uploaded can read/edit.
	*/
	permissions: { //TODO: Manage defaults/globals
		type: [{
			entity: { //User or user role
				type:	String,
				required: true
			},
			read: Boolean, //Can they read the file
			edit: Boolean //Can they edit the file
		}],
		default: null
	},
	metadata: Object, //Object of any file metadata. Eg. Image dimensions, audio/video length
	coords: { //Assigned location of file on map
		type: { 
			type: String,
			default:'Point' 
		}, 
		coordinates: { //Standard GPS/Map coords
			type: [Number],
			"default": [0,0]
		}
	},
	tags: [String] //Array of keywords the file is related to
});

mongoose.model('File', fileSchema);