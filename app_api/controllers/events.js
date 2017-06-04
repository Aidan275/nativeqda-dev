var mongoose = require('mongoose');
var Event = mongoose.model('Event');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.event = function(req, res) {
	var event = new Event();

	// if coordinates aren't supplied, do not attempt to store - most likely NaN
	if(req.body.lng && req.body.lat){
		event.coords = { 
			coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)]
		};
	}
	// store event description if provided, otherwise defaults to "Page load"
	if(req.body.desc)
		event.desc = req.body.desc;
	event.email = req.body.email;
	event.ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
	event.url = req.headers.referer;

	
	event.save(function(err) {
		if (err) {
			sendJSONresponse(res, 404, err);
		} else {
			sendJSONresponse(res, 200);
		}
	});

};