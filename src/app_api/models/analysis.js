var mongoose = require( 'mongoose' );

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
	subject: {type: String},
	sentence: {type: String},
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
	sourceDataKey: {
		type: String,
		required: true
	},
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