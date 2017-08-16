var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

/* Will remove this since the system should not allow random people to register */
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
			sendJSONresponse(res, 500, err);
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

module.exports.forgotPassword = function(req, res) {
	console.log(req.headers.host);
	var email = req.body.email;
	var user = new User();
	User.findOne({email: email}).exec(
		function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "No account with that email address found."
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 404, err);
				return;
			}
			user = results;

			user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
			user.resetPasswordExpires = Date.now() + 3600000; /* 1 hour */

			user.save(function(err, results) {
				if (err) {
					sendJSONresponse(res, 404, err);
				} else {
					sendEmail(req, res, results);
				}
			});

		});
};

var sendEmail = function(req, res, results) {
	/* create reusable transporter object using the default SMTP transport */
	let transporter = nodemailer.createTransport({
		host: 'nativeqda.xyz',
		port: 465,
		secure: true, /* secure:true for port 465, secure:false for port 587 */
		auth: {
			user: 'system@nativeqda.xyz',
			pass: 'Bubble99!'
		},
		tls: {
			rejectUnauthorized: false
		}
	});

	/* setup email data with unicode symbols */
	let mailOptions = {
		from: '"NativeQDA: Password Reset Request" <system@nativeqda.xyz>',
		to: results.email,
		subject: 'NativeQDA: Password Reset Request',
		text: 'Please go to https://' + req.headers.host + '/reset-password/' + results.resetPasswordToken + ' to reset your password'
	};

	/* send mail with defined transport object */
	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			sendJSONresponse(res, 500, {
				"message": "Error sending reset password email",
				"error": error
			});
			return;
		}
		sendJSONresponse(res, 200, null);
	});
};

module.exports.resetPassword = function(req, res) {
	var token = req.body.token;
	var password = req.body.password;

	var user = new User();
	User.findOne({resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() }}).exec(
		function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "Password reset token is invalid or has expired."
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 404, err);
				return;
			}

			user = results;

			user.setPassword(req.body.password);
			user.resetPasswordToken = undefined;
			user.resetPasswordExpires = undefined;
			user.lastModified = Date.now();

			user.save(function(err) {
				if (err) {
					sendJSONresponse(res, 404, err);
				} else {
					sendJSONresponse(res, 200, "Your password has been changed.");
				}
			});
		});
};
