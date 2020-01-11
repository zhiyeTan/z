const App = {
	// appName: '4CM',
	// loginApi: '/4cm/login',
	// logoutApi: '/4cm/logout',
	// permissionApi: '/4cm/permission',
	// pageConfigDomain: 'http://s.4cm.com/',//页面配置的域名
	pages: {},
	init: function(param){
		Object.keys(param).forEach(key => {
			this[key] = param[key];
		});
		Backdrop.init().showLoading();
		Dialog.init();
		this.initLoginForm();
		this.initStruct();
		this.initSidebar();
	},
	/**
	 * 初始化登录表单
	 */
	initLoginForm: function(){
		$('body').append('<div id="loginBox" class="container" style="display:none;">' +
							'<form class="col-xs-8 col-xs-offset-2">' +
								'<div class="form-group text-center h2">4CM</div>' +
								'<div class="form-group">' +
									'<input class="form-control" type="text" name="account" placeholder="账号">' +
								'</div>' +
								'<div class="form-group">' +
									'<input class="form-control" type="password" name="password" placeholder="密码">' +
								'</div>' +
								'<div class="alert alert-danger d-none"></div>' +
								'<div class="form-group">' +
									'<button type="submit" class="btn btn-block btn-success">登录</button>' +
								'</div>' +
							'</form>' +
						'</div>');
		$('#loginBox').css('margin-top', (document.documentElement.clientHeight / 2 - 150) + 'px');
		//绑定异步提交登录
		$('#loginBox').on('submit', e => {
			e.preventDefault();
			let account = $('#loginBox [name=account]').val();
			let pwd = $('#loginBox [name=password]').val();
			Backdrop.showLoading();
			$.post(
				this.loginApi,
				{
					account: account,
					password: pwd
				},
				res => {
					Backdrop.hideLoading();
					if(res.errno){
						$('.alert').html(res.message).removeClass('d-none');
						let elem = res.errno == 1 ? 'account' : 'password';
						let _event = 'input propertychange';
						$('#loginBox [name=account], #loginBox [name=password]').off(_event);
						$('#loginBox [name='+elem+']').on(_event, function(){
							$('#loginBox .alert').html(res.message).addClass('d-none');
							$(this).off(elem);
						});
					}
					else{
						this.initSidebar();
					}
				}
			);
		});
	},
	/**
	 * 初始化页面结构
	 */
	initStruct: function(){
		$('body').prepend($('<div id="container" style="display:none;"></div>')).prepend(
			$('<div id="sidebar" style="display:none;">' +
				'<div id="sideScrollBar">' +
					'<div id="sideScrollBarSlider"></div>' +
				'</div>' +
				'<div id="sidebarContent">' +
				'</div>' +
			'</div>')
		);
	},
	/**
	 * 初始化侧边栏
	 */
	initSidebar: function(){
		$.get(
			this.permissionApi,
			res => {
				if(res.errno){
					if(res.overdue){
						this.showLoginBox();
					}
					else{
						Dialog.show({
							message: res.message,
						})
					}
				}
				else{
					let cookies = {};
					document.cookie.split(' ').forEach(function(string){
						let tmpArr = string.replace(';', '').split('=');
						cookies[tmpArr[0]] = decodeURIComponent(tmpArr[1]);
					});
					$('#sidebarContent').append(
						$('<div class="admin-box clearfix">' +
							'<div class="admin-tag float-left">' + cookies.name[0] + '</div>' +
							'<div class="admin-info float-left">' +
								'<div class="operator-name">' + cookies.name.substr(1) + '</div>' +
								'<div class="role-name text-muted">' +
									'<span>' + cookies.role + '</span>' +
									'<a id="logout" href="javascript:;">[注销]</a>' +
								'</div>' +
							'</div>' +
							'<div class="float-right mobile-nav-icon">' +
								'<i class="glyphicon glyphicon-list"></i>' +
							'</div>' +
						'</div>')
					);
					//移动端隐藏或显示导航列表
					$('#sidebarContent .mobile-nav-icon').on('click', function(){
						if($('#sidebar nav:hidden').length){
							$('#sidebar nav').show();
						}
						else{
							$('#sidebar nav').hide()
						}
					});
					//绑定注销事件
					$('#logout').on('click', () => {
						$.get(
							this.logoutApi,
							() => {this.showLoginBox()}
						);
					});
					//权限列表
					let navHtml = '';
					Object.keys(res.data).forEach(function(mod){
						navHtml += '<li>' +
										'<a class="nav-module-item" href="#">' +
											'<i class="glyphicon glyphicon-user"></i>' +
											'<span>' + res.data[mod].name + '</span>' +
											'<i class="float-right glyphicon glyphicon-chevron-right"></i>' +
										'</a>' +
										'<ul>';
						Object.keys(res.data[mod].child).forEach(function(biz){
							navHtml += 		'<li>';
							navHtml += 			'<a mod="' + mod + '" biz="' + biz + '" class="nav-business-item" href="#">';
							navHtml +=				res.data[mod].child[biz];
							navHtml += 			'</a>';
							navHtml += 		'</li>';
						});
						navHtml += 		'</ul>';
						navHtml += '</li>';
					});
					$('#sidebarContent').append($('<nav>' + navHtml + '</nav>'));
					//初始化侧边栏
					Sidebar.init();
					//绑定一级导航点击事件
					$('#sidebarContent').on('click', '.nav-module-item', function(){
						if($(this).hasClass('active')){
							$(this).removeClass('active')
								.find('i:last')
								.removeClass('glyphicon-chevron-down')
								.addClass('glyphicon-chevron-right')
								.closest('a')
								.next().hide();
						}
						else{
							$(this).addClass('active')
								.find('i:last')
								.removeClass('glyphicon-chevron-right')
								.addClass('glyphicon-chevron-down')
								.closest('a')
								.next().show();
						}
					});
					//绑定二级导航点击事件
					$('#sidebarContent').on('click', '.nav-business-item', e => {
						let mod = $(e.target).attr('mod');
						let biz = $(e.target).attr('biz');
						let pkey = `${mod}_${biz}`;
						//已经加载过页面配置
						if(this.pages.hasOwnProperty(pkey)){
							$('#'+pkey).show().siblings().hide();
						}
						else{//未加载过
							Backdrop.showLoading();
							$.get(
								`${this.pageConfigDomain}/app/${this.appName}/page/${mod}/${biz}/script.js`,
								cfg => {
									eval(`config = ` + cfg);
									$('#container').append(`<div id="${pkey}"></div>`);
									this.pages[pkey] = Object.assign({}, this.page);
									this.pages[pkey].id = pkey;
									this.pages[pkey].formApiUrl = config.formApiUrl;
									this.pages[pkey].dataApiUrl = config.dataApiUrl;
									if(config.renderType){
										this.pages[pkey].renderType = config.renderType;
										delete config.renderType;
									}
									if (config.buttons) {
										this.pages[pkey].renderBtnGroup(config.buttons);
										delete config.buttons;
									}
									if (config.form){
										this.pages[pkey].renderForm(config.form);
										delete config.form;
									}
									if (config.filter){
										this.pages[pkey].renderFilter(config.filter);
										delete config.filter;
									}
									if (config.thead){
										this.pages[pkey].setThead(config.thead);
										delete config.thead;
									}
									if (config.actions){
										this.pages[pkey].setActions(config.actions);
										delete config.actions;
									}
									if (config.autoLoad){
										this.pages[pkey].submitFilter();
										delete config.autoLoad;
									}
									Object.keys(config).forEach(key => {
										this.pages[pkey].on(key, config[key]);
									});
									this.pages[pkey].clean();
									$('#'+pkey).show().siblings().hide();
									Backdrop.hideLoading();
								}
							);
						}
					});
					$('#loginBox').hide();
					$('#sidebar').show();
					$('#container').show();
				}
				Backdrop.hideLoading();
			}
		);
	    //访问权限列表接口(同时进行了登录状态的检测)
        //如果未登录，调出登录界面
        //如果已登录，通过cookie获取登陆者姓名及角色名，初始化登陆者信息及侧边导航
	},
	/**
	 * 显示登陆界面
	 */
	showLoginBox: function(){
		$('#loginBox').show();
		$('#sidebar').hide();
		$('#container').hide();
	},
	/**
	 * 页面对象(基本包含按钮组、表单、筛选器、表格、分页器)
	 */
	page: {
		id: '',//页面ID
		formApiUrl: '',//表单接口
		dataApiUrl: '',//数据接口
		gridWidth: 1,//栅格列宽(1~12)
		renderType: 0,//渲染类型(0表格，1栅格，2树形)
		data: {
			page: 1,//当前页码
			onPageNum: 1,//每页记录数
			recordNum: 0,//总记录数
			pageSideNum: 2,//两侧显示的页码数量
			keys: [],//键名数组，键名索引和数据索引保持一致
			list: [],//列表数据
			thead: [],//表头信息
			listIdx: -1,//选定列对应的索引
			form: {},//表单信息
			filter: {},//过滤器信息
			actions: [],//表格操作
		},
		timerBasicParam: {//时间选择器基本参数(页面初始化后删掉)
			language: 'zh-CN',
			weekStart: 1,
			todayBtn: 1,
			todayHighlight: 1,
			autoclose: 1,
			maxView: 4,
			startView: 2,
			// format: 'yyyy-mm-dd',
			// minView: 1,
		},
		//检查是否保留关键字
		checkReservedKeywords: function(key){
			return ['id', 'formApiUrl', 'dataApiUrl', 'data', 'on', 'off', 'clean'].indexOf(key) >= 0;
		},
		//设置属性
		on: function (key, value) {
			if (!this.checkReservedKeywords(key)) {
				if (this.hasOwnProperty(key) && typeof (this[key]) === 'function') {
					let mapKey = `${key}_${parseInt(key, 32)}`;
					if (!this.hasOwnProperty(mapKey)) {
						this[mapKey] = [];
						this[mapKey].push(this[key]);
					}
					this[mapKey].push(value);
					this[key] = () => {
						Object.keys(this[mapKey]).forEach(i => {
							this[mapKey][i]();
						})
					}
				} else {
					this[key] = value;
				}
			}
		},
		//移除属性
		off: function(key){
			if (!this.checkReservedKeywords(key)) {
				delete this[key];
				delete this[`${key}_${parseInt(key, 32)}`];
			}
		},
		//创建页面后清除无用属性
		clean: function () {
			delete this.timerBasicParam;
			delete this.renderBtnGroup;
			delete this.renderForm;
			delete this.renderFilter;
			delete this.setThead;
			delete this.setActions;
		},
		/**
		 * 显示表单
		 */
		showForm: function(data){
			Object.keys(this.data.form).forEach(key => {
				let info = this.data.form[key],
					newVal = data.hasOwnProperty(key) ? data[key] : info.default,
					target = $('#' + this.id + 'form [name=' + key + ']');
				//多选项
				if(info.type == 'checkbox'){
					this.data.form[key].value = [].concat(newVal);
					target.removeAttribute('checked');
					this.data.form[key].value.forEach(val => {
						$('#' + this.id + 'form [name=' + key + '][value=' + val + ']').prop('checked', true);
					});
				}
				//富文本
				else if(info.type == 'html'){
					target.summernote('code', newVal);
				}
				else{
					this.data.form[key].value = newVal;
					target.val(newVal);
				}
			});
			$('#' + this.id + ' form').show();
		},
		/**
		 * 隐藏表单
		 */
		hideForm: function(){
			$('#' + this.id + ' form').hide();
		},
		toggleTheadFilter: function(){
			$('.thead-filter').toggle();
		},
		/**
		 * 提交表单
		 */
		submitForm: function(){
			let postData = {};
			Object.keys(this.data.form).forEach(key => {
				if(this.data.form[key].regex){
					if(this.data.form[key].value.replace(this.data.form[key].regex, '') !== ''){
						Dialog.show({
							message: this.data.form[key].tips,
						});
					}
				}
				postData[key] = this.data.form[key].value;
			});
			$.post(
				this.formApiUrl,
				postData,
				result => {
					this.hideForm();
				},
				err => {
					Dialog.show({
						message: err.message,
					});
				}
			);
		},
		/**
		 * 提交过滤
		 */
		submitFilter: function(){
			let url = this.dataApiUrl;
			Object.keys(this.data.filter).forEach(key => {
				let value = this.data.filter[key].value;
				if(value !== ''){
					url += '/' + key + '/' + value;
				}
			});
			url += '/page/' + this.data.page;
			Backdrop.showLoading();
			$.get(
				url,
				res => {
					console.log(res)
					this.data.keys = res.keys;
					this.data.list = res.data;
					this.data.recordNum = res.count ? res.count : res.data.length;
					this.renderListData();
				}
			).fail(() => {
				Dialog.show({
					message: '请求异常，请稍后重试！'
				});
			}).always(() => {
				Backdrop.hideLoading();
			})
		},
		/**
		 * 设置表头信息
		 * @param cfg
		 * [
		 *     {
		 *         key: '',//key
		 *         name: '',//列名
		 *         regex: '',//用来修正显示的正则表达式
		 *         show: 1,//是否显示
		 *     },xN
		 * ]
		 */
		setThead: function(cfg){
			let theadFilter,
				html = '';
			Object.keys(cfg).forEach(i => {
				let info = cfg[i];
				info.regex = info.regex ? info.regex : '';
				info.show = info.hasOwnProperty('show') ? info.show : 1;
				this.data.thead[info.key] = info;
				let checked = info.show ? 'checked="checked"' : '';
				html += `<label><input type="checkbox" value="${info.key}" ${checked}>${info.name}</label>`;
			});
			//确定按钮
			html += '<div class="form-group"><button class="btn btn-primary">确定</button></div>';
			theadFilter = $(`<div class="container-row form-inline thead-filter" style="display:none;">${html}</div>`);
			theadFilter.find('input').each((i, e) => {
				$(e).on('click', () => {
					this.data.thead[$(e).val()].show = $(e).prop('checked') ? 1 : 0;
				});
			});
			theadFilter.find('button').on('click', () => {this.renderListData()});
			$('#' + this.id).append(theadFilter);
		},
		/**
		 * 设置表格动作
		 * @param cfg
		 * [
		 *     {
		 *         key: '',//key
		 *         name: '',//列名
		 *         class: '',//样式
		 *         click: '',//点击事件(匿名函数无法调用page的数据)
		 *     },xN
		 * ]
		 */
		setActions: function(cfg){
			Object.keys(cfg).forEach(i => {
				let info = cfg[i];
				this.data.actions[info.key] = {
					name: info.name,
					class: info.class ? info.class : '',
					click: info.click ? info.click : '',
				};
			});
		},
		/**
		 * 渲染按钮组(页面初始化后删掉)
		 * @param cfg
		 * [
		 *     {
		 *         name: '',//名称
		 *         class: '',//样式
		 *         click: '',//点击事件(匿名函数无法调用page的数据)
		 *     },xN
		 * ]
		 */
		renderBtnGroup: function (cfg) {
			let container = $('<div class="container-row form-inline"></div>');
			Object.keys(cfg).forEach(i => {
				let group = $('<div class="form-group"></div>')
				let btn = $(`<button class="btn btn-default ${cfg[i].class}">${cfg[i].name}</button>`);
				if (cfg[i].click) {
					btn.on('click', () => this[cfg[i].click]());
				}
				group.append(btn);
				container.append(group);
			});
			$('#' + this.id).append(container);
		},
		/**
		 * 渲染表单(页面初始化后删掉)
		 * @param cfg
		 * [
		 *     {
		 *         key: '',//表单元素的key
		 *         name: '',//表单元素的名字
		 *         type: '',//表单类型[select/hidden/text/textarea/password/radio/checkbox/number/tel/timer/html/files]
		 *         placeholder: '',//描述文字
		 *         options: {//选项(仅select/radio/checkbox类型用到)
		 *         		value: text, //选项值与提示文字键值对
		 *         },
		 *         unit: '',//单位描述(空表示没有单位)
		 *         value: '',//值(checkbox/files类型为数组)
		 *         default: '',//默认值(checkbox/files类型为数组)
		 *         regex: '',//检验值的正则表达式(空表示不校验)
		 *         tips: '',//校验不通过时的提示信息
		 *         format: '',//时间格式(仅timer类型用到)
		 *         column: 0,//所占列数(一行12列)
		 *     },xN
		 * ]
		 */
		renderForm: function (cfg) {
			let form = $('<form class="container-row"></form>');
			let colNumOnRow = 0;//一行的列数
			let lastIdx = cfg.length - 1;//最后一个配置的索引
			let rowBox = $('<div class="row"></div>');
			Object.keys(cfg).forEach(i => {
				let colBox,
					html = '',
					info = cfg[i];
				//校正参数
				info.name = info.hasOwnProperty('name') ? info.name : '';
				info.type = info.hasOwnProperty('type') ? info.type : 'text';
				info.placeholder = info.hasOwnProperty('placeholder') ? info.placeholder : '';
				info.options = info.hasOwnProperty('options') ? info.options : {};
				info.unit = info.hasOwnProperty('unit') ? info.unit : '';
				info.default = info.hasOwnProperty('default') ? info.default : '';
				info.regex = info.hasOwnProperty('regex') ? info.regex : '';
				info.tips = info.hasOwnProperty('tips') ? info.tips : '';
				info.format = info.hasOwnProperty('format') ? info.format : '';
				info.column = info.hasOwnProperty('column') ? info.column : 12;
				if(info.type == 'checkbox' && !Array.isArray(info.default)){
					if(info.default !== ''){
						info.default = [info.default.toString()];
					}
					else{
						info.default = [];
					}
				}
				info.value = info.default;
				//写到data的表单映射
				this.data.form[info.key] = {
					type: info.type,
					default: info.default,
					value: info.value,
					regex: info.regex,
					tips: info.tips,
				}
				//隐藏输入框只需要记录数据，不需要创建表单元素
				if(info.type == 'hidden'){
					return ;
				}
				//单选和多选
				if(['radio','checkbox'].indexOf(info.type) >= 0){
					Object.keys(info.options).forEach(key => {
						let checked = '';
						if((info.type == 'radio' && info.default == key)
							|| (info.type == 'checkbox' && info.default.indexOf(key) >= 0)){
							checked = 'checked="checked"';
						}
						html += `<label>
                                    <input type="${info.type}" name="${info.key}" value="${key}" ${checked}>
                                    ${info.options[key]}
                                    </label>`;
					});
					html = `<div class="form-multiselect-row">${html}</div>`;
				}
				//文本框和富文本
				else if(['textarea','html'].indexOf(info.type) >= 0){
					let sign = info.type == 'html' ? 'editor="1"' : '';
					html = `<textarea name="${info.key}" class="form-control" placeholder="${info.placeholder}" ${sign}>${info.value}</textarea>`;
				}
				//下拉选择框
				else if(info.type == 'select'){
					Object.keys(info.options).forEach(key => {
						let selected = info.default == key ? 'selected="selected"' : '';
						html += `<option value="${key}" ${selected}>${info.options[key]}</option>`;
					});
					html = `<select name="${info.key}" class="form-control">${html}</select>`;
				}
				//input输入框
				else{
					let appendHtml = '',
						readOnly = info.type == 'timer' ? 'readOnly=true' : '';
					if(info.unit){
						appendHtml = `<div class="input-group-append">
                                                <span class="input-group-text">${info.unit}</span>
                                            </div>`;
					}
					html = `<div class="input-group">
                                    <input class="form-control" type="${info.type}" name="${info.key}"
                                    placeholder="${info.placeholder}" value="${info.value}" ${readOnly}>
                                     ${appendHtml}
                                </div>`;
				}
				//创建列对象
				let colNum = info.column > 0 ? info.column : 12;
				colBox = $(`<div class="col-sm-${colNum}">
                                    <label>${info.name}</label>
                                    ${html}
                                </div>`);
				//绑定表单元素的change事件
				colBox.find(`[name=${info.key}]`).each((j, e) => {
					$(e).on('change', () => {
						let value = $(e).val();
						if(info.type == 'checkbox'){
							if($(e).prop('checked')){
								this.data.form[info.key].value.push(value);
							}
							else{
								this.data.form[info.key].value.splice(
									this.data.form[info.key].value.indexOf(value), 1);
							}
						}
						else{
							this.data.form[info.key].value = value;
						}
					})
				});
				//初始化时间选择器
				if(info.type == 'timer'){
					this.timerBasicParam.minView = 2;
					this.timerBasicParam.format = info.format ? info.format : 'yyyy-mm-dd';
					if(/h/i.test(this.timerBasicParam.format)){
						this.timerBasicParam.minView = 1;
					}
					colBox.find('input').datetimepicker(this.timerBasicParam);
				}
				//看一下应该放到哪一行
				colNumOnRow += colNum;
				if(colNumOnRow <= 12){
					rowBox.append(colBox);
				}
				if(colNumOnRow >= 12 || i == lastIdx){
					form.append(rowBox);
					rowBox = $('<div class="row"></div>');
					if(colNumOnRow > 12){
						rowBox.append(colBox);
						colNumOnRow = colNum;
					}
					else{
						colNumOnRow = 0;
					}
				}
				if(colNumOnRow >= 12 && i == lastIdx){
					form.append(rowBox);
				}
			});
			//提交和取消按钮
			let actions = $('<div class="row">' +
				'<div class="col-12">' +
				'<button name="submit" class="btn btn-success">提交</button>' +
				'<button name="cancel" class="btn btn-default">取消</button>' +
				'</div>' +
				'</div>');
			actions.find('[name=cancel]').on('click', () => {
				this.hideForm();
			});
			form.append(actions);
			form.on('submit', (e) => {
				e.preventDefault();
				this.submitForm();
			});
			$('#' + this.id).append(form);
			//初始化富文本
			$('#' + this.id).find('[editor=1]').each((i, e) => {
				$(e).summernote({
					lang: 'zh-CN',
					height: 150,
					callbacks: {
						onChange: (contents) => {
							this.data.form[$(e).attr('name')].value = contents;
						}
					}
				});
			});
		},
		/**
		 * 渲染过滤器(页面初始化后删掉)
		 * @param cfg
		 * [
		 *     {
		 *         key: '',//key
		 *         name: '',//名字
		 *         type: 'text',//类型[select/text/timer/bool/button]
		 *         placeholder: '',//描述文字
		 *         options: {//选项(仅select可用)
		 *         		value: text, //选项值与提示文字键值对
		 *         },
		 *         value: '',//值
		 *         format: '',//时间格式(仅timer类型可用)
		 *         click: 0,//点击事件(仅button类型可用)
		 *         class: '',//样式名(bool类型默认flase使用btn-default,true使用btn-success)
		 *     },xN
		 * ]
		 */
		renderFilter: function(cfg){
			let filter = $('<div class="container-row form-inline"></div>');
			Object.keys(cfg).forEach(i => {
				let html = '',
					label = '',
					group = '',
					info = cfg[i];
				//校正参数
				info.name = info.hasOwnProperty('name') ? info.name : '';
				info.type = info.hasOwnProperty('type') ? info.type : 'text';
				info.placeholder = info.hasOwnProperty('placeholder') ? info.placeholder : '';
				info.options = info.hasOwnProperty('options') ? info.options : {};
				info.value = info.hasOwnProperty('value') ? info.value : '';
				info.format = info.hasOwnProperty('format') ? info.format : '';
				info.click = info.hasOwnProperty('click') ? info.click : '';
				info.class = info.hasOwnProperty('class') ? info.class : '';
				//写到data的表单映射
				this.data.filter[info.key] = {
					type: info.type,
					value: info.value,
				}
				//下拉选择框
				if(info.type == 'select'){
					Object.keys(info.options).forEach(key => {
						let selected = info.value == key ? 'selected="selected"' : '';
						html += `<option value="${key}" ${selected}>${info.options[key]}</option>`;
					});
					html = `<select name="${info.key}" class="form-control">${html}</select>`;
				}
				else if(['text','timer'].indexOf(info.type) >= 0){
					let readOnly = info.type == 'timer' ? 'readOnly=true' : '';
					html = `<input type="text" class="form-control" name="${info.key}"
                                    placeholder="${info.placeholder}" value="${info.value}" ${readOnly}>`;
				}
				else{
					html = `<button name="${info.key}" class="btn btn-default ${info.class}">${info.name}</button>`;
				}
				if(info.name && ['bool','button'].indexOf(info.type) < 0){
					label = `<label>${info.name}</label>`;
				}
				group = $(`<div class="form-group">${label}${html}</div>`);
				//绑定事件
				if(info.type == 'bool'){//布朗类型
					group.find(`[name=${info.key}]`).on('click', e => {
						if(info.value){
							$(e.target).removeClass('btn-success');
						}
						else{
							$(e.target).addClass('btn-success');
						}
						info.value = info.value ? 0 : 1;
					});
				}
				else if(info.type == 'button'){//按钮
					group.find(`[name=${info.key}]`).on('click', () => this[info.click]());
				}
				else{//其他
					group.find(`[name=${info.key}]`).on('change', e => {
						this.data.filter[info.key].value = e.target.value;
					});
				}
				//初始化时间选择器
				if(info.type == 'timer'){
					this.timerBasicParam.minView = 2;
					this.timerBasicParam.format = info.format ? info.format : 'yyyy-mm-dd';
					if(/h/i.test(this.timerBasicParam.format)){
						this.timerBasicParam.minView = 1;
					}
					group.find('input').datetimepicker(this.timerBasicParam);
				}
				filter.append(group);
			});
			//搜索按钮
			let submit = $('<div class="form-group">' +
				'<button name="submit" class="btn btn-primary">搜索</button>' +
				'</div>');
			submit.find('button').on('click', () => {this.submitFilter()});
			filter.append(submit);
			$('#' + this.id).append(filter);
		},
		/**
		 * 渲染列表数据
		 */
		renderListData: function(){
			switch (this.renderType) {
				case 1:
					this.renderGrid();
					break;
				case 2:
					this.renderTree();
					break;
				default:
					this.renderTable();
			}
		},
		/**
		 * 渲染表格
		 */
		renderTable: function(){
			if(!$('#' + this.id).find('table').length){
				$('#' + this.id).append(
					$('<div class="table-responsive">' +
						'<table class="table table-striped">' +
						'<thead>' +
						'<tr></tr>' +
						'</thead>' +
						'<tbody></tbody>' +
						'</table>' +
						'</div>'));
			}
			let table = $('#' + this.id).find('table');
			let keys = [];//本次渲染时要显示的key
			let actKeys = Object.keys(this.data.actions);
			//thead
			let thead = '';
			Object.keys(this.data.thead).forEach(key => {
				if(this.data.thead[key].show){
					thead += `<th>${this.data.thead[key].name}</th>`;
					keys.push(key);
				}
			});
			thead += '<th>操作</th>';
			table.find('thead tr').html(thead);
			//tbody
			let tbody = table.find('tbody');
			tbody.html('');
			Object.keys(this.data.list).forEach(i => {
				let tr = $('<tr></tr>');
				let td = $('<td></td>');
				//数据列
				keys.forEach(key => {
					let value = this.data.list[i][this.data.keys.indexOf(key)];
					if(key == 'thumb'){
						value = `<img src="${value}" />`;
					}
					tr.append($(`<td>${value}</td>`));
				});
				//操作列
				actKeys.forEach(key => {
					let act = this.data.actions[key];
					let btn = $(`<button name="${key}" class="btn btn-sm ${act.class}">${act.name}</button>`);
					//绑定事件
					btn.on('click', () => {
						this.data.listIdx = i;
						if(act.click){
							this[act.click]();
						}
					});
					td.append(btn);
				});
				tr.append(td);
				tbody.append(tr);
			});
			this.renderPagination();
		},
		/**
		 * 渲染栅格
		 */
		renderGrid: function(){
			if(!$('#' + this.id).find('grid').length){
				$('#' + this.id).append(
					$('<div class="container-row"><grid class="row"></grid></div>'));
			}
			let grid = $('#' + this.id).find('grid').html('');
			let keys = [];//本次渲染时要显示的key
			let actKeys = Object.keys(this.data.actions);
			Object.keys(this.data.thead).forEach(key => {
				if(this.data.thead[key].show){
					keys.push(key);
				}
			});
			Object.keys(this.data.list).forEach(i => {
				let cell = $(`<div class="col-sm-${this.gridWidth}"></div>`);
				let cellLining = $('<div class="grid-cell-linning"></div>')
				//数据列
				keys.forEach(key => {
					let value = this.data.list[i][this.data.keys.indexOf(key)];
					if(key == 'thumb'){
						value = `<img src="${value}" />`;
					}
					cellLining.append($(`<p>${value}</p>`));
				});
				//操作列
				actKeys.forEach(key => {
					let act = this.data.actions[key];
					let btn = $(`<button name="${key}" class="btn btn-sm ${act.class}">${act.name}</button>`);
					//绑定事件
					btn.on('click', () => {
						this.data.listIdx = i;
						if(act.click){
							this[act.click]();
						}
					});
					cellLining.append(btn);
				});
				cell.append(cellLining);
				grid.append(cell);
			});
			this.renderPagination();
		},
		/**
		 * 渲染树形结构
		 */
		renderTree: function(){
			if(!$('#' + this.id).find('tree').length){
				$('#' + this.id).append(
					$('<div class="container-row"><tree></tree></div>'));
			}
			$('#' + this.id).find('tree').html('').append(this.getTreeElement());
		},
		/**
		 * 获取树形结构
		 * @param data
		 * [
		 * 		id=>{
		 * 		 	title: 标题,
		 * 		 	pid: 上级id,
		 * 		 	其他字段(编辑时传递给表单)
		 * 		}
		 * ]
		 */
		getTreeElement: function(pid){
			let tree = $('<ul></ul>');
			let actKeys = Object.keys(this.data.actions);
			pid = pid ? pid : 0;
			Object.keys(this.data.list).forEach(i => {
				if(this.data.list[i][this.data.keys.indexOf('pid')] == pid){
					let li = $(`<li><p><span>${this.data.list[i][this.data.keys.indexOf('title')]}</span></p></li>`);
					actKeys.forEach(key => {
						let act = this.data.actions[key];
						let btn = $(`<button name="${key}" class="btn btn-sm ${act.class}">${act.name}</button>`)
						//绑定事件
						btn.on('click', () => {
							this.data.listIdx = i;
							if(act.click){
								this[act.click]();
							}
						});
						li.find('p').append(btn);
					});
					li.append(this.getTreeElement(i));
					tree.append(li);
				}
			});
			return tree.find('li').length ? tree : '';
		},
		/**
		 * 渲染分页器
		 */
		renderPagination: function(){
			let maxPage = Math.ceil(this.data.recordNum / this.data.onPageNum);
			let html = this.getPageHtml(this.data.page, '', 'active');
			for(let i=1; i<=this.data.pageSideNum; i++){
				html = this.getPageHtml(this.data.page - i) + html + this.getPageHtml(this.data.page + i);
			}
			if(this.data.page - this.data.pageSideNum > 1){
				html = this.getPageHtml(1, '...', 'disabled') + html;
				html = this.getPageHtml(1) + html;
			}
			if(this.data.page > 1){
				html = this.getPageHtml(this.data.page - 1, '<') + html;
			}
			if(this.data.page + this.data.pageSideNum < maxPage){
				html += this.getPageHtml(maxPage, '...', 'disabled');
				html += this.getPageHtml(maxPage);
			}
			if(this.data.page < maxPage){
				html += this.getPageHtml(this.data.page + 1, '>');
			}
			html = '<ul class="pagination clearfix">' + html + '</ul>\n';
			tagName = 'table';
			switch(this.renderType){
				case 1:
					tagName = 'grid';
					break;
				case 2:
					tagName = 'tree';
					break;
			}
			$(`#${this.id} ${tagName}`).nextAll().remove();
			$(`#${this.id} ${tagName}`).closest('div').append($(html));
		},
		/**
		 * 获取页码Html
		 */
		getPageHtml: function(page, pageText, className){
			if(page < 1 || page > Math.ceil(this.data.recordNum / this.data.onPageNum)){
				return '';
			}
			pageText = pageText ? pageText : page;
			className = className ? className : '';
			return '<li class="page-item ' + className +'">' +
				'<a class="page-link" data-page="' + page + '" href="#">' + pageText + '</a>' +
				'</li>';
		},
	},
};
/**
 * 侧边栏
 * 主要包括基本参数设置及构建元素后的初始化
 */
