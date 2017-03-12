ngApp.provider.controller('ctrlHome', ['$scope', '$http', function($scope, $http) {
    function listSites() {
        $http.get('/rest/home/listSite').success(function(rsp) {
            $scope.sites = rsp.data.sites;
        });
    };

    function listTemplates() {
        $http.get('/rest/home/listTemplate').success(function(rsp) {
            $scope.templates = rsp.data;
        });
    };

    function listApps() {
        $http.get('/rest/home/listApp').success(function(rsp) {
            $scope.apps = rsp.data.matters;
        });
    };

    function listArticles() {
        $http.get('/rest/home/listArticle').success(function(rsp) {
            $scope.articles = rsp.data.matters;
        });
    };
    $scope.openTrend = function(trend) {
        if (/article|custom|news|channel|link/.test(trend.matter_type)) {
            location.href = '/rest/site/fe/matter?site=' + trend.siteid + '&id=' + id + '&type=' + trend.matter_type;
        } else {
            location.href = '/rest/site/fe/matter/' + trend.matter_type + '?site=' + trend.siteid + '&app=' + id;
        }
    };
    $scope.openMatter = function(matter) {
        location.href = matter.url;
    };
    listSites();
    listTemplates();
    listApps();
    listArticles();
}]);
ngApp.provider.controller('ctrlCarousel', function($scope) {
    $scope.myInterval = 5000;
    $scope.noWrapSlides = false;
    $scope.active = 0;

    $scope.$watch('platform', function(platform) {
        if (platform === undefined) return;
        if (platform.home_carousel.length) {
            $scope.slides = platform.home_carousel;
        }
    });
});
