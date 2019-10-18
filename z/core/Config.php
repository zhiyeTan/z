<?php
/**
 * 配置管理
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zCoreConfig
{
	public static $noViewSubDir = false;//是否设置了视图子目录
	public static $options = [];//配置项
	//私有构造方法
	private function __construct(){}
	
	/**
	 * 初始化配置参数，单例模式
	 * @access public
	 */
	public static function init(){
		static $ready;
		if(!$ready){
			error_reporting(E_ALL);
			$path = UNIFIED_PATH . 'z' . Z_DS;
			self::$options = require $path . 'config' . Z_DS . 'config.php';//加载默认配置项
			require $path . 'const' . Z_DS . 'basic.php';//加载预定义常量
			define('TMPFS_PATH', UNIFIED_PATH . 'tmpfs' . Z_DS);//作为虚拟文件系统的路径
			define('COMPILED_PATH', TMPFS_PATH . 'compiled' . Z_DS);//编译文件所在路径
			define('APP_RESOURCE_DIR', 'app');//应用资源(页面和组件资源)所在目录
			define('APP_RESOURCE_PATH', UNIFIED_PATH . 'resource' . Z_DS . APP_RESOURCE_DIR . Z_DS);//应用资源(页面和组件资源)所在路径
		}
	}
	
	/**
	 * 配置应用的基本信息
	 * @access public
	 */
	public static function configure(){
		define('APP_PATH', UNIFIED_PATH . 'app' . Z_DS . APP_DIR . Z_DS);//目录路径
		define('APP_LOG_PATH', UNIFIED_PATH . 'log' . Z_DS . APP_DIR . Z_DS);//日志路径
		define('APP_CACHE_PATH', TMPFS_PATH . 'cache' . Z_DS . APP_DIR . Z_DS);//静态缓存路径
		//加载应用/模块的独有配置项 TODO 加载顺序及如何覆盖的问题
		self::loadConfig('config');
		//修正静态资源相关设置
		self::$options['static_domain'] = rtrim(self::$options['static_domain'], '/') . '/';
		self::$options['static_suffix'] = trim(self::$options['static_suffix'], '|');
		//设定时区
		date_default_timezone_set(self::$options['default_timezone']);
	}
	
	/**
	 * 获取域名映射的目录
	 * @access public
	 * @param  string  $domain  域名
	 * @return array
	 */
	public static function getDomainMap($domain = ''){
		static $map;
		if(!$map){
			$map = require UNIFIED_PATH . 'z' . Z_DS . 'config' . Z_DS . 'domainMap.php';
		}
		$domain = $domain ?: zCoreRequest::server('HTTP_HOST');
		return $map[$domain] ?? [];
	}
	
	/**
	 * 获取资源直属目录
	 * @access private
	 * @param  string  $businessName    业务名称(非类名)
	 * @param  bool    $pageView        是否为页面视图
	 * @param  bool    $isViewRes       是否为视图资源
	 * @return string
	 */
	private static function getUnderDir(&$businessName, $pageView = true, $isViewRes = true){
		//当前业务名称和前端渲染模式的业务名称一致，即当渲染SPA的起始页
		if(APP_BUSINESS == FERM_BUSINESS){
			$underDir = FERM_BUSINESS;
			$businessName = FERM_BUSINESS;
		}
		//否则渲染对应模版
		else{
			$underDir = $pageView ? 'page' : 'component';
			//后端渲染的视图资源还有一个与业务同名的层级
			$underDir .= $isViewRes ? Z_DS . $businessName : '';
		}
		return $underDir;
	}
	
	/**
	 * 获取模版路径
	 * @access public
	 * @param  string  $businessName    业务名称(非类名)
	 * @param  string  $moduleName      应用/模块名
	 * @param  bool    $pageView        是否为页面视图
	 * @param  bool    $complied        是否为编译文件
	 * @return path
	 */
	public static function getViewPath($businessName, $moduleName, $pageView = true, $complied = false){
		//应用/模块名
		$moduleName = $moduleName ?: APP_DIR;
		//资源直属目录
		$underDir = self::$noViewSubDir ? "" : self::getUnderDir($businessName, $pageView, !$complied);
		//文件名
		$fileName = $complied ? $businessName . '.php' : 'struct.htm';
		if(!$complied && self::$noViewSubDir){
		    return APP_RESOURCE_PATH . $moduleName . Z_DS . 'index.html';
		}
		//返回拼接好的路径
		return ($complied ? COMPILED_PATH : APP_RESOURCE_PATH) . $moduleName . Z_DS . $underDir . Z_DS . $fileName;
	}
	
	/**
	 * 获取静态资源标签
	 * @access public
	 * @param  string  $moduleName      应用/模块名
	 * @param  string  $businessName    业务名称(非类名)
	 * @param  int     $type            资源类型(0样式，1脚本)
	 * @param  bool    $isPage          是否为页面资源
	 * @return string
	 */
	public static function getResourceTag($moduleName, $businessName, $type, $isPage){
		$tag = [
			'<link rel="stylesheet" type="text/css" href="%s">',//样式标签
			'<script type="text/javascript" src="%s"></script>'//脚本标签
		];
		$underDir = strtr(self::getUnderDir($businessName, $isPage), Z_DS, '/');
		//TODO '?v='.time();//版本号根据具体需求调整，当前写法与浏览器缓存时间一致
		$url = '/' . APP_RESOURCE_DIR . '/' . $moduleName . '/' . $underDir . '/' . ($type ? 'script.js' : 'style.css');
		return sprintf($tag[$type], $url);
	}
	
	/**
	 * 加载配置文件
	 * @access public
	 * @param  string  $fileName  配置文件名
	 * @return array
	 */
	public static function loadConfig($fileName){
		$config = require UNIFIED_PATH . 'z' . Z_DS . 'config' . Z_DS . $fileName . '.php';
		$appCfgFile = APP_PATH . 'config' . Z_DS . $fileName .'.php';
		if(is_file($appCfgFile)){
			$config = array_merge($config, require $appCfgFile);
		}
		return $config;
	}
	
	/**
	 * 加载常量文件
	 * @access private
	 * @param  string  $fileName  文件名
	 * @param  bool    $isAppFile  是否为应用/模块的常量文件
	 */
	private static function loadDefineFile($fileName, $isAppFile){
		$filePath = UNIFIED_PATH . ($isAppFile ? 'app' : 'z') . Z_DS . 'const' . Z_DS . $fileName . '.php';
		if(is_file($filePath)){
			require $filePath;
		}
	}
	
	/**
	 * 加载应用/模块的常量文件
	 * @access public
	 * @param  string  $fileName  文件名
	 */
	public static function loadAppDefine($fileName){
		self::loadDefineFile($fileName, true);
	}
	
	/**
	 * 加载框架的常量文件
	 * @access public
	 * @param  string  $fileName  文件名
	 */
	public static function loadFrameDefine($fileName){
		self::loadDefineFile($fileName, false);
	}
}
