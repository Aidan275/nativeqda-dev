var mongoose = require('mongoose');
var Loc = mongoose.model('Location');
var User = mongoose.model('User');
var Event = mongoose.model('Event');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.loginEvent = function(req, res) {
	//var event = new Event();
	//console.log(req.body);
	var ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
	console.log(ip);
	sendJSONresponse(res, 200, ip);
	//event.email = req.body.email;
};

/* POST a event
/* /api/event */
module.exports.writeEvent = function(req, res) {
	getAuthor(req, res, function (req, res, userName) {
		if (req.params.locationid) {
			Loc
			.findById(req.params.locationid)
			.select('reviews')
			.exec(
				function(err, location) {
					if (err) {
						sendJSONresponse(res, 400, err);
					} else {
						doAddReview(req, res, location, userName);
					}
				}
				);
		} else {
			sendJSONresponse(res, 404, {
				"message": "Not found, locationid required"
			});
		}
	});
};

var getAuthor = function(req, res, callback) {
	console.log("Finding author with email " + req.payload.email);
	if (req.payload.email) {
		User
		.findOne({ email : req.payload.email })
		.exec(function(err, user) {
			if (!user) {
				sendJSONresponse(res, 404, {
					"message": "User not found"
				});
				return;
			} else if (err) {
				console.log(err);
				sendJSONresponse(res, 404, err);
				return;
			}
			console.log(user);
			callback(req, res, user.name);
		});

	} else {
		sendJSONresponse(res, 404, {
			"message": "User not found"
		});
		return;
	}
};

var doAddReview = function(req, res, location, author) {
	if (!location) {
		sendJSONresponse(res, 404, "locationid not found");
	} else {
		location.reviews.push({
			author: author,
			rating: req.body.rating,
			reviewText: req.body.reviewText
		});
		location.save(function(err, location) {
			var thisReview;
			if (err) {
				sendJSONresponse(res, 400, err);
			} else {
				updateAverageRating(location._id);
				thisReview = location.reviews[location.reviews.length - 1];
				sendJSONresponse(res, 201, thisReview);
			}
		});
	}
};


module.exports.locationsCreate = function (req, res) {
	console.log(req.body);
	Loc.create({
		name: req.body.name,
		address: req.body.address,
		facilities: req.body.facilities.split(","),
		coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
		openingTimes: [{
			days: req.body.days1,
			opening: req.body.opening1,
			closing: req.body.closing1,
			closed: req.body.closed1,
		}, {
			days: req.body.days2,
			opening: req.body.opening2,
			closing: req.body.closing2,
			closed: req.body.closed2,
		}]
	}, function(err, location) {
		if (err) {
			console.log(err);
			sendJSONresponse(res, 400, err);
		} else {
			console.log(location);
			sendJSONresponse(res, 201, location);
		}
	});
};