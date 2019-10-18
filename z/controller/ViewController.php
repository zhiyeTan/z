<?php
/**
 * 视图控制器
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zConViewController extends zCoreBase
{
	use zConController;
	
	protected $viewName = '';//视图名，空表示与业务名称一致，否则表示公共视图
	
	/**
	 * 构建函数
	 * @access public
	 */
	public function __construct(){
		self::setMountMap('mountControllerMap');
		$this->init();
	}
	
	/**
	 * 显示视图
	 * @access public
	 */
	public function display(){
		$content = $this->cache;
		if(!$content){
			$this->main();
			$content = zConViewcompiler::render($this->data, $this->errno ? $this->errViewName : $this->viewName);
			//修正静态资源的路径（不包括站外资源引用）
			$content = zCoreRouter::redirectStaticResources($content);
			if(!$this->errno){
				zModCache::saveAppViewCache($this->cacheName, $content);
			}
		}
		zCoreResponse::setContent($content)::send();
	}
}
