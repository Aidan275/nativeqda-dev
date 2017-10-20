var gulp = require('gulp');
var debug = require('gulp-debug');
var browserSync = require('browser-sync');
var del = require('del');
var paths = require('./gulp.config.json');
var plug = require('gulp-load-plugins')();
var reload = browserSync.reload;
var markdownpdf = require("markdown-pdf");

var colors = plug.util.colors;
var env = plug.util.env;
var log = plug.util.log;
var port = process.env.PORT || 3000;

/**
* List the available gulp tasks
*/
gulp.task('help', plug.taskListing);

/**
* Copy the Please Wait files for the initial loading screen
* @return {Stream}
*/
gulp.task('please-wait', function() {
	log('Copying the Please Wait scripts');

	gulp.src(paths.pleaseWaitCSS)
	.pipe(gulp.dest(paths.dist + 'assets/css'));

	gulp.src(paths.pleaseWaitJS)
	.pipe(gulp.dest(paths.dist + 'assets/js'));

	gulp.src(paths.pleaseWaitStartJS)
	.pipe(gulp.dest(paths.dist + 'assets/js'));

	return gulp.src(paths.pleaseWaitStopJS)
	.pipe(gulp.dest(paths.dist + 'assets/js'));
});

/**
* Minify and bundle the vendor CSS
* @return {Stream}
*/
gulp.task('vendor-css', function() {
	log('Bundling, minifying, and copying the vendor CSS');

	return gulp.src(paths.minVendorCSS)
	.pipe(debug({title: 'vendor-css:'}))
	.pipe(plug.concat('vendor.min.css'))
	.pipe(plug.bytediff.start())
	.pipe(plug.minifyCss({}))
	.on('error', function (err) { plug.util.log(colors.red('[Error]'), err.toString()); })
	.pipe(plug.bytediff.stop(bytediffFormatter))
	.pipe(gulp.dest(paths.dist + 'assets/css'));
});

/**
* Minify and copy the separate app CSS for each view
* @return {Stream}
*/
gulp.task('app-css', function() {
	log('Minifying, and copying the app CSS styles');

	return gulp.src(paths.appCSS)
	.pipe(debug({title: 'app-css:'}))
	.pipe(plug.autoprefixer('last 2 version', '> 5%'))
	.pipe(plug.minifyCss({}))
	.on('error', function (err) { plug.util.log(colors.red('[Error]'), err.toString()); })
	.pipe(gulp.dest(paths.dist + 'app'));
});

/**
* Minify the global CSS style
* @return {Stream}
*/
gulp.task('styles-css', function() {
	log('Bundling, minifying, and copying the CSS styles');

	return gulp.src(paths.CSS)
	.pipe(debug({title: 'styles-css:'}))
	.pipe(plug.concat('styles.min.css')) /* Before bytediff or after */
	.pipe(plug.autoprefixer('last 2 version', '> 5%'))
	.pipe(plug.bytediff.start())
	.pipe(plug.minifyCss({}))
	.on('error', function (err) { plug.util.log(colors.red('[Error]'), err.toString()); })
	.pipe(plug.bytediff.stop(bytediffFormatter))
	.pipe(gulp.dest(paths.dist + 'assets/css'));
});

/**
* Minify and bundle the vendor JS
* @return {Stream}
*/
gulp.task('vendor-js', function() {
	log('Bundling, minifying, and copying the vendor JS');

	return gulp.src(paths.minVendorJS)
	.pipe(debug({title: 'vendor-js:'}))
	.pipe(plug.concat('vendor.min.js'))
	.pipe(plug.bytediff.start())
	.pipe(plug.uglify())
	.on('error', function (err) { plug.util.log(colors.red('[Error]'), err.toString()); })
	.pipe(plug.bytediff.stop(bytediffFormatter))
	.pipe(gulp.dest(paths.dist + 'assets/js'));
});

/**
* Minify and bundle the JS scripts
* @return {Stream}
*/
gulp.task('scripts-js', function() {
	log('Bundling, minifying, and copying the JS scripts');

	return gulp.src(paths.JS)
	.pipe(debug({title: 'scripts-js:'}))
	.pipe(plug.concat('scripts.min.js'))
	.pipe(plug.bytediff.start())
	.pipe(plug.uglify())
	.on('error', function (err) { plug.util.log(colors.red('[Error]'), err.toString()); })
	.pipe(plug.bytediff.stop(bytediffFormatter))
	.pipe(gulp.dest(paths.dist + 'assets/js'));
});

/**
* Minify and bundle the app JS
* @return {Stream}
*/
gulp.task('ng-app', function() {
	log('Bundling, annotating, minifying, and copying the app JS');

	var source = [].concat(paths.appJS, paths.dist + 'templates.js');
	return gulp.src(source)
	.pipe(debug({title: 'ng-app:'}))
	.pipe(plug.concat('ng-app.min.js'))
	.pipe(plug.ngAnnotate({
		add: true,
		single_quotes: true
	}))
	.pipe(plug.bytediff.start())
	.pipe(plug.uglify({
		mangle: true
	}))
	.on('error', function (err) { plug.util.log(colors.red('[Error]'), err.toString()); })
	.pipe(plug.bytediff.stop(bytediffFormatter))
	.pipe(gulp.dest(paths.dist + 'assets/js'));
});

