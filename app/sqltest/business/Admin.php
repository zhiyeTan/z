<?php

class appBizAdmin extends appPubDataController
{
	protected function main(){
		dShopAdmin::init();
		dShopUser::init();
		dShopsssUserOrder::init();
		
		//::field(['name','sex','pwd','note'])
		//::data(['addtest3333333',0,'sssss','addtest'])
		//::data([['insertmore1',0,'sssss','addtest'],['insertmore2',1,'sssss','insertmore']])
		//::data(['updatetest2222',1,'sssss','updatetest'])
		dShopAdmin::setAssoc(['name'=>'datatestssss','note'=>'datatestnote'])
		//::where(['id', '=', 17])
		::where(['id', '>', 3])
		//::add();
		::edit();
		//::del();
		
		
		
		$this->assign('data', dShopAdmin::getAll());
	}
}