const Sidebar = {
	sidebarHeight: 0,//侧边栏高度
	contentHeight: 0,//内容高度
	scrollBarHeight: 0,//滚动条高度
	sliderHeight: 0,//滑块高度
	ratio: 1,//内容可见部分的比例
	timer: null,//延迟变量，用来确定何时停止滚动
	scrollDown: true,//是否向下滚动(即正数)
	scrollTimes: 0,//滚动次数(反向滚动时清零)
	step: 0,//每次滚动的固定幅度
	contentInitialPosition: 0,//内容的初始位置
	sliderInitialPosition: 0,//滑块的初始位置
	startY: 0,//Y轴的初始位置
	lastY: 0,//Y轴的最后位置
	timeStamp: 0,//初始时间戳
	init: function(){
		let _this = this;
		this.sidebarHeight = $('#sidebar').height();
		this.contentHeight = $('#sidebarContent').height();
		//高度值再额外加上内容的上下内边距才能完全展现
		let paddingTop = parseFloat($('#sidebarContent').css("padding-top"));
		let paddingBottom = parseFloat($('#sidebarContent').css("padding-bottom"));
		this.contentHeight += paddingTop + paddingBottom;
		this.scrollBarHeight = $('#sideScrollBar').height();
		this.step = this.sidebarHeight / 10;//设定初始滚动幅度为可见高的1/10
		if(this.sidebarHeight < this.contentHeight){
			this.ratio = this.sidebarHeight / this.contentHeight;
			this.ratio = this.ratio > 1 ? 1 : this.ratio;
			this.sliderHeight = this.ratio * this.scrollBarHeight;
			$('#sideScrollBarSlider').height(this.sliderHeight).show();
		}
		else{
			this.sliderHeight = 0;
			$('#sideScrollBarSlider').hide();
		}
		//自动绑定相关事件
		$('#sidebarContent').on('wheel', function(){
			_this.webScroll();
		})
			.css('transition', '.2s');//丝一般顺滑，不能直接写到样式，否则移动端会有异常
		$('#sideScrollBarSlider').on('mousedown', function(){
			_this.webSliderMouseDown();
		})
			.css('transition', '.2s');//丝一般顺滑，不能直接写到样式，否则移动端会有异常
		$(window).on('mouseup', function(){
			$(window).off('mousemove selectstart');
		});
	},
	//web端的滚动事件
	webScroll: function(){
		if(this.sliderHeight > 0){
			clearTimeout(this.timer);
			let e = window.event;
			let wheelValue = e.wheelDelta ? e.wheelDelta : e.detail;
			if(this.scrollDown != wheelValue < 0){
				this.scrollDown = wheelValue < 0;
				this.scrollTimes = 0;
			}
			let currStep = this.step * (1 + this.scrollTimes * 0.5);
			let marginTop = parseFloat($('#sidebarContent').css('margin-top'))
			marginTop += this.scrollDown ? -currStep : currStep;
			this.changeContentMarginTop(marginTop);
			this.scrollTimes++;
			//停止连续滚动时清0滚动次数
			let _this = this;
			this.timer = setTimeout(function(){
				_this.scrollTimes = 0;
			}, 300);
		}
	},
	//web端滑块位置鼠标按下
	webSliderMouseDown: function(){
		let _this = this;
		this.sliderInitialPosition = parseFloat($('#sideScrollBarSlider').css('margin-top'));
		this.startX = window.event.pageX;
		$(window).off('mousemove').on('mousemove', function(){
			_this.webSliderMouseMove();
		})
		//鼠标按下时禁掉文本选择，以免在拖动时选中文本，影响效果
			.on('selectstart', function(){
				return false;
			})
	},
	//web端滑块位置鼠标移动
	webSliderMouseMove: function(){
		this.changeSliderMarginTop(this.sliderInitialPosition + window.event.pageY - this.startY);
	},
	//改变内容的外边距
	changeContentMarginTop: function(marginTop){
		if(marginTop > 0){
			marginTop = 0;
		}
		else if(- marginTop + this.sidebarHeight > this.contentHeight){
			marginTop = - this.contentHeight + this.sidebarHeight;
		}
		$('#sideScrollBarSlider').css('margin-top', -marginTop * this.ratio + 'px');
		$('#sidebarContent').css('margin-top', marginTop + 'px');
	},
	//改变滑块的外边距
	changeSliderMarginTop: function(marginTop){
		if(marginTop < 0){
			marginTop = 0;
		}
		else if(marginTop + this.sliderHeight > this.scrollBarHeight){
			marginTop = this.scrollBarHeight - this.sliderHeight;
		}
		$('#sideScrollBarSlider').css('margin-top', marginTop + 'px');
		$('#sidebarContent').css('margin-top', -marginTop / this.ratio + 'px');
	}
}

