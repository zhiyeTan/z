<?php
/**
 * 控制器
 * 
 * @author 谈治烨<594557148@qq.com>
 */
trait zConController
{
	//受许可的GET参数的键名数组，如：['cid', 'keyword', 'page']
	//需验证的GET参数的键名及规则值对数组，如：['cid'=>'int', 'keyword'=>'addslashes', 'page'=>'int']
	//需过滤的GET参数的键名，默认值，规则数组，如：[['cid', 0, 'int'], ['keyword', '', 'addslashes', ['page', 1, 'int']]]
	//POST同理
	protected $getAllowedKeys = [];
	protected $getVerifyRules = [];
	protected $getFilterRules = [];
	protected $postAllowedKeys = [];
	protected $postVerifyRules = [];
	protected $postFilterRules = [];
	
	public $data = [];//数据栈
	
	protected $errno = 0;//错误代码
	protected $message = '';//错误信息
	protected $view_error = '';//异常视图模版
	
	protected $useCache = true;//是否使用缓存
	private $cacheName;//缓存名
	public $cache;//缓存

    protected $simulateRequestParam = null;//模拟的请求参数，如果有，那么returnData方法将使用此参数暂时替换实际请求参数

	/**
	 * 公共的初始化方法
	 * @access private
     * @param  array  $requestParam  默认获取当前URL传递的参数，如果传递了数组，那么根据数组参数进行初始化
	 */
	private function init($requestParam = null){
	    if(is_array($requestParam)){
            zCoreRouter::complementBasicParam($requestParam);
            $this->simulateRequestParam = $requestParam;
        }
	    else{
            $this->checkRequest('get');
            $this->checkRequest('post');
            $requestParam = zCoreRequest::get();
        }
		ksort($requestParam);//统一排序，确保缓存的唯一性
		$this->cacheName = $requestParam['a'] . '-' . $requestParam['m'] . '-' . $requestParam['b'] . '-' . md5(http_build_query($requestParam));
		$this->cache = zModCache::getAppDataCache($this->cacheName);
	}

    /**
     * 跳转到指定参数的地址
     * @access public
     * @param  array   $args     参数键值对数组
     * @param  int     $pattern  路由模式
     * @param  string  $domain   完整域名（包含协议部分）
     * @param  string  $suffix   后缀名
     */
    public static function goto($args, $pattern = DEFAULT_ROUTER_MODEL, $domain = '', $suffix = 'html'){
        $url = is_string($args) ? $args : zCoreRouter::mkUrl($args, $pattern, $domain, $suffix);
        header('Location:'.$url);
        exit;
    }
	
	/**
	 * 赋值到数据栈中
	 * @access public
	 * @param  string  $mixed  键名或键值对数组
	 * @param  string  $value  键值（$key为非数组时有效）
	 */
	protected function assign($mixed, $value = ''){
		if(is_array($mixed)){
			foreach($mixed as $k => $v){
				$this->data[$k] = $v;
			}
		}
		else{
			$this->data[$mixed] = $value;
		}
	}

	/**
	 * 校验请求
	 * @access public
	 * @param  str  $requestType  请求类型(get/post)
	 */
	protected function checkRequest($requestType){
		//分别确定目标数组、许可键名数组、验证数组、过滤数组、基础键名数组、异常日志文件名
		$method  = $requestType == 'get' ? 'get' : 'post';
		$target  = zCoreRequest::$method();
		$allows  = $requestType == 'get' ? $this->getAllowedKeys : $this->postAllowedKeys;
		$verifys = $requestType == 'get' ? $this->getVerifyRules : $this->postVerifyRules;
		$filters = $requestType == 'get' ? $this->getFilterRules : $this->postFilterRules;
		$basics  = $requestType == 'get' ? ['a', 'b'] : ['token'];
		$logName = $requestType == 'get' ? 'illegalGetLog' : 'abnormalPoscho';
		
		//获得不被允许的参数键名(空表示不限制传入参数)
		$diff = empty($allows) ? '' : array_diff(array_keys($target), array_merge($basics, $allows));
		//验证参数的合法性
		foreach($verifys as $k => $rule){
			//不合法时标记错误
			if(!get_called_class()::verify($target[$k] ?? null, $rule)){
				$error = true;
				zCoreRequest::exception($method, $k);
			}
		}
		//若存在差异键名或非法验证，记录请求信息到日志中
		if(!empty($diff) || !empty(zCoreRequest::exception($method))){
			$content = date('Y-m-d H:i:s', zCoreRequest::server('REQUEST_TIME')) . ' ';
			$content .= zCoreRequest::ip() . ' ';
			$content .= $requestType == 'get' ? zCoreRequest::server('REQUEST_URI') : var_export(zCoreRequest::post(), true);
			zCoreLog::save($logName, $content);
			//删除多余的参数
			if(!empty($diff)){
				zCoreRequest::$method(array_fill_keys($diff, null));
			}
		}
		//过滤参数
		foreach($filters as $k => $rule){
			zCoreRequest::$method([$k => get_called_class()::filter($target[$k] ?? null, $rule)]);
		}
	}
	
	/**
	 * 主方法(相应相关的业务逻辑都应该放在这个方法下)
	 */
	protected function main(){}
}
