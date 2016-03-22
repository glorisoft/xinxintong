var app = angular.module('app', ['ngRoute', 'ui.tms', 'matters.xxt']);
app.config(['$locationProvider', '$controllerProvider', '$routeProvider', function($lp, $cp, $rp) {
    var loadJs = function(url, callback) {
        var script;
        script = document.createElement('script');
        script.src = url;
        callback && (script.onload = function() {
            callback()
        });
        document.body.appendChild(script);
    };
    $lp.html5Mode(true);
    app.provider = {
        controller: $cp.register
    };
    $rp.when('/rest/pl/fe/site/sns/yx/setting', {
        templateUrl: '/views/default/pl/fe/site/sns/yx/setting.html?_=2',
        controller: 'ctrlSet',
        resolve: {
            load: function($q) {
                var defer = $q.defer();
                loadJs('/views/default/pl/fe/site/sns/yx/setting.js', function() {
                    defer.resolve();
                });
                return defer.promise;
            }
        }
    }).otherwise({
        templateUrl: '/views/default/pl/fe/site/sns/yx/setting.html?_=2',
        controller: 'ctrlSet',
        resolve: {
            load: function($q) {
                var defer = $q.defer();
                loadJs('/views/default/pl/fe/site/sns/yx/setting.js', function() {
                    defer.resolve();
                });
                return defer.promise;
            }
        }
    });
}]);
app.controller('ctrlYx', ['$scope', '$location', 'http2', function($scope, $location, http2) {
    $scope.subView = '';
    $scope.siteId = $location.search().site;
    http2.get('/rest/pl/fe/site/sns/yx/get?site=' + $scope.siteId, function(rsp) {
        $scope.yx = rsp.data;
    });
}]);