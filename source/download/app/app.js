(function (angular) {

	'use strict';

	angular.module("DownloadApp", [

      'explorer.config',
      'explorer.confirm',
		'explorer.drag',
		'explorer.enter',
      'explorer.flasher',
      'explorer.googleanalytics',
		'explorer.httpdata',
		'explorer.info',
      'explorer.legend',
      'explorer.message',
		'explorer.modal',
		'explorer.persist',
		'explorer.projects',
		'explorer.tabs',
		'explorer.version',
		'exp.ui.templates',
		'explorer.map.templates',

		'ui.bootstrap',
		'ui.bootstrap-slider',
      'ngAutocomplete',
		'ngRoute',
		'ngSanitize',
		'page.footer',

		//'geo.baselayer.control',
		'geo.draw',
		'geo.geosearch',
		'geo.map',
		'geo.maphelper',
		'geo.measure'
	])

		// Set up all the service providers here.
		.config(['configServiceProvider', 'projectsServiceProvider', 'persistServiceProvider', 'versionServiceProvider',
         function (configServiceProvider, projectsServiceProvider, persistServiceProvider, versionServiceProvider) {
				configServiceProvider.location("app/resources/config/download.json");
				versionServiceProvider.url("app/assets/package.json");
				projectsServiceProvider.setProject("download");
				persistServiceProvider.handler("local");
			}])

		.factory("userService", [function () {
			return {
				login: noop,
				hasAcceptedTerms: noop,
				setAcceptedTerms: noop,
				getUsername: function () {
					return "anon";
				}
			};
			function noop() { return true; }
		}])

		.controller("RootCtrl", RootCtrl);

	RootCtrl.$invoke = ['$http', 'configService', 'mapService'];
	function RootCtrl($http, configService, mapService) {
		var self = this;
		mapService.getMap().then(function (map) {
			self.map = map;
		});
		configService.getConfig().then(function (data) {
			self.data = data;
			// If its got WebGL its got everything we need.
			try {
				var canvas = document.createElement('canvas');
				data.modern = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
			} catch (e) {
				data.modern = false;
			}
		});
	}


})(angular);