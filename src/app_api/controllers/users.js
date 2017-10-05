var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

function extractJWT(authheader) { //Extract the JWT from the Authorization header and then verify it and return the payload (email, etc)
	var jwtheader = authheader.split(' ');
	return jwt.verify(jwtheader[1], process.env.JWT_SECRET);
};

module.exports.createUser = function(req, res) {
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

	user.save(function(err, response) {
		if (err) {
			sendJSONresponse(res, 500, err);
		} else {
			sendJSONresponse(res, 200, response);
		}
	});
};

module.exports.getUserInfo = function(req, res) {
	var email = req.query.email;
	if(email) {
		User
		.findOne({email: email}, { email: 1, firstName: 1, lastName: 1, company: 1, avatar: 1, roles: 1, settings: 1 })
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
};

module.exports.getAllUsersInfo = function(req, res) {
	User
	.find({}, { email: 1, firstName: 1, lastName: 1, company: 1, avatar: 1, isAdmin: 1 })
	.exec(
		function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "No users found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 404, err);
				return;
			}
			sendJSONresponse(res, 200, results);
		});
};

module.exports.userLastModified = function(req, res) {
	var jwtpayload = extractJWT(req.headers["authorization"]);

	User
	.findOne({email: jwtpayload.email}, { lastModified: 1 })
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
	
};

module.exports.getAvatar = function(req, res) {
	var email = req.params["email"];

	User
	.findOne({email: email}, 'avatar -_id', function(err, results) {
		if (err) {
			sendJSONresponse(res, 404, null);
			return;
		}
		sendJSONresponse(res, 200, results);
	});
};

//Note: This should be able to be done better but I've spent too long trying to get it to work elegantly...
module.exports.updateProfile = function(req, res) {
	var jwtpayload = extractJWT(req.headers["authorization"]);
	
	User.findOne({email: jwtpayload.email}, function(err, response) { //Find the logged in user's object
		if (err) {
			sendJSONresponse(res, 500, err)
			return
		}
		if (!response) { //If the user is in some quantum superposition where it both exists and doesn't exist
			sendJSONresponse(res, 404, response)
		return
	}

	var tmpuser = new User();
	tmpuser = response;

		//"Update" fields
		if (req.body.email)
			tmpuser.email = req.body.email;
		if (req.body.firstName)
			tmpuser.firstName = req.body.firstName;
		if (req.body.lastName)
			tmpuser.lastName = req.body.lastName;
		if (req.body.company)
			tmpuser.company = req.body.company;	/* If the company field is an empty string the company won't be changed */
		else {
			tmpuser.company = "";
		}							
		if (req.body.settings)
			tmpuser.settings = req.body.settings;
		if (req.body.avatar)
			tmpuser.avatar = req.body.avatar;
		if (req.body.password)
			tmpuser.setPassword(req.body.password);

		var currentDate = new Date();
		currentDate.setSeconds(currentDate.getSeconds() - 1);	/* Sets the last modified date to 1 seconds in the past to account for generating and passing the JWT to the browser (may be unnecessary) */

		tmpuser.lastModified = currentDate;
		
		tmpuser.save(function(err, response) {
			if (err)
				sendJSONresponse(res, 500, err)
			else
				sendJSONresponse(res, 200, tmpuser.generateJwt()) //Send new JWT
		})
	});
};

module.exports.deleteUser = function(req, res) {
	var jwtpayload = extractJWT(req.headers["authorization"]);
	if (req.params["email"] == null || req.params["email"] == jwtpayload.email) { //Deleting own account
		User.remove({"email": jwtpayload.email}, function(err, results) {
			if (err) {
				sendJSONresponse(res, 500, err);
				return;
			}
			else if (results.toJSON().n < 1) {
				sendJSONresponse(res, 404, {"message": "User not found"});
				return;
			}
			else {
				sendJSONresponse(res, 200, results);
				return;
			}
		});
	}
	else { //Deleting another account
		//Determine if they are a sysadmin
		User.findOne({"email": jwtpayload.email}, function(err, results) { //Find the requesting user's account
			if (err) {
				sendJSONresponse(res, 500, err)
				return
			}
			else if (!results) {
				sendJSONresponse(res, 404, {"message": "User not found"})
				return
			}
			else {
				if (results.roles.indexOf("sysadmin") > -1) { //The user is a sysadmin
					User.remove({"email": req.params["email"]}, function(err, results) {
						if (err) {
							sendJSONresponse(res, 500, err);
							return;
						}
						else if (results.toJSON().n < 1) {
							sendJSONresponse(res, 404, {"message": "User not found"});
							return;
						}
						else {
							sendJSONresponse(res, 200, results);
							return;
						}
					});
				}
				else { //The user is not a sysadmin and so is not authorised to delete a user.
					sendJSONresponse(res, 403, {"message": "Not System Administrator"});
					return;
				}
			}
		});
	}
};

module.exports.getUserProfile = function(req, res) { res.sendStatus(418) };

module.exports.setRole = function(req, res) { //TODO: Check user is a superadmin
	//Check if admin
	if (!req.payload.isAdmin) {
		sendJSONresponse(res, 403, "Not Administrator")
		return;
	}
	User.findOneAndUpdate({"email": req.params["email"]}, {"isAdmin": req.body["isAdmin"]}, function(err, results) {
		if (err) {
			sendJSONresponse(res, 500, err);
		}
		else if (!results) {
			sendJSONresponse(res, 404, {"message": "No user found"});
		}
		else { //TODO: Invalidate JWT?
			sendJSONresponse(res, 200, null);
		}
	});
};
