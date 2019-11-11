<?php

class appBizListBusiness extends appPubDataController
{
	protected function main(){
		//从目录里面拿到appname与business的映射
		$tree = $this->listDirTree(dirname(APP_PATH), ['common', 'const', 'plugins', 'public', 'README.txt']);
		$bizMap = [];
		foreach($tree as $appItem){
			foreach($appItem['children'] as $typeItem){
				if($typeItem['name'] == 'business'){
					foreach($typeItem['children'] as $bizItem){
						$bizMap[$appItem['name']][] = substr($bizItem['name'], 0, strpos($bizItem['name'], '.'));
					}
				}
			}
		}
		unset($tree);
		//从权限表里面拿到已经保存的映射，整理成bizMap一样的结构
		$permission = [];
		foreach(dHoldlonPermission::init()::getAll() as $item){
			$permission[$item['appid']][] = $item['businessid'];
		}
		//取得已移除的business映射
		$removedBizMap = [];
		$removedAppSet = array_diff(array_keys($permission), array_keys($bizMap));
		foreach($removedAppSet as $appid){
			$removedBizMap[$appid] = $permission[$appid];
		}
		//取得新增的business映射
		$newBizMap = [];
		foreach($bizMap as $appid => $bizItem){
			$tmpNewBiz = $bizItem;
			$tmpRemovedBiz = [];
			if(isset($permission[$appid])){
				$tmpNewBiz = array_diff($bizItem, $permission[$appid]);
				$tmpRemovedBiz = array_diff($permission[$appid], $bizItem);
			}
			if(!empty($tmpNewBiz)){
				$newBizMap[$appid] = $tmpNewBiz;
			}
			if(!empty($tmpRemovedBiz)){
				$removedBizMap[$appid] = $tmpRemovedBiz;
			}
		}
		unset($permission, $bizMap);
		$this->assign('removedBizMap', $removedBizMap);
		$this->assign('newBizMap', $newBizMap);
	}
}
