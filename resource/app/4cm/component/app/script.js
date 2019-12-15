const App = {
	appName: '4CM',
	loginApi: '/4cm/login',
	logoutApi: '/4cm/logout',
	permissionApi: '/4cm/permission',
	pageConfigDomain: 'http://s.4cm.com/',//页面配置的域名
	init: function(){
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


$(function(){
	App.init();
});
