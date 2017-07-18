var mongoose = require( 'mongoose' );
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var metaDataSchema = new mongoose.Schema({
	key: {
		type: String,
		required: true
	},
	value: {
		type: String,
		required: true
	}
});

var filetypes = ["folder", "text", "document", "image", "video", "audio", "survey", "dataset"];

var fileSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	type: { //The type or category of file, not file extension.
		type: String,
		required: true,
		enum: filetypes //Must be one of strings in filetypes array
	},
	folder: { //The 'folder' the file is in.
		type: String, //Reference the name field of another file with the 'folder' type
		"default": null //null means the root of the filesystem
	},
	key: {
		type: String,
		required: true
	},
	textFileKey: {
		type: String
	},
	dateCreated: {
		type: Date,
		"default": Date.now
	},
	lastModified: {
		type: Date,
		"default": Date.now
	},
	acl: {
		type: String,
		"default": 'private'
	},
	size: {
		type: Number
	},
	url: {
		type: String
	},
	createdBy: {
		type: String
	},
	coords: { 
		type: { 
			type: String,
			default:'Point' 
		}, 
		coordinates: {
			type: [Number],
			"default": [0,0]
		}
	},
	tags: [String]
});

mongoose.model('File', fileSchema);