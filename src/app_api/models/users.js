var mongoose = require( 'mongoose' );
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var userRolesSchema = new mongoose.Schema({
	name: { /*Name of the user role */
		type: String,
		unique: true,
		required: true
	},
	color: { /*Colour associated with the user role, in HTML notation. */
		type: String,
		required: true
	}
});

var userSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true
	},
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	company: {
		type: String
	},
	roles: { /*User roles the member has been assigned */
		type: [String],
		default: 'researcher'
	},
	settings: { /*Object of user settings */
		type: Object,
		required: true,
		default: '{}'
	},
	dateCreated: { /*Datetime user was created in the system */
		type: Date,
		"default": Date.now
	},
	lastModified: {	/*Datetime the user's information was last edited */
		type: Date,
		"default": Date.now
	},
	hash: String,
	salt: String,
	avatar: {	/* Url of the user's avatar image */
		type: String,
		"default": "/assets/img/settings/default-avatar.png"	/* default image */
	},
	resetPasswordToken: String,
  	resetPasswordExpires: Date
});

userSchema.methods.setPassword = function(password){
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

userSchema.methods.validPassword = function(password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
	return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
	var expiry = new Date();
	expiry.setDate(expiry.getDate() + 7);	/* Sets the expiry date to 7 days in the future */
	return jwt.sign({
		_id: this._id,
		email: this.email,
		firstName: this.firstName,
		settings: this.settings,
		avatar: this.avatar,
		exp: parseInt(expiry.getTime() / 1000),	/* Sets the expiry date in seconds in the jwt */
	}, process.env.JWT_SECRET);
};

mongoose.model('User', userSchema);
mongoose.model('UserRoles', userRolesSchema);
