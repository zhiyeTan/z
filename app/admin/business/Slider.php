<?php

class appBizSlider extends zConDataController
{
	public function main(){
		$this->assign('nav', [
			[
				'name' => 'name1',
				'child' => [],
			],
			[
				'name' => 'name2',
				'child' => [
					[
						'value' => 'value1',
						'flag' => 0
					],
					[
						'value' => 'value2',
						'flag' => -1
					],
					[
						'value' => 'value3',
						'flag' => 1
					]
				]
			]
		]);
	}
}
