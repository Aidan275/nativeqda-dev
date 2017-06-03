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
	time: {
		type: Date, "default": Date.now
	},
	event: {
		type: String
	}
});

mongoose.model('Event', eventSchema);