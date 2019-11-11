<?php
/**
 * 异常机制
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zCoreException extends Exception
{
	private static $inBusiness = false;//标记是否进入业务逻辑
	private static $fatalType = [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE];
	//重定义构造器使 message 变为必须被指定的属性  
	public function __construct($message, $code = 0){
		//确保所有变量都被正确赋值
		parent::__construct($message, $code);
		self::error([$this->code, $this->message, $this->file, $this->line]);
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
			self::error([$code, $message, $file, $line]);
		}
	}
	
	/**
	 * 异常处理方法
	 * @access public
	 * @param  object  $objE  异常类
	 */
	public static function appException($objE){
		self::error([$objE->getCode(), $objE->getMessage(), $objE->getFile(), $objE->getLine()]);
	}
	
	/**
	 * 终止时的处理方法
	 * @access public
	 */
	public static function appShutdown(){
		if(!is_null($error = error_get_last()) && in_array($error['type'], self::$fatalType)){
			self::error([$error['type'], $error['message'], $error['file'], $error['line']]);
		}
	}
	
	/**
	 * 标记进入业务逻辑
	 * @access public
	 */
	public static function inBusiness(){
		self::$inBusiness = true;
	}
	
	/**
	 * 统一的错误处理方法
	 * @access private
	 */
	private static function error($errInfo){
		self::saveErrorLog($errInfo);
		if(self::$inBusiness && !zCoreConfig::$options['debug_mode']){
			zCoreRequest::error($errInfo);
		}
		else{
			self::responseError($errInfo);
		}
	}
	
	/**
	 * 输出错误信息
	 * @access private
	 */
	private static function responseError($errInfo){
		$content  = '<div style="padding: 24px 48px;"><h1>&gt;_&lt;#</h1>';
		$content .= '<p>code: ' . $errInfo[0] . '</p>';
		$content .= '<p>message: ' . $errInfo[1] . '</p>';
		$content .= '<p>file: ' . $errInfo[2] . '</p>';
		$content .= '<p>line: ' . $errInfo[3] . '</p>';
		ob_clean();
		zCoreResponse::setExpire(0)::setContent($content)::send();
		exit;
	}
	
	/**
	 * 保存错误日志
	 * @access private
	 */
	private static function saveErrorLog($errInfo){
		$content = date('Y-m-d H:i:s', $_SERVER['REQUEST_TIME']) . ' ';
		$content .= zCoreRequest::ip() . ' ';
		$content .= $errInfo[0] . ' ';
		$content .= $errInfo[1] . ' ';
		$content .= $errInfo[2] . ' ';
		$content .= $errInfo[3] . ' ';
		$content .= $_SERVER['REQUEST_URI'] . ' ';
		zCoreLog::save('exceptionLog', $content);
	}
}