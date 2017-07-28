var mongoose = require('mongoose');
var Settings = mongoose.model('Settings');

/*
	TODO: getSettings and setSettings both can only be used by a (the?) user with superadmin or such permission.
	This is pre-requisite by user role implementation in user controller
*/

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.getSettings = function(req, res) { //Get system settings object
	Settings.findOne({"_id": null}).exec(function(err, results) {
		if (!results) {
			sendJSONresponse(res, 404, {
				"message": "No settings found"
			});
			return;
		} else if (err) {
			sendJSONresponse(res, 500, err);
			return;
		}
		sendJSONresponse(res, 200, results);
	});
};

module.exports.setSettings = function(req, res) { //Update system settings with new settings object or create db entry if it doesn't exist. Returns the updated JSON object.
	//ObjectID is null, hopefully shouldn't be a problem
	Settings.findOneAndUpdate({"_id": null}, {$set:{"settings": req.body.newsettings}}, { upsert: true, new: true }, function(err, results) {
		if (err) {
			sendJSONresponse(res, 500, err);
			return;
		}
		sendJSONresponse(res, 200, results);
	});
	
};