/**
 * 遮挡层组件
 */
const Backdrop = {
	/**
	 * 初始化
	 */
	init: function(){
		let backdropObj = document.createElement('div');
		backdropObj.id = 'backdrop';
		//加载中图标
		let loading = $('<div id="loading">\n' +
			'<div class="loading-container">\n' +
			'<div class="circle1"></div>\n' +
			'<div class="circle2"></div>\n' +
			'<div class="circle3"></div>\n' +
			'<div class="circle4"></div>\n' +
			'</div>\n' +
			'<div class="loading-container">\n' +
			'<div class="circle1"></div>\n' +
			'<div class="circle2"></div>\n' +
			'<div class="circle3"></div>\n' +
			'<div class="circle4"></div>\n' +
			'</div>\n' +
			'<div class="loading-container">\n' +
			'<div class="circle1"></div>\n' +
			'<div class="circle2"></div>\n' +
			'<div class="circle3"></div>\n' +
			'<div class="circle4"></div>\n' +
			'</div>\n' +
			'</div>')[0];
		backdropObj.append(loading);
		$('body').append(backdropObj);
		return this;
	},
	/**
	 * 显示加载中提示
	 */
	showLoading: function(){
		$('#loading').show();
		$('#backdrop').show();
	},
	/**
	 * 隐藏加载中提示
	 */
	hideLoading: function(){
		$('#loading').hide();
		$('#backdrop').hide();
	},
}

