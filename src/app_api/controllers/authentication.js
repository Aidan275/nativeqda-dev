var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.register = function(req, res) {
	if(!req.body.password || !req.body.email || !req.body.firstName || !req.body.lastName) {
		sendJSONresponse(res, 400, {
			"message": "All fields required"
		});
		return;
	}

	var user = new User();

	user.email = req.body.email;
	user.firstName = req.body.firstName;
	user.lastName = req.body.lastName;
	user.company = req.body.company;

	user.setPassword(req.body.password);

	user.save(function(err) {
		var token;
		if (err) {
			sendJSONresponse(res, 404, err);
		} else {
			token = user.generateJwt();
			sendJSONresponse(res, 200, {
				"token" : token
			});
		}
	});
};

module.exports.login = function(req, res) {
	if(!req.body.email || !req.body.password) {
		sendJSONresponse(res, 400, {
			"message": "All fields required"
		});
		return;
	}

	passport.authenticate('local', function(err, user, info){
		var token;

		if (err) {
			sendJSONresponse(res, 404, err);
			return;
		}

		if(user){
			token = user.generateJwt();
			sendJSONresponse(res, 200, {
				"token" : token
			});
		} else {
			sendJSONresponse(res, 401, info);
		}
	})(req, res);
};

//Sets the User's avatar field in database to a new S3 file URL
module.exports.setavatar = function(req, res) {
	var user = new User();
	User.findOne({email: req.body.email}, { email: 1, firstName: 1, lastName: 1, company: 1 }).exec(
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
			console.log(results);
			user = results();
		});

	user.avatar = req.body.newavatarurl;

	user.save(function(err) {
		if (err) {
			sendJSONresponse(res, 404, err);
		} else {
			sendJSONresponse(res, 200, "New avatar set");
		}
	});
};