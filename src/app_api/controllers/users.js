var mongoose = require('mongoose');
var User = mongoose.model('User');
var UserRoles = mongoose.model('UserRoles');
var jwt = require('jsonwebtoken');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

function extractJWT(authheader) { //Extract the JWT from the Authorization header and then verify it and return the payload (email, etc)
	var jwtheader = authheader.split(' ');
	return jwt.verify(jwtheader[1], process.env.JWT_SECRET);
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
			tmpuser.email = req.body.email
		if (req.body.firstName)
			tmpuser.firstName = req.body.firstName
		if (req.body.lastName)
			tmpuser.lastName = req.body.lastName
		if (req.body.company)
			tmpuser.company = req.body.company
		if (req.body.settings)
			tmpuser.settings = req.body.settings
		if (req.body.avatar)
			tmpuser.avatar = req.body.avatar
		if (req.body.password)
			tmpuser.setPassword(req.body.password)
		
		tmpuser.save(function(err, response) {
			if (err)
				sendJSONresponse(res, 500, err)
			else
				sendJSONresponse(res, 200, tmpuser.generateJwt()) //Send new JWT
		})
	});
};

module.exports.getUserProfile = function(req, res) { res.sendStatus(418) };

module.exports.getRoles = function(req, res) {
	if (!req.params["rolename"]) { //Retrieve all the roles
		UserRoles.find({}).exec( function(err, results) {
			if (results.length == 0) {
				sendJSONresponse(res, 404, {
					"message": "No user role found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 500, err);
				return;
			}
			var roles = [];
			results.forEach(function(doc) {
				roles.push({
					name: doc.name,
					color: doc.color
				});
			});
			sendJSONresponse(res, 200, roles);
			return
		});
	}
	else { //Retrieve a specific role
		UserRoles.findOne({name: req.params["rolename"]}).exec( function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "No user role found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 500, err);
				return;
			}
			sendJSONresponse(res, 200, results);
		});
	}
};

module.exports.putRole = function(req, res) {
	//TODO: Validate color
	UserRoles.findOneAndUpdate({name: req.params["rolename"]}, {color: req.body.color}, {new: true, upsert: true} , function(err, response) {
		if (err) {
			sendJSONresponse(res, 500, err);
		} else {
			sendJSONresponse(res, 200, response);
		}
	});	
};

module.exports.deleteRole = function(req, res) {
	UserRoles.findOneAndRemove({name: req.params["rolename"]}, function(err, response) {
		if (err) {
			sendJSONresponse(res, 500, err);
		} else if (!response) {
			sendJSONresponse(res, 404, {"message": "No user role found"});
		}		
		else {
			sendJSONresponse(res, 200, response);
		}
	});	
};