var mongoose = require('mongoose');
var File = mongoose.model('File');
var AnalysisResults = mongoose.model('analysisResults');
var MarkerLink = mongoose.model('MarkerLink');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

var extractpath = function(filepathparam) { //Getting file name and path can definitely be done better
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
	var path = extractpath(req.params["filepath"]);
	var file = new File();

	file.name = path[0];
	file.path = path[1];
	
	if (path[1] == "") {
		sendJSONresponse(res, 500, "Path is empty");
		return;
	}
	
	file.type = req.body.type;
	
	file.key = req.body.key;
	if(req.body.textFileKey){
		file.textFileKey = req.body.textFileKey;
	}
	file.size = req.body.size;
	file.url = req.body.url;
	file.createdBy = req.body.createdBy;
	
	if(req.body.coords != undefined){
		file.coords = { 
			coordinates: [parseFloat(req.body.coords.lng), parseFloat(req.body.coords.lat)]
		};
	}
	file.tags = req.body.tags;
	file.icon = req.body.icon;
	
	File.findOne({name: path[0], path: path[1]}, function(err, results) {
		if (err)
			sendJSONresponse(res, 500, err)
		else if (!results) { //File doesn't exist, create it
			file.save(function(err, response) {
				if (err) {
					sendJSONresponse(res, 500, err);
				} else {
					sendJSONresponse(res, 200, response);
				}
			});	
		} else { //File already exists, update it
			var fileData = file.toObject();
			delete fileData._id;
			File.update({name: path[0], path: path[1]}, fileData, function(err, response) {
				if (err)
					sendJSONresponse(res, 500, err)
				else
					sendJSONresponse(res, 200, response)
			});
		}
	});
};


/**
* @apiGroup Files
* @api {Delete} /api/files/:filepath(*)	Delete File
* @apiDescription Deletes the file from the database  
* Also deletes any marker links and updates analyses associated with the file
* @apiPermission researcher
* @apiParam (URL Parameter) {String} filepath 	File path of the file
* @apiSuccessExample {json} Success Example
*     HTTP/1.1 204 No Content
* @apiUse FileNotFoundError
* @apiUse InternalServerError
*/
module.exports.deleteFile = function(req, res) { /* Remove file and any marker links associated with the file */
	var path = extractpath(req.params["filepath"]);	/* Extract the path and the file name */
	
	File.find({name: path[0], path: path[1]}).exec(function(err, results) {
		
		if (err) {
			sendJSONresponse(res, 500, err)
			return;
		}
		if (!results) {
			sendJSONresponse(res, 404, "Not found")
			return;
		}
		var path = [results[0].name, results[0].path]
		if (results[0].type == 'folder') {
			//Delete all the files/folders in the selected folder
			if (path[1] == '/') //Folder is in root
				deleteFolder(res, [path[0]])
			else //Folder is not in root
				deleteFolder(res, path)			
		}
		//Normal file deletion
		deleteFile(res, path)
		sendJSONresponse(res, 204, null);
	});
};

function deleteFolder(res, path) {
	File.find({path: path[1]+'/'+path[0] })
		.exec(function(err, results) {
			if (err) {
				sendJSONresponse(res, 500, err)
				return;
			}
			for (var i = 0; i < results.length; i++) {
				var path = [results[i].name, results[i].path]
				deleteFile(res, path);
				if (results[i].type == 'folder') {
					//console.log('Folder: ' + results[i].name)
					deleteFolder(res, path) //Another folder
				}
			}
		});
}

