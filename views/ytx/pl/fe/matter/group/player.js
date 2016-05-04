(function() {
    ngApp.provider.controller('ctrlRecord', ['$scope', 'http2', '$modal', function($scope, http2, $modal) {
        $scope.doSearch = function(page) {
            var url;
            page && ($scope.page.at = page);
            url = '/rest/pl/fe/matter/group/player/list';
            url += '?site=' + $scope.siteId;
            url += '&app=' + $scope.app.id;
            url += '&tags=' + $scope.page.tags.join(',');
            url += $scope.page.joinParams();
            http2.get(url, function(rsp) {
                if (rsp.data) {
                    $scope.players = rsp.data.players ? rsp.data.players : [];
                    angular.forEach($scope.players, function(player) {
                        player.data.member && (player.data.member = JSON.parse(player.data.member));
                    });
                    rsp.data.total && ($scope.page.total = rsp.data.total);
                } else {
                    $scope.players = [];
                }
            });
        };
        $scope.page = {
            at: 1,
            size: 30,
            tags: [],
            orderBy: 'time',
            joinParams: function() {
                var p;
                p = '&page=' + this.at + '&size=' + this.size;
                p += '&orderby=' + this.orderBy;
                return p;
            }
        };
        $scope.selected = {};
        $scope.selectAll;
        $scope.tagByData = function() {
            $modal.open({
                templateUrl: 'tagByData.html',
                controller: ['$scope', '$modalInstance', function($scope2, $mi) {
                    $scope2.data = {
                        filter: {},
                        tag: ''
                    };
                    $scope2.schema = [];
                    angular.forEach($scope.schema, function(def) {
                        if (['img', 'file', 'datetime'].indexOf(def.type) === -1) {
                            $scope2.schema.push(def);
                        }
                    });
                    $scope2.cancel = function() {
                        $mi.dismiss();
                    };
                    $scope2.ok = function() {
                        $mi.close($scope2.data);
                    };
                }],
                backdrop: 'static'
            }).result.then(function(data) {
                if (data.tag && data.tag.length) {
                    http2.post('/rest/mp/app/enroll/record/tagByData?aid=' + $scope.aid, data, function(rsp) {
                        var aAssigned;
                        $scope.doSearch();
                        aAssigned = data.tag.split(',');
                        angular.forEach(aAssigned, function(newTag) {
                            $scope.app.tags.indexOf(newTag) === -1 && $scope.app.tags.push(newTag);
                        });
                    });
                }
            });
        };
        $scope.$on('search-tag.xxt.combox.done', function(event, aSelected) {
            $scope.page.tags = $scope.page.tags.concat(aSelected);
            $scope.doSearch();
        });
        $scope.$on('search-tag.xxt.combox.del', function(event, removed) {
            var i = $scope.page.tags.indexOf(removed);
            $scope.page.tags.splice(i, 1);
            $scope.doSearch();
        });
        $scope.$on('batch-tag.xxt.combox.done', function(event, aSelected) {
            var i, record, records, eks, posted;
            records = [];
            eks = [];
            for (i in $scope.selected) {
                if ($scope.selected) {
                    record = $scope.players[i];
                    eks.push(record.enroll_key);
                    records.push(record);
                }
            }
            if (eks.length) {
                posted = {
                    eks: eks,
                    tags: aSelected
                };
                http2.post('/rest/pl/fe/matter/group/player/batchTag?site=' + $scope.siteId + '&app=' + $scope.id, posted, function(rsp) {
                    var i, l, m, n, newTag;
                    n = aSelected.length;
                    for (i = 0, l = records.length; i < l; i++) {
                        record = records[i];
                        if (!record.tags || record.length === 0) {
                            record.tags = aSelected.join(',');
                        } else {
                            for (m = 0; m < n; m++) {
                                newTag = aSelected[m];
                                (',' + record.tags + ',').indexOf(newTag) === -1 && (record.tags += ',' + newTag);
                            }
                        }
                    }
                });
            }
        });
        $scope.keywordKeyup = function(evt) {
            evt.which === 13 && $scope.doSearch();
        };
        $scope.memberAttr = function(val, key) {
            var keys;
            if (val.member) {
                keys = key.split('.');
                if (keys.length === 2) {
                    return val.member[keys[1]];
                } else if (val.member.extattr) {
                    return val.member.extattr[keys[2]];
                } else {
                    return '';
                }
            } else {
                return '';
            }
        };
        $scope.value2Label = function(val, key) {
            var schemas = $scope.app.data_schemas,
                i, j, s, aVal, aLab = [];
            if (val === undefined) return '';
            for (i = 0, j = schemas.length; i < j; i++) {
                if (schemas[i].id === key) {
                    s = schemas[i];
                    break;
                }
            }
            if (s && s.ops && s.ops.length) {
                aVal = val.split(',');
                for (i = 0, j = s.ops.length; i < j; i++) {
                    aVal.indexOf(s.ops[i].v) !== -1 && aLab.push(s.ops[i].l);
                }
                if (aLab.length) return aLab.join(',');
            }
            return val;
        };
        $scope.json2Obj = function(json) {
            if (json && json.length) {
                obj = JSON.parse(json);
                return obj;
            } else {
                return {};
            }
        };
        $scope.editPlayer = function(player) {
            $modal.open({
                templateUrl: 'editorPlayer.html',
                controller: 'ctrlEditor',
                windowClass: 'auto-height',
                resolve: {
                    app: function() {
                        return $scope.app;
                    },
                    player: function() {
                        return player;
                    }
                }
            }).result.then(function(updated) {
                var p, tags;
                p = updated[0];
                http2.post('/rest/pl/fe/matter/group/player/update?site=' + $scope.siteId + '&id=' + $scope.id + '&ek=' + player.enroll_key, p, function(rsp) {
                    //tags = updated[1];
                    //$scope.app.tags = tags;
                });
            });
        };
        $scope.addPlayer = function() {
            $modal.open({
                templateUrl: 'editorPlayer.html',
                controller: 'ctrlEditor',
                windowClass: 'auto-height',
                resolve: {
                    app: function() {
                        return $scope.app;
                    },
                    player: function() {
                        return {
                            tags: ''
                        };
                    }
                }
            }).result.then(function(updated) {
                var p, tags;
                p = updated[0];
                tags = updated[1];
                http2.post('/rest/pl/fe/matter/group/player/add?site=' + $scope.siteId + '&id=' + $scope.id, p, function(rsp) {
                    $scope.app.tags = tags;
                    $scope.players.splice(0, 0, rsp.data);
                });
            });
        };
        $scope.removePlayer = function(record) {
            if (window.confirm('确认删除？')) {
                http2.get('/rest/mp/app/enroll/record/remove?aid=' + $scope.id + '&key=' + record.enroll_key, function(rsp) {
                    var i = $scope.players.indexOf(record);
                    $scope.players.splice(i, 1);
                    $scope.page.total = $scope.page.total - 1;
                });
            }
        };
        $scope.empty = function() {
            var vcode;
            vcode = prompt('是否要删除所有登记信息？，若是，请输入活动名称。');
            if (vcode === $scope.app.title) {
                http2.get('/rest/mp/app/enroll/record/empty?aid=' + $scope.aid, function(rsp) {
                    $scope.doSearch(1);
                });
            }
        };
        $scope.$watch('selectAll', function(nv) {
            var i, j;
            if (nv !== undefined) {
                for (i = 0, j = $scope.players.length; i < j; i++) {
                    $scope.selected[i] = nv;
                }
            }
        });
        $scope.$watch('app', function(nv) {
            if (!nv) return;
            $scope.doSearch();
        });
    }]);
    ngApp.provider.controller('ctrlEditor', ['$scope', '$modalInstance', '$sce', 'app', 'player', function($scope, $mi, $sce, app, player) {
        $scope.app = app;
        $scope.aTags = app.tags;
        player.aTags = (!player.tags || player.tags.length === 0) ? [] : player.tags.split(',');
        $scope.player = player;
        $scope.json2Obj = function(json) {
            if (json && json.length) {
                obj = JSON.parse(json);
                return obj;
            } else {
                return {};
            }
        };
        $scope.ok = function() {
            var c, p, col;
            p = {
                tags: $scope.player.aTags.join(','),
                data: {}
            };
            $scope.player.tags = p.tags;
            for (c in $scope.app.data_schemas) {
                col = $scope.app.data_schemas[c];
                p.data[col.id] = $scope.player.data[col.id];
            }
            $mi.close([p, $scope.aTags]);
        };
        $scope.cancel = function() {
            $mi.dismiss('cancel');
        };
        $scope.$on('tag.xxt.combox.done', function(event, aSelected) {
            var aNewTags = [];
            for (var i in aSelected) {
                var existing = false;
                for (var j in $scope.player.aTags) {
                    if (aSelected[i] === $scope.player.aTags[j]) {
                        existing = true;
                        break;
                    }
                }!existing && aNewTags.push(aSelected[i]);
            }
            $scope.player.aTags = $scope.player.aTags.concat(aNewTags);
        });
        $scope.$on('tag.xxt.combox.add', function(event, newTag) {
            $scope.player.aTags.push(newTag);
            $scope.aTags.indexOf(newTag) === -1 && $scope.aTags.push(newTag);
        });
        $scope.$on('tag.xxt.combox.del', function(event, removed) {
            $scope.player.aTags.splice($scope.player.aTags.indexOf(removed), 1);
        });
    }]);
})();