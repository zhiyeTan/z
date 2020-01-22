<?php
/**
 * 读取器基类
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zModModel
{
	private static $tableMap = [];//表映射
	//private static $baseMethods = ['field', 'data', 'where', 'group', 'having', 'order', 'page'];
	private static $getMethods = ['getAll', 'getRow', 'getCol', 'getOne'];
	private static $setMethods = ['add', 'edit', 'del'];
	private static $pageNum = 20;//每页默认显示的记录数
	private static $args = [];
	
	protected static function register($db, $table){
		self::$tableMap[get_called_class()] = [$db, $table];
	}
	
	/**
	 * 设置关联数据(即包含字段名和数据)
	 * @access public
	 * @param  array  $data  关联数组
	 */
	public static function setAssoc(array $data){
		if(is_array(reset($data))){
			self::$args['field'] = array_keys(reset($data));
			self::$args['data'] = array_map(function($v){
				return array_values($v);
			}, $data);
		}
		else{
			self::$args['field'] = array_keys($data);
			self::$args['data'] = array_values($data);
		}
		return get_called_class();
	}
	
	private static function turn($className, $method, $args = []){
		if(in_array($method, self::$getMethods)){
			zModDataBase::setDb(self::$tableMap[$className][0])
			::setTable(self::$tableMap[$className][1])
			::field(self::$args['field'] ?? '')
			::where(self::$args['where'] ?? '')
			::group(self::$args['group'] ?? '')
			::having(self::$args['having'] ?? '')
			::order(self::$args['order'] ?? '');
			if(isset(self::$args['page'])){
				zModDataBase::page(self::$args['page'], self::$args['pageNum']);
			}
			self::$args = [];
			return zModDataBase::$method();
		}
		elseif(in_array($method, self::$setMethods)){
			zModDataBase::setDb(self::$tableMap[$className][0])
			::setTable(self::$tableMap[$className][1]);
			if($method == 'add'){
				zModDataBase::field(self::$args['field'])
				::data(self::$args['data']);
				self::$args = [];
				return zModDataBase::insert();
			}
			elseif($method == 'edit'){
				zModDataBase::field(self::$args['field'])
				::data(self::$args['data'])
				::where(self::$args['where'] ?: '');
				self::$args = [];
				return zModDataBase::update();
			}
			else{
				zModDataBase::where(self::$args['where'] ?? '');
				self::$args = [];
				return zModDataBase::delete();
			}
		}
	}
	
	public static function field($fixed){
		self::$args[__FUNCTION__] = $fixed;
		return get_called_class();
	}
	
	public static function data($fixed){
		self::$args[__FUNCTION__] = $fixed;
		return get_called_class();
	}
	
	public static function where($fixed){
		self::$args[__FUNCTION__] = $fixed;
		return get_called_class();
	}
	
	public static function group($fixed){
		self::$args[__FUNCTION__] = $fixed;
		return get_called_class();
	}
	
	public static function having($fixed){
		self::$args[__FUNCTION__] = $fixed;
		return get_called_class();
	}
	
	public static function order($fixed){
		self::$args[__FUNCTION__] = $fixed;
		return get_called_class();
	}
	
	public static function page($page, $pageNum = 0){
		self::$args['page'] = abs(intval($page));
		self::$args['pageNum'] = $pageNum > 0 ? $pageNum : self::$pageNum;
		return get_called_class();
	}
	
	public static function getAll(){
		return self::turn(get_called_class(), __FUNCTION__);
	}
	
	public static function getRow(){
		return self::turn(get_called_class(), __FUNCTION__);
	}
	
	public static function getCol(){
		return self::turn(get_called_class(), __FUNCTION__);
	}
	
	public static function getOne(){
		return self::turn(get_called_class(), __FUNCTION__);
	}
	
	public static function add(){
		return self::turn(get_called_class(), __FUNCTION__);
	}
	
	public static function edit(){
		return self::turn(get_called_class(), __FUNCTION__);
	}
	
	public static function del(){
		return self::turn(get_called_class(), __FUNCTION__);
	}
}