<?php
//定义统一的分隔符
const Z_DS = DIRECTORY_SEPARATOR;

//定义统一的框架路径
define('UNIFIED_PATH', dirname(dirname(__FILE__)) . Z_DS);

/**
 * 框架引导机制
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class z
{
	//目录别名映射
	private static $dirAliasMap = [
		'con'	=> 'controller',
		'mod'	=> 'model',
		'pub'	=> 'public',
		'biz'	=> 'business'
	];
	
	private static $pathAliasMap;//路径别名映射
	private static $autoloadMap;//自动加载的类名与路径别名映射
	private static $loaded = false;//是否已经载入映射
	
	//自动加载类名文件
	public static function autoload($className){
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
            $filePath .= !in_array($words[0], ['app', 'm']) ? (self::$dirAliasMap[$words[0]] ?? $words[0]) . Z_DS : '';
			$filePath .= (self::$dirAliasMap[$words[1]] ?? $words[1]) . Z_DS;
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
		if(!self::$loaded){
			self::$pathAliasMap = zCoreConfig::loadConfig('pathAliasMap');
			self::$autoloadMap = zCoreConfig::loadConfig('autoloadMap');
			self::$loaded = true;
		}
		//存在加载映射且存在路径别名映射时加载对应文件
		if(isset(self::$autoloadMap[$className]) && isset(self::$pathAliasMap[self::$autoloadMap[$className]])){
			$filePath = UNIFIED_PATH . strtr(self::$pathAliasMap[self::$autoloadMap[$className]], Z_DS, '/') . Z_DS . $className . '.php';
			if(is_file($filePath)){
				include $filePath;
			}
		}
	}
}
//使用自定义的类加载机制
spl_autoload_register(['z', 'autoload'], true, true);
//运行应用
(new zCoreApp())->run();