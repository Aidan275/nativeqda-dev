var mongoose = require('mongoose');
var Dataset = mongoose.model('Dataset');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.datasetCreate = function(req, res) {
	getAuthor(req, res, function (req, res, userName) {
		var dataset = new Dataset();

		dataset.name = req.body.name
		dataset.desc = req.body.desc;
		dataset.createdBy = userName;

		dataset.save(function(err) {
			if (err) {
				sendJSONresponse(res, 404, err);
			} else {
				sendJSONresponse(res, 200);
			}
		});	
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
			callback(req, res, user.name);
		});

	} else {
		sendJSONresponse(res, 404, {
			"message": "User not found"
		});
		return;
	}
};

module.exports.listDatasets = function(req, res) {
	Dataset
	.find()
	.exec(
		function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "No Datasets found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 404, err);
				return;
			}
			datasetList = buildDatasetList(req, res, results);
			sendJSONresponse(res, 200, datasetList);
		});
}

var buildDatasetList = function(req, res, results) {
	var datasetList = [];
	results.forEach(function(doc) {
		datasetList.push({
			name: doc.name,
			createdBy: doc.createdBy,
			dateCreated: doc.dateCreated,
			desc: doc.desc,
			_id: doc._id
		});
	});
	return datasetList;
};

module.exports.datasetReadOne = function(req, res) {
	var datasetid = req.params.datasetid;
	if (datasetid) {
		Dataset
		.findById(datasetid)
		.exec(
			function(err, dataset) {
				if (!dataset) {
					sendJSONresponse(res, 404, {
						"message": "datasetid not found"
					});
					return;
				} else if (err) {
					sendJSONresponse(res, 404, err);
					return;
				}
				sendJSONresponse(res, 200, dataset);
			});
	} else {
		sendJSONresponse(res, 404, {
			"message": "No datasetid in request"
		});
	}
}

module.exports.datasetDeleteOne = function(req, res) {
	var datasetid = req.params.datasetid;
	if (datasetid) {
		Dataset
		.findByIdAndRemove(datasetid)
		.exec(
			function(err, dataset) {
				if (err) {
					console.log(err);
					sendJSONresponse(res, 404, err);
					return;
				}
				console.log("dataset id " + datasetid + " deleted");
				sendJSONresponse(res, 204, null);
			});
	} else {
		sendJSONresponse(res, 404, {
			"message": "No datasetid"
		});
	}
}