var deleteFile = function(res, path) {
	console.log('File: ' + path)
	
	File.findOneAndRemove({name: path[0], path: path[1]})	/* Finds and removes the file with the provided path and name */
	.exec(function(err, results) {

		if (err) {	/* If error, return error message */
			sendJSONresponse(res, 500, err);
			return;
		}

		if (!results) {	/* If no results, return message (do we need this or will there be an err if no results?) */
			sendJSONresponse(res, 404, "File not found");
			return;
		}

		/* If the file has marker links associated with it, remove each link */
		if(results.markerLinks) {	
			results.markerLinks.forEach(function(markerLink) {
				MarkerLink.findByIdAndRemove(markerLink)
				.exec(
					function(err, results) {
						if (err) {	/* If error, return error message */
							sendJSONresponse(res, 404, err);
							return;
						}
					});
			})
		}

		/* If the file has been used in any existing analyses, update analysis to reflect file deletion */
		if(results.analyses) {	
			AnalysisResults.update(
				{ _id: { $in: results.analyses } },		/* Finds analyses the file was used in */
				{ $pull: { files: results._id } },		/* Removes the file reference from the analysis */
				{ multi: true }, function (err) {
					if (err) {
						sendJSONresponse(res, 500, err);	/* Return error if err */
					}
				});

			/* Data stored in the analysis document to so users know which files were included in an anlysis, even if deleted */
			var deletedFile = {
				name: results.name,
				icon: results.icon,
				dateCreated: results.dateCreated,
				size: results.size,
				createdBy: results.createdBy
			};

			/* Updates the analyses with the deleted file information */
			AnalysisResults.update(
				{ _id: { $in: results.analyses } },			/* Finds analyses the file was used in */
				{ $push: { deletedFiles: deletedFile } },	/* Adds the deleted files details */
				{ multi: true }, function (err) {
					if (err) {
						sendJSONresponse(res, 500, err);	/* Return error if err */
					}
				});
		}
	});
}


//Get (limited) file info for pins on the map based on some criteria. Ie. Limited in spatial or time range
module.exports.map = function(req, res) { //TODO: Actual limiting (Criteria and ACL)
	File
	.find({type: {$ne: 'folder'} })
	.exec(
		function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "File not found"
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

var folderList = function(req, res, pathname) {
	// If the "onlyTextFiles" flag is true, only return the files
	// with associated text files for creating a dataset for analysis
	var options = {path: pathname};
	
	if(req.query.getTextFile === 'true'){	// If text files only flag, return text files and folders
		options = {path: pathname,
			$or: [{
				textFileKey: { $exists: true }
			}, {
				type: 'folder'
			}]
		}
	}

	File
	.find(options)
	.exec(
		function(err, results) {
			if (!results) {
				sendJSONresponse(res, 404, {
					"message": "File not found"
				});
				return;
			} else if (err) {
				sendJSONresponse(res, 500, err);
				return;
			}
			var fileList = buildFileListDB(req, res, results);
			//use this
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
			type: doc.type,
			coords: {
				coordinates: {
					0: doc.coords.coordinates[0],
					1: doc.coords.coordinates[1]
				}
			},
			tags: doc.tags,
			_id: doc._id,
			acl: doc.acl,
			icon: doc.icon,
			analyses: doc.analyses
		});
	});
	return fileList;
};

/**
* @apiGroup Files
* @api {Post} /api/files/acl	Update ACL Setting
* @apiDescription Updates the Access Control List (ACL) setting in the database. 
* @apiPermission researcher
* @apiParam (Body Parameter) {String} key 	S3 key of the file object
* @apiParam (Body Parameter) {String} acl 	ACL string of the file object (private/public-read/etc.)
* @apiParamExample {json} Request Example
*     {
*       "key": "files/2017/08/18/cd27ef702889d55d8a98.pdf",
*       "acl": "private"
*     }
* @apiSuccessExample {json} Success Example
*     HTTP/1.1 204 No Content
* @apiUse FileNotFoundError
* @apiUse InternalServerError
*/
module.exports.acl = function(req, res) {
	var key = req.body.key;
	var acl = req.body.acl;
	
	File.update({key: key}, {$set: {acl: acl}}, function(err, results) {
		if (err)
			sendJSONresponse(res, 500, err)
		else if (!results) {
			sendJSONresponse(res, 404, {
				"message": "File not found"
			});
			return;
		} else {
			sendJSONresponse(res, 204, null);
		}
	});
};

/* ============== API Definitions for inheritance ============== */

/**
* @apiDefine FileNotFoundError
*
* @apiError FileNotFound The File was not found
*
* @apiErrorExample {json} Error 404
*     HTTP/1.1 404 Not Found 
*     {
*       "message": "File not found"
*     }
*/

/**
* @apiDefine InternalServerError
*
* @apiError InternalServerError Internal server error
*
* @apiErrorExample {json} Error 500
*     HTTP/1.1 500 Internal Server Error
*/

/**
* @apiDefine ServiceUnavailableError
*
* @apiError ServiceUnavailable S3 service unavailable
*
* @apiErrorExample {json} Error 503
*     HTTP/1.1 503 Service Unavailable
*/