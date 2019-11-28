<?php
/**
 * 数据控制器
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zConDataController extends zCoreBase
{
	use zConController;
	
	/**
	 * 构建函数
	 * @access public
	 */
	public function __construct(){
		self::setMountMap('mountControllerMap');
		$this->init();
	}

    /**
     * 返回主方法执行后的数据
     * @access public
     * @param  string  $dataType  数据类型(默认返回数组，否则json)
     * @return array
     */
    public function returnData($dataType = 'array'){
        if($this->cache){
            $jsonData = $this->cache;
            $json = json_encode($this->cache);
        }
        else{
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
            //这里只是用来固定指定键名的顺序
            $jsonData = ['errno'=>0, 'message'=>'', 'keys'=>'', 'data'=>''];
            $jsonData = array_merge($jsonData, $this->data, [
                'errno'		=> $this->errno,
                'message'	=> $this->message
            ]);
            //最后把二维关联数组的键值拆开，大量数据的时候能有效降低体积
            //这里约定数据要放在data里面，否则无效
            if(isset($this->data['data'])){
                $jsonData = array_merge($jsonData, zCoreMethod::splitArrayKeyData($this->data['data']));
            }
            //修正静态资源的路径（不包括站外资源引用）
            //如果json的值为html并包含静态资源的话，必须在外部转为HTML实体时进行修正
            $json = zCoreRouter::redirectStaticResources(json_encode($jsonData, JSON_NUMERIC_CHECK));
            if($this->useCache && !$this->errno){
                zModCache::saveAppDataCache($this->cacheName, $json);
            }
        }
        return $dataType == 'array' ? $jsonData : $json;
    }
	
	/**
	 * 显示视图
	 * @access public
	 */
	public function display(){
        $json = $this->returnData('json');
		zCoreResponse::setContentType('json')::setContent($json)::send();
	}
}
