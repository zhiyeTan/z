<?php
/**
 * 应用管理
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zCoreApp
{
	/**
	 * 执行应用
	 */
	public function run(){
		//初始化
		zCoreConfig::init();
		//注册异常和错误处理方法
		zCoreException::register();
		//解析请求
		zCoreRouter::parse();
		//加载应用配置
		zCoreConfig::configure();
		//业务逻辑存在
		if($this->checkBusiness(APP_ID, APP_MODULE, APP_BUSINESS)){
			zCoreException::inBusiness();
			//执行业务逻辑
			$className = 'appBiz' . ucfirst(strtolower(zCoreRequest::module())) . ucfirst(strtolower(zCoreRequest::business()));
			$object = new $className();
			$object->display();
		}
		//业务逻辑不存在，直接加载视图
		else{
			$content = zConViewCompiler::render();
			//修正静态资源的路径(不包括站外资源引用)
			$content = zCoreRouter::redirectStaticResources($content);
			zCoreResponse::setContent($content)::send();
		}
	}

    /**
     * 检查业务逻辑是否存在
     * @access public
     * @param  string  $appid     应用名
     * @param  string  $module    模块名
     * @param  string  $business  业务名
     * @return bool
     */
    public static function checkBusiness($appid, $module, $business){
        return is_file(UNIFIED_PATH . 'app' . Z_DS . $appid . Z_DS . 'business' . Z_DS . $module . Z_DS . $business . '.php');
    }
}