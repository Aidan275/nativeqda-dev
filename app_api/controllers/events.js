var mongoose = require('mongoose');
var Event = mongoose.model('Event');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.loginEvent = function(req, res) {
	var event = new Event();

	event.email = req.body.email;
	event.ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
	event.coords = { 
		coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)]
	};
	event.event = "Login Event";

	event.save(function(err) {
		if (err) {
			sendJSONresponse(res, 404, err);
		} else {
			sendJSONresponse(res, 200, {
				"message": "User details received."
			});
		}
	});
};