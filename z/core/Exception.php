<?php
/**
 * 异常机制
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zCoreException extends Exception
{
	private static $_code;
	private static $_message;
	private static $_file;
	private static $_line;
	private static $fatalType = [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE];
	//重定义构造器使 message 变为必须被指定的属性  
	public function __construct($message, $code = 0){
		//确保所有变量都被正确赋值
		parent::__construct($message, $code);
		self::setAttr($this->code, $this->message, $this->file, $this->line);
	}
	
	/**
	 * 注册异常处理
	 * @access public
	 */
	public static function register(){
        set_error_handler([__CLASS__, 'appError']);
        set_exception_handler([__CLASS__, 'appException']);
        register_shutdown_function([__CLASS__, 'appShutdown']);
	}
	
	/**
	 * 错误处理方法
	 * @access public
     * @param  int     $code     错误编号
     * @param  string  $message  详细错误信息
     * @param  path    $file     出错的文件
     * @param  int     $line     出错行号
	 */
	public static function appError($code, $message, $file, $line){
		if(error_reporting() && $code){
			self::setAttr($code, $message, $file, $line);
			self::tips();
		}
	}
	
	/**
	 * 异常处理方法
	 * @access public
	 * @param  object  $objE  异常类
	 */
	public static function appException($objE){
		self::setAttr($objE->getCode(), $objE->getMessage(), $objE->getFile(), $objE->getLine());
		self::tips();
	}
	
	/**
	 * 终止时的处理方法
	 * @access public
	 */
	public static function appShutdown(){
		if(!is_null($error = error_get_last()) && in_array($error['type'], self::$fatalType)){
			self::setAttr($error['type'], $error['message'], $error['file'], $error['line']);
			self::tips();
		}
	}
	
	/**
	 * 设置类属性
	 * @access private
     * @param  int     $code     错误编号
     * @param  string  $message  详细错误信息
     * @param  path    $file     出错的文件
     * @param  int     $line     出错行号
	 */
	private static function setAttr($code, $message, $file, $line){
		self::$_code = $code;
		self::$_message = $message;
		self::$_file = $file;
		self::$_line = $line;
	}
	
	/**
	 * 使用友好的方式输出提示
	 * @access private
	 * @return string
	 */
	private static function getFriendlyTips(){
		return '<div style="padding: 24px 48px;"><h1>&gt;_&lt;#</h1><p>' . self::$_message . '</p>';
	}
	
	/**
	 * 使用规范的方式输出提示
	 * @access private
	 * @return string
	 */
	private static function getNormTips(){
		$content  = '<div style="padding: 24px 48px;"><h1>&gt;_&lt;#</h1>';
		$content .= '<p>code: ' . self::$_code . '</p>';
		$content .= '<p>message: ' . self::$_message . '</p>';
		$content .= '<p>file: ' . self::$_file . '</p>';
		$content .= '<p>line: ' . self::$_line . '</p>';
		//$content .= '<p><pre>debug_backtrace:' . var_export(debug_backtrace(), true) . '</p>';
		return $content;
	}
	
	/**
	 * 输出提示
	 * @access public
	 */
	public static function tips(){
		ob_clean();
		$content = zCoreConfig::$options['tips_mode'] ? self::getNormTips() : self::getFriendlyTips();
		zCoreResponse::setExpire(0)::setContent($content)::send();
		$content = date('Y-m-d H:i:s', zCoreRequest::server('REQUEST_TIME')) . ' ';
		$content .= zCoreRequest::ip() . ' ';
		$content .= self::$_code . ' ';
		$content .= self::$_message . ' ';
		$content .= self::$_file . ' ';
		$content .= self::$_line . ' ';
		$content .= zCoreRequest::server('REQUEST_URI') . ' ';
		zCoreLog::save('exceptionLog', $content);
		exit;
	}
}