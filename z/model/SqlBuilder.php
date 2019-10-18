<?php
/**
 * 查询语句构建类(目前仅支持mysql)
 * 
 * @author 谈治烨<594557148@qq.com>
 */
trait zModSqlBuilder
{
	private static $db				= '';
	private static $table			= '';
	private static $realTable		= '';
	private static $partition		= [];
	private static $field			= [];
	private static $where			= [];
	private static $order			= [];
	private static $group			= [];
	private static $having			= [];
	private static $data			= [];
	private static $limit			= '';
	//以下参数不需要重置
	private static $prefix			= 'z_';//表前缀名
	private static $partitionName	= '_mark';//分区所在的字段名(默认采用单一分区，不支持复合分区)
	private static $dbModelType		= 'default';//数据库数据模型类型(对应mysql配置的数据模型类型)
	private static $modelType		= 'default';//缓存数据模型类型(对应redis配置的数据模型类型)
	private static $dbRules			= [];//库名规则(分库规则)
	private static $tableRules		= [];//表名规则(包含分表、分区规则)
	//操作符
	private static $operatorRules	= ['>', '=', '<', '<>', '!=', '!>', '!<', '=>', '=<', '>=', '<=', 'IN', 'NOT IN', 'LIKE', 'REGEXP'];
	private static $subQueryRules	= ['IN', 'NOT IN'];//子查询操作符
	private static $fixConnector	= ['||'=>'OR','&&'=>'AND'];//修正连接符
	private static $orderRules		= ['asc', 'desc', 'ASC', 'DESC'];//排序规则(这里包含小写以方便处理)
	private static $arithmeticRules	= ['+', '-', '*', '/', '%'];//算术运算符
	
	/**
	 * 设置目标数据库
	 * @access public
	 * @param  string  $dbName     库名
	 * @param  mixed   $reference  参考值
	 * @return class
	 */
	public static function setDb($dbName, $reference = ''){
		if(empty(self::$dbRules)){
			self::$dbRules = zCoreConfig::loadConfig('dbRules');
		}
		if(!isset(self::$dbRules[$dbName])){
			trigger_error(T_DB_MAP_NOT_EXISTS, E_USER_ERROR);
		}
		self::$db = $dbName;
		self::$dbModelType = self::$dbRules[$dbName];
		return __CLASS__;
	}
	
	/**
	 * 设置目标数据表
	 * @access public
	 * @param  string  $tableName  库名
	 * @param  mixed   $reference  参考值
	 * @return class
	 */
	public static function setTable($tableName, $reference = ''){
		if(!isset(self::$tableRules[self::$db])){
			self::$tableRules[self::$db] = zCoreConfig::loadConfig('tableRules_' . self::$db);
		}
		if(!isset(self::$tableRules[self::$db][$tableName][0])){
			trigger_error(T_TABLE_MAP_NOT_EXISTS, E_USER_ERROR);
		}
		self::$table = $tableName;
		self::$realTable = self::parseRuleMap(PARSE_TYPE_TABLE, self::$tableRules[self::$db][$tableName][0], $reference, $tableName);
		if(!empty(self::$tableRules[self::$db][$tableName][2])){
			self::$modelType = self::$tableRules[self::$db][$tableName][2];
		}
		return __CLASS__;
	}
	
	/**
	 * 设置分区值(允许连续设置多个分区值)
	 * @access public
	 * @param  mixed  $reference  参考值
	 * @return class
	 */
	public static function setPartition($reference){
		if(!isset(self::$tableRules[self::$db][self::$table][1])){
			trigger_error(T_PARTITION_MAP_NOT_EXISTS, E_USER_ERROR);
		}
		if(!is_array($reference)){
			$reference = [$reference];
		}
		foreach($reference as $v){
			self::$partition[] = self::parseRuleMap(PARSE_TYPE_PARTITION, self::$tableRules[self::$db][self::$table][1], $v);
		}
		return __CLASS__;
	}
	
