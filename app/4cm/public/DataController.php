<?php

class appPubDataController extends zConDataController
{
	public function __construct(){
		parent::__construct();
		//非登录或登出行为，未登录或过期状态，提示错误
		if(!in_array(strtolower(APP_BUSINESS), ['login', 'logout']) && (!zCoreRequest::session('account') || zCoreRequest::session('account') != zCoreRequest::cookie('account'))){
			trigger_error('尚未登录或已失效，请先登录！');
		}
		$this->assign('title', '4CM超级管理平台');
		$this->assign('keywords', '4CM超级管理平台');
		$this->assign('description', '4CM超级管理平台');
		$this->assign('appName', '4cm');
		$this->assign('domain', zCoreConfig::$options['static_domain']);
	}
}
