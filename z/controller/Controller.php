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
	
	protected $errno = 0;
	protected $message = '';
	
	protected $useCache = true;//是否使用缓存
	private $cacheName;//缓存名
	public $cache;//缓存
	
	/**
	 * 公共的初始化方法
	 * @access private
	 */
	private function init(){
		$this->checkRequest('get');
		$this->checkRequest('post');
		$param = zCoreRequest::get();
		ksort($param);//统一排序，确保缓存的唯一性
		$this->cacheName = APP_DIR . '-' . APP_BUSINESS . '-' . md5(http_build_query($param));
		$this->cache = zModCache::getAppDataCache($this->cacheName);
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

		$error = false;
		//获得不被允许的参数键名(空表示不限制传入参数)
		$diff = empty($allows) ? '' : array_diff(array_keys($target), array_merge($basics, $allows));
		//验证参数的合法性
		foreach($verifys as $k => $rule){
			//不合法时标记错误
			if(!get_called_class()::verify($target[$k] ?? null, $rule)){
				$error = true;
				break;
			}
		}
		//若存在差异键名或非法验证，记录请求信息到日志中
		if($diff || $error){
			$content = date('Y-m-d H:i:s', zCoreRequest::server('REQUEST_TIME')) . ' ';
			$content .= zCoreRequest::ip() . ' ';
			$content .= $requestType == 'get' ? zCoreRequest::server('REQUEST_URI') : var_export(zCoreRequest::post(), true);
			zCoreLog::save($logName, $content);
			//参数不合法时触发错误处理
			if($error){
				trigger_error(T_ILLEGAL_PARAMETER, E_USER_ERROR);
			}
			//删除多余的参数
			zCoreRequest::$method(array_fill_keys($diff, null));
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

	/**
     * 创建一个异步任务(配合swoole使用)
     * @access public
     * @param  string  $className  类名
     * @param  string  $action     方法名
     * @param  arrray  $args       参数
     */
	public function createAsyncTask($className, $action, $args = []){
	    //等待开启的任务
        //进行中的任务
        //任务处理细节
        //线程的开辟与回收
        //如何分配任务到线程
    }
}
