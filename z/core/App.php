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
		if(is_file(APP_PATH . 'business' . Z_DS . APP_MODULE . Z_DS . APP_BUSINESS . '.php')){
			zCoreException::inBusiness();
			//执行业务逻辑
			$className = 'appBiz' . ucfirst(strtolower(APP_MODULE)) . ucfirst(strtolower(APP_BUSINESS));
			$object = new $className();
			$object->display();
		}
		//业务逻辑不存在，直接加载视图
		else{
			$content = zConViewCompiler::getViewContent();
			//修正静态资源的路径(不包括站外资源引用)
			$content = zCoreRouter::redirectStaticResources($content);
			zCoreResponse::setContent($content)::send();
		}
	}
}