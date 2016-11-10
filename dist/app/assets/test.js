/**
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

'use strict';

(function (angular) {

	'use strict';

	angular.module("DownloadApp", ['explorer.config', 'explorer.confirm', 'explorer.drag', 'explorer.enter', 'explorer.flasher', 'explorer.googleanalytics', 'explorer.header', 'explorer.httpdata', 'explorer.info', 'explorer.legend', 'explorer.message', 'explorer.modal', 'explorer.persist', 'explorer.projects', 'explorer.tabs', 'explorer.version', 'exp.ui.templates', 'explorer.map.templates', 'ui.bootstrap', 'ngAutocomplete', 'ngRoute', 'ngSanitize', 'page.footer',

	//'geo.baselayer.control',
	'geo.draw', 'geo.geosearch', 'geo.map', 'geo.maphelper', 'geo.measure', 'test.templates', 'download.panes', 'ed.download'])

	// Set up all the service providers here.
	.config(['configServiceProvider', 'projectsServiceProvider', 'persistServiceProvider', 'versionServiceProvider', function (configServiceProvider, projectsServiceProvider, persistServiceProvider, versionServiceProvider) {
		configServiceProvider.location("app/resources/config/download.json");
		versionServiceProvider.url("app/assets/package.json");
		projectsServiceProvider.setProject("download");
		persistServiceProvider.handler("local");
	}]).factory("userService", [function () {
		return {
			login: noop,
			hasAcceptedTerms: noop,
			setAcceptedTerms: noop,
			getUsername: function getUsername() {
				return "anon";
			}
		};
		function noop() {
			return true;
		}
	}]).controller("rootCtrl", RootCtrl);

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
"use strict";

(function (angular) {
  'use strict';

  angular.module("download.download", []);
})(angular);
"use strict";

(function (angular) {
	'use strict';

	angular.module("download.panes", []).directive("downloadPanes", ['$rootScope', '$timeout', 'mapService', function ($rootScope, $timeout, mapService) {
		return {
			templateUrl: "test/download/panes/panes.html",
			transclude: true,
			replace: true,
			scope: {
				defaultItem: "@",
				data: "="
			},
			controller: ['$scope', function ($scope) {
				var changeSize = false;

				$scope.view = $scope.defaultItem;

				$scope.setView = function (what) {
					var oldView = $scope.view;

					if ($scope.view == what) {
						if (what) {
							changeSize = true;
						}
						$scope.view = "";
					} else {
						if (!what) {
							changeSize = true;
						}
						$scope.view = what;
					}

					$rootScope.$broadcast("view.changed", $scope.view, oldView);

					if (changeSize) {
						mapService.getMap().then(function (map) {
							map._onResize();
						});
					}
				};
				$timeout(function () {
					$rootScope.$broadcast("view.changed", $scope.view, null);
				}, 50);
			}]
		};
	}]).directive("downloadTabs", [function () {
		return {
			templateUrl: "test/download/panes/tabs.html",
			require: "^downloadPanes"
		};
	}]).controller("downloadPaneCtrl", PaneCtrl).factory("downloadPaneService", PaneService);

	PaneCtrl.$inject = ["downloadPaneService"];
	function PaneCtrl(downloadPaneService) {
		var _this = this;

		downloadPaneService.data().then(function (data) {
			_this.data = data;
		});
	}

	PaneService.$inject = [];
	function PaneService() {
		var data = {};

		return {
			add: function add(item) {},

			remove: function remove(item) {}
		};
	}
})(angular);
angular.module("test.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("test/download/panes/panes.html","<div class=\"container contentContainer\">\r\n	<div class=\"row icsmPanesRow\" >\r\n		<div class=\"icsmPanesCol\" ng-class=\"{\'col-md-12\':!view, \'col-md-7\':view}\" style=\"padding-right:0\">\r\n			<div class=\"expToolbar row noPrint\" icsm-toolbar-row map=\"root.map\" title=\"\'fred\'\"></div>\r\n			<div class=\"panesMapContainer\" geo-map configuration=\"data.map\">\r\n			    <geo-extent></geo-extent>\r\n			</div>\r\n    		<div geo-draw data=\"data.map.drawOptions\" line-event=\"elevation.plot.data\" rectangle-event=\"bounds.drawn\"></div>\r\n    		<div class=\"common-legend\" common-legend map=\"data.map\"></div>\r\n    		<div download-tabs class=\"icsmTabs\"  ng-class=\"{\'icsmTabsClosed\':!view, \'icsmTabsOpen\':view}\"></div>\r\n		</div>\r\n		<div class=\"icsmPanesColRight\" ng-class=\"{\'hidden\':!view, \'col-md-5\':view}\" style=\"padding-left:0; padding-right:0\">\r\n			<div class=\"panesTabContentItem\" ng-show=\"view == \'download\'\" ed-panel></div>\r\n		</div>\r\n	</div>\r\n</div>");
$templateCache.put("test/download/panes/tabs.html","<!-- tabs go here -->\r\n<div id=\"panesTabsContainer\" class=\"paneRotateTabs\" style=\"opacity:0.9\" ng-style=\"{\'right\' : contentLeft +\'px\'}\">\r\n\r\n	<div class=\"paneTabItem\" ng-class=\"{\'bold\': view == \'download\'}\" ng-click=\"setView(\'download\')\">\r\n		<button class=\"undecorated\">Download</button>\r\n	</div>\r\n</div>\r\n");}]);