/**
* Minify and copy the app HTML
* @return {Stream}
*/
gulp.task('html', function() {
	log('Minifying, and copying the app HTML');

	return gulp.src(paths.appHTML)
	.pipe(debug({title: 'html:'}))
	/*.pipe(plug.bytediff.start()) */
	.pipe(plug.minifyHtml({
		empty: true
	}))
	/*.pipe(plug.bytediff.stop(bytediffFormatter)) */
	.pipe(gulp.dest(paths.dist + 'app'));
});

/**
* Compress and copy the images
* @return {Stream}
*/
gulp.task('images', function() {
	log('Compressing, caching, and copying the images');

	return gulp.src(paths.images)
	.pipe(debug({title: 'images:'}))
	.pipe(plug.cache(plug.imagemin({
		optimizationLevel: 3
	})))
	.pipe(gulp.dest(paths.dist + 'assets/img'));
});

/**
* Copy the fonts
* @return {Stream}
*/
gulp.task('fonts', function() {
	log('Copying the fonts');

	return gulp.src(paths.fonts)
	.pipe(debug({title: 'fonts:'}))
	.pipe(gulp.dest(paths.dist + 'assets/fonts'));
});

/**
* Creates a PDF version of the readme
* @return {Stream}
*/
gulp.task('readmeToPDF', function() {
	log('Converting the readme to PDF');

	markdownpdf().from("readme.md").to("readme.pdf");
});


/**
* Inject all the optimised files into the index.html for production
* @return {Stream}
*/
gulp.task('inject-min', ['ng-app', 'scripts-js', 'vendor-js', 'styles-css', 'app-css', 'vendor-css', 'please-wait'], function() {
	log('Injecting paths into index.html for production');
	var dist = paths.dist;

	gulp.src(paths.client + 'index-template.html')
	.pipe(debug({title: 'inject-min:'}))
	.pipe(inject('assets/css/please-wait.css', 'inject-please-wait'))
	.pipe(inject('assets/css/vendor.min.css', 'inject-vendor'))
	.pipe(inject('assets/css/styles.min.css', 'inject-styles'))
	.pipe(inject('assets/js/please-wait.min.js', 'inject-please-wait'))
	.pipe(inject('assets/js/please-wait-start.js', 'inject-please-wait-start'))
	.pipe(inject('assets/js/vendor.min.js', 'inject-vendor'))
	.pipe(inject('assets/js/scripts.min.js', 'inject-scripts'))
	.pipe(inject('assets/js/ng-app.min.js', 'inject-ng-app'))
	.pipe(inject('assets/js/please-wait-stop.js', 'inject-please-wait-stop'))
	.pipe(plug.concat('index.html'))
	.pipe(gulp.dest(dist));

	/* the inject function is used above to remove 'dist' from the path before inserting into index.html  */
	function inject(path, name) {
		var pathGlob = dist + path;
		var options = {
			ignorePath: dist.substring(1)
		};
		if (name) {
			options.name = name;
		}
		return plug.inject(gulp.src(pathGlob, {read: false}), options);
	}
});

/**
* Build the optimised app for production
* @return {Stream}
*/
gulp.task('build', ['inject-min', 'fonts', 'images', 'html', 'readmeToPDF'], function() {
	log('Building the optimized app');

	return gulp.src('')
	.pipe(plug.notify({
		onLast: true,
		message: 'Deployed code!'
	}));
});

/**
* Remove all files from the dist folder
* One way to run clean before all tasks is to run
* from the cmd line: gulp clean && gulp build
* @return {Stream}
*/
gulp.task('clean', function(cb) {
	log('Cleaning: ' + plug.util.colors.blue(paths.dist));

	var delPaths = [].concat(paths.dist, paths.report);
	del(delPaths, cb);
});

/**
* Serve the development environment
*
* This will watch the AngularJS HTML files, scripts, styles, 
* images, and fonts and reload the browser if any changes are noticed.
* 
* This is also using nodemon so any edits to the AngularJS JS files 
* will be detected and node and the browser will both reload.
*/
gulp.task('serve', ['browser-sync', 'inject'], function () {
	gulp.watch(paths.appHTML, reload);		/* Watches the apps HTML paths and reloads browser if changed */
	gulp.watch(paths.CSS, reload);			/* Watches the CSS paths and reloads browser if changed */
	gulp.watch(paths.JS, reload);			/* Watches the JS paths and reloads browser if changed */
	gulp.watch(paths.images, reload);		/* Watches the images paths and reloads browser if changed */
	gulp.watch(paths.fonts, reload);		/* Watches the fonts paths and reloads browser if changed */
});

