var mongoose = require('mongoose');
var crypto = require('crypto');
var moment = require('moment');
var cloudconvert = new (require('cloudconvert'))(process.env.CLOUD_CONVERT_API_KEY);
var aws = require('aws-sdk');
var s3 = new aws.S3();
var Dataset = mongoose.model('Dataset');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.datasetCreate = function(req, res) {
	var dataset = new Dataset();

	dataset.name = req.body.name
	dataset.desc = req.body.desc;
	dataset.size = req.body.size,
	dataset.key = req.body.key;
	dataset.url = req.body.url,
	dataset.createdBy = req.body.createdBy;
	dataset.files = req.body.files;

	dataset.save(function(err) {
		if (err) {
			sendJSONresponse(res, 404, err);
		} else {
			sendJSONresponse(res, 200, dataset);
		}
	});	
	
}

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

