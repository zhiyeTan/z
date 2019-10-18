<?php
/**
 * 响应管理
 * 
 * @author 谈治烨<594557148@qq.com>
 * 
 */
class zCoreResponse
{
	//状态码地图（常用200、301、304、401、404）
	private static $codeMap = [
		100 => 'HTTP/1.1 100 Continue',
		101 => 'HTTP/1.1 101 Switching Protocols',
		200 => 'HTTP/1.1 200 OK',
		201 => 'HTTP/1.1 201 Created',
		202 => 'HTTP/1.1 202 Accepted',
		203 => 'HTTP/1.1 203 Non-Authoritative Information',
		204 => 'HTTP/1.1 204 No Content',
		205 => 'HTTP/1.1 205 Reset Content',
		206 => 'HTTP/1.1 206 Partial Content',
		300 => 'HTTP/1.1 300 Multiple Choices',
		301 => 'HTTP/1.1 301 Moved Permanently',
		302 => 'HTTP/1.1 302 Found',
		303 => 'HTTP/1.1 303 See Other',
		304 => 'HTTP/1.1 304 Not Modified',
		305 => 'HTTP/1.1 305 Use Proxy',
		307 => 'HTTP/1.1 307 Temporary Redirect',
		400 => 'HTTP/1.1 400 Bad Request',
		401 => 'HTTP/1.1 401 Unauthorized',
		402 => 'HTTP/1.1 402 Payment Required',
		403 => 'HTTP/1.1 403 Forbidden',
		404 => 'HTTP/1.1 404 Not Found',
		405 => 'HTTP/1.1 405 Method Not Allowed',
		406 => 'HTTP/1.1 406 Not Acceptable',
		407 => 'HTTP/1.1 407 Proxy Authentication Required',
		408 => 'HTTP/1.1 408 Request Time-out',
		409 => 'HTTP/1.1 409 Conflict',
		410 => 'HTTP/1.1 410 Gone',
		411 => 'HTTP/1.1 411 Length Required',
		412 => 'HTTP/1.1 412 Precondition Failed',
		413 => 'HTTP/1.1 413 Request Entity Too Large',
		414 => 'HTTP/1.1 414 Request-URI Too Large',
		415 => 'HTTP/1.1 415 Unsupported Media Type',
		416 => 'HTTP/1.1 416 Requested range not satisfiable',
		417 => 'HTTP/1.1 417 Expectation Failed',
		500 => 'HTTP/1.1 500 Internal Server Error',
		501 => 'HTTP/1.1 501 Not Implemented',
		502 => 'HTTP/1.1 502 Bad Gateway',
		503 => 'HTTP/1.1 503 Service Unavailable',
		504 => 'HTTP/1.1 504 Gateway Time-out' 
	];
	//内容类型地图
	private static $contentTypeMap = [
		'html'			=> 'Content-Type: text/html; charset=utf-8',
		'plain'			=> 'Content-Type: text/plain',
		'jpeg'			=> 'Content-Type: image/jpeg',
		'zip'			=> 'Content-Type: application/zip',
		'pdf'			=> 'Content-Type: application/pdf',
		'mpeg'			=> 'Content-Type: audio/mpeg',
		'css'			=> 'Content-type: text/css',
		'javascript'	=> 'Content-type: text/javascript',
		'json'			=> 'Content-type: application/json',
		'xml'			=> 'Content-type: text/xml',
		'flash'			=> 'Content-Type: application/x-shockw**e-flash'
	];
	private static $code = 200;//状态码
	private static $contentType = 'html';//内容类型
	private static $content;//响应内容
	private static $expire;//本地缓存时间
	private function __construct(){}//禁止直接创建对象
	
	/**
	 * 设置内容类型
	 * 
	 * @access public
	 * @param  string  $type  内容类型
	 * @return class
	 */
	public static function setContentType($type){
		if(in_array($type, array_keys(self::$contentTypeMap))){
			self::$contentType = $type;
		}
		return __CLASS__;
	}
	
	/**
	 * 设置响应内容
	 * @access public
	 * @param  string  $content  响应内容
	 * @return class
	 */
	public static function setContent($content){
		//保存到属性中
		self::$content = $content;
		return __CLASS__;
	}
	
	/**
	 * 设置响应状态码
	 * 
	 * @access public
	 * @param  number  $code  状态吗
	 * @return class
	 */
	public static function setCode($code){
		if(in_array($code, array_keys(self::$codeMap))){
			self::$code = $code;
		}
		return __CLASS__;
	}
	
	/**
	 * 设置本地缓存时间
	 * 
	 * @access public
	 * @param  number  $timeStamp  有效时间（单位s）
	 * @return class
	 */
	public static function setExpire($timeStamp){
		self::$expire = (int)$timeStamp;
		return __CLASS__;
	}
	
	/**
	 * 发送数据到客户端
	 * 
	 * @access public
	 */
	public static function send(){
		//检查 HTTP 表头是否已被发送
		if(!headers_sent()){
			$expire = self::$expire ?? zCoreConfig::$options['local_expire'];
			//发送头部信息
			header(self::$codeMap[self::$code]);
			header('Content-language: ' . zCoreConfig::$options['default_lang']);
			header('Cache-Control: max-age=' . $expire . ',must-revalidate');
			header('Last-Modified:' . gmdate('D,d M Y H:i:s') . ' GMT');
			header('Expires:' . gmdate('D,d M Y H:i:s', zCoreRequest::server('REQUEST_TIME') + $expire) . ' GMT');
			header(self::$contentTypeMap[self::$contentType]);
		}
		echo self::$content;
		if(function_exists('fastcgi_finish_request')){
			//提高页面响应
			fastcgi_finish_request();
		}
		echo '响应完毕';
	}
}
