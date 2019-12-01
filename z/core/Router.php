<?php
/**
 * 路由策略
 * 使用URL重写规则后，到达php-fpm的URL将形如："协议名://主机名/index.php?s=..."
 * 包括以下3种路由模式：
 * DEFAULT_ROUTER_MODEL => 协议名://主机名/应用或模块名称(index时省略)/业务名称-key-value-key-value...
 * SHORTURL_ROUTER_MODEL => 协议名://主机名/六位字符串
 * DIRECTORY_ROUTER_MODEL => 协议名://主机名/应用或模块名称/业务名称/key/value/key/value...
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zCoreRouter
{
	private function __construct(){}//静态类，不允许实例化

	/**
	 * 创建Url
	 * @access public
	 * @param  array   $args     参数键值对数组
	 * @param  int     $pattern  路由模式
	 * @param  string  $domain   完整域名（包含协议部分）
	 * @param  string  $suffix   后缀名
	 * @return string
	 */
	public static function mkUrl($args, $pattern = DEFAULT_ROUTER_MODEL, $domain = '', $suffix = 'html'){
		$url = trim($domain, '/') . '/';
		$args = array_merge(['a'=>zCoreRequest::appid(), 'm'=>zCoreRequest::module(), 'b'=>zCoreRequest::business()], $args);
		ksort($args);
		//短地址模式
		if($pattern == SHORTURL_ROUTER_MODEL){
			$queryStr = http_build_query($args);
			$hashStr = md5(AUTHOR_KEY . $queryStr);
			//将加密串分成4段计算
			for($i = 0; $i < 4; $i++){
				//将截取每段字符并转为10进制数组，再与0x3fffffff做位与运算（即把30位以后的字符归零）
				$idx = hexdec(substr($hashStr, $i << 2, 4)) & 0x3fffffff;
				//生成6位短链接
				$tmpStr = '';
				for($j = 0; $j < 6; $j++){
					//与$basechar的最大下标0x0000003d（即61）做位与运算得到新的数组下标后取得对应的值
					$tmpStr .= BASE_CHAR_MAP[$idx & 0x0000003d];
					$idx = $idx >> 5;
				}
				//如果不存在映射或已存在映射，跳出循环
				$map = zModCache::getUrlMap($tmpStr);
				if(!$map || $map === $queryStr){
					break;
				}
			}
			//如果不存在映射，建立映射
			if(!$map){
				zModCache::saveUrlMap($tmpStr, $queryStr);
			}
			$url .= $tmpStr;
		}
		//默认模式和目录模式的结构类似，可兼容处理
		else{
			$separator = $pattern == DIRECTORY_ROUTER_MODEL ? '/' : '-';
			if($pattern == DIRECTORY_ROUTER_MODEL || $args['a'] != 'default'){
				$url .= $args['a'] . '/';
			}
			if(!empty($args['m'])){
			    $url .= $args['m'] . '/';
            }
			$url .= $args['b'] . $separator;
			unset($args['a'], $args['m'], $args['b']);
			$url .= strtr(http_build_query($args), '=&', $separator);
			$url  = trim($url, $separator);
		}
		$url .= $suffix ? '.' . $suffix : '';
		return $url;
	}

	/**
	 * 解析请求
	 * @access public
	 */
	public static function parse(){
		$arrRequest = [];
		$strRequest = zCoreRequest::get('s') ?? '';
		zCoreRequest::get(['s'=>null]);
		if($strRequest){
			//先移除无关紧要的后缀名
			if($idx = strpos($strRequest, '.')){
				$strRequest = substr($strRequest, 0, $idx);
			}
			//首先判断以何种模式处理(具体参考RequestString.xlsx)
			$pattern = strpos($strRequest, '-') ? DEFAULT_ROUTER_MODEL
					 :(strpos($strRequest, '/') ? DIRECTORY_ROUTER_MODEL
					 :(strlen($strRequest) == 6 || preg_match('/\d/', $strRequest) ? SHORTURL_ROUTER_MODEL : DEFAULT_ROUTER_MODEL));
			//短地址模式的逆向处理
			if($pattern == SHORTURL_ROUTER_MODEL){
				$data = zModCache::getUrlMap($strRequest);
				if($data !== false){
					parse_str($data, $tmpQueryArr);
					foreach($tmpQueryArr as $k => $v){
						$arrRequest[$k] = $v;
					}
				}
				//如果匹配不到短地址则认为是默认模式的业务名称
				else{
					$arrRequest['b'] = $strRequest;
				}
			}
			//默认模式和目录模式的结构类似，可兼容处理
			else{
				$separator = $pattern == DEFAULT_ROUTER_MODEL ? '-' : '/';
				if($pattern == DEFAULT_ROUTER_MODEL){
					$strRequest = strpos($strRequest, '/') ? str_replace('/', '-', $strRequest) : 'default-' . $strRequest;
				}
				$tmpArr = explode($separator, trim($strRequest, $separator));
                $arrRequest['a'] = $tmpArr[0];
                $arrRequest['m'] = $tmpArr[1] ?? '';
                $arrRequest['b'] = $tmpArr[2] ?? 'index';
                $startIndex = zCoreApp::checkBusiness($arrRequest['a'], $arrRequest['m'], $arrRequest['b']) ? 3 : 2;
                if($startIndex == 2){
                    $arrRequest['m'] = '';
                    $arrRequest['b'] = $tmpArr[1] ?? 'index';
                }
                $tmpArr = array_slice($tmpArr, $startIndex);
                foreach($tmpArr as $k => $v){
                    if($k % 2 == 0){
                        $arrRequest[$v] = $tmpArr[$k + 1] ?? '';
                    }
                }
			}
		}
		self::complementBasicParam($arrRequest);
		zCoreRequest::get($arrRequest);
		$domainMap = zCoreConfig::getDomainMap();
		//如果是默认应用，根据域名映射取得对应的应用ID(应用目录)
		if($arrRequest['a'] == 'default' && !empty($domainMap)){
		    $arrRequest['a'] = $domainMap[0];
        }
		//判断是否允许访问当前应用/模块
		if(!empty($domainMap) && !in_array($arrRequest['a'], $domainMap)){
			trigger_error(T_NO_PERMISSION_MODULE, E_USER_ERROR);
		}
		//定义应用/模块目录和业务名称为常量
        define('APP_ID', $arrRequest['a']);
        define('APP_MODULE', $arrRequest['m']);
		define('APP_BUSINESS', $arrRequest['b']);
	}

    /**
     * 补全基本的参数
     * @access public
     * @param  array  $requestParam  请求参数
     * @return array
     */
    public static function complementBasicParam(&$requestParam){
        $requestParam['a'] = $requestParam['a'] ?? 'default';
        $requestParam['m'] = $requestParam['m'] ?? '';
        $requestParam['b'] = $requestParam['b'] ?? 'index';
        return $requestParam;
    }
	
	/**
	 * 重定向静态资源
	 * @access public
	 * @param  string  $content  内容
	 * @return string
	 */
	public static function redirectStaticResources($content){
		$pattern = '/(\\\?(\'|"))((?!http)[^\'|\"]*?\.(' . zCoreConfig::$options['static_suffix'] . '))(.*?)(\\\?(\'|"))/i';
		$replacement = '\1' . zCoreConfig::$options['static_domain'] . '\3\5\6';
		return preg_replace($pattern, $replacement, $content);
	}
}
