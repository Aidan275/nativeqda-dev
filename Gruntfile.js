

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
				titleLink: '/#/docs'
			},
			docs: {
				src: ['src/**/*.js'],
				title: 'Documentation',
				api: true
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
		'docs/css',
		'docs/font',
		'docs/js',
		'docs/partials',
		'docs/index.html'
		],

		watch: {
			options: {
				livereload: LIVERELOAD_PORT
			},
			files: 'src/**/*.js',
			tasks: ['clean', 'ngdocs']
		}
	});

	grunt.loadTasks('docs/grunt-ngdocs/tasks');
	//grunt.loadNpmTasks('grunt-ngdocs');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['clean', 'ngdocs', 'connect', 'watch']);
};
