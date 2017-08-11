var mongoose = require('mongoose');
var MarkerLink = mongoose.model('MarkerLink');
var File = mongoose.model('File');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};


module.exports.putLink = function(req, res) {	/* Adds a marker link to the database */
	var link = new MarkerLink();

	link._creator = req.body._creator;
	link.name = req.body.name;
	link.description = req.body.description;

	link.precedent = req.body.precedent;
	link.dependent = req.body.dependent;

	link.save(function(err, response) {
		if(err) {
			sendJSONresponse(res, 500, err);
			return;
		}

		File.update(
			{ _id: { $in: [link.precedent, link.dependent] } } ,
			{ $push: { markerLinks: response._id } },
			{ multi: true }, function (err) {
				if (err) {
					sendJSONresponse(res, 500, err);
				}
			});

		var options = [
		{path: '_creator', select: 'firstName lastName'}, 
		{path: 'precedent', select: 'coords'}, 
		{path: 'dependent', select: 'coords'}
		];

		MarkerLink.populate(response, options, function(err, doc) { 
			if (err) {
				sendJSONresponse(res, 500, err);
			} else {
				sendJSONresponse(res, 200, doc);
			}
		});
	});

};

module.exports.getLinks = function(req, res) {	/* Gets all the marker links from the database */
	var options = [
	{path: '_creator', select: 'firstName lastName'}, 
	{path: 'precedent', select: '_id coords'}, 
	{path: 'dependent', select: '_id coords'}
	];

	MarkerLink
	.find()
	.populate(options)
	.exec(
		function(err, results) {
			if(!results) {
				sendJSONresponse(res, 404, {
					"message": "No marker links found"
				});
				return;
			} else if(err) {
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
			_creator: doc._creator,
			name: doc.name,
			description: doc.description,
			dateCreated: doc.dateCreated,
			precedent:  doc.precedent,
			dependent: doc.dependent,
			_id: doc._id
		});
	});
	return LinkList;
};

module.exports.deleteLink = function(req, res) { /* Remove link */
	var id = req.params["id"];
	if(id) {
		MarkerLink
		.findByIdAndRemove(id)
		.exec(
			function(err, results) {
				if(err) {
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