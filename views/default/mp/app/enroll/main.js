xxtApp.controller('enrollCtrl', ['$scope', '$modal', 'http2', function($scope, $modal, http2) {
    $scope.page = {
        at: 1,
        size: 30
    }
    $scope.doSearch = function() {
        var url = '/rest/mp/app/enroll/list?page=' + $scope.page.at + '&size=' + $scope.page.size;
        $scope.fromParent && $scope.fromParent === 'Y' && (url += '&src=p');
        http2.get(url, function(rsp) {
            $scope.apps = rsp.data[0];
            $scope.page.total = rsp.data[1];
        });
    };
    $scope.create = function() {
        $modal.open({
            templateUrl: 'templatePicker.html',
            size: 'lg',
            windowClass: 'auto-height',
            controller: ['$scope', '$modalInstance', function($scope2, $mi) {
                $scope2.data = {};
                $scope2.selected = {};
                $scope2.cancel = function() {
                    $mi.dismiss();
                };
                $scope2.blank = function() {
                    $mi.close();
                };
                $scope2.ok = function() {
                    $mi.close($scope2.selected);
                };
                $scope2.chooseTemplate = function() {
                    var url;
                    url = '/rest/mp/app/enroll/template/pageList';
                    url += '?scenario=' + $scope2.selected.scenario.name;
                    url += '&template=' + $scope2.selected.template.name;
                    http2.get(url, function(rsp) {
                        var first;
                        $scope2.pages = rsp.data;
                        $scope2.data.selectedPage = rsp.data[0];
                        $scope2.choosePage();
                    });
                };
                $scope2.choosePage = function() {
                    var elSimulator, url, name;
                    name = $scope2.data.selectedPage.name;
                    elSimulator = document.querySelector('#simulator');
                    url = 'http://' + location.host;
                    url += '/rest/app/enroll/template';
                    url += '?scenario=' + $scope2.selected.scenario.name;
                    url += '&template=' + $scope2.selected.template.name;
                    url += '&page=' + name;
                    url += '&_=' + (new Date()).getTime();
                    elSimulator.src = url;
                };
                http2.get('/rest/mp/app/enroll/template/list', function(rsp) {
                    $scope2.templates = rsp.data;
                });
            }]
        }).result.then(function(selected) {
            console.log('sss', selected);
            var url = '/rest/mp/app/enroll/create';
            if (selected) {
                url += '?scenario=' + selected.scenario.name;
                url += '&template=' + selected.template.name;
            }
            http2.get(url, function(rsp) {
                location.href = '/rest/mp/app/enroll/detail?aid=' + rsp.data.id;
            });
        })
    };
    $scope.open = function(aid) {
        location.href = '/rest/mp/app/enroll/detail?aid=' + aid;
    };
    $scope.remove = function(act, event) {
        event.preventDefault();
        event.stopPropagation();
        http2.get('/rest/mp/app/enroll/remove?aid=' + act.id, function(rsp) {
            var i = $scope.apps.indexOf(act);
            $scope.apps.splice(i, 1);
        });
    };
    $scope.copy = function(copied, event) {
        event.preventDefault();
        event.stopPropagation();
        var url = '/rest/mp/app/enroll/copy?';
        if (copied.id)
            url += 'aid=' + copied.id;
        else if (copied.shopid)
            url += 'shopid=' + copied.shopid;
        http2.get(url, function(rsp) {
            location.href = '/rest/mp/app/enroll/detail?aid=' + rsp.data.id;
        });
    };
    $scope.doSearch();
}]);