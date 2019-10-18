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
		//判断当前访问域名与绑定域名是否一致
		if(zCoreConfig::$options['bind_host'] && zCoreConfig::$options['bind_host'] != zCoreRequest::server('HTTP_HOST')){
			$domain = 'http' . (zCoreConfig::$options['is_https'] ? 's' : '') . '://' . zCoreConfig::$options['bind_host'];
			zCoreRouter::goto(zCoreRequest::get(), DEFAULT_ROUTER_MODEL, $domain);
		}
		//判断是否允许访问当前应用/模块
		$domainMap = zCoreConfig::getDomainMap();
		if(!empty($domainMap) && !in_array(APP_DIR, $domainMap)){
			trigger_error(T_NO_PERMISSION_MODULE, E_USER_ERROR);
		}
		//业务逻辑存在
		if(is_file(APP_PATH . 'business' . Z_DS . APP_BUSINESS . '.php')){
			//执行业务逻辑
			$className = 'appBiz' . ucfirst(strtolower(APP_BUSINESS));
			$object = new $className();
			$object->display();
		}
		//业务逻辑不存在，直接加载视图
		else{
			$filePath = zCoreConfig::getViewPath(APP_BUSINESS, APP_DIR);
			if(!is_file($filePath)){
				trigger_error(T_TEMPLATE_NOT_EXIST, E_USER_ERROR);
			}
			$content = zCoreMethod::read($filePath) ?: '';
			//仅检查有没有组件模版语法(此时必然没有变量的模版语法)
			if(preg_match('/<component(.*?)><\/component>/i', $content)){
				$content = zConViewcompiler::render();
			}
			//修正静态资源的路径(不包括站外资源引用)
			$content = zCoreRouter::redirectStaticResources($content);
			zCoreResponse::setContent($content)::send();
		}
	}
}