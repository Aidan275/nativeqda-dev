## NativeQDA 

### How to Run Locally

* Download and install Node - [Node.js Download](https://nodejs.org/en/) 
* Download and install MongoDB - [MongoDB Download](https://www.mongodb.com/download-center?jmp=nav#community) 
* Clone repo from Github  (The development repo will have the most recent commits)

Development repo deploys to [nativeqda-dev](https://nativeqda-dev.herokuapp.com/) every push to master
```
git clone git@github.com:Aidan275/nativeqda-dev.git
```
Production repo deploys to [nativeqda](https://nativeqda.herokuapp.com/) every push to master
```
git clone git@github.com:Aidan275/nativeqda.git
```
* Change to the root dir and download dependencies using NPM
```
cd nativeqda-dev
npm install
```
This will download all the dependencies for the app into the node_modules folder, it may take a minute (~150 MB including dev dependencies). 
* Install [gulp](http://gulpjs.com/) globally to build and serve the development and production environments
 ```
npm install -g gulp
```
Gulp is used to automate deployment to production and provides additional development features. <br>
Some of the commands that exist at the moment include:
 ```javascript
gulp serve			/*	Serves the files for development located in /src and watches
						these files and reloads the app/browser when changes are made */
            
gulp build			/* 	Builds the optimised app for production. Copies optimised code
						to the dist folder */

gulp serve-build		/* 	This will watch the AngularJS JS files, vendor JS, vendor CSS, 
						scripts, styles, images, fonts, and AngularJS HTML and run the 
						appropriate tasks to bundle/minify/copy/etc. the modified files
						when changes are detected and reload the app/browser.	*/
```
The scripts for these commands are located in gulpfile<span></span>.js. <br>
**Note:** The app must be built before deploying as this creates the files in the dist directory which are used in production.
* Install [Browsersync](https://www.browsersync.io/) globally to automatically reload the browser when file changes are detected
```
npm install -g browser-sync
```
* Before running the app, environmental variables need to be defined. 
	* Create a new file in the root folder called **.env**
	* Add the following text and save the file
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://heroku_t0vt9rr2:lskjavvplpc89t6ggkp6pm9v9d@ds125481.mlab.com:25481/heroku_t0vt9rr2
JWT_SECRET=WhateverYouWant
AWS_ACCESS_KEY_ID=AKIAIP53REFZNB3H3GBA
AWS_SECRET_ACCESS_KEY=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
S3_BUCKET_NAME=nativeqda-assets
```
These variables should be kept secret and shouldn't be included here but oh well, no one can see them. <br>
The MONGODB_URI is only used when NODE_ENV is set to production and the JWT_SECRET is for the authentication of users and passwords (salts and hashes).
* Start MongoDB in a separate command line/terminal with
```
mongod
```
* Try gulp serve to run the app in its development environment
* Not working? Try going to localhost:3000 instead.