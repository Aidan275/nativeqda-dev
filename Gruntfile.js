

module.exports = function(grunt) {

	'use strict';

	var LIVERELOAD_PORT = 35729;

	grunt.initConfig({

		ngdocs: {
			options: {
				scripts: ['angular.js'],
				html5Mode: false,
				title: 'NativeQDA',
				startPage: '/docs',
				sourceLink: true,
				titleLink: '/#/docs',
				dest: 'docs/front-end-docs/'
			},
			docs: {
				src: ['src/**/*.js', 'docs/assets/index.js'],
				title: 'Documentation',
				api: true
			}
		},

		apidoc: {
			myapp: {
				src: 'src/app_api/controllers/',
				dest: 'docs/back-end-docs'
			}
		},

		connect: {
			server: {
				options: {
					livereload: LIVERELOAD_PORT,
					base: 'docs'
				}
			}
		},

		clean: [
		'docs/front-end-docs',
		'docs/back-end-docs',
		'apidocs'
		],

		watch: {
			options: {
				livereload: LIVERELOAD_PORT
			},
			files: 'src/**/*.js',
			tasks: ['clean', 'ngdocs', 'apidoc']
		}
	});

	grunt.loadTasks('docs/assets/grunt-ngdocs/tasks'); /* fix for source links */
	//grunt.loadNpmTasks('grunt-ngdocs');
	grunt.loadNpmTasks('grunt-apidoc'); 
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('docs', ['clean', 'ngdocs', 'apidoc', 'connect', 'watch']);
};
