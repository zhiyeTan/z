<?php

class appBizLogout extends appPubDataController
{
	protected function main(){
		$this->session(['account'=>null, 'operater'=>null]);
		$this->cookie(['account'=>null]);
	}
}