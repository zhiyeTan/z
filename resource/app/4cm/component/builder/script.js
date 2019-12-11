const Builder = {
	appName: '4CM',
	loginApi: '/4cm/login',
	permissionApi: '/4cm/permission',
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
						$('#loginBox').hide();
						//TODO 初始化sidebar
						$('#sidebar').show();
						$('#container').show();
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
		Backdrop.hideLoading();
		$.post(
			self.permissionApi,
			function(res){
				if(res.errno){
					if(res.overdue){
						$('#loginBox').show();
						$('#sidebar').hide();
						$('#container').hide();
					}
					else{
						Dialog.show({
							message: res.message,
						})
					}
				}
				else{
					let cookies = {};
					let tmpArr = document.cookie.replace(/\s/g, '')
						.replace(/=/g, ';')
						.split(';');
					let len = tmpArr.length;
					for(let i=0; i<len; i++){
						if(i%2 == 0){
							cookies[tmpArr[i]] = tmpArr[i+1];
						}
					}

					$('#loginBox').hide();
					//TODO 初始化sidebar
					$('#sidebar').show();
					$('#container').show();
				}
			});
	    //访问权限列表接口(同时进行了登录状态的检测)
        //如果未登录，调出登录界面
        //如果已登录，通过cookie获取登陆者姓名及角色名，初始化登陆者信息及侧边导航
	},
}
$(function(){
	Builder.init();
});
