define([], function() {
    'use strict';
    var ngApp = angular.module('app', ['ngRoute', 'ui.tms', 'ui.xxt', 'tmplshop.ui.xxt', 'tinymce.ui.xxt']);
    ngApp.config(['$controllerProvider', '$routeProvider', '$locationProvider', '$compileProvider', '$uibTooltipProvider', function($controllerProvider, $routeProvider, $locationProvider, $compileProvider, $uibTooltipProvider) {
        var RouteParam = function(name) {
            var baseURL = '/views/ytx/pl/fe/matter/mission/';
            this.templateUrl = baseURL + name + '.html?_=' + ((new Date()) * 1);
            this.controller = 'ctrl' + name[0].toUpperCase() + name.substr(1);
            this.resolve = {
                load: function($q) {
                    var defer = $q.defer();
                    require([baseURL + name + '.js'], function() {
                        defer.resolve();
                    });
                    return defer.promise;
                }
            };
        };
        ngApp.provider = {
            controller: $controllerProvider.register,
            directive: $compileProvider.directive
        };
        $routeProvider
            .when('/rest/pl/fe/matter/mission/main', new RouteParam('main'))
            .when('/rest/pl/fe/matter/mission/matter', new RouteParam('matter'))
            .when('/rest/pl/fe/matter/mission/user', new RouteParam('user'))
            .otherwise(new RouteParam('main'));

        $locationProvider.html5Mode(true);
        $uibTooltipProvider.setTriggers({
            'show': 'hide'
        });
    }]);
    ngApp.controller('ctrlFrame', ['$scope', '$location', 'http2', function($scope, $location, http2) {
        var ls = $location.search();

        $scope.id = ls.id;
        $scope.viewNames = {
            'main': '项目定义',
            'matter': '资料和活动',
            'user': '用户',
        };
        $scope.subView = '';
        $scope.$on('$locationChangeSuccess', function(event, currentRoute) {
            var subView = currentRoute.match(/([^\/]+?)\?/);
            $scope.subView = subView[1] === 'mission' ? 'main' : subView[1];
        });
        http2.get('/rest/pl/fe/matter/mission/get?id=' + $scope.id, function(rsp) {
            var mission = rsp.data;
            mission.type = 'mission';
            mission.extattrs = (mission.extattrs && mission.extattrs.length) ? JSON.parse(mission.extattrs) : {};
            $scope.mission = mission;
            if (location.href.indexOf('/matter?') === -1) {
                http2.get('/rest/pl/fe/matter/mission/matter/count?id=' + $scope.id, function(rsp) {
                    if (parseInt(rsp.data)) {
                        $location.path('/rest/pl/fe/matter/mission/matter').search({ id: ls.id });
                        $location.replace();
                    }
                });
            }
            http2.get('/rest/pl/fe/site/get?site=' + mission.siteid, function(rsp) {
                $scope.site = rsp.data;
            });
        });
    }]);
    /*bootstrap*/
    require(['domReady!'], function(document) {
        angular.bootstrap(document, ["app"]);
    });
    return ngApp;
});