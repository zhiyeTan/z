<?php

class appPubDataController extends zConDataController
{
	public function __construct(){
		parent::__construct();
		//非登录或登出行为，未登录或过期状态，提示错误
		if(!in_array(strtolower(zCoreRequest::business()), ['login', 'logout'])
            && (!$this->session('account') || $this->session('account') != $this->cookie('account'))){
			$this->assign('overdue', 1);
		    $this->errno = 1;
		    $this->message = '尚未登录或已失效，请先登录！';
		}
	}
}
