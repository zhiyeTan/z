<?php
/**
 * 视图控制器
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zConViewController extends zCoreBase
{
	use zConController;
	
	protected $viewName = '';//视图名，空表示与业务名称一致
    protected $moduleName = '';//模块名，空表示与APPNAME一致
	
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
			$viewName = $this->errno ? $this->errViewName : $this->viewName;
			$content = zConViewcompiler::render($this->data, $viewName, $this->moduleName);
			//修正静态资源的路径（不包括站外资源引用）
			$content = zCoreRouter::redirectStaticResources($content);
			if(!$this->errno){
				zModCache::saveAppViewCache($this->cacheName, $content);
			}
		}
		zCoreResponse::setContent($content)::send();
		$this->delay();
	}
}
