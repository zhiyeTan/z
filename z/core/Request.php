<?php
/**
 * 请求管理
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zCoreRequest
{
	private static $error = [];//错误信息栈堆
	private static $exception = [];//异常键名集合
	private function __construct(){}//静态类，禁止构造对象
	
	/**
	 * 获取或添加错误信息栈堆
	 */
	public static function error($info = ''){
		if($info){
			self::$error[] = $info;
		}
		else{
			return self::$error;
		}
	}
	
	/**
	 * 获取或添加异常键名
	 * @access private
	 * @param  string  $type  指定类型
	 * @param  string  $key   键名
	 * @return array
	 */
	public static function exception($type, $key = ''){
		if($key){
			self::$exception[$type][] = $key;
		}
		else{
			return self::$exception[$type] ?? null;
		}
	}
	
	/**
	 * 获取或修改指定类型的参数
	 * @access private
	 * @param  string        $type   指定类型
	 * @param  string/array  $mixed  指定键名/更改指定键值对(值为null时表示删除)
	 * @return mixed
	 */
	private static function info($type, $mixed){
	    //表示删除或修改键值(仅支持get、post、files、cookie、session)
		if(!empty($mixed) && is_array($mixed)){
			if($type == 'cookie'){
				$expire = time() + zCoreConfig::$options['cookie_expire'];
			}
			foreach($mixed as $k => $v){
				if($type == 'cookie'){
					setcookie($k, $v, $v === null ? -1 : $expire, '/', self::getCookieScope(), zCoreConfig::$options['is_https']);
				}
				else{
					switch($type){
						case 'get':
							if($v === null){
								unset($_GET[$k]);
							}
							else{
								$_GET[$k] = $v;
							}
							break;
						case 'post':
							if($v === null){
								unset($_POST[$k]);
							}
							else{
								$_POST[$k] = $v;
							}
							break;
						case 'session':
							if($v === null){
								unset($_SESSION[$k]);
							}
							else{
								$_SESSION[$k] = $v;
							}
							break;
						case 'files':
							if($v === null){
								unset($_FILES[$k]);
							}
							else{
								$_FILES[$k] = $v;
							}
							break;
					}
				}
			}
			return true;
		}
		//表示清空整个变量(仅支持get、post、files)
		if($mixed === null){
            switch($type) {
                case 'get':
                    $_GET = [];
                    break;
                case 'post':
                    $_POST = [];
                    break;
                case 'files':
                    $_FILES = [];
                    break;
            }
            return true;
        }
		//cookie需要特别处理一下
		if($type == 'cookie'){
			$value = $_COOKIE[$mixed] ?? null;
			$data = $value ? json_decode($value, true) : null;
			return $data === null ? $value : $data;
		}
		switch($type){
			case 'get':
				$targetInfo = $_GET;
				break;
			case 'post':
				$targetInfo = $_POST;
				break;
			case 'request':
				$targetInfo = $_REQUEST;
				break;
			case 'server':
				$targetInfo = $_SERVER;
				break;
			case 'session':
				$targetInfo = $_SESSION;
				break;
			case 'files':
				$targetInfo = $_FILES;
				break;
			case 'headers':
				$targetInfo = getallheaders();
				break;
			default:
				$targetInfo = [];
		}
		return empty($mixed) ? $targetInfo : ($targetInfo[$mixed] ?? null);
	}
	
	/**
	 * 获取cookie作用域
	 * @access private
	 * @return string
	 */
	private static function getCookieScope(){
		static $scope;
		if(!$scope){
			$start = strpos($_SERVER['HTTP_HOST'], '.');
			$start = zCoreConfig::$options['cookie_same_domain'] || $start === false ? 0 : $start;
			$end = strrpos($_SERVER['HTTP_HOST'], ':');
			$end = $end === false ? strlen($_SERVER['HTTP_HOST']) : $end;
			$scope = substr($_SERVER['HTTP_HOST'], $start, $end - $start);
		}
		return $scope;
	}
	
	/**
	 * 获取或修改$_GET参数
	 * @access public
	 * @param  string/array  $mixed  指定键名/更改指定键值
	 * @return mixed
	 */
	public static function get($mixed = ''){
		return self::info('get', $mixed);
	}
	
	/**
	 * 获取或修改$_POST参数
	 * @access public
	 * @param  string/array  $mixed  指定键名/更改指定键值
	 * @return mixed
	 */
	public static function post($mixed = ''){
		return self::info('post', $mixed);
	}
	
	/**
	 * 获取$_REQUEST参数
	 * @access public
	 * @param  string  $key  指定键名
	 * @return mixed
	 */
	public static function request($key = ''){
		return self::info('request', $key);
	}

	/**
	 * 获取$_SERVER参数
	 * @access public
	 * @param  string  $key  指定键名
	 * @return mixed
	 */
	public static function server($key = ''){
		return self::info('server', $key);
	}

	/**
	 * 获取或修改$_COOKIE参数
	 * @access public
	 * @param  string/array  $mixed  指定键名/更改指定键值
	 * @return mixed
	 */
	public static function cookie($mixed = ''){
		return self::info('cookie', $mixed);
	}

	/**
	 * 获取或修改$_SESSION参数
	 * @access public
	 * @param  string/array  $mixed  指定键名/更改指定键值
	 * @return mixed
	 */
	public static function session($mixed = ''){
		//配置并开启session
		static $ready;
		if(!$ready){
			ini_set('session.auto_start', 0);
			ini_set('session.cache_expire', zCoreConfig::$options['session_expire']);
			ini_set('session.use_trans_sid', 0);
			ini_set('session.use_cookies', 1);
			session_start();
			$ready = 1;
		}
		return self::info('session', $mixed);
	}

	/**
	 * 获取或修改$_FILES参数
	 * @access public
	 * @param  string/array  $mixed  指定键名/更改指定键值
	 * @return mixed
	 */
	public static function files($mixed = ''){
		return self::info('files', $mixed);
	}

	/**
	 * 获取header参数
	 * @access public
	 * @param  string  $key  指定键名
	 * @return mixed
	 */
	public static function headers($key = ''){
		return self::info('headers', $key);
	}
	
	/**
	 * 获取请求参数
	 * @access public
	 * @param  string  $key  指定键名(如cookie.key, server.key)
	 * @return mixed
	 */
	public static function param($key){
		$keys = explode('.', $key);
		return self::info($keys[0], $keys[1]);
	}
	
	/**
	 * 判断是否存在请求参数
	 * @access public
	 * @param  $key  string  指定键名(如cookie.key, server.key)
	 * @return bool
	 */
	public static function has($key){
		return self::param($key) !== null;
	}
	
	/**
	 * 判断是否为cli模式
	 * @access public
	 * @return bool
	 */
	public static function isCli(){
		return !!preg_match('/cli/i', php_sapi_name());
	}
	
	/**
	 * 判断是否为cgi模式
	 * @access public
	 * @return bool
	 */
	public static function isCgi(){
		return !!preg_match('/cgi/i', php_sapi_name());
	}
	
	/**
	 * 判断是否为移动端
	 * @access public
	 * @return bool
	 */
	public static function isMobile(){
		$userAgent = self::headers('User-Agent');
		if(preg_match('/iphone/i', $userAgent)){
			return true;
		}
		if(preg_match('/android/i', $userAgent) && !preg_match('/pad/i', $userAgent)){
			return true;
		}
		return false;
	}
	
	/**
	 * 判断是否为平板端
	 * @access public
	 * @return bool
	 */
	public static function isPad(){
		return !!preg_match('/pad/i', self::headers('User-Agent'));
	}
	
	/**
	 * 判断是否为PC端
	 * @access public
	 * @return bool
	 */
	public static function isPc(){
		return !self::isMobile() && !self::isPad();
	}
	
	/**
	 * 获取当前域名
	 * @access public
	 * @return string
	 */
	public static function domain($withHttp = false){
		return ($withHttp ? self::server('REQUEST_SCHEME') . '://' : '') . self::server('HTTP_HOST');
	}
	
	/**
	 * 获取当前URL
	 * @access public
	 * @return string
	 */
	public static function url(){
		return self::domain(true) . self::server('REQUEST_URI');
	}

    /**
     * 获取当前请求的应用名
     * @access public
     * @return string
     */
    public static function appid(){
        return APP_ID;
    }
	
	/**
	 * 获取当前请求的模块名
	 * @access public
	 * @return string
	 */
	public static function module(){
		return APP_MODULE;
	}
	
	/**
	 * 获取当前请求的业务名
	 * @access public
	 * @return string
	 */
	public static function business(){
		return APP_BUSINESS;
	}
	
	/**
	 * 获取客户端ip地址
	 * @access public
	 * @return string
	 */
	public static function ip(){
		static $ip;
		if(!$ip){
			$ip = self::server('REMOTE_ADDR');
			if(!$ip){
				if(self::server('HTTP_X_FORWARDED_FOR')){
					$arr = explode(',', self::server('HTTP_X_FORWARDED_FOR'));
					$pos = array_search('unknown', $arr);
					if($pos !== false) unset($arr[$pos]);
					$ip = trim(current($arr));
				}
				else{
					$ip = self::server('HTTP_CLIENT_IP') ? self::server('HTTP_CLIENT_IP') : self::server('REMOTE_ADDR');
					$ip = $ip ? $ip : '0.0.0.0';
				}
			}
		}
		return $ip;
	}
	
}
