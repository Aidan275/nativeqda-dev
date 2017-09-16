

module.exports = function(grunt) {

	'use strict';

	var LIVERELOAD_PORT = 35729;

	grunt.initConfig({

		ngdocs: {
			options: {
				scripts: ['angular.js', '../src.js'],
				html5Mode: false
			},
			all: 'src/**/*.js'
		},

		connect: {
			server: {
				options: {
					livereload: LIVERELOAD_PORT,
					base: 'docs'
				}
			}
		},

		clean: ['docs'],

		watch: {
			options: {
				livereload: LIVERELOAD_PORT
			},
			files: 'src/**/*.js',
			tasks: ['clean', 'ngdocs']
		}
	});

	grunt.loadNpmTasks('grunt-ngdocs');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['clean', 'ngdocs', 'connect', 'watch']);
};