	/**
	 * 通用规则映射解析
	 * @access public
	 * @param  int     $type       解析类型(0库名、1表名、2分区值)
	 * @param  int     $ruleCode   规则代码
	 * @param  mixed   $reference  参考值(手机号码/时间戳)
	 * @param  string  $orgName    原始名称
	 * @return string/int
	 */
	private static function parseRuleMap($type, $ruleCode, $reference = '', $orgName = ''){
		$value = '';
		//日期类规则的默认参考值为当期时间戳
		if(!$reference && in_array($ruleCode, [MAP_RULE_YEAR, MAP_RULE_MONTH, MAP_RULE_QUARTER])){
			$reference = time();
		}
		switch($ruleCode){
			case MAP_RULE_MOBILE_SEGMENT://手机号段
				$value = substr($reference, 0, 3);
				break;
			case MAP_RULE_MOBILE_FOURTH://手机号码第四位
				$value = substr($reference, 3, 1);
				break;
			case MAP_RULE_YEAR:
				$value = date('Y', $reference);
				break;
			case MAP_RULE_MONTH:
				$value = date('Ym', $reference);
				break;
			case MAP_RULE_QUARTER:
				$value = date('Y', $reference).ceil(date('n', $reference) / 3);
				break;
			default://MAP_RULE_NORMAL常规
				break;
		}
		if($type == PARSE_TYPE_PARTITION){
			return is_numeric($value) ? (int)$value : $value;
		}
		$name = ($type == PARSE_TYPE_TABLE ? self::$prefix : '') . $orgName;
		return $value ? $name . '_' . $value : $name;
	}
	
	/**
	 * 设置字段名(允许连续设置多个字段)
	 * 
	 * 不设置任何值时默认读取全部
	 * 用法如下：
	 * ->field('id')
	 * ->field(['account', 'password'])
	 * 
	 * @access public
	 * @param  mixed  $mixed  字段名或数组
	 * @return class
	 */
	public static function field($mixed){
		if(!empty($mixed)){
			if(!is_array($mixed)){
				$mixed = [$mixed];
			}
			self::$field = array_merge(self::$field, $mixed);
		}
		return __CLASS__;
	}
	
	/**
	 * 设置条件(允许连续设置多个条件)
	 * 
	 * 不支持between
	 * 用法如下：
	 * ->where(['uid', '=', 1])
	 * ->where(['uid', '=', 1, 'and'])
	 * ->where([['uid', '=', 1, '&&('], ['id', '>=', 12, ')']])
	 * 
	 * @access public
	 * @param  array   $array  由字段名、操作符、值、逻辑（可空）组成的数组
	 * @return class
	 */
	public static function where($array){
		if(!empty($array)){
			if(is_array(reset($array))){//二维数组
				$tmpCondition = array_map([__CLASS__, 'fixCondition'], $array);
			}
			else{
				$tmpCondition = [self::fixCondition($array)];
			}
			self::$where = array_merge(self::$where, $tmpCondition);
		}
		return __CLASS__;
	}
	
	/**
	 * 设置分组(允许连续设置多个分组)
	 * 
	 * 用法如下：
	 * ->group('age')
	 * ->group(['age', 'familyName'])
	 * 
	 * @access public
	 * @param  mixed   $mixed  字段或字段数组
	 * @return class
	 */
	public static function group($mixed){
		if(!empty($mixed)){
			if(!is_array($mixed)){
				$mixed = [$mixed];
			}
			self::$group = array_merge(array_map([__CLASS__, 'fixField'], $mixed));
		}
		return __CLASS__;
	}
	
	/**
	 * 设置分组条件(允许连续设置多个分组条件)
	 * 
	 * 不支持between
	 * 用法如下：
	 * ->having(['id', '>', 0])
	 * ->having(['id', '>', 0, 'OR'])
	 * ->having([['id', '>', 0, '&&'], ['age', '>', 12]])
	 * 
	 * @access public
	 * @param  array   $array  由字段名、操作符、值、逻辑（可空）组成的数组
	 * @return class
	 */
	public static function having($array){
		if(!empty($array)){
			if(is_array(reset($array))){//二维数组
				$tmpCondition = array_map([__CLASS__, 'fixCondition'], $array);
			}
			else{
				$tmpCondition = [self::fixCondition($array)];
			}
			self::$having = array_merge(self::$having, $tmpCondition);
		}
		return __CLASS__;
	}
	
