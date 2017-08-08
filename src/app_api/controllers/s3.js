var aws = require('aws-sdk');
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


// Creates a signed URL for the user to upload a file directly to S3 from their browser/device, bypassing the server.
module.exports.signUpload = function(req, res) {
	var s3Url = 'https://' + process.env.S3_BUCKET_NAME + '.s3-ap-southeast-2.amazonaws.com';
	var path = null;

	// If a key is supplied in the request, use, otherwise generate a unique date based key
	// This is for uploading a text file converted from a PDF/Docx. 
	// e.g. same key but different file extension (.txt)
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

	// If the file being uploaded is an avatar, edit the path to include 
	// the parent avatar folder.
	if(req.body.avatar) {
		path = 'avatars/' + path ;
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

module.exports.signDownload = function(req, res) {
	var paths = extractpath(req.params["filepath"]);
	var key = '';
	File.findOne({name: paths[0], path: paths[1] }).exec(function(err, results) {
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
			sendJSONresponse(res, 404, {
				"message": "Folder or no key"
			});
			return;
		}

		if(req.query.getTextFile === 'true') {
			key = results.textFileKey;
		} else {
			key = results.key;
		}

		var params = {
			Bucket: process.env.S3_BUCKET_NAME, 
			Key: key
		};
		var url = s3.getSignedUrl('getObject', params, function(err, url) {
			if (err){
				sendJSONresponse(res, 404, err);
			}
			else {
				sendJSONresponse(res, 200, {
					"url": url,
					"type": results.type 	// Returns type to determine if the browser should view using google docs viewer or not
				});
			}         
		});
	});
};

module.exports.getFileList = function(req, res) {
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

module.exports.deleteFile = function(req, res) {
	var key = req.params["key"];
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


module.exports.syncDB = function(req, res) {
	console.log("Need to get DB to sync with S3! Need to: add file info to DB for files that only exist in S3 and remove file info from DB that don't exist in S3");
	res.sendStatus(418);
};

module.exports.acl = function(req, res) {
	var key = req.params["key"];
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