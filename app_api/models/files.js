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

var fileSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	eTag: {
		type: String
	},
	key: {
		type: String,
		required: true
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