/**
* Inject all the file paths into index.html for development
* @return {Stream}
*/
gulp.task('inject', function() {
	log('Injecting paths into index.html for development');

	/* Delete the existing index.html to create the new one with injected paths */
	del(paths.client + 'index.html');

	gulp.src(paths.client + 'index-template.html')
	.pipe(debug({title: 'inject:'}))
	.pipe(inject(paths.devVendorCSS, 'inject-vendor'))
	.pipe(inject(paths.CSS, 'inject-styles'))
	.pipe(inject(paths.devVendorJS, 'inject-vendor'))
	.pipe(inject(paths.JS, 'inject-scripts'))
	.pipe(inject(paths.appJS, 'inject-ng-app'))
	.pipe(inject(paths.pleaseWaitCSS, 'inject-please-wait'))
	.pipe(inject(paths.pleaseWaitJS, 'inject-please-wait'))
	.pipe(inject(paths.pleaseWaitStartJS, 'inject-please-wait-start'))
	.pipe(inject(paths.pleaseWaitStopJS, 'inject-please-wait-stop'))
	.pipe(plug.concat('index.html'))
	.pipe(gulp.dest(paths.client));

	function inject(path, name) {
		var options = {};
		if (name) {
			options.name = name;
		}
		return plug.inject(gulp.src(path, {read: false}), options);
	}
});

gulp.task('browser-sync', ['nodemon'], function() {
	browserSync({
		proxy: "localhost:3000",	/* Local app address - no auto-reload */
		port: 5000,					/* Port for local address (localhost:5000) - with auto-reload */
		notify: true				/* Message to notify user of reload */
	});
});

gulp.task('nodemon', function (cb) {
	var called = false;
	return plug.nodemon({
		script: paths.server + 'app.js',
		env: {
			'NODE_ENV': 'development',		/* Tells app.js to use the development files in the src folder */
			'PORT': 3000
		},
		ignore: [
		'gulpfile.js',
		'docs/',
		'apidocs/',
		'node_modules/'
		]
	})
	.on('start', function () {
		if (!called) {
			called = true;
			cb();
		}
	})
	.on('restart', function () {
		setTimeout(function () {
			reload({ stream: false });
		}, 1000);
	});
});

/**
* Serve the build environment from the dist folder
*
* This will watch the AngularJS JS files, vendor JS, vendor CSS, 
* scripts, styles, images, fonts, and AngularJS HTML and run the 
* appropriate tasks to bundle/minify/copy/etc. the modified files
* when changes are detected and reload the app/browser.
* 
* This is also using nodemon so any edits to the AngularJS JS files 
* will be detected and node and the browser will both reload.
*/
gulp.task('serve-build', ['browser-sync-build'], function () {
	log('Watching all files');

	gulp.watch(paths.appJS, ['ng-app']).on('change', logWatch);
	gulp.watch(paths.minVendorJS, ['vendor-js']).on('change', logWatch);
	gulp.watch(paths.minVendorCSS, ['vendor-css']).on('change', logWatch);
	gulp.watch(paths.JS, ['scripts-js']).on('change', logWatch);
	gulp.watch(paths.CSS, ['styles-css']).on('change', logWatch);
	gulp.watch(paths.images, ['images']).on('change', logWatch);
	gulp.watch(paths.fonts, ['fonts']).on('change', logWatch);
	gulp.watch(paths.appHTML, ['html']).on('change', reload);

	function logWatch(event) {
		log('*** File ' + event.path + ' was ' + event.type + ', running tasks...');
	}
});

gulp.task('browser-sync-build', ['nodemon-build'], function() {
	browserSync({
		proxy: "localhost:3030",	/* Local app address - no auto-reload */
		port: 5050,					/* Port for local address (localhost:5050) - with auto-reload */
		notify: true				/* Message to notify user of reload */
	});
});

gulp.task('nodemon-build', function (cb) {
	var called = false;
	return plug.nodemon({
		script: paths.server + 'app.js',
		env: {
			'NODE_ENV': 'build',		/* Tells app.js to use the build files in the dist folder */
			'PORT': 3030
		},
		ignore: [
		'gulpfile.js',
		'docs/',
		'apidocs/',
		'node_modules/'
		]
	})
	.on('start', function () {
		if (!called) {
			called = true;
			cb();
		}
	})
	.on('restart', function () {
		setTimeout(function () {
			reload({ stream: false });
		}, 1000);
	});
});

///////////////////////////

/**
* Formatter for bytediff to display the size changes after processing
* @param  {Object} data - byte data
* @return {String}	  Difference in bytes, formatted
*/
function bytediffFormatter(data) {
	var difference = (data.savings > 0) ? ' smaller.' : ' larger.';
	return data.fileName + ' went from ' +
	(data.startSize / 1000).toFixed(2) + ' kB to ' + (data.endSize / 1000).toFixed(2) + ' kB' +
	' and is ' + formatPercent(1 - data.percent, 2) + '%' + difference;
}

/**
* Format a number as a percentage
* @param  {Number} num	   Number to format as a percent
* @param  {Number} precision Precision of the decimal
* @return {String}		   Formatted percentage
*/
function formatPercent(num, precision) {
	return (num * 100).toFixed(precision);
}
