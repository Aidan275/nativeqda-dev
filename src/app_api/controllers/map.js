var mongoose = require('mongoose');
var MarkerLinks = mongoose.model('markerLinks');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};


module.exports.putLink = function(req, res) {	/* Adds a marker link to the database */
	var link = new MarkerLinks();

	console.log(req.body);

	link.name = req.body.name;
	link.description = req.body.description;
	link.dateCreated = req.body.dateCreated;
	link.createdBy = req.body.createdBy;
	link.userID = req.body.userID;

	link.precedent.fileID = req.body.precedent.fileID;
	link.precedent.coords = { 
		coordinates: [parseFloat(req.body.precedent.lng), parseFloat(req.body.precedent.lat)]
	};

	link.dependent.fileID = req.body.dependent.fileID;
	link.dependent.coords = { 
		coordinates: [parseFloat(req.body.dependent.lng), parseFloat(req.body.dependent.lat)]
	};

	console.log(link);

	link.save(function(err, response) {
		if (err) {
			sendJSONresponse(res, 500, err);
		} else {
			sendJSONresponse(res, 200, response);
		}
	});

};

module.exports.getLinks = function(req, res) {	/* Gets all the marker links from the database */
	var lat = req.query.lat;
	var lng = req.query.lng;
	var options = {
		$or: [{
			'precedent.coords.coordinates': [lng, lat]

		}, {
			'dependent.coords.coordinates': [lng, lat]
		}]
	};
	MarkerLinks
	.find(options)
	.exec(
		function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "No marker links found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 500, err);
				return;
			}
			var markerList = buildMarkerList(req, res, results);
			sendJSONresponse(res, 200, markerList);
		});
};

var buildMarkerList = function(req, res, results) {
	var markerList = [];
	results.forEach(function(doc) {
		markerList.push({
			name: doc.name,
			description: doc.description,
			dateCreated: doc.dateCreated,
			createdBy: doc.createdBy,
			userID: doc.userID,
			precedent: {
				fileID: doc.precedent.coords.fileID,
				coords: {
					coordinates: {
						0: doc.precedent.coords.coordinates[0],
						1: doc.precedent.coords.coordinates[1]
					}
				},
			},
			dependent: {
				fileID: doc.dependent.coords.fileID,
				coords: {
					coordinates: {
						0: doc.dependent.coords.coordinates[0],
						1: doc.dependent.coords.coordinates[1]
					}
				},
			},
			_id: doc._id
		});
	});
	return markerList;
};