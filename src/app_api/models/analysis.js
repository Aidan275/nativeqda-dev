var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

var deletedFileSchema = new mongoose.Schema({
	name: { 
		type: String
	},
	icon: { // Icon for file depending on the file extension (set when uploading) - using Font Awesome classes
		type: String,
	},
	dateCreated: { //Datetime file was uploaded to system
		type: Date,
		"default": Date.now
	},
	lastModified: { //Datetime file was last edited
		type: Date,
		"default": Date.now
	},
	size: { //Size of file, in bytes
		type: Number
	},
	createdBy: { //User who uploaded the file
		type: String
	}
});

var categoriesSchema = new mongoose.Schema({
	score: {type: Number},
	label: {type: String}
});

var conceptSchema = new mongoose.Schema({
	text: {type: String},
	relevance: {type: Number},
	dbpedia_resource: {type: String}
});

var entitieSchema = new mongoose.Schema({
	type: {type: String},
	text: {type: String},
	sentiment: {
		score: {type: Number}
	},
	relevance: {type: Number},
	emotion: {
		sadness: {type: Number},
		joy: {type: Number},
		fear: {type: Number},
		disgust: {type: Number},
		anger: {type: Number}
	},
	disambiguation: {
		subtype: [{type: String}],
		name: {type: String},
		dbpedia_resource: {type: String}
	},
	count: {type: Number}
});

var keywordSchema = new mongoose.Schema({
	text: {type: String},
	sentiment: {
		score: {type: Number}
	},
	relevance: {type: Number},
	emotion: {
		sadness: {type: Number},
		joy: {type: Number},
		fear: {type: Number},
		disgust: {type: Number},
		anger: {type: Number}
	}
});

var relationEntitiesSchema = new mongoose.Schema({
	type: {type: String},
	text: {type: String}
});

var relationArgumentsSchema = new mongoose.Schema({
	text: {type: String},
	entities: [relationEntitiesSchema]
});

var relationSchema = new mongoose.Schema({
	type: {type: String},
	sentence: {type: String},
	score: {type: Number},
	arguments: [relationArgumentsSchema]
});

var semanticRoleSchema = new mongoose.Schema({
	subject: {
		text: {type: String}
	},
	sentence: {type: String},
	object: {
		text: {type: String}
	},
	action: {
		verb: {
			text: {type: String},
			tense: {type: String}
		},
		text: {type: String},
		normalized: {type: String}
	}
});

var analysisResultsSchema = new mongoose.Schema({
	name: {
		type: String, 
		required: true
	},
	description: {
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
	files: [{	/* Reference to the files used to generate the analysis */
		type: Schema.Types.ObjectId, 
		ref: 'File' 
	}], 
	deletedFiles: [deletedFileSchema],	/* Files references that were deleted - used so users know which files were included in an anlysis, even if deleted */
	language: {
		type: String,
		required: true
	},
	categories: [categoriesSchema],
	concepts: [conceptSchema],
	entities: [entitieSchema],
	keywords: [keywordSchema],
	relations: [relationSchema],
	semanticRoles: [semanticRoleSchema]
});

mongoose.model('analysisResults', analysisResultsSchema);