	/**
	 * 设置排序(允许连续设置多个排序方式)
	 * 
	 * 用法如下：
	 * ->order('age')
	 * ->order(['age', 'sort'])
	 * ->order(['age'=>'asc', 'sort'=>'desc'])
	 * 
	 * @access public
	 * @param  mixed   $mixed  字段或字段数组或字段与排序方式值对的数组
	 * @return class
	 */
	public static function order($mixed){
		if(!empty($mixed)){
			if(is_array($mixed)){
				foreach($mixed as $k => $v){
					self::$order[] = is_numeric($k) ?
						(self::fixField($v) . ' DESC') :
						(self::fixField($k) . ' ' . (in_array($v, self::$orderRules) ? strtoupper($v) : 'DESC'));
				}
			}
			else{
				self::$order[] = self::fixField($mixed) . ' DESC';
			}
		}
		return __CLASS__;
	}
	
	/**
	 * 设置查询限制
	 * 
	 * 用法如下：
	 * ->limit(5)
	 * ->limit(0, 5)
	 * 
	 * @access public
	 * @param  int  $first   第一个参数(如果有第二个参数则作为起始索引值，否则作为数量)
	 * @param  int  $second  数量
	 * @return class
	 */
	public static function limit($first, $second = null){
		if(!$second){
			self::$limit = '0,' . (int)$first;
		}
		else{
			self::$limit = (int)$first . ',' . (int)$second;
		}
		return __CLASS__;
	}
	
	/**
	 * 通过页码设置查询限制
	 * 
	 * 用法如下：
	 * ->page(1, 20)
	 * 
	 * @access public
	 * @param  int  $page  页码
	 * @param  int  $num   数量
	 * @return class
	 */
	public static function page($page, $num){
		self::$limit = ($page-1)*$num . ',' . $num;
		return __CLASS__;
	}
	
	/**
	 * 绑定数据（同时将原始数据转为二维数组）
	 * 
	 * 用法如下：
	 * ->data(1)
	 * ->data([1, 'admin', 'passwordkey'])
	 * ->data([[1, 'admin', 'passwordkey'], [2, 'admin2', 'passwordkey2']])
	 * 
	 * @access public
	 * @param  array   $mixed  数据
	 * @return class
	 */
	public static function data($mixed){
		$newData = [];
		$mixed = is_array($mixed) ? $mixed : [$mixed];
		foreach($mixed as $key => $val){
			//二维数据
			if(is_array($val)){
				foreach($val as $k => $v){
					//修正字符串
					$newData[$key][$k] = is_numeric($v) ? $v : "'$v'";
				}
			}
			else{
				//修正字符串
				$newData[0][$key] = is_numeric($val) ? $val : "'$val'";
			}
		}
		self::$data = $newData;
		return __CLASS__;
	}
	
	/**
	 * 修正条件
	 * @access private
	 * @param  array   $arr   条件数组
	 * @return array/false
	 */
	private static function fixCondition($arr){
		//数组长度大于2，即字段名、操作符、值是必须的，以及操作符的合法性
		if(is_array($arr) && count($arr) > 2 && in_array($arr[1], self::$operatorRules)){
			//修正字段名
			$arr[0] = self::fixField($arr[0]);
			//修正操作符为大写标准
			$arr[1] = strtoupper($arr[1]);
			//修正字符串类型的值
			$arr[2] = is_array($arr[2]) ? implode(',', $arr[2]) : $arr[2];
			$arr[2] = in_array($arr[1], self::$subQueryRules) ? "($arr[2])" : (is_numeric($arr[2]) ? $arr[2] : "'$arr[2]'");
			//修正逻辑部分
			$arr[3] = empty($arr[3]) ? 'AND' : strtr(strtoupper($arr[3]), self::$fixConnector);
			return $arr;
		}
		return false;
	}
	
	/**
	 * 修正字段名
	 * @access private
	 * @param  string   $field   字段名
	 * @return string
	 */
	private static function fixField(string $field){
		if($field && $field !== '*'){
			//分开处理一下可能使用的聚合函数
			$field = strpos($field, '(') ? strtr($field, ['('=>'(`', ')'=>'`)']) : "`$field`";
		}
		return $field;
	}
	
	/**
	 * 拼接查询字段
	 * @access private
	 * @return string
	 */
	private static function fieldToStr(){
		//空值则认为是获取全部字段
		if(empty(self::$field)){
			return '*';
		}
		return implode(',', array_map([__CLASS__, 'fixField'], self::$field));
	}
	
