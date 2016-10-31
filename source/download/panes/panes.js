
(function(angular) {
'use strict';

angular.module("download.panes", [])

.directive("downloadPanes", ['$rootScope', '$timeout', 'mapService', function($rootScope, $timeout, mapService) {
	return {
		templateUrl : "test/download/panes/panes.html",
		transclude : true,
      replace: true,
		scope : {
			defaultItem : "@",
			data : "="
		},
		controller : ['$scope', function($scope) {
			var changeSize = false;

			$scope.view = $scope.defaultItem;

			$scope.setView = function(what) {
				var oldView = $scope.view;

				if($scope.view == what) {
					if(what) {
						changeSize = true;
					}
					$scope.view = "";
				} else {
					if(!what) {
						changeSize = true;
					}
					$scope.view = what;
				}

				$rootScope.$broadcast("view.changed", $scope.view, oldView);

				if(changeSize) {
					mapService.getMap().then(function(map) {
						map._onResize();
					});
				}
			};
			$timeout(function() {
				$rootScope.$broadcast("view.changed", $scope.view, null);
			},50);
		}]
	};
}])

.directive("downloadTabs", [function() {
	return {
		templateUrl : "test/download/panes/tabs.html",
		require : "^downloadPanes"
	};
}])

.controller("downloadPaneCtrl", PaneCtrl)
.factory("downloadPaneService", PaneService);

PaneCtrl.$inject = ["downloadPaneService"];
function PaneCtrl(downloadPaneService) {
	downloadPaneService.data().then(data => {
		this.data = data;
	});
}

PaneService.$inject = [];
function PaneService() {
	var data = {
	};

	return {
		add : function(item) {
		},

		remove : function(item) {
		}
	};
}

})(angular);
