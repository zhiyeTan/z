<?php

class appBizHome extends zConViewController
{
	protected $viewName = 'home';
	protected function main(){
		$this->assign('appid', 'admin');
		$this->assign('appVersion', 5);
		$this->assign('title', '4CM单页应用测试页');
		$this->assign('domain', zCoreConfig::$options['static_domain']);
	}
}
