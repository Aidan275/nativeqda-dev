var mongoose = require('mongoose');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.getUserInfo = function(req, res) {
	// Checks the state of the connection to the DB is 'connected'
	if(mongoose.connection.readyState === 1) {
		var email = req.query.email;
		if(email) {
			User
			.findOne({email: email}, { email: 1, firstName: 1, lastName: 1, company: 1, avatar: 1 })
			.exec(
				function(err, results) {
					if (!results) {
						sendJSONresponse(res, 404, {
							"message": "No user found"
						});
						return;
					} else if (err) {
						sendJSONresponse(res, 404, err);
						return;
					}
					sendJSONresponse(res, 200, results);
				});
		} else {
			sendJSONresponse(res, 404, {
				"message": "No email parameter in request"
			});
		}
	} else {
		sendJSONresponse(res, 404, {errmsg: "Databse connection error."});
	}
};