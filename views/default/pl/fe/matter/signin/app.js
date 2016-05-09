(function() {
	ngApp.provider.controller('ctrlApp', ['$scope', 'http2', function($scope, http2, mediagallery) {
		$scope.publish = function() {
			$scope.app.state = 2;
			$scope.update('state');
			$scope.submit().then(function() {
				location.href = '/rest/pl/fe/matter/enroll/publish?site=' + $scope.siteId + '&id=' + $scope.id;
			});
		};
		$scope.$on('xxt.tms-datepicker.change', function(event, data) {
			$scope.app[data.state] = data.value;
			$scope.update(data.state);
		});
	}]);
	ngApp.provider.controller('ctrlPageEditor', ['$scope', '$q', '$modal', 'http2', 'mediagallery', function($scope, $q, $modal, http2, mediagallery) {
		$scope.$watch('app', function(app) {
			if (!app) return;
			$scope.ep = app.pages[0];
		});
		$scope.choosePage = function(page) {
			$scope.ep = page;
			tinymce.activeEditor.setContent(page.html);
		};
		$scope.activeWrap = false;
		var setActiveWrap = function(wrap) {
			var wrapType;
			if (wrap) {
				wrapType = $(wrap).attr('wrap');
				wrap.classList.add('active');
				$scope.hasActiveWrap = true;
				$scope.activeWrap = {
					type: wrapType,
					editable: !/list/.test(wrapType),
					upmost: /body/i.test(wrap.parentNode.tagName),
					downmost: /button|static|radio|checkbox/.test(wrapType),
				};
			} else {
				$scope.hasActiveWrap = false;
				$scope.activeWrap = false;
			}
		};
		var ctrlSchemaEditor = ['$scope', '$modalInstance', '$timeout', 'schema', 'memberSchemas', function($scope, $mi, $timeout, schema, memberSchemas) {
			var base = {
					title: '',
					type: '',
					required: 'N',
					showname: 'label'
				},
				prefab = {
					'name': {
						title: '姓名',
						id: 'name'
					},
					'mobile': {
						title: '手机',
						id: 'mobile'
					},
					'email': {
						title: '邮箱',
						id: 'email'
					}
				},
				newSchema = function(type) {
					var id = 'c' + (new Date()).getTime(),
						schema = angular.copy(base);
					schema.type = type;
					if (prefab[type]) {
						schema.id = prefab[type].id;
						schema.title = prefab[type].title;
					} else {
						schema.id = id;
						schema.title = '新登记项';
						if (type === 'single' || type === 'multiple') {
							schema.ops = [{
								l: '选项1',
								v: 'v1'
							}, {
								l: '选项2',
								v: 'v2'
							}];
							schema.align = 'V';
							if (type === 'single') {
								schema.component = 'R';
							}
						} else if (type === 'image' || type === 'file') {
							schema.count = 1;
						}
					}
					return schema;
				};
			$scope.schema = schema ? schema : newSchema('shorttext');
			$scope.memberSchemas = memberSchemas;
			$scope.schemaHtml = function(schema) {
				var url = '/views/default/pl/fe/matter/enroll/component/' + schema.type + '.html?_=1';
				return url;
			};
			$scope.addOption = function() {
				if ($scope.schema.ops === undefined)
					$scope.schema.ops = [];
				var maxSeq = 0,
					newOp = {
						l: ''
					};
				angular.forEach($scope.schema.ops, function(op) {
					var opSeq = parseInt(op.v.substr(1));
					opSeq > maxSeq && (maxSeq = opSeq);
				});
				newOp.v = 'v' + (++maxSeq);
				$scope.schema.ops.push(newOp);
				$timeout(function() {
					$scope.$broadcast('xxt.editable.add', newOp);
				});
			};
			$scope.$on('xxt.editable.remove', function(e, op) {
				var i = $scope.schema.ops.indexOf(op);
				$scope.schema.ops.splice(i, 1);
			});
			$scope.changeType = function() {
				$scope.schema = newSchema($scope.schema.type);
			};
			$scope.selectedMemberSchema = {
				schema: null,
				attrs: null,
				attr: null
			};
			$scope.shiftMemberSchema = function() {
				var schema = $scope.selectedMemberSchema.schema,
					schemaAttrs = [];
				$scope.schema.schema_id = schema.id;
				schema.attr_name[0] === '0' && (schemaAttrs.push({
					id: 'name',
					label: '姓名'
				}));
				schema.attr_mobile[0] === '0' && (schemaAttrs.push({
					id: 'mobile',
					label: '手机'
				}));
				schema.attr_email[0] === '0' && (schemaAttrs.push({
					id: 'email',
					label: '邮箱'
				}));
				if (schema.extattr && schema.extattr.length) {
					var i, l, ea;
					for (i = 0, l = schema.extattr.length; i < l; i++) {
						ea = schema.extattr[i];
						schemaAttrs.push({
							id: 'extattr.' + ea.id,
							label: ea.label
						});
					}
				}
				$scope.selectedMemberSchema.attrs = schemaAttrs;
			};
			$scope.shiftMemberSchemaAttr = function() {
				var attr = $scope.selectedMemberSchema.attr;
				selectedMemberSchema = attr.label;
				$scope.schema.id = 'member.' + attr.id;
			};
			$scope.ok = function() {
				if ($scope.schema.title.length === 0) {
					alert('必须指定登记项的名称');
					return;
				}
				$mi.close($scope.schema);
			};
			$scope.cancel = function() {
				$mi.dismiss();
			};
			$scope.$watch('schema.setUpper', function(nv) {
				if (nv === 'Y') {
					$scope.schema.upper = $scope.schema.ops ? $scope.schema.ops.length : 0;
				}
			});
		}];
		$scope.$on('tinymce.wrap.select', function(event, wrap) {
			$scope.$apply(function() {
				var root = wrap,
					selectableWrap = wrap,
					wrapType;
				while (root.parentNode) root = root.parentNode;
				$(root).find('.active').removeClass('active');
				$scope.hasActiveWrap = false;
				$scope.activeWrap = false;
				wrapType = $(selectableWrap).attr('wrap');
				while (!/input|radio|checkbox|static|button|list/.test(wrapType) && selectableWrap.parentNode) {
					selectableWrap = selectableWrap.parentNode;
					wrapType = $(selectableWrap).attr('wrap');
				}
				if (/input|radio|checkbox|static|button|list/.test(wrapType)) {
					setActiveWrap(selectableWrap);
				}
			});
		});
		$scope.chooseSchema = function() {
			$modal.open({
				templateUrl: '/views/default/pl/fe/matter/enroll/component/chooseSchema.html?_=1',
				backdrop: 'static',
				resolve: {
					schemas: function() {
						return $scope.app.data_schemas;
					}
				},
				controller: ['$scope', '$modalInstance', 'schemas', function($scope, $mi, schemas) {
					var choosed = [];
					$scope.schemas = angular.copy(schemas);
					$scope.choose = function(schema) {
						schema._selected ? choosed.push(schema) : choosed.splice(choosed.indexOf(schema), 1);
					};
					$scope.ok = function() {
						$mi.close(choosed);
					};
					$scope.cancel = function() {
						$mi.dismiss();
					};
				}],
			}).result.then(function(choosed) {
				angular.forEach(choosed, function(schema) {
					var dataSchemas = $scope.ep.data_schemas,
						i = 0,
						l = dataSchemas.length;
					while (i < l && schema.id !== dataSchemas[i++].id) {};
					if (i === l) {
						delete schema._selected;
						dataSchemas.push(schema);
					}
					window.wrapLib.embedInput(tinymce.activeEditor, schema);
				});
				tinymce.activeEditor.save();
				$scope.updPage(page, 'data_schemas');
			});
		};
		$scope.createSchema = function() {
			$modal.open({
				templateUrl: '/views/default/pl/fe/matter/enroll/component/createSchema.html?_=1',
				resolve: {
					schema: function() {
						return false;
					},
					memberSchemas: function() {
						return $scope.memberSchemas;
					}
				},
				backdrop: 'static',
				size: 'lg',
				windowClass: 'auto-height',
				controller: ctrlSchemaEditor,
			}).result.then(function(schema) {
				$scope.app.data_schemas.push(schema);
				$scope.$parent.modified = true;
				$scope.update('data_schemas');
				$scope.submit().then(function() {
					$scope.ep.data_schemas.push(schema);
					$scope.updPage($scope.ep, 'data_schemas').then(function() {
						var activeEditor = tinymce.activeEditor;
						wrapLib.embedInput(activeEditor, schema);
						activeEditor.save();
						$scope.ep.$$modified = true;
					});
				});
			});
		};
		$scope.modifyWrap = function() {
			var editor = tinymce.activeEditor,
				$active = $(editor.getBody()).find('.active'),
				schema;
			if (/button/.test($active.attr('wrap'))) {
				schema = wrapLib.extractButtonSchema($active[0]);
				if (schema.name === 'remarkRecord') {
					$scope.$root.errmsg = '不支持修改该类型组件';
					return;
				}
				$modal.open({
					templateUrl: 'embedButtonLib.html',
					backdrop: 'static',
					resolve: {
						app: function() {
							return $scope.app;
						},
						schema: function() {
							return schema;
						}
					},
					controller: _ctrlEmbedButton,
				}).result.then(function(schema) {
					wrapLib.changeEmbedButton(editor, $active[0], schema);
					$scope.ep.$$modified = true;
				});
			} else if (/input/.test($active.attr('wrap'))) {
				$modal.open({
					templateUrl: '/views/default/pl/fe/matter/enroll/component/modifySchema.html?_=1',
					backdrop: 'static',
					size: 'lg',
					windowClass: 'auto-height',
					resolve: {
						memberSchemas: function() {
							return $scope.memberSchemas;
						},
						schema: function() {
							var schema = wrapLib.extractInputSchema($active[0]);
							for (var i = 0, l = $scope.ep.data_schemas.length; i < l; i++) {
								if (schema.id === $scope.ep.data_schemas[i].id) {
									schema = $scope.ep.data_schemas[i];
									break;
								}
							}
							return schema;
						}
					},
					controller: ctrlSchemaEditor,
				}).result.then(function(schema) {
					$scope.$parent.modified = true;
					$scope.update('data_schemas');
					$scope.submit().then(function() {
						$scope.updPage($scope.ep, 'data_schemas').then(function() {
							var newWrap = wrapLib.modifyEmbedInput(editor, $active[0], schema);
							editor.save();
							setActiveWrap(newWrap);
						});
					});
				});
			} else if (/static/.test($active.attr('wrap'))) {
				schema = wrapLib.extractStaticSchema($active[0]);
				$modal.open({
					templateUrl: 'embedStaticEditor.html',
					backdrop: 'static',
					controller: ['$scope', '$modalInstance', function($scope, $mi) {
						$scope.schema = schema;
						$scope.ok = function() {
							$mi.close($scope.schema);
						};
						$scope.cancel = function() {
							$mi.dismiss();
						};
					}]
				}).result.then(function(schema) {
					wrapLib.changeEmbedStatic(editor, $active[0], schema);
				});
			}
		};
		$scope.removeWrap = function(page) {
			var editor = tinymce.activeEditor;
			$(editor.getBody()).find('.active').remove();
			editor.save();
			setActiveWrap(null);
		};
		$scope.upWrap = function(page) {
			var editor = tinymce.activeEditor,
				active = $(editor.getBody()).find('.active');
			active.prev().before(active);
			editor.save();
		};
		$scope.downWrap = function(page) {
			var editor = tinymce.activeEditor,
				active = $(editor.getBody()).find('.active');
			active.next().after(active);
			editor.save();
		};
		$scope.upLevel = function(page) {
			var editor = tinymce.activeEditor,
				$active = $(editor.getBody()).find('.active'),
				$parent = $active.parents('[wrap]');
			if ($parent.length) {
				$active.removeClass('active');
				setActiveWrap($parent[0]);
			}
		};
		$scope.downLevel = function(page) {
			var editor = tinymce.activeEditor,
				$active = $(editor.getBody()).find('.active'),
				$children = $active.find('[wrap]');
			if ($children.length) {
				$active.removeClass('active');
				setActiveWrap($children[0]);
			}
		};
		$scope.embedMatter = function(page) {
			mattersgallery.open($scope.siteId, function(matters, type) {
				var editor, dom, mtype, fn;
				editor = tinymce.activeEditor;
				dom = editor.dom;
				angular.forEach(matters, function(matter) {
					matter = matters[i];
					fn = "openMatter(" + matter.id + ",'" + mtype + "')";
					editor.insertContent(dom.createHTML('div', {
						'wrap': 'link',
						'class': 'matter-link'
					}, dom.createHTML('a', {
						href: 'javascript:void(0)',
						"ng-click": fn,
					}, dom.encode(matter.title))));
				});
			}, {
				matterTypes: $scope.innerlinkTypes,
				hasParent: false,
				singleMatter: true
			});
		};
		$scope.gotoCode = function(codeid) {
			window.open('/rest/code?pid=' + codeid, '_self');
		};
		$scope.onPageChange = function() {
			$scope.ep.$$modified = true;
		};
		$scope.updPage = function(page, name) {
			var editor, defer = $q.defer();
			if (!angular.equals($scope.app, $scope.persisted)) {
				if (name === 'html') {
					editor = tinymce.activeEditor;
					if ($(editor.getBody()).find('.active').length) {
						$(editor.getBody()).find('.active').removeClass('active');
						$scope.hasActiveWrap = false;
						page.html = $(editor.getBody()).html();
					}
				}
				$scope.$root.progmsg = '正在保存页面...';
				var url, p = {};
				p[name] = name === 'html' ? encodeURIComponent(page[name]) : page[name];
				url = '/rest/pl/fe/matter/enroll/page/update';
				url += '?site=' + $scope.siteId;
				url += '&app=' + $scope.id;
				url += '&pid=' + page.id;
				url += '&pname=' + page.name;
				url += '&cid=' + page.code_id;
				http2.post(url, p, function(rsp) {
					$scope.persisted = angular.copy($scope.app);
					page.$$modified = false;
					$scope.$root.progmsg = '';
					defer.resolve();
				});
			}
			return defer.promise;
		};
		$scope.delPage = function() {
			if (window.confirm('确定删除？')) {
				var url = '/rest/pl/fe/matter/enroll/page/remove';
				url += '?site=' + $scope.siteId;
				url += '&app=' + $scope.id;
				url += '&pid=' + $scope.ep.id;
				http2.get(url, function(rsp) {
					$scope.app.pages.splice($scope.app.pages.indexOf($scope.ep), 1);
					if ($scope.app.pages.length) {
						$scope.choosePage($scope.app.pages[0]);
					} else {
						$scope.ep = null;
					}
				});
			}
		};
		$scope.gotoPageConfig = function() {
			location = '/rest/pl/fe/matter/enroll/page?site=' + $scope.siteId + '&id=' + $scope.id + '&page=' + $scope.ep.name;
		};
		$scope.$on('tinymce.multipleimage.open', function(event, callback) {
			var options = {
				callback: callback,
				multiple: true,
				setshowname: true
			};
			mediagallery.open($scope.siteId, options);
		});
	}]);
})();