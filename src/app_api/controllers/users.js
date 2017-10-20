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

module.exports.updateProfile = function(req, res) { //Update the user's profile, or if an admin, another profile.
	if (req.payload.isAdmin && req.params.email != req.payload.email && req.params.email != undefined) //Admin trying to update someone else's profile
		useremail = req.params.email
	else if (!req.payload.isAdmin && req.params.email != req.payload.email && req.params.email != undefined) { //Regular user trying to update someone else's profile IE. Unauthorised action
		sendJSONresponse(res, 403, "Not an admin")
		return
	}
	else //User updating their own profile
		useremail = req.payload.email
	
	User.findOne({email: useremail}, function(err, user) { //Find the logged in user's object
		if (err) {
			sendJSONresponse(res, 500, err)
			return
		}
		if (!user) { //If the user is in some quantum superposition where it both exists and doesn't exist
			sendJSONresponse(res, 404, "User not found")
			return;
		}

		//"Update" fields
		if (req.body.email)
			user.email = req.body.email;
		if (req.body.firstName)
			user.firstName = req.body.firstName;
		if (req.body.lastName)
			user.lastName = req.body.lastName;
		if (req.body.company)
			user.company = req.body.company;					
		if (req.body.settings)
			user.settings = req.body.settings;
		if (req.body.isAdmin && req.payload.isAdmin)
			user.isAdmin = req.body.isAdmin;
		if (req.body.avatar)
			user.avatar = req.body.avatar;
		if (req.body.password)
			user.setPassword(req.body.password);

		var currentDate = new Date();
		currentDate.setSeconds(currentDate.getSeconds() - 1);	/* Sets the last modified date to 1 seconds in the past to account for generating and passing the JWT to the browser (may be unnecessary) */

		user.lastModified = currentDate;
		
		user.save(function(err, response) {
			if (err)
				sendJSONresponse(res, 500, err)
			else if (req.payload.isAdmin && req.payload.email != req.body.email) //Editing another user's profile
				sendJSONresponse(res, 200, response)
			else
				sendJSONresponse(res, 200, user.generateJwt()) //Send new JWT
		})
	});
};

module.exports.deleteUser = function(req, res) {
	if (req.params["email"] == null || req.params["email"] == req.payload.isAdmin) { //Deleting own account
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
		if (req.payload.isAdmin) { //The user is a sysadmin
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
};

module.exports.getUserProfile = function(req, res) { res.sendStatus(418) };

/*module.exports.setRole = function(req, res) { //TODO: Check user is a superadmin
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
		else { //Update JWT [NOTE: If an admin is made a researcher they could still present as an admin using an old JWT whilst it is still time-valid]
			sendJSONresponse(res, 200, {"token" : results.generateJwt()});
		}
	})
};*/
