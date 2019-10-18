<?php
/**
 * 数据库基础类
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zModDataBase
{
	use zModSqlBuilder;
	
	private static $readMethods = ['getOne', 'getCol', 'getRow', 'getAll'];
	private static $writeMethods = ['insert', 'update', 'delete'];
	private static $mandatory = false;//强制对当前查询语句使用缓存处理
	private static $sqlStack = [];
	
	//禁止直接创建对象
	private function __construct(){}
	
	/**
	 * 设置是否强制使用缓存处理
	 * @access public
	 * @param  bool  $flag  是/否
	 * @return class
	 */
	public static function setMandatory($flag){
		self::$mandatory = $flag;
		return __CLASS__;
	}
	
	/**
	 * 通过重载创建指定的静态方法
	 * @access public
	 * @param  $method  静态方法名
	 * @param  $args    方法参数
	 */
	public static function __callstatic($method, $args){
		if(!in_array($method, self::$readMethods) && !in_array($method, self::$writeMethods)){
			trigger_error("Model类不存在 $method 方法", E_USER_ERROR);
		}
		return self::query(in_array($method, self::$readMethods) ? 'select' : $method, in_array($method, self::$readMethods) ? $method : '');
	}
	
	/**
	 * 查询
	 * @access private
	 * @param  string  $type    查询类型(CURD)
	 * @param  int     $method  查询处理的方法名
	 * @return class
	 */
	private static function query($type, $method = ''){
		$sql = self::sql($type);
		self::$sqlStack[] = $sql;
		$isRead = $type == 'select';
		if($isRead){
			//强制使用缓存处理时，有限时间设为永久
			$expire = self::$mandatory ? 0 : zCoreConfig::$options['model_cache_expire'];
			//键名采用dbname-tablename-md5($sql)格式，以便在需要时根据库和表更新缓存
			$cacheKey = self::$db . '-' . self::$realTable . '-' . md5($sql);
			$cacheData = zModCache::getSqlModel($cacheKey, $expire);
			if($cacheData){
				self::clean();
				self::$mandatory = false;
				return $cacheData;
			}
		}
		//穿透到mysql
		$methodName = $type;
		if($isRead){
			$methodName = $method;
		}
		$result = zModMySql::init()->$methodName($sql, self::$dbModelType);
		//缓存数据
		if($isRead){
			zModCache::saveSqlModel($cacheKey, $result, $expire);
		}
		self::clean();
		self::$mandatory = false;
		return $result;
	}
	
	/**
	 * 获取查询语句的栈堆
	 * @access public
	 * @return array
	 */
	public static function getSqlStack(){
		return self::$sqlStack;
	}
}
