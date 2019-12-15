const App = {
	// appName: '4CM',
	// loginApi: '/4cm/login',
	// logoutApi: '/4cm/logout',
	// permissionApi: '/4cm/permission',
	// pageConfigDomain: 'http://s.4cm.com/',//页面配置的域名
	init: function(param){
		let self = this;
		Object.keys(param).forEach(function(key){
			self[key] = param[key];
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
		let self = this;
		$('#loginBox').on('submit', function(){
			let account = $('#loginBox [name=account]').val();
			let pwd = $('#loginBox [name=password]').val();
			Backdrop.showLoading();
			$.post(
				self.loginApi,
				{
					account: account,
					password: pwd
				},
				function(res){
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
						self.initSidebar();
					}
				}
			);
			return false;
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
		let self = this;
		$.get(
			self.permissionApi,
			function(res){
				if(res.errno){
					if(res.overdue){
						self.showLoginBox();
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
					$('#logout').on('click', function(){
						$.get(
							self.logoutApi,
							function(){
								self.showLoginBox();
							}
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
					$('#sidebarContent').on('click', '.nav-business-item', function(){
						let mod = $(this).attr('mod');
						let biz = $(this).attr('biz');
						let pkey = `${mod}_${biz}`;
						//已经加载过页面配置
						if($('#'+pkey).length){
							$('#'+pkey).show().siblings().hide();
						}
						else{//未加载过
							Backdrop.showLoading();
							$.get(
								`${self.pageConfigDomain}/app/${self.appName}/page/${mod}/${biz}/script.js`,
								function(cfg){
									eval(`config = ` + cfg);
									$('#container').append(`<div id="${pkey}"></div>`);
									Object.keys(config).forEach(function(key){
										let cfg = config[key];
										let ckey = pkey + '_' + key;
										$('#'+pkey).append(`<div id="${ckey}" class="container-row"></div>`);
										switch(key.toLowerCase()){
											case 'form':
												cfg.id = ckey;
												Form.init(cfg);
												break;
											case 'filter':
												cfg.id = ckey;
												Filter.init(cfg);
												break;
											case 'pagination':
												cfg.id = ckey;
												Pagination.init(cfg);
												break;
											case 'table':
												cfg.id = ckey;
												Table.init(cfg);
												break;
										}
									});
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

/**
 * 基于bootstrap4的筛选器组件
 */
const Filter = {
	id: '',//筛选器ID
	apiUrl: '',//数据接口
	elements: {//过滤器表单元素(键名和表单元素ID一一对应)
		// elementName: {
		//     name: '',//表单元素的标题
		//     type: 'text',//表单类型[select/text/timer/button]
		//     placeholder: '',//描述文字
		//     options: {//选项(仅select类型用到)
		//         value: text,//选项值与提示文字键值对
		//     },
		//     value: '',//值(checkbox/files类型为数组)
		//     regex: '',//检验值的正则表达式(空表示不校验)
		//     tips: '',//校验不通过时的提示信息
		//     className: '',//样式名(仅button类型可用)
		//	   click: '',//点击事件(仅button类型可用)
		//     format: '',//时间格式(仅timer类型可用)
		// },
	},
	baseTimerParam: {//基本的时间选择器参数(基本不需要改变)
		language:  'zh-CN',
		weekStart: 1,
		todayBtn:  1,
		todayHighlight: 1,
		autoclose: 1,
		maxView: 4,
		startView: 2,
		// format: 'yyyy-mm-dd',
		// minView: 1,
	},
	/**
	 * 初始化表单对象
	 */
	init: function(param){
		let self = this;
		this.apiUrl = param.apiUrl;
		this.id = param.id;
		if(param.elements){
			Object.keys(param.elements).forEach(function(key){
				self.elements[key] = {
					name: param.elements[key].hasOwnProperty('name') ? param.elements[key].name : '',
					type: param.elements[key].hasOwnProperty('type') ? param.elements[key].type : 'text',
					placeholder: param.elements[key].hasOwnProperty('placeholder') ? param.elements[key].placeholder : '',
					options: param.elements[key].hasOwnProperty('options') ? param.elements[key].options : [],
					value: param.elements[key].hasOwnProperty('value') ? param.elements[key].value : '',
					regex: param.elements[key].hasOwnProperty('regex') ? param.elements[key].regex : '',
					tips: param.elements[key].hasOwnProperty('tips') ? param.elements[key].tips : '',
					className: param.elements[key].hasOwnProperty('className') ? param.elements[key].className : '',
					click: param.elements[key].hasOwnProperty('click') ? param.elements[key].click : '',
					format: param.elements[key].hasOwnProperty('format') ? param.elements[key].format : '',
				}
			});
		}
		//自动加一个搜索按钮进去
		this.searchBtnName = 'searchBtn';
		this.elements[this.searchBtnName] = {
			name: '',
			type: 'button',
			placeholder: '',
			options: [],
			value: '搜索',
			regex: '',
			tips: '',
			className: 'btn-primary',
			click: this.search
		}
		this.create();
	},
	/**
	 * 创建过滤器
	 */
	create: function(){
		let self = this;
		$('#'+this.id).html('');
		if(!$('#'+this.id).hasClass('form-inline')){
			$('#'+this.id).addClass('form-inline');
		}
		//表单元素
		Object.keys(this.elements).forEach(function(key){
			let info = self.elements[key];
			if(info.name){
				let label = document.createElement('label');
				label.innerHTML = info.name;
				$('#'+self.id).append(label);
			}
			let groupObj = document.createElement('div');
			groupObj.className = 'form-group';
			if(info.type == 'select'){//下拉框
				let eleObj = document.createElement('select');
				eleObj.name = key;
				eleObj.className = 'form-control';
				Object.keys(info.options).forEach(function(optKey){
					let option = document.createElement('option');
					option.value = optKey;
					option.innerHTML = info.options[optKey];
					if(info.value === optKey){
						option.selected = true;
					}
					eleObj.append(option);
				});
				groupObj.append(eleObj);
			}
			//文本框和时间选择器都用input
			else if(['text','timer'].indexOf(info.type) >= 0){
				let eleObj = document.createElement('input');
				eleObj.name = key;
				eleObj.type = 'text';
				eleObj.className = 'form-control';
				eleObj.value = info.value;
				eleObj.placeholder = info.placeholder;
				if(info.type == 'timer'){
					eleObj.readOnly = true;
				}
				groupObj.append(eleObj);
			}
			else if(info.type == 'button'){
				let eleObj = document.createElement('button');
				eleObj.name = key;
				eleObj.className = 'btn btn-default ' + info.className;
				eleObj.innerHTML = info.value;
				groupObj.append(eleObj);
				//绑定点击事件
				if(info.click){
					$('#'+self.id).on('click', '[name='+key+']', function(){
						if(key == self.searchBtnName){
							self.search();
						}
						else{
							info.click();
						}
					});
				}
			}
			$('#'+self.id).append(groupObj);
			//绑定表单change事件
			$('#'+self.id).on('change', '[name='+key+']', function(){
				self.elements[key].value = $(this).val();
			});
			//时间选择器要绑一下控件
			if(info.type == 'timer'){
				self.baseTimerParam.minView = 2;
				self.baseTimerParam.format = info.format ? info.format : 'yyyy-mm-dd';
				if(/h/i.test(self.baseTimerParam.format)){
					self.baseTimerParam.minView = 1;
				}
				$('[name='+key+']').datetimepicker(self.baseTimerParam);
			}
		});
	},
	search: function(){
		let self = this;
		let formData = {};
		Object.keys(this.elements).forEach(function(key){
			formData[key] = self.elements[key].value;
		})
		console.log(formData)
	}
}

/**
 * 基于bootstrap4的表单组件
 * TODO 待补充files相关功能(独立做一个上传功能，表单这里不提供上传功能，只能选择已上传的图片)
 */
const Form = {
	id: '',//表单ID
	apiUrl: '',//保存数据接口
	elements:{//表单元素(键名和表单元素ID一一对应)
		// elementName: {
		//     name: '',//表单元素的名字
		//     type: 'text',//表单类型[select/text/textarea/password/radio/checkbox/number/tel/timer/html/files]
		//     placeholder: '',//描述文字
		//     options: {//选项(仅select/radio/checkbox类型用到)
		//         // value: text,//选项值与提示文字键值对
		//     },
		//     unit: '',//单位描述(空表示没有单位)
		//     value: '',//值(checkbox/files类型为数组)
		//     default: '',//默认值(checkbox/files类型为数组)
		//     regex: '',//检验值的正则表达式(空表示不校验)
		//     tips: '',//校验不通过时的提示信息
		//     format: '',//时间格式(仅timer类型用到)
		//     column: 0,//所占列数(一行12列)
		// },
	},
	baseTimerParam: {//基本的时间选择器参数(基本不需要改变)
		language:  'zh-CN',
		weekStart: 1,
		todayBtn:  1,
		todayHighlight: 1,
		autoclose: 1,
		maxView: 4,
		startView: 2,
		// format: 'yyyy-mm-dd',
		// minView: 1,
	},
	/**
	 * 初始化表单对象
	 */
	init: function(param){
		let self = this;
		this.apiUrl = param.apiUrl;
		this.id = param.id;
		if(param.elements){
			Object.keys(param.elements).forEach(function(key){
				self.elements[key] = {
					name: param.elements[key].hasOwnProperty('name') ? param.elements[key].name : '',
					type: param.elements[key].hasOwnProperty('type') ? param.elements[key].type : 'text',
					placeholder: param.elements[key].hasOwnProperty('placeholder') ? param.elements[key].placeholder : '',
					options: param.elements[key].hasOwnProperty('options') ? param.elements[key].options : [],
					unit: param.elements[key].hasOwnProperty('unit') ? param.elements[key].unit : '',
					//value: param.elements[key].hasOwnProperty('value') ? param.elements[key].value : '',
					default: param.elements[key].hasOwnProperty('default') ? param.elements[key].default : '',
					regex: param.elements[key].hasOwnProperty('regex') ? param.elements[key].regex : '',
					tips: param.elements[key].hasOwnProperty('tips') ? param.elements[key].tips : '',
					format: param.elements[key].hasOwnProperty('format') ? param.elements[key].format : '',
					column: param.elements[key].hasOwnProperty('column') ? param.elements[key].column : 0,
				}
				//多选项的值和默认值自动转换为数组
				if(self.elements[key].type == 'checkbox' && !Array.isArray(self.elements[key].default)){
					let _default = self.elements[key].default;
					self.elements[key].default = [];
					if(_default !== ''){
						self.elements[key].default.push(_default.toString());
					}
				}
				//值和默认值保持一致
				self.elements[key].value = self.elements[key].default;
			});
		}
		this.create();
	},
	/**
	 * 创建行元素
	 */
	createRowElement: function(){
		let obj = document.createElement('div');
		obj.className = 'row';
		return obj;
	},
	/**
	 * 创建表单
	 */
	create: function(){
		let self = this;
		$('#'+this.id).html('');
		//表单元素
		let eleKeys = Object.keys(this.elements);
		let lastEleKey = eleKeys[eleKeys.length - 1];//最后一个元素的key
		let colNumOnRow = 0;//一行的列数
		let rowBox = this.createRowElement();
		eleKeys.forEach(function(key){
			let info = self.elements[key];
			let colTitle = document.createElement('label');
			colTitle.innerHTML = info.name;
			let colBox = document.createElement('div');
			let colNum = info.column > 0 ? info.column : 12;
			colBox.className = 'col-sm-'+colNum;
			colBox.append(colTitle);
			let eleObj;
			//input
			if(['text','password','radio','checkbox','number','tel','timer'].indexOf(info.type) >= 0){
				//具有多个选项
				if(['radio','checkbox'].indexOf(info.type) >= 0){
					let optKeys = Object.keys(info.options);
					if(optKeys.length){
						let optBoxObj = document.createElement('div');
						optBoxObj.className = 'form-multiselect-row';
						optKeys.forEach(function(optKey){
							let label = document.createElement('label');
							label.innerHTML = info.options[optKey];
							eleObj = document.createElement('input');
							eleObj.type = info.type;
							eleObj.name = key;
							eleObj.value = optKey;
							if(Array.isArray(info.default)){
								if(info.default.indexOf(optKey) >= 0){
									eleObj.checked = true;
								}
							}
							else if(info.default == optKey){
								eleObj.checked = true;
							}
							label.prepend(eleObj);
							optBoxObj.append(label);
						});
						colBox.append(optBoxObj);
					}
				}
				//唯一表单元素
				else{
					eleObj = document.createElement('input');
					eleObj.type = info.type;
					eleObj.name = key;
					eleObj.value = info.default;
					eleObj.placeholder = info.placeholder;
					eleObj.className = 'form-control';
					if(info.type == 'timer'){
						eleObj.readOnly = true;
					}
					if(info.unit){
						let groupObj = document.createElement('div');
						groupObj.className = 'input-group';
						groupObj.append(eleObj);
						let groupText = document.createElement('span');
						groupText.className = 'input-group-text';
						groupText.innerHTML = info.unit;
						let groupAppend = document.createElement('div');
						groupAppend.className = 'input-group-append';
						groupAppend.append(groupText);
						groupObj.append(groupAppend);
						colBox.append(groupObj);
					}
					else{
						colBox.append(eleObj);
					}
				}
			}
			//else if(info.type == 'textarea'){
			else if(['textarea','html'].indexOf(info.type) >= 0){
				eleObj = document.createElement('textarea');
				eleObj.name = key;
				eleObj.value = info.default;
				eleObj.className = 'form-control';
				eleObj.placeholder = info.placeholder;
				if(info.type == 'html'){
					eleObj.dataset.editor = 1;
				}
				colBox.append(eleObj);
			}
			else if(info.type == 'select'){
				eleObj = document.createElement('select');
				eleObj.name = key;
				eleObj.className = 'form-control';
				Object.keys(info.options).forEach(function(optKey){
					let option = document.createElement('option');
					option.value = optKey;
					option.innerHTML = info.options[optKey];
					if(info.default === optKey){
						option.selected = true;
					}
					eleObj.append(option);
				})
				colBox.append(eleObj);
			}
			//绑定表单change事件
			$(colBox).on('change', '[name='+key+']', function(){
				let val = $(this).val();
				//多选项要单独处理
				if($(this).attr('type') == 'checkbox'){
					if(!Array.isArray(self.elements[key].value)){
						self.elements[key].value = [];
					}
					if($(this).prop('checked')){
						self.elements[key].value.push(val);
					}
					else{
						self.elements[key].value.splice(self.elements[key].value.indexOf(val), 1);
					}
				}
				else{
					self.elements[key].value = val;
				}
			});
			//时间选择器要绑一下控件
			if(info.type == 'timer'){
				self.baseTimerParam.minView = 2;
				self.baseTimerParam.format = info.format ? info.format : 'yyyy-mm-dd';
				if(/h/i.test(self.baseTimerParam.format)){
					self.baseTimerParam.minView = 1;
				}
				$(eleObj).datetimepicker(self.baseTimerParam);
			}
			colNumOnRow += colNum;
			//一行只能放下12列
			if(colNumOnRow <= 12){
				rowBox.append(colBox);
			}
			//如果当前行已经放不下表单元素，先把行放到表单中
			//最后一个表单元素要把行放到表单中
			//再生成一个新的行对象，重置行内列数
			if(colNumOnRow >= 12 || key == lastEleKey){
				$('#'+self.id).append(rowBox);
				rowBox = self.createRowElement();
				if(colNumOnRow > 12){
					rowBox.append(colBox);
					colNumOnRow = colNum;
				}
				else{
					colNumOnRow = 0;
				}
			}
			if(colNumOnRow >= 12 && key == lastEleKey){
				$('#'+self.id).append(rowBox);
			}
		});
		//按钮组
		rowBox = self.createRowElement();
		let submitBtn = document.createElement('button');
		submitBtn.className = 'btn btn-success';
		submitBtn.id = this.id + '_btn_submit';
		submitBtn.innerHTML = '提交';
		let cancelBtn = document.createElement('button');
		cancelBtn.className = 'btn btn-default';
		cancelBtn.id = this.id + '_btn_submit';
		cancelBtn.innerHTML = '取消';
		let colBox = document.createElement('div');
		colBox.className = 'col-12';
		colBox.append(submitBtn);
		colBox.append(cancelBtn);
		rowBox.append(colBox);
		$('#'+self.id).append(rowBox);
		//绑定按钮click事件
		$('#'+this.id).on('click', '#'+submitBtn.id+',#'+cancelBtn.id, function(){
			if($(this).attr('id') == submitBtn.id){
				self.submit();
			}
			else{
				self.hide();
			}
		});
		//如果有富文本元素，进行初始化
		//TODO 后面要改一下图片和视频插入按钮相关逻辑
		$('#'+self.id).find('[data-editor=1]').each(function(){
			let key = $(this).attr('name');
			$(this).summernote({
				lang: 'zh-CN',
				height: 150,
				callbacks: {
					onChange: function(contents){
						self.elements[key].value = contents;
					}
				}
			});
		});
	},
	/**
	 * 设置表单数据
	 * @param formData
	 */
	setData: function(formData){
		let self = this;
		formData = formData ? formData : {};
		Object.keys(this.elements).forEach(function(key){
			let type = self.elements[key].type;
			let newVal = formData.hasOwnProperty(key) ? formData[key] : self.elements[key].default;
			//多选项
			if(type == 'checkbox'){
				self.elements[key].value = [].concat(newVal);//要防止地址引用
				$('#'+self.id+' [name='+key+']').prop('checked', false);
				self.elements[key].value.forEach(function(val){
					$('#'+self.id+' [name='+key+'][value='+val+']').prop('checked', true);
				});
			}
			//富文本
			else if(type == 'html'){
				$('#'+self.id+' [name='+key+']').summernote('code', newVal);
			}
			else{
				self.elements[key].value = newVal;
				$('#'+self.id+' [name='+key+']').val(self.elements[key].value);
			}
		});
	},
	/**
	 * 显示表单
	 * @param formData 表单数据
	 */
	show: function(formData){
		this.setData(formData);
		$('#'+this.id).show();
	},
	hide: function(){
		$('#'+this.id).hide();
	},
	submit: function(){
		let self = this;
		let formData = {};
		Object.keys(this.elements).forEach(function(key){
			formData[key] = self.elements[key].value;
		})
		console.log(formData)
		this.hide();
	}
}

/**
 * 基于bootstrap4的分页组件
 */
const Pagination = {
	id: '',//选择器
	currentPage: 1,//当前页码
	recordNum: 0,//总记录数
	onPageNum: 1,//每页记录数
	totalPage: 1,//总页数
	pageSideNum: 2,//当前页码两侧的页码显示数量
	init: function(param){
		this.id = param.id;
		this.currentPage = param.currentPage > 1 ? param.currentPage : 1;
		this.recordNum = param.recordNum > 0 ? param.recordNum : 0;
		this.onPageNum = param.onPageNum > 1 ? param.onPageNum : 1;
		this.pageSideNum = param.pageSideNum > 0 ? param.pageSideNum : 2;
		this.totalPage = Math.ceil(this.recordNum / this.onPageNum);
		if($('#'+param.id).length){
			let self = this;
			this.render();
			$('#'+param.id).on('click', 'a', function(e){
				e.preventDefault();
				if(self.currentPage != $(this).data('page')){
					self.currentPage = $(this).data('page');
					self.render();
					if(param.pageClick){
						(param.pageClick)(self.currentPage);
					}
				}
			});
		}
	},
	render: function(){
		let html = this.compile(this.currentPage, '', 'active');
		for(let i=1; i<=this.pageSideNum; i++){
			html = this.compile(this.currentPage - i) + html + this.compile(this.currentPage + i);
		}
		if(this.currentPage - this.pageSideNum > 1){
			html = this.compile(1, '...', 'disabled') + html;
			html = this.compile(1) + html;
		}
		if(this.currentPage > 1){
			html = this.compile(this.currentPage - 1, '<') + html;
		}
		if(this.currentPage + this.pageSideNum < this.totalPage){
			html += this.compile(this.totalPage, '...', 'disabled');
			html += this.compile(this.totalPage);
		}
		if(this.currentPage < this.totalPage){
			html += this.compile(this.currentPage + 1, '>');
		}
		//html = this.compile(1, this.currentPage+'/'+this.totalPage+'('+this.recordNum+')', 'disabled') + html;
		html = '<ul class="clearfix">' + html + '</ul>\n';
		$('#'+this.id).html(html);
	},
	compile: function(page, pageText, className){
		if(page < 1 || page > this.totalPage){
			return '';
		}
		pageText = pageText ? pageText : page;
		className = className ? className : '';
		return '<li class="page-item ' + className +'">\n' +
			'<a class="page-link" data-page="' + page + '" href="#">' + pageText + '</a>\n' +
			'</li>\n';
	},
}

/**
 * 表格组件
 */
const Table = {
	id: '',//表格ID
	header: {//表头信息
		// key: {//即键名数组中的值
		// 	show: 1,//是否显示(可自由选择)
		// 	name: '',//列名
		// 	regex: '',//用来修正显示的正则表达式
		// }
	},
	actions: {//操作列表
		// edit: {
		// 	name: '',//显示名称
		// 	click: '',//点击事件
		// 	className: '',//样式名
		// }
	},
	keys: [],//键名数组，键名索引和数据索引保持一致
	data: [],
	actKey: '',//操作时标记对应数据行的key
	init: function(param){
		let self = this;
		this.id = param.id;
		Object.keys(param.header).forEach(function(key){
			self.header[key] = {
				show: param.header[key].hasOwnProperty('show') ? param.header[key].show : 1,
				name: param.header[key].hasOwnProperty('name') ? param.header[key].name : '',
				regex: param.header[key].hasOwnProperty('regex') ? param.header[key].regex : '',
			}
		});
		Object.keys(param.actions).forEach(function(key){
			self.actions[key] = {
				name: param.actions[key].hasOwnProperty('name') ? param.actions[key].name : '',
				click: param.actions[key].hasOwnProperty('click') ? param.actions[key].click : '',
				className: param.actions[key].hasOwnProperty('className') ? param.actions[key].className : '',
			}
		});
		this.create();
		return this;
	},
	setKeys: function(keys){
		this.keys = keys;
		return this;
	},
	setData: function(data){
		this.data = data;
		this.render();
	},
	create: function(){
		let self = this;
		let tableBox = document.createElement('div');
		tableBox.className = 'table-responsive';
		tableBox.append(document.createElement('table'));
		$(tableBox).find('table').addClass('table table-striped')
			.append(document.createElement('thead'))
			.append(document.createElement('tbody'));
		$(tableBox).find('thead').append(document.createElement('tr'));
		Object.keys(this.header).forEach(function(key){
			if(self.header[key].show){
				let th = document.createElement('th');
				th.innerHTML = self.header[key].name;
				$(tableBox).find('thead tr').append(th);
			}
		});
		let actTh = document.createElement('th');
		actTh.innerHTML = '操作';
		$(tableBox).find('thead tr').append(actTh);
		$('#'+this.id).append(tableBox);
	},
	render: function(){
		let self = this;
		Object.keys(this.data).forEach(function(i){
			let tr = document.createElement('tr');
			Object.keys(self.header).forEach(function(key){
				let td = document.createElement('td');
				let idx = self.keys.indexOf(key);
				let value = self.data[i][idx] ? self.data[i][idx] : '';
				if(self.header[key].regex){
					value = self.header[key].regex.test(value);
				}
				td.innerHTML = value;
				tr.append(td);
			});
			//操作列
			let actTd = document.createElement('td');
			Object.keys(self.actions).forEach(function(key){
				let actBtn = document.createElement('button');
				actBtn.className = 'btn btn-sm ' + self.actions[key].className;
				actBtn.innerHTML = self.actions[key].name;
				actBtn.onclick = function(){
					self.actKey = i;
				}
				if(self.actions[key].click){
					$(actBtn).on('click', self.actions[key].click);
				}
				actTd.append(actBtn);
			});
			tr.append(actTd);
			$('#'+self.id).find('tbody').append(tr);
		});
	},
	/**
	 * 获取操作所在行的数据
	 */
	getActionData: function(){
		let data = {};
		let self = this;
		Object.keys(this.keys).forEach(function(key){
			data[self.keys[key]] = self.data[self.actKey][key];
		});
		return data;
	},
}

