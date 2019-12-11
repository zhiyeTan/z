<?php

class appBizPermission extends zConDataController
{
	public function main(){
		$this->useCache = false;
		$this->assign('data', [
            'platform'=>[
                'name'=>'平台管理',
                'child'=>[
                    'site'=>'站点管理',
                    'member'=>'成员管理',
                    'power'=>'职能与权限'
                ]
            ]
        ]);
	}
}
