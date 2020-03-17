<?php
//定义统一的分隔符
const Z_DS = DIRECTORY_SEPARATOR;

//定义统一的框架路径
define('UNIFIED_PATH', dirname(dirname(__FILE__)) . Z_DS);

//设置自定义的类加载机制
spl_autoload_register(function($className){
    static $dirAliasMap,$pathAliasMap,$autoloadMap,$loaded = false;
    if(!$dirAliasMap){
        $dirAliasMap = [
            'con'	=> 'controller',
            'mod'	=> 'model',
            'pub'	=> 'public',
            'biz'	=> 'business'
        ];
    }
    //优先加载框架的自动加载策略
    $words = explode(',', strtolower(preg_replace('/([A-Z])/', ',\1', $className)));
    if(count($words) > 2){
        //库名+表名的读写模型类，框架将自动创建对应的模型类，无需书写文件
        if($words[0] == 'd'){
            $dbName = $words[1];
            $tableName = implode('', array_slice($words, 2));
            eval("class $className extends zModModel
					{
						public static function init(){
							self::register('$dbName', '$tableName');
							return __CLASS__;
						}
					}");
            return true;
        }
        $filePath = $words[0] == 'app' ? APP_PATH : UNIFIED_PATH;
        //模型类统一放在model目录下
        $filePath .= $words[0] == 'm' ? 'model' . Z_DS : '';
        //app下的类已经带上了第一个参数
        $filePath .= !in_array($words[0], ['app', 'm']) ? ($dirAliasMap[$words[0]] ?? $words[0]) . Z_DS : '';
        $filePath .= ($dirAliasMap[$words[1]] ?? $words[1]) . Z_DS;
        $fileName = substr($className, strlen($words[0].$words[1])) . '.php';
        if(is_file($filePath.$fileName)){
            include $filePath.$fileName;
            return true;
        }
        //app下允许二级目录，方便做文件管理
        elseif($words[0] == 'app'){
            $filePath .= strtolower($words[2]) . Z_DS;
            $fileName = substr($className, strlen($words[0].$words[1].$words[2])) . '.php';
            if(is_file($filePath.$fileName)){
                include $filePath.$fileName;
                return true;
            }
        }
    }
    //其次检查映射
    if(!$loaded || !defined(APP_PATH)){
        $pathAliasMap = zCoreConfig::loadConfig('pathAliasMap');
        $autoloadMap = zCoreConfig::loadConfig('autoloadMap');
        $loaded = true;
    }
    //存在加载映射且存在路径别名映射时加载对应文件
    if(isset($autoloadMap[$className]) && isset($pathAliasMap[$autoloadMap[$className]])){
        $filePath = UNIFIED_PATH . strtr($pathAliasMap[$autoloadMap[$className]], Z_DS, '/') . Z_DS . $className . '.php';
        if(is_file($filePath)){
            include $filePath;
        }
    }
}, true, true);


//初始化核心配置
zCoreConfig::init();
//注册异常和错误处理方法
zCoreException::register();
//解析请求
$params = zCoreRouter::parse();
//获取域名映射
$domainMap = zCoreConfig::getDomainMap();
//如果是默认应用，根据域名映射取得对应的应用ID(应用目录)
if($params['a'] == 'default' && !empty($domainMap)){
    $params['a'] = $domainMap[0];
}
//判断是否允许访问当前应用/模块
if(!empty($domainMap) && count($domainMap) > 1 && !in_array($params['a'], $domainMap)){
    trigger_error(T_NO_PERMISSION_MODULE, E_USER_ERROR);
}
//设置请求参数到全局get变量中
zCoreRequest::get($params);
//定义应用/模块目录和业务名称为常量
define('APP_ID', $params['a']);
define('APP_MODULE', $params['m']);
define('APP_BUSINESS', $params['b']);

//加载应用配置
zCoreConfig::configure();
//业务逻辑存在
if(zConViewController::checkBusiness(APP_ID, APP_MODULE, APP_BUSINESS)){
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
