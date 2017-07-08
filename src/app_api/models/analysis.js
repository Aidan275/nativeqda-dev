var mongoose = require( 'mongoose' );

var conceptSchema = new mongoose.Schema({
    text: {
    	type: String, 
    	required: true
    },
    relevance: {
    	type: Number, 
    	required: true
    },
    dbpedia_resource: {
    	type: String, 
    	required: true
    },
});

var analysisConceptSchema = new mongoose.Schema({
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
	concepts: [conceptSchema]
});

mongoose.model('AnalysisConcept', analysisConceptSchema);