const Dialog = {
	init: function(){
		$('body').append('<div id="dialog" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="fcmDialogTitle" aria-hidden="true">' +
			'<div class="modal-dialog">' +
			'<div class="modal-content">' +
			'<div class="modal-header">' +
			'<span class="modal-title"></span>' +
			'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
			'</div>' +
			'<div class="modal-body"></div>' +
			'<div class="modal-footer">' +
			'<button name="cancel" type="button" class="btn btn-default" data-dismiss="modal">取消</button>' +
			'<button name="confirm" type="button" class="btn btn-primary">确定</button>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>');
	},
	/**
	 * 显示对话框
	 * @param {Object} args 样式参数
	 * {
	 *     title: 对话框标题
	 *     message: 对话框提示信息
	 *     btnyes: 是否显示确认按钮
	 *     btnno: 是否显示取消按钮
	 *     confirm: 确认按钮的回调函数
	 *     cancel: 取消按钮的回调函数
	 * }
	 */
	show: function(args){
		$('#dialog .modal-title').html(args.title ? args.title : '系统提示');
		$('#dialog .modal-body').html(args.message ? args.message : '暂无明细信息');
		if(args.hasOwnProperty('btnyes') && !args.btnyes){
			$('#dialog [name=confirm]').hide();
		}
		else{
			$('#dialog [name=confirm]').show();
		}
		if(args.hasOwnProperty('btnno') && !args.btnno){
			$('#dialog [name=cancel]').hide();
		}
		else{
			$('#dialog [name=cancel]').show();
		}
		//绑定默认的点击事件
		$('#dialog [name=confirm],#dialog [name=cancel]').off('click').on('click', function(){
			$('#dialog').modal('hide');
		});
		if(args.confirm){
			this.confirm(args.confirm);
		}
		if(args.cancel){
			this.cancel(args.cancel);
		}
		$('#dialog .modal-dialog').css('top', '18%');
		$('#dialog').modal('show');
		return this;
	},
	/**
	 * 绑定确定按钮的回调函数
	 * @param {Object} callBack
	 */
	confirm: function(callBack){
		$('#dialog [name=confirm]').off('click').on('click', function(){
			callBack();
			$('#dialog').modal('hide');
		});
		return this;
	},
	/**
	 * 绑定取消按钮的回调函数
	 * @param {Object} callBack
	 */
	cancel: function(callBack){
		$('#dialog [name=cancel]').off('click').on('click', function(){
			callBack();
			$('#dialog').modal('hide');
		});
		return this;
	},
}


