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

### How to generate documentation
Generate documentation using grunt
```
grunt
```
This should start a server at [http://localhost:8000](http://localhost:8000) where the documentation can be viewed.

## Testing

Unit tests are run using the following set of tools:
* [http://karma-runner.github.io](Karma) - test runner used to run the tests against code
* [https://mochajs.org/](Mocha) - testing framework used to define our overall unit test with describe, beforeEach and it functions
* [http://chaijs.com/](Chai) - assertion library used to verify the results of our unit tests
* [http://sinonjs.org/](Sinon) - library used for creating test spies, stubs and mocks in javascript 

![Example Figure](http://jasonwatmore.com/_content/images/angular-unit-testing-2.png)

### Running Unit Tests

To run the unit tests use the following karma command

```
karma start
```

This script will start the Karma test runner to execute the unit tests. Moreover, Karma will sit and
watch the source and test files for changes and then re-run the tests whenever any of them change.
This is the recommended strategy; if your unit tests are being run every time you save a file then
you receive instant feedback on any changes that break the expected code functionality.

* the configuration is found at 'karma.conf.js'
* the unit tests are found next to the code they are testing and are named as '....spec.js'.