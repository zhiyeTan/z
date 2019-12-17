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
}


