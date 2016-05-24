ngApp = angular.module('app', ['ngRoute', 'ui.tms', 'tinymce.ui.xxt', 'matters.xxt', 'channel.fe.pl']);
ngApp.config(['$controllerProvider', '$routeProvider', '$locationProvider', '$compileProvider', function($controllerProvider, $routeProvider, $locationProvider, $compileProvider) {
	ngApp.provider = {
		controller: $controllerProvider.register,
		directive: $compileProvider.directive
	};
	$routeProvider.when('/rest/pl/fe/matter/enroll/schema', {
		templateUrl: '/views/ytx/pl/fe/matter/enroll/schema.html?_=3',
		controller: 'ctrlSchema',
		resolve: {
			load: function($q) {
				var defer = $q.defer();
				(function() {
					$.getScript('/views/ytx/pl/fe/matter/enroll/schema.js', function() {
						defer.resolve();
					});
				})();
				return defer.promise;
			}
		}
	}).when('/rest/pl/fe/matter/enroll/page', {
		templateUrl: '/views/ytx/pl/fe/matter/enroll/page.html?_=4',
		controller: 'ctrlPage',
		resolve: {
			load: function($q) {
				var defer = $q.defer();
				(function() {
					$.getScript('/views/ytx/pl/fe/matter/enroll/page.js', function() {
						defer.resolve();
					});
				})();
				return defer.promise;
			}
		}
	}).when('/rest/pl/fe/matter/enroll/event', {
		templateUrl: '/views/ytx/pl/fe/matter/enroll/event.html?_=2',
		controller: 'ctrlEntry',
		resolve: {
			load: function($q) {
				var defer = $q.defer();
				(function() {
					$.getScript('/views/ytx/pl/fe/matter/enroll/event.js', function() {
						defer.resolve();
					});
				})();
				return defer.promise;
			}
		}
	}).when('/rest/pl/fe/matter/enroll/record', {
		templateUrl: '/views/ytx/pl/fe/matter/enroll/record.html?_=3',
		controller: 'ctrlRecord',
		resolve: {
			load: function($q) {
				var defer = $q.defer();
				(function() {
					$.getScript('/views/ytx/pl/fe/matter/enroll/record.js', function() {
						defer.resolve();
					});
				})();
				return defer.promise;
			}
		}
	}).when('/rest/pl/fe/matter/enroll/stat', {
		templateUrl: '/views/ytx/pl/fe/matter/enroll/stat.html?_=1',
		controller: 'ctrlStat',
		resolve: {
			load: function($q) {
				var defer = $q.defer();
				(function() {
					$.getScript('/views/ytx/pl/fe/matter/enroll/stat.js', function() {
						defer.resolve();
					});
				})();
				return defer.promise;
			}
		}
	}).when('/rest/pl/fe/matter/enroll/coin', {
		templateUrl: '/views/ytx/pl/fe/matter/enroll/coin.html?_=1',
		controller: 'ctrlCoin',
		resolve: {
			load: function($q) {
				var defer = $q.defer();
				(function() {
					$.getScript('/views/ytx/pl/fe/matter/enroll/coin.js', function() {
						defer.resolve();
					});
				})();
				return defer.promise;
			}
		}
	}).when('/rest/pl/fe/matter/enroll/publish', {
		templateUrl: '/views/ytx/pl/fe/matter/enroll/publish.html?_=2',
		controller: 'ctrlRunning',
		resolve: {
			load: function($q) {
				var defer = $q.defer();
				(function() {
					$.getScript('/views/ytx/pl/fe/matter/enroll/publish.js', function() {
						defer.resolve();
					});
				})();
				return defer.promise;
			}
		}
	}).when('/rest/pl/fe/matter/enroll/config', {
		templateUrl: '/views/ytx/pl/fe/matter/enroll/config.html?_=2',
		controller: 'ctrlConfig',
		resolve: {
			load: function($q) {
				var defer = $q.defer();
				(function() {
					$.getScript('/views/ytx/pl/fe/matter/enroll/config.js', function() {
						defer.resolve();
					});
				})();
				return defer.promise;
			}
		}
	}).otherwise({
		templateUrl: '/views/ytx/pl/fe/matter/enroll/app.html?_=2',
		controller: 'ctrlApp',
		resolve: {
			load: function($q) {
				var defer = $q.defer();
				(function() {
					$.getScript('/views/ytx/pl/fe/matter/enroll/app.js', function() {
						defer.resolve();
					});
				})();
				return defer.promise;
			}
		}
	});
	$locationProvider.html5Mode(true);
}]);
ngApp.controller('ctrlFrame', ['$scope', '$location', '$q', 'http2', function($scope, $location, $q, http2) {
	var ls = $location.search(),
		modifiedData = {},
		PageBase = {
			arrange: function() {
				var dataSchemas = this.data_schemas,
					actSchemas = this.act_schemas,
					userSchemas = this.user_schemas;
				this.data_schemas = dataSchemas && dataSchemas.length ? JSON.parse(dataSchemas) : [];
				this.act_schemas = actSchemas && actSchemas.length ? JSON.parse(actSchemas) : [];
				this.user_schemas = userSchemas && userSchemas.length ? JSON.parse(userSchemas) : [];
			},
			containInput: function(schema) {
				var i, l;
				if (this.type === 'I') {
					for (i = 0, l = this.data_schemas.length; i < l; i++) {
						if (this.data_schemas[i].id === schema.id) {
							return this.data_schemas[i];
						}
					}
				} else if (this.type === 'V') {
					if (this.data_schemas.record) {
						for (i = 0, l = this.data_schemas.record.length; i < l; i++) {
							if (this.data_schemas.record[i].schema.id === schema.id) {
								return this.data_schemas.record[i].schema;
							}
						}
					}
					if (this.data_schemas.list) {
						var list, j, k;
						for (i = 0, l = this.data_schemas.list.length; i < l; i++) {
							list = this.data_schemas.list[i];
							for (j = 0, k = list.schemas.length; j < k; j++) {
								if (list.schemas[j].id === schema.id) {
									return list.schemas[j];
								}
							}
						}
					}
				}
				return false;
			},
			removeInput: function(schema) {
				var i, l;
				if (this.type === 'I') {
					for (i = 0, l = this.data_schemas.length; i < l; i++) {
						if (this.data_schemas[i].id === schema.id) {
							return this.data_schemas.splice(i, 1);
						}
					}
				}
				return false;
			},
			containAct: function(schema) {
				var i, l;
				for (i = 0, l = this.act_schemas.length; i < l; i++) {
					if (this.act_schemas[i].id === schema.id) {
						return this.act_schemas[i];
					}
				}
				return false;
			},
			containStatic: function(schema) {
				if (this.type === 'V') {
					for (i = 0, l = this.data_schemas.length; i < l; i++) {
						if (this.data_schemas[i].id === schema.id) {
							return this.data_schemas[i];
						}
					}
				}
				return false;
			},
			removeAct: function(schema) {
				var i, l;
				for (i = 0, l = this.act_schemas.length; i < l; i++) {
					if (this.act_schemas[i].id === schema.id) {
						return this.act_schemas.splice(i, 1);
					}
				}
				return false;
			},
			removeStatic: function(config) {
				if (this.type === 'V') {
					for (var i = 0, l = this.data_schemas.length; i < l; i++) {
						if (this.data_schemas[i].id === config.id) {
							if (config.schema) {
								for (var j = 0, k = this.data_schemas[i].schemas.length; j < k; j++) {
									if (this.data_schemas[i].schemas[j].id === config.schema.id) {
										return this.data_schemas[i].schemas.splice(j, 1);
									}
								}
							} else {
								return this.data_schemas.splice(i, 1);
							}
						}
					}
				}
				return false;
			},
		};
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
		$scope.submit();
	};
	$scope.getApp = function() {
		http2.get('/rest/pl/fe/matter/enroll/get?site=' + $scope.siteId + '&id=' + $scope.id, function(rsp) {
			var app;
			app = rsp.data;
			app.tags = (!app.tags || app.tags.length === 0) ? [] : app.tags.split(',');
			app.type = 'enroll';
			app.data_schemas = app.data_schemas && app.data_schemas.length ? JSON.parse(app.data_schemas) : [];
			app.entry_rule.scope === undefined && (app.entry_rule.scope = 'none');
			angular.forEach(app.pages, function(page) {
				angular.extend(page, PageBase);
				page.arrange();
			});
			$scope.persisted = angular.copy(app);
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