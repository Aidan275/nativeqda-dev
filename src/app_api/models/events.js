var mongoose = require( 'mongoose' );

var eventSchema = new mongoose.Schema({
	email: {
		type: String
	},
	ip: {
		type: String
	},
	coords: { 
		type: { 
			type: String, 
			default:'Point' 
		}, 
		coordinates: [Number]
	},
	date: {
		type: Date, "default": Date.now
	},
	url: {
		type: String
	},
	desc: {
		type: String, "default": "Page load"
	}
});

mongoose.model('Event', eventSchema);