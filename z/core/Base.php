<?php
/**
 * 挂载器
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zCoreBase
{
	private static $mountMap = [];//挂载映射
	private static $instanceMap = [];//已挂载的实例映射
	private static $regexAliasMap = [];//正则别名映射
	
	/**
	 * 设置挂载映射
	 * @access private
	 * @param  string  $mountMapName  映射文件名
	 */
	protected static function setMountMap($mountMapName){
	    static $mounted;
	    if(!$mounted){
            $mounted = 1;
            self::$mountMap = zCoreConfig::loadConfig($mountMapName);
        }
	}
	
	/**
	 * 通过动态方法重载和挂载映射使用其他类方法
	 * @access public
	 * @param  string  $func  方法名
	 * @param  array   $args  参数数组
	 * @return fixed
	 */
	public function __call($func, $args){
		return self::hook($func, $args);
	}
	
	/**
	 * 通过静态方法重载和挂载映射使用其他类方法
	 * @access public
	 * @param  string  $func  方法名
	 * @param  array   $args  参数数组
	 * @return fixed
	 */
	public static function __callStatic($func, $args){
		return self::hook($func, $args);
	}
	
	/**
	 * 钩子函数(通过挂载映射调用其他类方法)
	 * @access private
	 * @param  string  $func  方法名
	 * @param  array   $args  参数数组
	 * @return fixed
	 */
	private static function hook($func, $args){
		if(isset(self::$mountMap[$func])){
			if(!empty(self::$mountMap[$func][3]) && empty(self::$mountMap[$func][4])){
				require UNIFIED_PATH . self::$mountMap[$func][3];
				self::$mountMap[$func][4] = true;//标记已经挂载
			}
			if(!isset(self::$instanceMap[self::$mountMap[$func][0]])){
				self::$instanceMap[self::$mountMap[$func][0]] = empty(self::$mountMap[$func][2]) ? self::$mountMap[$func][0] : new self::$mountMap[$func][0]();
			}
			$obj = self::$instanceMap[self::$mountMap[$func][0]];
			return call_user_func_array([$obj, self::$mountMap[$func][1]], $args);
		}
	}
	
	/**
	 * 根据规则或方法过滤字符串
	 * @access public
	 * @param  string  $string  要过滤的字符串
	 * @param  string  $rule    过滤规则别名或方法名(允许多个，用|隔开，按顺序过滤，:表示默认值)
	 * @return string
	 */
	public static function filter($string, $rule){
		static $ready;
		if(!$ready){
			$ready = 1;
			self::$regexAliasMap = zCoreConfig::loadConfig('regexAliasMap');
		}
		$rule = explode(':', $rule);
		if($string === null){
			return $rule[1] ?? null;
		}
		$methods = explode('|', $rule[0]);
		foreach($methods as $method){
			if($method){
				//存在同名方法(即内置方法)，优先使用
				if(function_exists($method)){
					$string = $method($string);
				}
				//其次使用正则别名映射
				elseif(isset(self::$regexAliasMap[$method])){
					$matchs = [];
					preg_match_all(self::$regexAliasMap[$method], $string, $matchs);
					$string = isset($matchs[0]) ? implode('', $matchs[0]) : $string;
				}
				//最后是优先类方法，然后是挂载进来的方法
				else{
					$string = get_called_class()::$method($string);
				}
			}
		}
		return $string;
	}
	
	/**
	 * 验证字符串是否合法(根据规则过滤字符串后判断是否一致)
	 * @access public
	 * @param  string  $string  要验证的字符串
	 * @param  string  $rule    验证规则别名或方法名(允许多个，用|隔开，按顺序过滤，:表示默认值)
	 */
	public static function verify($string, $rule){
		return $string == self::filter($string, $rule);
	}
}
