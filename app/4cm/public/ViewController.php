<?php

class appPubViewController extends zConViewController
{
	public function __construct(){
		parent::__construct();
		//未登录或过期，自动跳转到入口页面
		if(strtolower(APP_BUSINESS) != 'entrance' && (!zCoreRequest::session('account') || zCoreRequest::session('account') != zCoreRequest::cookie('account'))){
			zCoreRouter::goto(['b'=>'entrance']);
		}
		$this->assign('title', '4CM超级管理平台');
		$this->assign('keywords', '4CM超级管理平台');
		$this->assign('description', '4CM超级管理平台');
		$this->assign('appName', '4cm');
		$this->assign('domain', zCoreConfig::$options['static_domain']);
	}
}
