var aws = require('aws-sdk');
var crypto = require('crypto');
var moment = require('moment');
var fs = require('fs');
var mongoose = require('mongoose');
var File = mongoose.model('File');
var s3 = new aws.S3();

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.signUploadS3 = function(req, res) {
	var s3Url = 'https://' + process.env.S3_BUCKET_NAME + '.s3-ap-southeast-2.amazonaws.com';
	
	// Generate date based key
	var datePrefix = moment().format('YYYY[/]MM');
	var key = crypto.randomBytes(10).toString('hex');
	var hashFilename = key + '-' + req.body.name;
	var path = datePrefix + '/' + hashFilename;

	var type = req.body.type

	var readType = 'private';

    var expiration = moment().add(5, 'm').toDate(); //15 minutes
    var s3Policy = {
    	'expiration': expiration,
    	'conditions': [
    	{'bucket': process.env.S3_BUCKET_NAME},
    	['starts-with', '$key', path], 
    	{'acl': readType},
    	{'success_action_status': '201'},
    	['starts-with', '$Content-Type', type],
    	['content-length-range', 2048, 10485760],
    	]
    };

    var stringPolicy = JSON.stringify(s3Policy);
    var base64Policy = new Buffer(stringPolicy, 'utf-8').toString('base64');

    // sign policy
    var signature = crypto.createHmac('sha1', process.env.AWS_SECRET_ACCESS_KEY)
    .update(new Buffer(base64Policy, 'utf-8')).digest('base64');

    var credentials = {
    	url: s3Url,
    	fields: {
    		key: path,
    		AWSAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    		acl: readType,
    		policy: base64Policy,
    		signature: signature,
    		'Content-Type': type,
    		success_action_status: 201
    	}
    };
    res.jsonp(credentials);
};

module.exports.signDownloadS3 = function(req, res) {
	var key = req.query.key;
	var params = {
		Bucket: process.env.S3_BUCKET_NAME, 
		Key: key
	};

	var url = s3.getSignedUrl('getObject', params, function(err, url) {
		if (err){
			sendJSONresponse(res, 404, err);
		}
		else {
			sendJSONresponse(res, 200, url);
		}         
	});
};

module.exports.getFileListS3 = function(req, res) {
	var params = {
		Bucket: process.env.S3_BUCKET_NAME,
	};

	s3.listObjects(params, function(err, data) {
		if (err){
			sendJSONresponse(res, 404, err);
		}
		else {
			sendJSONresponse(res, 200, data);
		}         
	});
};

module.exports.deleteFileS3 = function(req, res) {
	var key = req.body.key;
	var params = {
		Bucket: process.env.S3_BUCKET_NAME, 
		Key: key
	};
	s3.deleteObject(params, function(err, data) {
		if(err){
			sendJSONresponse(res, 404, err);
		} else {
			sendJSONresponse(res, 200, data);
		}
	});
};

module.exports.addFileDB = function(req, res) {
	var file = new File();

	file.name = req.body.name;
	file.eTag = req.body.eTag;
	file.key = req.body.key;
	file.size = req.body.size;
	file.url = req.body.url;
	file.createdBy = req.body.createdBy;
	if(req.body.coords.lng && req.body.coords.lat){
		file.coords = { 
			coordinates: [parseFloat(req.body.coords.lng), parseFloat(req.body.coords.lat)]
		};
	}
	file.tags = req.body.tags;

	file.save(function(err, response) {
		if (err) {
			sendJSONresponse(res, 404, err);
		} else {
			sendJSONresponse(res, 200, response);
		}
	});	
};

module.exports.getFileListDB = function(req, res) {
	File
	.find()
	.exec(
		function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "No Files found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 404, err);
				return;
			}
			var fileList = buildFileListDB(req, res, results);
			sendJSONresponse(res, 200, fileList);
		});
};

var buildFileListDB = function(req, res, results) {
	var fileList = [];
	results.forEach(function(doc) {
		fileList.push({
			eTag: doc.eTag,
			key: doc.key,
			size: doc.size,
			url: doc.url,
			createdBy: doc.createdBy,
			lastModified: doc.lastModified,
			name: doc.name,
			coords: {
				coordinates: {
					0: doc.coords.coordinates[0],
					1: doc.coords.coordinates[1]
				}
			},
			tags: doc.tags,
			_id: doc._id,
			acl: doc.acl
		});
	});
	return fileList;
};

module.exports.fileReadOneDB = function(req, res) {
	var key = req.query.key;
	console.log(key);
	if(key) {
		File
		.findOne({key: key})
		.exec(
			function(err, results) {
				if (!results) {
					sendJSONresponse(res, 404, {
						"message": "No file found"
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
			"message": "No key parameter in request"
		});
	}
};

module.exports.deleteFileDB = function(req, res) {
	var key = req.query.key;
	if(key) {
		File
		.remove({key: key})
		.exec(
			function(err, results) {
				if (err) {
					console.log(err);
					sendJSONresponse(res, 404, err);
					return;
				}
				console.log(key + " deleted");
				sendJSONresponse(res, 204, null);
			});
	} else {
		sendJSONresponse(res, 404, {
			"message": "No key parameter in request"
		});
	}
};

module.exports.syncDBwithS3 = function(req, res) {
	console.log("Need to get DB to sync with S3! Need to: add file info to DB for files that only exist in S3 and remove file info from DB that don't exist in S3");
};

module.exports.objectAclS3 = function(req, res) {
	var key = req.body.key;
	var acl = req.body.acl;
	
	var params = {
		Bucket: process.env.S3_BUCKET_NAME,
		Key: key,
		ACL: acl
	};

	s3.putObjectAcl(params, function(err, data) {
		if(err){
			sendJSONresponse(res, 404, err);
		} else {
			sendJSONresponse(res, 200, data);
		}
	});
};

module.exports.objectAclDB = function(req, res) {
	var key = req.body.key;
	var acl = '';

	if(req.body.acl === 'public-read')
		acl = 'public-read';
	else if(req.body.acl === 'private')
		acl = 'private';

	if(!key || !acl) {
		sendJSONresponse(res, 404, {
			"message": "No key or ACL parameter in request"
		});
	} else if(req.body.acl == 'public-read' || req.body.acl == 'private') {
		File
		.update({key: key}, {$set: {acl: acl}})
		.exec(
			function(err, results) {
				if (err) {
					console.log(err);
					sendJSONresponse(res, 404, err);
					return;
				}
				console.log(key + " ACL updated to " + acl);
				sendJSONresponse(res, 204, null);
			});
	} else {
		sendJSONresponse(res, 404, {
			"message": "invalid ACL parameter in request - must be either 'public-read' or 'private'"
		});		
	}
};