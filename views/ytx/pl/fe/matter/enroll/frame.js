define(['require', 'enrollService'], function(require) {
    'use strict';
    var ngApp = angular.module('app', ['ngRoute', 'frapontillo.bootstrap-switch', 'ui.tms', 'tmplshop.ui.xxt', 'service.matter', 'service.enroll', 'tinymce.enroll', 'ui.xxt', 'channel.fe.pl']);
    ngApp.constant('cstApp', {
        notifyMatter: [{
            value: 'tmplmsg',
            title: '模板消息',
            url: '/rest/pl/fe/matter'
        }, {
            value: 'article',
            title: '项目资料',
            url: '/rest/pl/fe/matter'
        }, {
            value: 'enroll',
            title: '登记活动',
            url: '/rest/pl/fe/matter'
        }],
        innerlink: [{
            value: 'article',
            title: '项目资料',
            url: '/rest/pl/fe/matter'
        }],
        alertMsg: {
            'schema.duplicated': '不允许重复添加题目',
            'require.mission.phase': '请先指定项目的课程期数'
        }
    });
    ngApp.config(['$controllerProvider', '$routeProvider', '$locationProvider', '$compileProvider', '$uibTooltipProvider', 'srvSiteProvider', 'srvQuickEntryProvider', 'srvAppProvider', 'srvRoundProvider', 'srvPageProvider', 'srvRecordProvider', function($controllerProvider, $routeProvider, $locationProvider, $compileProvider, $uibTooltipProvider, srvSiteProvider, srvQuickEntryProvider, srvAppProvider, srvRoundProvider, srvPageProvider, srvRecordProvider) {
        var RouteParam = function(name, htmlBase, jsBase) {
            var baseURL = '/views/default/pl/fe/matter/enroll/';
            this.templateUrl = (htmlBase || baseURL) + name + '.html?_=' + (new Date() * 1);
            this.controller = 'ctrl' + name[0].toUpperCase() + name.substr(1);
            this.resolve = {
                load: function($q) {
                    var defer = $q.defer();
                    require([(jsBase || baseURL) + name + '.js'], function() {
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
            .when('/rest/pl/fe/matter/enroll/main', new RouteParam('main', '/views/ytx/pl/fe/matter/enroll/'))
            .when('/rest/pl/fe/matter/enroll/publish', new RouteParam('publish', '/views/ytx/pl/fe/matter/enroll/'))
            .when('/rest/pl/fe/matter/enroll/schema', new RouteParam('schema', '/views/ytx/pl/fe/matter/enroll/'))
            .when('/rest/pl/fe/matter/enroll/page', new RouteParam('page', '/views/ytx/pl/fe/matter/enroll/'))
            .when('/rest/pl/fe/matter/enroll/record', new RouteParam('record'))
            .when('/rest/pl/fe/matter/enroll/recycle', new RouteParam('recycle'))
            .when('/rest/pl/fe/matter/enroll/stat', new RouteParam('stat'))
            .when('/rest/pl/fe/matter/enroll/log', new RouteParam('log'))
            .when('/rest/pl/fe/matter/enroll/coin', new RouteParam('coin'))
            .when('/rest/pl/fe/matter/enroll/discuss', new RouteParam('discuss', '/views/default/pl/fe/_module/', '/views/default/pl/fe/_module/'))
            .otherwise(new RouteParam('publish', '/views/ytx/pl/fe/matter/enroll/'));

        $locationProvider.html5Mode(true);

        $uibTooltipProvider.setTriggers({
            'show': 'hide'
        });

        (function() {
            var ls, siteId, appId;
            ls = location.search;
            siteId = ls.match(/[\?&]site=([^&]*)/)[1];
            appId = ls.match(/[\?&]id=([^&]*)/)[1];
            //
            srvSiteProvider.config(siteId);
            srvAppProvider.config(siteId, appId);
            srvRoundProvider.config(siteId, appId);
            srvPageProvider.config(siteId, appId);
            srvRecordProvider.config(siteId, appId);
            srvQuickEntryProvider.setSiteId(siteId);
        })();
    }]);
    ngApp.controller('ctrlFrame', ['$scope', 'srvSite', 'srvApp', 'templateShop', function($scope, srvSite, srvApp, templateShop) {
        $scope.scenarioNames = {
            'common': '通用登记',
            'registration': '报名',
            'voting': '评价',
        };
        $scope.viewNames = {
            'main': '活动定义',
            'publish': '发布预览',
            'schema': '修改题目',
            'page': '修改页面',
            'record': '查看数据',
            'stat': '统计报告',
            'discuss': '用户评论',
            'coin': '积分规则',
            'log': '运行日志',
            'recycle': '回收站',
        };
        $scope.subView = '';
        $scope.$on('$locationChangeSuccess', function(event, currentRoute) {
            var subView = currentRoute.match(/([^\/]+?)\?/);
            $scope.subView = subView[1] === 'enroll' ? 'publish' : subView[1];
        });
        $scope.update = function(name) {
            srvApp.update(name);
        };
        $scope.shareAsTemplate = function() {
            templateShop.share($scope.app.siteid, $scope.app);
        };
        srvSite.get().then(function(oSite) {
            $scope.site = oSite;
        });
        srvSite.snsList().then(function(aSns) {
            $scope.sns = aSns;
        });
        srvSite.memberSchemaList().then(function(aMemberSchemas) {
            $scope.memberSchemas = aMemberSchemas;
        });
        srvApp.get().then(function(app) {
            $scope.app = app;
            app.__schemasOrderConsistent = 'Y'; //页面上登记项显示顺序与定义顺序一致
            // 用户评论
            if (app.can_discuss === 'Y') {
                $scope.discussParams = {
                    title: app.title,
                    threadKey: 'enroll,' + app.id,
                    domain: app.siteid
                };
            }
        });
    }]);
    /***/
    require(['domReady!'], function(document) {
        angular.bootstrap(document, ["app"]);
    });
    /***/
    return ngApp;
});
