define(['require', 'page'], function(require, pageLib) {
	var ngApp = angular.module('app', ['ngRoute', 'ui.tms', 'tinymce.ui.xxt', 'matters.xxt', 'channel.fe.pl']);
	ngApp.config(['$controllerProvider', '$routeProvider', '$locationProvider', '$compileProvider', function($controllerProvider, $routeProvider, $locationProvider, $compileProvider) {
		ngApp.provider = {
			controller: $controllerProvider.register,
			directive: $compileProvider.directive
		};
		$routeProvider.when('/rest/pl/fe/matter/enroll/page', {
			templateUrl: '/views/default/pl/fe/matter/enroll/page.html?_=4',
			controller: 'ctrlPage',
			resolve: {
				load: function($q) {
					var defer = $q.defer();
					require(['/views/default/pl/fe/matter/enroll/page.js'], function() {
						defer.resolve();
					});
					return defer.promise;
				}
			}
		}).when('/rest/pl/fe/matter/enroll/event', {
			templateUrl: '/views/default/pl/fe/matter/enroll/event.html?_=2',
			controller: 'ctrlEntry',
			resolve: {
				load: function($q) {
					var defer = $q.defer();
					(function() {
						$.getScript('/views/default/pl/fe/matter/enroll/event.js', function() {
							defer.resolve();
						});
					})();
					return defer.promise;
				}
			}
		}).when('/rest/pl/fe/matter/enroll/record', {
			templateUrl: '/views/default/pl/fe/matter/enroll/record.html?_=3',
			controller: 'ctrlRecord',
			resolve: {
				load: function($q) {
					var defer = $q.defer();
					require(['/views/default/pl/fe/matter/enroll/record.js'], function() {
						defer.resolve();
					});
					return defer.promise;
				}
			}
		}).when('/rest/pl/fe/matter/enroll/stat', {
			templateUrl: '/views/default/pl/fe/matter/enroll/stat.html?_=1',
			controller: 'ctrlStat',
			resolve: {
				load: function($q) {
					var defer = $q.defer();
					(function() {
						$.getScript('/views/default/pl/fe/matter/enroll/stat.js', function() {
							defer.resolve();
						});
					})();
					return defer.promise;
				}
			}
		}).when('/rest/pl/fe/matter/enroll/coin', {
			templateUrl: '/views/default/pl/fe/matter/enroll/coin.html?_=1',
			controller: 'ctrlCoin',
			resolve: {
				load: function($q) {
					var defer = $q.defer();
					(function() {
						$.getScript('/views/default/pl/fe/matter/enroll/coin.js', function() {
							defer.resolve();
						});
					})();
					return defer.promise;
				}
			}
		}).when('/rest/pl/fe/matter/enroll/publish', {
			templateUrl: '/views/default/pl/fe/matter/enroll/publish.html?_=2',
			controller: 'ctrlRunning',
			resolve: {
				load: function($q) {
					var defer = $q.defer();
					require(['/views/default/pl/fe/matter/enroll/publish.js'], function() {
						defer.resolve();
					});
					return defer.promise;
				}
			}
		}).when('/rest/pl/fe/matter/enroll/config', {
			templateUrl: '/views/default/pl/fe/matter/enroll/config.html?_=2',
			controller: 'ctrlConfig',
			resolve: {
				load: function($q) {
					var defer = $q.defer();
					(function() {
						$.getScript('/views/default/pl/fe/matter/enroll/config.js', function() {
							defer.resolve();
						});
					})();
					return defer.promise;
				}
			}
		}).otherwise({
			templateUrl: '/views/default/pl/fe/matter/enroll/app.html?_=8',
			controller: 'ctrlApp',
			resolve: {
				load: function($q) {
					var defer = $q.defer();
					require(['/views/default/pl/fe/matter/enroll/app.js'], function() {
						defer.resolve();
					});
					return defer.promise;
				}
			}
		});
		$locationProvider.html5Mode(true);
	}]);
	ngApp.controller('ctrlFrame', ['$scope', '$location', '$uibModal', '$q', 'http2', function($scope, $location, $uibModal, $q, http2) {
		var ls = $location.search(),
			modifiedData = {};
		$scope.id = ls.id;
		$scope.siteId = ls.site;
		$scope.modified = false;
		window.onbeforeunload = function(e) {
			var message;
			if ($scope.modified) {
				message = '修改还没有保存，是否要离开当前页面？',
					e = e || window.event;
				if (e) {
					e.returnValue = message;
				}
				return message;
			}
		};
		$scope.back = function() {
			history.back();
		};
		$scope.submit = function() {
			var defer = $q.defer();
			http2.post('/rest/pl/fe/matter/enroll/update?site=' + $scope.siteId + '&app=' + $scope.id, modifiedData, function(rsp) {
				$scope.modified = false;
				modifiedData = {};
				defer.resolve(rsp.data);
			});
			return defer.promise;
		};
		$scope.update = function(name) {
			if (['entry_rule'].indexOf(name) !== -1) {
				modifiedData[name] = encodeURIComponent($scope.app[name]);
			} else if (name === 'tags') {
				modifiedData.tags = $scope.app.tags.join(',');
			} else {
				modifiedData[name] = $scope.app[name];
			}
			$scope.modified = true;

			return $scope.submit();
		};
		$scope.createPage = function() {
			var deferred = $q.defer();
			$uibModal.open({
				templateUrl: '/views/default/pl/fe/matter/enroll/component/createPage.html?_=3',
				backdrop: 'static',
				controller: ['$scope', '$uibModalInstance', function($scope, $mi) {
					$scope.options = {};
					$scope.ok = function() {
						$mi.close($scope.options);
					};
					$scope.cancel = function() {
						$mi.dismiss();
					};
				}],
			}).result.then(function(options) {
				http2.post('/rest/pl/fe/matter/enroll/page/add?site=' + $scope.siteId + '&app=' + $scope.id, options, function(rsp) {
					var page = rsp.data;
					angular.extend(page, pageLib);
					page.arrange();
					$scope.app.pages.push(page);
					deferred.resolve(page);
				});
			});

			return deferred.promise;
		};
		$scope.getApp = function() {
			http2.get('/rest/pl/fe/matter/enroll/get?site=' + $scope.siteId + '&id=' + $scope.id, function(rsp) {
				var app = rsp.data,
					mapOfAppSchemas = {};
				app.tags = (!app.tags || app.tags.length === 0) ? [] : app.tags.split(',');
				app.type = 'enroll';
				app.data_schemas = app.data_schemas && app.data_schemas.length ? JSON.parse(app.data_schemas) : [];
				angular.forEach(app.data_schemas, function(schema) {
					mapOfAppSchemas[schema.id] = schema;
				});
				app.entry_rule.scope === undefined && (app.entry_rule.scope = 'none');
				angular.forEach(app.pages, function(page) {
					angular.extend(page, pageLib);
					page.arrange(mapOfAppSchemas);
				});
				//$scope.persisted = angular.copy(app);
				$scope.app = app;
				$scope.url = 'http://' + location.host + '/rest/site/fe/matter/enroll?site=' + $scope.siteId + '&app=' + $scope.id;
			});
		};
		http2.get('/rest/pl/fe/site/snsList?site=' + $scope.siteId, function(rsp) {
			$scope.sns = rsp.data;
		});
		http2.get('/rest/pl/fe/site/member/schema/list?valid=Y&site=' + $scope.siteId, function(rsp) {
			$scope.memberSchemas = rsp.data;
		});
		$scope.getApp();
	}]);
	/***/
	require(['domReady!'], function(document) {
		angular.bootstrap(document, ["app"]);
	});
	/***/
	return ngApp;
});