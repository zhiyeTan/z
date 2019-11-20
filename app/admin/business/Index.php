<?php

class appBizIndex extends zConViewController
{
	public function main(){
		//$this->assign('title', 'public template test title!');
		zCoreRequest::get(['b'=>'home']);
		$this->goto(zCoreRequest::get(), DEFAULT_ROUTER_MODEL);
	}
}
