var mongoose = require('mongoose');
var MarkerLinks = mongoose.model('markerLinks');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};


module.exports.putLink = function(req, res) {	/* Adds a marker link to the database */
	var link = new MarkerLinks();

	link.name = req.body.name;
	link.description = req.body.description;
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

	link.save(function(err, response) {
		if (err) {
			sendJSONresponse(res, 500, err);
		} else {
			sendJSONresponse(res, 200, response);
		}
	});

};

module.exports.getLinks = function(req, res) {	/* Gets all the marker links from the database */
	MarkerLinks
	.find()
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
			var LinkList = buildLinkList(req, res, results);
			sendJSONresponse(res, 200, LinkList);
		});
};

var buildLinkList = function(req, res, results) {
	var LinkList = [];
	results.forEach(function(doc) {
		LinkList.push({
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
	return LinkList;
};

module.exports.deleteLink = function(req, res) { /* Remove link */
	var id = req.params["id"];
	if(id) {
		MarkerLinks
		.findByIdAndRemove(id)
		.exec(
			function(err, results) {
				if (err) {
					sendJSONresponse(res, 404, err);
					return;
				}
				sendJSONresponse(res, 204, null);
			});
	} else {
		sendJSONresponse(res, 404, {
			"message": "No id parameter in request"
		});
	}
};