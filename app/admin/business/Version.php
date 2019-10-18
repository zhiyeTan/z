<?php

class appBizVersion extends zConDataController
{
	public function main(){
		$this->assign('version', 4);
		$this->assign('updateItems', [
			'update' => [
				'public' => [
					'css' => ['header', 'footer'],
					'htm' => ['header', 'footer'],
					'js' => ['header', 'footer']
				],
				'admin' => [
					'css' => ['index', 'slider'],
					'htm' => ['index', 'slider'],
					'js' => ['index', 'slider']
				]
			],
			'delete' => [
				'public' => [
					'css' => ['else']
				]
			]
		]);
	}
}
