const Builder = {
	appName: '4CM',
	loginApi: '/4cm/login',
	init: function(){
		Backdrop.init();
		//this.initLoginForm();
		this.initStruct();
	},
	/**
	 * 初始化登录表单
	 */
	initLoginForm: function(){
		let loginBox = document.createElement('div');
		loginBox.id = 'loginBox';
		loginBox.className = 'container';
		loginBox.style.marginTop = (document.documentElement.clientHeight / 2 - 150) + 'px';
		let formObj = document.createElement('form');
		formObj.className = 'col-xs-8 col-xs-offset-2';
		//应用名
		let appTitleObj = document.createElement('div');
		appTitleObj.className = 'form-group text-center h2';
		appTitleObj.innerHTML = this.appName;
		formObj.append(appTitleObj);
		//账号
		let accountObj = document.createElement('input');
		accountObj.className = 'form-control';
		accountObj.type = 'text';
		accountObj.name = 'account';
		accountObj.placeholder = '账号';
		let accountBox = document.createElement('div');
		accountBox.className = 'form-group';
		accountBox.append(accountObj);
		formObj.append(accountBox);
		//密码
		let passwordObj = document.createElement('input');
		passwordObj.className = 'form-control';
		passwordObj.type = 'password';
		passwordObj.name = 'password';
		passwordObj.placeholder = '密码';
		let passwordBox = document.createElement('div');
		passwordBox.className = 'form-group';
		passwordBox.append(passwordObj);
		formObj.append(passwordBox);
		//信息提示框
		let tipsObj = document.createElement('div');
		tipsObj.className = 'alert alert-danger d-none';
		formObj.append(tipsObj);
		//按钮
		let btnObj = document.createElement('button');
		btnObj.type = 'submit';
		btnObj.className = 'btn btn-block btn-success';
		btnObj.innerHTML = '登录';
		let btnBox = document.createElement('div');
		btnBox.className = 'form-group';
		btnBox.append(btnObj);
		formObj.append(btnBox);
		loginBox.append(formObj);
		$('body').append(loginBox)
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
