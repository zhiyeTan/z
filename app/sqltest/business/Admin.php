<?php

class appBizAdmin extends appPubDataController
{
	protected function main(){
		dHoldlongAdmin::init();
		dHoldlongUser::init();
		dHoldlongsssUserOrder::init();
		
		//::field(['name','sex','pwd','note'])
		//::data(['addtest3333333',0,'sssss','addtest'])
		//::data([['insertmore1',0,'sssss','addtest'],['insertmore2',1,'sssss','insertmore']])
		//::data(['updatetest2222',1,'sssss','updatetest'])
		dHoldlongAdmin::setAssoc([
			'mobile'=>'13580564273',
			'password'=>md5('123123'),
			'name'=>'谈治烨'
		]);
		//::where(['id', '=', 17])
		//::where(['id', '>', 3])
		//::add();
		//::edit();
		//::del();
//		echo '<pre>';
//		print_r(zModDataBase::getSqlStack());
//		exit;
		
		$this->assign('data', dHoldlongAdmin::getAll());
	}
}
