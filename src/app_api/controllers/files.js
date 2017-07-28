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

var extractpath = function(filepathparam) {
	//Getting file name and path can definitely be done better
	var fileparam = filepathparam;
	var filepath = "/" + filepathparam;
	//Strip trailing / if there is one
	if (filepath.endsWith('/')) {
		filepath = filepath.slice(0, filepath.length-1);
		fileparam = fileparam.slice(0, fileparam.length-1);
	}
	filepath = filepath.substring(1, filepath.lastIndexOf('/'));
	fileparam = fileparam.split("/");
	var path = new Array();
	path[0] = fileparam[fileparam.length-1];
	path[1] = filepath;
	return path;
}

module.exports.getFile = function(req, res) { //Get file info OR browse a folder
	if (req.params["filepath"] === "") { //Root folder, so we know to list files
		folderList(req, res, "/");
		return;
	}
	
	var path = extractpath(req.params["filepath"]);
	
	File.findOne({name: path[0], path: path[1]}).exec(
		function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "Nothing found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 500, err);
				return;
			}
			if (results.type == "folder") { //If a folder, return contents of folder
				if (results.path == '/') //Folder is in root
					folderList(req, res, results.name);
				else
					folderList(req, res, results.path + '/' + results.name);
			}
			else { //A file, return info
				sendJSONresponse(res, 200, results);
			}
		}
	);
};

module.exports.putFile = function(req, res) { //Update or add a file
	res.sendStatus(418);
};

module.exports.deleteFile = function(req, res) { //Remove file
	res.sendStatus(418);
};

//Get (limited) file info for pins on the map based on some criteria. Ie. Limited in spatial or time range
module.exports.map = function(req, res) { //TODO: Actual limiting (Criteria and ACL)
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

// Creates a signed URL for the user to upload a file directly to S3 from their browser/device, bypassing the server.
module.exports.signUploadS3 = function(req, res) {
	var s3Url = 'https://' + process.env.S3_BUCKET_NAME + '.s3-ap-southeast-2.amazonaws.com';
	var path = null;

	// If a key is supplied in the request, use, otherwise generate a date based key
	if(req.body.key) {
		path = req.body.key;
	} else {
		var datePrefix = moment().format('YYYY[/]MM');
		var key = crypto.randomBytes(10).toString('hex');
		var hashFilename = key + '-' + req.body.name;
		path = datePrefix + '/' + hashFilename;
	}

	// If the file being uploaded is a dataset (a concatenated text file), edit the path to include 
	// the parent datasets folder and the .txt file extension.
	if(req.body.dataset) {
		path = 'datasets/' + path + '.txt';
	}

	var type = req.body.type
	var readType = 'private';

	// If a read type is supplied in the request, use, otherwise use private
	if(req.body.readType) {
		readType = req.body.readType;
	}

    var expiration = moment().add(5, 'm').toDate();		//15 minutes
    var s3Policy = {
    	'expiration': expiration,
    	'conditions': [
    	{'bucket': process.env.S3_BUCKET_NAME},
    	['starts-with', '$key', path], 
    	{'acl': readType},
    	{'success_action_status': '201'},
    	['starts-with', '$Content-Type', type],
    	['content-length-range', 1, 10485760],	// File size range - 1 byte to 10 megabytes
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
    sendJSONresponse(res, 200, credentials);
};

module.exports.signDownloadS3 = function(req, res) {
	var paths = extractpath(req.params["filepath"]);
	console.log(paths);
	File.find({name: paths[0], path: paths[1] }).exec(function(err, results) {
		if (!results) {
			sendJSONresponse(res, 404, {
				"message": "No File found"
			});
			return;
		} else if (err) {
			sendJSONresponse(res, 500, err);
			return;
		}
		if (!results.key || results.type == "folder") {
			sendJSONresponse(res, 404, "Folder or no key");
			return;
		}
		var key = results.key
	});
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
	
	//Placeholder stuff to avoid breaking uploads
	file.type = 'document';
	file.folder = '/';
	
	file.key = req.body.key;
	if(req.body.textFileKey){
		file.textFileKey = req.body.textFileKey;
	}
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

var folderList = function(req, res, pathname) {
	// If the "onlyTextFiles" flag is true, only return the files
	// with associated text files for creating a dataset for analysis
	var options = {path: pathname};
	console.log('pathname: ' + pathname);
	/*if(req.query.onlyTextFiles === 'true'){
		options =+ { textFileKey: { $exists: true } };
	}*/

	File
	.find(options)
	.exec(
		function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "No Files found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 500, err);
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
			key: doc.key,
			textFileKey: doc.textFileKey,
			size: doc.size,
			url: doc.url,
			createdBy: doc.createdBy,
			lastModified: doc.lastModified,
			name: doc.name,
			path: doc.path,
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

/*module.exports.fileReadOneDB = function(req, res) {
	var key = req.query.key;
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
		sendJSONresponse(res, 400, {
			"message": "No key parameter in request"
		});
	}
};*/

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
		sendJSONresponse(res, 400, {
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
		sendJSONresponse(res, 400, {
			"message": "invalid ACL parameter in request - must be either 'public-read' or 'private'"
		});		
	}
};