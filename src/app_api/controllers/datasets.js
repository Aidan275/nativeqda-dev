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
	// Generate date based key
	var datePrefix = moment().format('YYYY[/]MM');
	var key = crypto.randomBytes(10).toString('hex');
	var hashFilename = key + '-' + req.body.name;
	var path = datePrefix + '/' + hashFilename;

	var CLOUD_CONVERT_S3_ACCESS_KEY = process.env.CLOUD_CONVERT_S3_ACCESS_KEY;
	var CLOUD_CONVERT_S3_SECRET_KEY = process.env.CLOUD_CONVERT_S3_SECRET_KEY;
	var S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

	var fileUploaded = false;
	var attempts = 0;

	console.log("datasets/" + path + ".pdf");

	combineFiles();

	///////////////////////////

	/* 	
		Creating a dataset involves multiple steps and API requests to cloud convert and S3.

		The text analysis service (Watson - Natural Language Understanding) accepts text files
		from URLs. 

		Therefore, when a dataset is created, the selected files are retrieved from S3 by 
		Cloud Convert to be combined into one PDF file, which is then uploaded back to S3.

		This PDF is then retrieved again by Cloud Convert and converted into one TXT file, 
		which is then uploaded back to S3. This TXT file can then be retrieved by Watson
		to be analysed.

		Messy
	*/

	function combineFiles() {
		cloudconvert.createProcess({				// Prepares Cloud Convert for file combining and retrieves a Process URL
			"mode": "combine",
			"outputformat": "pdf"
		}, function(error, process) {
			if(error) {
				sendJSONresponse(res, 404, error);	
				return;
			} else {
				process.start({						// Starts the process of getting the files from S3 and combining
					"mode": "combine",
					"input": {
						"s3": {
							"accesskeyid": CLOUD_CONVERT_S3_ACCESS_KEY,
							"secretaccesskey": CLOUD_CONVERT_S3_SECRET_KEY,
							"bucket": S3_BUCKET_NAME
						}
					},
					"files": req.body.files,
					"outputformat": "pdf",
					"output": {
						"s3": {
							"accesskeyid": CLOUD_CONVERT_S3_ACCESS_KEY,
							"secretaccesskey": CLOUD_CONVERT_S3_SECRET_KEY,
							"bucket": S3_BUCKET_NAME,
							"path": "datasets/" + path + ".pdf"
						}
					},
					"wait": true
				}, function (error, process) {
					if(error) {
						sendJSONresponse(res, 404, error);
						return;
					} else {									// Once complete, checks if the new combined file has been uploaded to S3 yet.
						var myVar = setInterval(function(){		// If the file does not exist yet, waits 5 seconds and checks again.
							attempts++;							// If more than 10 attempts have been made, gives up and sends an error message.
							if(attempts > 10) {					
								clearInterval(myVar);
								sendJSONresponse(res, 404, {
									message: "The combining of the dataset files failed."
								});
								return;
							}
							console.log("Checking if file exists...");
							var params = {
								Bucket: S3_BUCKET_NAME, 
								Key: "datasets/" + path + ".pdf"
							};
							s3.headObject(params, function (err, data) {
								if (!err) {
									clearInterval(myVar);
									convertToText();			// Once the file is detected in S3, begins the conversion process 
								}
							});
						}, 5000);
					}
				});
			}
		});
	}

	function convertToText() {
		console.log("Continuing"); 
		cloudconvert.createProcess({
			"inputformat": "pdf",
			"outputformat": "txt"
		}, function(error, process) {
			if(error) {
				sendJSONresponse(res, 404, error);
				return;
			} else {
				process.start({
					"input": {
						"s3": {
							"accesskeyid": CLOUD_CONVERT_S3_ACCESS_KEY,
							"secretaccesskey": CLOUD_CONVERT_S3_SECRET_KEY,
							"bucket": S3_BUCKET_NAME
						}
					},
					"file": "datasets/" + path + ".pdf",
					"outputformat": "txt",
					"output": {
						"s3": {
							"accesskeyid": CLOUD_CONVERT_S3_ACCESS_KEY,
							"secretaccesskey": CLOUD_CONVERT_S3_SECRET_KEY,
							"bucket": S3_BUCKET_NAME,
							"path": "datasets/" + path + ".txt"
						}
					}
				}, function (error, process) {
					if(error) {
						sendJSONresponse(res, 404, error);
						return;
					} else {
						addDatasetToDB();
					}
				});
			}
		});
	}

	function addDatasetToDB() {
		getAuthor(req, res, function (req, res, userName) {
			var dataset = new Dataset();

			dataset.name = req.body.name
			dataset.desc = req.body.desc;
			dataset.files = req.body.files;
			dataset.createdBy = userName;
			dataset.key = "datasets/" + path + ".txt";

			dataset.save(function(err) {
				if (err) {
					sendJSONresponse(res, 404, err);
				} else {
					sendJSONresponse(res, 200, dataset);
				}
			});	
		});
	}
}

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

