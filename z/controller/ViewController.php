<?php
/**
 * 视图控制器
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zConViewController extends zCoreBase
{
	use zConController;

    protected $view_appid = '';//视图的应用，空表示与APP_ID一致
    protected $view_module = '';//视图的模块名，空表示与APP_MODULE一致
	protected $view_business = '';//视图的业务名，空表示与APP_BUSINESS一致
	
	/**
	 * 构建函数
	 * @access public
	 */
	public function __construct($requestParam = null){
		self::setMountMap('mountControllerMap');
		$this->init($requestParam);
	}

    /**
     * 返回主方法执行后的数据
     * @access public
     * @return array
     */
    public function returnData(){
        //如果有模拟请求参数，使用此参数替换请求参数后再执行对应业务逻辑，随后还原参数
        if($this->simulateRequestParam){
            $originalRequestParam = zCoreRequest::get();
            zCoreRequest::get(null);
            zCoreRequest::get($this->simulateRequestParam);
            $this->main();
            zCoreRequest::get(null);
            zCoreRequest::get($originalRequestParam);
        }
        else{
            $this->main();
        }
        return $this->data;
    }
	
	/**
	 * 显示视图
	 * @access public
	 */
	public function display(){
		$content = $this->cache;
		if(!$content){
			$this->main();
			$view_business = $this->errno ? $this->view_error : $this->view_business;
			$content = zConViewcompiler::render($this->data, $view_business, $this->view_module, $this->view_appid);
			//修正静态资源的路径（不包括站外资源引用）
			$content = zCoreRouter::redirectStaticResources($content);
			if(!$this->errno){
				zModCache::saveAppViewCache($this->cacheName, $content);
			}
		}
		zCoreResponse::setContent($content)::send();
	}
}
