var mongoose = require('mongoose');
var File = mongoose.model('File');

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
	var path = extractpath(req.params["filepath"]);
	var file = new File();

	file.name = path[0];
	file.path = path[1];
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

module.exports.deleteFile = function(req, res) { //Remove file
	var path = extractpath(req.params["filepath"]);
	File.remove({name: path[0], path: path[1]}).exec(function(err, results) {
		if (err) {
			sendJSONresponse(res, 500, err);
			return;
		}
		if (!results) {
			sendJSONresponse(res, 404, "Nothing found");
			return;
		}
		sendJSONresponse(res, 204, null);			
	});
};

//Get (limited) file info for pins on the map based on some criteria. Ie. Limited in spatial or time range
module.exports.map = function(req, res) { //TODO: Actual limiting (Criteria and ACL)
	File
	.find({type: {$ne: 'folder'} })
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
			icon: doc.icon
		});
	});
	return fileList;
};