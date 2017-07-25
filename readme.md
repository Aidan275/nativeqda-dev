## NativeQDA 

### How to Run Locally

* Download and install Node v6 - [Node.js Download](https://nodejs.org/en/) 
* Download and install MongoDB - [MongoDB Download](https://www.mongodb.com/download-center?jmp=nav#community) 
* Clone repo from Github  (The development repo will have the most recent commits)
* Setup PATH Variables for Git and MongoDB

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
gulp serve			/*	Inject the paths into index.html then serves the files for development 
						located in /src and watches these files and reloads the app/browser 
						when changes are made */
            
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
* Removed the .env file from gitignore so it's now included in pushes/pulls to/from github. <br>
 **Note:** This may break others login authentication due to a different JWT_SECRET key.

* Start MongoDB in a separate command line/terminal with
```
mongod
```
* Try gulp serve to run the app in its development environment
* Not working? Try going to localhost:3000 instead.
