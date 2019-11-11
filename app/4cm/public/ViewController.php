<?php

class appPubViewController extends zConViewController
{
	public function __construct(){
		parent::__construct();
		//未登录或过期，自动跳转到入口页面
		if(strtolower(APP_BUSINESS) != 'entrance' && (!$this->session('account') || $this->session('account') != $this->cookie('account'))){
			$this->goto(['b'=>'entrance']);
		}
		$this->assign('operater', $this->session('operater'));
		$this->assign('title', '4cm');
	}
}
