var mongoose = require('mongoose');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.getUserInfo = function(req, res) {
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
				if (results.avatar == null || results.avatar === "") //If the user doesn't have an avatar image, return the default one.
					results.avatar = "/assets/img/settings/default-avatar.png";
				sendJSONresponse(res, 200, results);
			});
	} else {
		sendJSONresponse(res, 404, {
			"message": "No email parameter in request"
		});
	}
};

module.exports.updateProfile = function(req, res) { res.sendStatus(418) };

module.exports.getUserProfile = function(req, res) { res.sendStatus(418) };