	/**
	 * 拼接查询条件
	 * @access private
	 * @return string
	 */
	private static function whereToStr(){
		if(!empty(self::$partition)){
			array_unshift(self::$where, self::fixCondition([self::$partitionName, 'IN', self::$partition]));
		}
		if(empty(self::$where)){
			return '';
		}
		$str = ' WHERE ';
		foreach(self::$where as $v){
			$str .= implode(' ', $v) . ' ';
		}
		//去掉可能存在的多余的与或逻辑
		return rtrim(rtrim(rtrim($str), 'AND'), 'OR');
	}
	
	/**
	 * 拼接需要插入的数据
	 * @access private
	 * @return string
	 */
	private static function insertDataToStr(){
		$str = '';
		foreach(self::$data as $v){
			$str .= '(' . implode(',', $v) . '),';
		}
		return rtrim($str, ',');
	}
	
	/**
	 * 拼接需要更新的数据
	 * @access private
	 * @return string
	 */
	private static function updateDateToStr(){
		$str = '';
		foreach(self::$data as $v){
			foreach(self::$field as $kk => $vv){
				//处理数据
				$data = $v[$kk] ?: '\'\'';
				//第一个字符是四则运算或取模符号，并且其余字符是数字
				if(in_array(substr($data, 0, 1), self::$arithmeticRules) && is_numeric(substr($data, 1))){
					$data = "`$vv`" . trim($data, ',');
				}
				$str .= "`$vv`=" . $data . ',';
			}
		}
		return rtrim($str, ',');
	}
	
	/**
	 * 拼接分组
	 * @access private
	 * @return string
	 */
	private static function groupToStr(){
		if(empty(self::$group)){
			return '';
		}
		$str = ' GROUP BY ' . implode(',', self::$group);
		if(!empty(self::$having)){
			$str .= ' HAVING ';
			foreach(self::$having as $v){
				$str .= implode(' ', $v) . ' ';
			}
			//去掉可能存在的多余的与或逻辑
			$str = rtrim(rtrim(rtrim($str), 'AND'), 'OR');
		}
		return $str;
	}
	
	/**
	 * 拼接排序方式
	 * @access private
	 * @return string
	 */
	private static function orderToStr(){
		return empty(self::$order) ? '' : ' ORDER BY ' . implode(',', self::$order);
	}
	
	/**
	 * 拼接查询限制
	 * @access private
	 * @return string
	 */
	private static function limitToStr(){
		return self::$limit ? ' LIMIT ' . self::$limit : '';
	}
	
	/**
	 * TODO 分表的时候，递增步需要查询是否存在，不存在则创建
	 * 获取查询信息数据库的语句
	 */
	 public static function tableInfoSql(){
	 	//SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'mshop_2016' AND TABLE_NAME ='ms_coupons';
	 }
	
	/**
	 * 取得sql语句
	 * @access private
	 * @param  string  $type  查询类型(CURD)
	 * @return string
	 */
	public static function sql($type){
		$sql = '';
		switch($type){
			case 'insert':
				$sql = 'INSERT INTO ' . self::$db . '.' . self::$realTable . '(' . self::fieldToStr() . ') VALUES ' . self::insertDataToStr();
				break;
			case 'update':
				$sql = 'UPDATE ' . self::$db . '.' . self::$realTable . ' SET ' . self::updateDateToStr() . self::whereToStr();
				break;
			case 'delete':
				$sql = 'DELETE FROM ' . self::$db . '.' . self::$realTable . self::whereToStr();
				break;
			default:
				$sql = 'SELECT ' . self::fieldToStr() . ' FROM ' . self::$db . '.' . self::$realTable . self::whereToStr() . self::groupToStr() . self::orderToStr() . self::limitToStr();
				break;
		}
		return $sql;
	}
	
	/**
	 * 清空当前查询设置
	 * @access private
	 */
	private static function clean(){
		self::$db			= '';
		self::$table		= '';
		self::$realTable	= '';
		self::$partition	= [];
		self::$field		= [];
		self::$where		= [];
		self::$order		= [];
		self::$group		= [];
		self::$having		= [];
		self::$data			= [];
		self::$limit		= '';
	}
}