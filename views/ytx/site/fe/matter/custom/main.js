define(["require", "angular"], function(require, angular) {
    'use strict';
    var ngApp = angular.module('app', []);
    ngApp.config(['$controllerProvider', function($cp) {
        ngApp.provider = {
            controller: $cp.register
        };
    }]);
    ngApp.controller('ctrl', ['$scope', '$http', '$timeout', '$q', function($scope, $http, $timeout, $q) {
        var ls, siteId, id, shareby;
        ls = location.search;
        siteId = ls.match(/[\?&]site=([^&]*)/)[1];
        id = ls.match(/[\?&]id=([^&]*)/)[1];
        shareby = ls.match(/shareby=([^&]*)/) ? ls.match(/shareby=([^&]*)/)[1] : '';
        var setMpShare = function(xxtShare) {
            var shareid, sharelink;
            //shareid = $scope.user.vid + (new Date()).getTime();
            xxtShare.options.logger = function(shareto) {
                /*var url = "/rest/mi/matter/logShare";
                url += "?shareid=" + shareid;
                url += "&site=" + siteId;
                url += "&id=" + id;
                url += "&type=article";
                url += "&title=" + $scope.article.title;
                url += "&shareto=" + shareto;
                url += "&shareby=" + shareby;
                $http.get(url);*/
            };
            sharelink = 'http://' + location.hostname + '/rest/site/fe/matter';
            sharelink += '?siteId=' + siteId;
            sharelink += '&type=custom';
            sharelink += '&id=' + id;
            //sharelink += "&shareby=" + shareid;
            xxtShare.set($scope.article.title, sharelink, $scope.article.summary, $scope.article.pic);
        };
        var loadCss = function(css) {
            var link, head;
            link = document.createElement('link');
            link.href = css.url;
            link.rel = 'stylesheet';
            head = document.querySelector('head');
            head.appendChild(link);
        };
        var loadDynaCss = function(css) {
            var style, head;
            style = document.createElement('style');
            style.rel = 'stylesheet';
            style.innerHTML = css;
            head = document.querySelector('head');
            head.appendChild(style);
        };
        var loadDynaJs = function(article, page) {
            $timeout(function dynamicjs() {
                eval(page.js);
                $scope.article = article;
            });
        };
        var loadExtJs = function(article, page) {
            var jslength = page.ext_js.length,
                loadJs;
            loadJs = function(js) {
                var script;
                script = document.createElement('script');
                script.src = js.url;
                script.onload = function() {
                    jslength--;
                    if (jslength === 0) {
                        if (page.js && page.js.length) {
                            loadDynaJs(article, page);
                        } else {
                            $scope.article = article;
                        }
                    }
                };
                document.body.appendChild(script);
            };
            angular.forEach(page.ext_js, loadJs);
        };
        var articleLoaded = function() {
            /MicroMessenge|Yixin/i.test(navigator.userAgent) && require(['xxt-share'], function(xxtShare) {
                setMpShare(xxtShare);
            });
            window.loading.finish();
        };
        var loadArticle = function() {
            var deferred = $q.defer();
            $http.get('/rest/site/fe/matter/article/get?site=' + siteId + '&id=' + id).success(function(rsp) {
                var article, page;
                article = rsp.data.article;
                $http.post('/rest/site/fe/matter/logAccess?site=' + siteId + '&id=' + id + '&type=article&title=' + article.title + '&shareby=' + shareby, {
                    search: location.search.replace('?', ''),
                    referer: document.referrer
                });
                page = article.page;
                $scope.user = rsp.data.user;
                $scope.site = rsp.data.site;
                if (page.ext_css && page.ext_css.length) {
                    angular.forEach(page.ext_css, loadCss);
                }
                if (page.css && page.css.length) {
                    loadDynaCss(page.css);
                }
                if (page.ext_js && page.ext_js.length) {
                    loadExtJs(article, page);
                } else if (page.js && page.js.length) {
                    loadDynaJs(article, page);
                } else {
                    $scope.article = article;
                }
                deferred.resolve();
            }).error(function(content, httpCode) {
                if (httpCode === 401) {
                    var el = document.createElement('iframe');
                    el.setAttribute('id', 'frmAuth');
                    el.onload = function() {
                        this.height = document.documentElement.clientHeight;
                    };
                    document.body.appendChild(el);
                    if (content.indexOf('http') === 0) {
                        window.onAuthSuccess = function() {
                            el.style.display = 'none';
                            loadArticle().then(articleLoaded);
                        };
                        el.setAttribute('src', content);
                        el.style.display = 'block';
                    } else if (el.contentDocument && el.contentDocument.body) {
                        el.contentDocument.body.innerHTML = content;
                        el.style.display = 'block';
                    }
                } else {
                    alert(content);
                }
            });
            return deferred.promise;
        };
        loadArticle().then(articleLoaded);
    }]);
    ngApp.directive('dynamicHtml', function($compile) {
        return {
            restrict: 'EA',
            replace: true,
            link: function(scope, ele, attrs) {
                scope.$watch(attrs.dynamicHtml, function(html) {
                    if (html && html.length) {
                        ele.html(html);
                        $compile(ele.contents())(scope);
                    }
                });
            }
        };
    });
    require(['domReady!'], function(document) {
        angular.bootstrap(document, ["app"]);
    });
});