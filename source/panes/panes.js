
(function(angular) {
'use strict';

angular.module("common.panes", [])

.directive("testPanes", ['$rootScope', '$timeout', 'mapService', function($rootScope, $timeout, mapService) {
	return {
		templateUrl : "panes/panes.html",
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

.directive("testTabs", [function() {
	return {
		templateUrl : "panes/tabs.html",
		require : "^testPanes"
	};
}])

.controller("PaneCtrl", PaneCtrl)
.factory("paneService", PaneService);

PaneCtrl.$inject = ["paneService"];
function PaneCtrl(paneService) {
	paneService.data().then(data => {
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
