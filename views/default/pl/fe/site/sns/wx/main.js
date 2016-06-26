define(['require'], function(require) {
    'use strict';
    var ngApp = angular.module('app', ['ngRoute', 'ui.tms', 'ui.xxt']);
    ngApp.config(['$locationProvider', '$controllerProvider', '$routeProvider', '$provide', function($lp, $cp, $rp, $provide) {
        var RouteParam = function(name) {
            var baseURL = '/views/default/pl/fe/site/sns/wx/';
            this.templateUrl = baseURL + name + '.html?_=' + (new Date() * 1);
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
        $lp.html5Mode(true);
        ngApp.provider = {
            controller: $cp.register,
            service: $provide.service,
        };
        $rp
            .when('/rest/pl/fe/site/sns/wx/setting', new RouteParam('setting'))
            .when('/rest/pl/fe/site/sns/wx/text', new RouteParam('text'))
            .when('/rest/pl/fe/site/sns/wx/menu', new RouteParam('menu'))
            .when('/rest/pl/fe/site/sns/wx/qrcode', new RouteParam('qrcode'))
            .when('/rest/pl/fe/site/sns/wx/other', new RouteParam('other'))
            .when('/rest/pl/fe/site/sns/wx/relay', new RouteParam('relay'))
            .when('/rest/pl/fe/site/sns/wx/page', new RouteParam('page'))
            .when('/rest/pl/fe/site/sns/wx/tmplmsg', new RouteParam('tmplmsg'))
            .otherwise(new RouteParam('setting'));
    }]);
    ngApp.controller('ctrlWx', ['$scope', '$location', 'http2', function($scope, $location, http2) {
        $scope.subView = '';
        $scope.siteId = $location.search().site;
        $scope.$on('$locationChangeSuccess', function(event, currentRoute) {
            var subView = currentRoute.match(/([^\/]+?)\?/);
            $scope.subView = subView[1] === 'wx' ? 'setting' : subView[1];
        });
        http2.get('/rest/pl/fe/site/sns/wx/get?site=' + $scope.siteId, function(rsp) {
            $scope.wx = rsp.data;
        });
    }]);
    /***/
    require(['domReady!'], function(document) {
        angular.bootstrap(document, ["app"]);
    });
    /***/
    return ngApp;
});