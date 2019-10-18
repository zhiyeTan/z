<?php
/**
 * 默认的index业务示例
 * 
 * 实际上如果没有必要逻辑，可直接加载静态页面，此文件则不需要
 * 此时若存在此文件，反而会产生额外的模版解析损耗
 */
class appBizIndex extends zConViewController
{
	public function main(){
		$this->goto('/guider');
		//$this->assign('title', 'guider');
	}
}
