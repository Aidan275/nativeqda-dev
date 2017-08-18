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
		html: '<!DOCTYPE html> <html lang="en"><head><meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"><link href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap.min.css" rel="stylesheet"> <style type="text/css"> body { padding: 0; margin: 0; } html { -webkit-text-size-adjust:none; -ms-text-size-adjust: none;} @media only screen and (max-device-width: 680px), only screen and (max-width: 680px) { *[class="tableWidth"] { width: 96% !important; } *[class="centerMobile"] { text-align: center !important; } *[class="centerMobile2"] { float: none !important; display: block !important; margin: 0px auto; } .emailFooter a { text-decoration: none; 		color: #929ca8; 	} } .tableWidth { 	width: 680px; } </style> <script src="http://code.jquery.com/jquery-1.11.1.min.js"></script> <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.0/js/bootstrap.min.js"></script></head><body><div id="email" class="notification" align="center"><table  width="100%" border="0" cellspacing="0" cellpadding="0" style="min-width: 320px;"><tr><td align="center" bgcolor="#4676fa">  <!--[if gte mso 10]> <table width="680" border="0" cellspacing="0" cellpadding="0"> <tr><td> <![endif]--><table border="0" cellspacing="0" cellpadding="0" class="tableWidth" width="100%" style="max-width: 680px; min-width: 300px;"><tr><td><!-- padding --><div style="height: 80px; line-height: 80px; font-size: 10px;"></div></td></tr><!--header --><tr><td align="center" bgcolor="#fff"><br /><table width="90%" border="0" cellspacing="0" cellpadding="0"><tr><td align="left"><!--Item --><div class="centerMobile2" style="float: left; display: inline-block; width: 115px;"><table class="centerMobile" width="115" border="0" cellspacing="0" cellpadding="0" align="left" style="border-collapse: collapse;"><tr><td align="left" valign="middle"><!-- padding --><div style="height: 20px; line-height: 20px; font-size: 10px;"></div><table width="200" border="0" cellspacing="0" cellpadding="0" ><tr><td align="left" valign="top" class="centerMobile"><img src="http://dev.nativeqda.xyz/img/email-logo.png" width="200" alt="NativeQDA" border="0" style="display: block;" /></td></tr></table></td></tr></table></div><!-- Item END--><!--[if gte mso 10]></td><td align="right"><![endif]--></tr></table><!-- padding --><div style="height: 50px; line-height: 50px; font-size: 10px;"></div></td></tr><!--header END--><tr><td align="center" bgcolor="#fbfcfd"><table width="90%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center"><div style="line-height: 44px;"><font face="Arial, Helvetica, sans-serif" size="5" color="#333" style="font-size: 34px;"><span style="font-family: Arial, Helvetica, sans-serif; font-size: 34px; color: #333;">Forgot your password?<br /><br /></span></font></div></td></tr><tr><td align="center"><div style="line-height: 24px;">We&rsquo;ve done that before, but don&rsquo;t worry<br />we have your back, just use this reset link:</div><!-- padding --><div style="height: 40px; line-height: 40px; font-size: 10px;"></div></td></tr><tr><td align="center"><div style="line-height: 24px;"><b>' + '<a href="https://' + req.headers.host + '/reset-password/' + results.resetPasswordToken + '">CLICK TO RESET PASSWORD</a></b></div><br /><br /></td></tr></table></td></tr><!--footer --><tr><td class="emailFooter" align="center" bgcolor="#fff"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center"><br />NativeQDA © 2017 The Bubble Bunch.</td></tr></table><br /><br /></td></tr><!--footer END--><tr><td><br /><br /><br /><br /></td></tr></table></td></tr></table></div><br />',
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
