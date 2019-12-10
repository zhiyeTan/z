const Builder = {
	appName: '4CM',
	loginApi: '/4cm/login',
	init: function(){
		Backdrop.init();
		Dialog.init();
		this.initLoginForm();
		//this.initStruct();
	},
	/**
	 * 初始化登录表单
	 */
	initLoginForm: function(){
		$('body').append('<div id="loginBox" class="container">' +
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
						$('#contentBox').show();
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
		let sidebar = document.createElement('div');
		sidebar.id = 'sidebar';
		let container = document.createElement('div');
		container.id = 'container';
		let tabControl = document.createElement('div');
		tabControl.id = 'tabControl';
		tabControl.innerHTML = ''
		container.append(tabControl);
		$('body').prepend(container).prepend(sidebar);
	},
}
$(function(){
	Builder.init();
});
