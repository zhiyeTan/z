<?php
/**
 * 核心方法
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zCoreMethod
{
	/**
	 * 创建文件夹
	 * @access  public
	 * @param   string  $folderPath  目录路径
	 */
	public static function mkFolder($folderPath){
		if(!is_dir($folderPath)){
			@mkdir($folderPath, 0777, true);
		}
	}
	
	/**
	 * 读取文档内容(2M以内采用此方法)
	 * @access public
	 * @param  path  $filePath  文件路径
	 * @return string/bool
	 */
	public static function read($filePath){
		$data = false;
		if(is_file($filePath) && is_readable($filePath)){
			$fp = fopen($filePath, 'r');
			if(flock($fp, LOCK_SH)){
				$data = @fread($fp, filesize($filePath));
			}
			fclose($fp);
		}
		return $data;
	}
	
	/**
	 * 写入文档内容
	 * @access public
	 * @param  path        $filePath    文件路径
	 * @param  string      $content     需要写入的内容
	 * @param  true/false  $changeFlag  是否变更内容，默认true
	 * @param  true/false  $coverFlag   是否覆盖原内容（覆盖或追加），默认true
	 * @return boolean
	 */
	public static function write($filePath, $content, $changeFlag = true, $coverFlag = true){
		$bool = false;
		if(!$changeFlag && is_file($filePath)){
			$bool = true;
		}
		if(!$bool && (!is_file($filePath) || is_writeable($filePath))){
			$mode = $coverFlag ? 'w' : 'ab';
			$file = fopen($filePath, $mode);
			if(flock($file, LOCK_EX)){
				$bool = fputs($file, $content) ? true : false;
			}
			fclose($file);
		}
		return $bool;
	}
	
	/**
	 * 列出指定目录的结构树
	 * @access public
	 * @param  path   $targetPath   目录路径
	 * @param  array  $filterFiles  要过滤的文件数组
	 * @return array
	 */
	public static function listDirTree($targetPath, $filterFiles = []){
		$trees = self::recursiveDealDir($targetPath, true);
		return self::quickHandler($trees, 'children', [__CLASS__, 'filterDirInfo'], [$filterFiles, $targetPath]);
	}
	
	/**
	 * 删除指定目录下的所有文件
	 * PS.由于这里只执行删除操作，忽略可能产生的错误，所以要确保成功删除的话，需要在函数调用后检查一下该目录是否存在
	 * @access public
	 * @param  path  $targetPath  目录路径
	 */
	public static function deleteDir($targetPath){
		return self::recursiveDealDir($targetPath);
	}
	
	/**
	 * 递归处理目录
	 * 由于list和delete由同一参数控制，对外开放具有风险，因此由另外语义明确的函数调用
	 * @access  private
	 * @param   path     $targetPath  目录路径
	 * @param   boolean  $deleteFlag  处理方式（默认false删除，true获取文档树）
	 * @param   int      $level       文档相对目录的层级
	 * @return  nothing/array
	 */
	private static function recursiveDealDir($targetPath, $deleteFlag = false, $level = 0){
		$i = 0;
		$res = [];
		$fp = dir($targetPath);
		while(false != ($item = $fp->read())){
			//跳过.:
			if($item == '.' || $item == '..'){
				continue;
			}
			$tmpPath = rtrim($fp->path, Z_DS) . Z_DS . $item;
			$type = is_dir($tmpPath);
			//这部分是获取文档树用的
			if($deleteFlag){
				$res[$i] = [
					'name'	=> $item,
					'path'	=> $tmpPath,
					'type'	=> $type,
					'level'	=> $level
				];
				if($type){
					$res[$i]['children'] = self::recursiveDealDir($tmpPath, $deleteFlag, $level + 1);
				}
				$i++;
			}
			//这部分是执行删除操作
			else{
				if($type){
					self::recursiveDealDir($tmpPath, false);
					@rmdir($tmpPath);
				}
				else{
					@unlink($tmpPath);
				}
			}
		}
		$fp->close();
		return $res;
	}
	
	/**
	 * 递归过滤掉目录树的指定信息
	 * @access private
	 * @param  array  $dirInfo      目录结构信息
	 * @param  array  $filterFiles  要过滤的文件数组
	 * @param  path   $baseDir      基准路径
	 * @param  bool   $hiddenPath   是否隐藏物理路径
	 * @return array
	 */
	private static function filterDirInfo($dirInfo, $filterFiles, $baseDir, $hiddenPath = true){
		if(in_array($dirInfo['name'], $filterFiles)){
			return false;
		}
		$dirInfo['link'] = str_replace(Z_DS, '/', str_replace($baseDir, '', $dirInfo['path']));
		if($hiddenPath){
			unset($dirInfo['path']);
		}
		return $dirInfo;
	}
	
	/**
	 * 快速处理数组
	 * @access public
	 * @param  array   $arrTarget    目标数组
	 * @param  string  $key          多维子数组的键名
	 * @param  array   $funCallBack  回调函数(调用类方法时以数组形式传参，eg:[__CLASS__, 'method'])
	 * @param  array   $funParam     回调函数的参数(不包含目标数组，且回调函数的目标数组必须是第一个参数)
	 * @param  int     $thread       线程数
	 * @return array
	 */
	public static function quickHandler($arrTarget, $key, $funCallBack, $funParam, $thread = 5){
		if(empty($arrTarget)){
			return [];
		}
		$result = [];
		$size = ceil(count($arrTarget) / $thread);
		$chunks = array_chunk($arrTarget, $size);
		for($i = 0; $i < $size; $i++){
			for($j = 0; $j < $thread; $j++){
				if(!empty($chunks[$j][$i])){
					$tmpParam = $funParam;
					array_unshift($tmpParam, $chunks[$j][$i]);
					$tmpArr = call_user_func_array($funCallBack, $tmpParam);
					if(!empty($tmpArr[$key])){
						$tmpArr[$key] = self::quickHandler($chunks[$j][$i][$key], $key, $funCallBack, $funParam, $thread);
					}
					if($tmpArr){
						$result[] = $tmpArr;
					}
				}
			}
		}
		return $result;
	}
	
	/**
	 * 初始化curl
	 * 注：在windows运行nginx不会自动生成php-cgi.exe进程，如有必要，需配合php-fpm使用
	 * @access private
	 * @param  string  $url       请求地址(包含协议域名的完整地址)
	 * @param  array   $postData  post数据
	 * @return curl句柄
	 */
	private static function curlInit($url, $postData){
		$options = [
			CURLOPT_URL => $url,
			CURLOPT_HEADER => 0,
			CURLOPT_CONNECTTIMEOUT => 1,
			CURLOPT_TIMEOUT => 3,
			CURLOPT_RETURNTRANSFER => 1,
		];
		if(stripos($url, 'https') === 0){
			$options[CURLOPT_SSL_VERIFYPEER] = 0;//禁止验证对等证书
			$options[CURLOPT_SSL_VERIFYHOST] = 0;//不检查证书公用名
		}
		if(!empty($postData)){
			$options[CURLOPT_POST] = 1;
			$options[CURLOPT_POSTFIELDS] = $postData;
		}
		curl_setopt_array($ch = curl_init(), $options);
		return $ch;
	}
	
	/**
	 * 单个curl请求
	 * @access public
	 * @param  string  $url       请求地址
	 * @param  array   $postData  post数据
	 * @return array/string
	 */
	public static function curl($url, $postData = []){
		$ch = self::curlInit($url, $postData);
		$result = curl_exec($ch);
		$jsonData = $result ? json_decode($result, true) : null;
		return $jsonData === null ? $result : $jsonData;
	}
	
	/**
	 * 多个curl请求
	 * @access public
	 * @param  array  $args  [url, ...]/[url=>postdata, ...]
	 * @return array  [url=>返回的数据]
	 */
	public static function multiCurl($args){
		$chs = [];
		$res = [];
		$num = 0;//连接数
		$mh = curl_multi_init();
		//兼容多个get请求
		if(is_array(reset($args))){
			$map = $args;
		}
		else{
			foreach($args as $url){
				$map[$url] = '';
			}
		}
		//初始化每个会话并添加到批处理
		foreach($map as $url => $data){
			curl_multi_add_handle($mh, $chs[$url] = self::curlInit($url, $data));
		}
		//处理每个请求
		do{
			while($mrc = curl_multi_exec($mh, $num) == CURLM_CALL_MULTI_PERFORM || $num);
		}
		while($mrc == CURLM_OK && curl_multi_select($mh) != -1);
		//依次取得返回值并关闭会话
		foreach($chs as $url => $ch){
			$res[$url] = curl_errno($ch) ? '' : curl_multi_getcontent($ch);
			curl_multi_remove_handle($mh, $ch);
			curl_close($ch);
			$jsonRes = $res[$url] ? json_decode($res[$url], true) : null;
			$res[$url] = $jsonRes === null ? $res[$url] : $jsonRes;
		}
		curl_multi_close($mh);
		return $res;
	}
	
	/**
	 * 分离二维数组的键名与数据
	 * @access public
	 * @param  mixed  $array
	 * @return array  ['keys'=>[], 'data'=>[]](keys在非二维数组时为空)
	 */
	public static function splitArrayKeyData($data){
		$result = [];
		//非数组或一维数组，不需要分离键值
		if(!is_array($data) || !is_array(reset($data))){
			$result['data'] = $data;
		}
		else{
		    //关联数组或二维数组非关联数组，不需要分离键值
		    if(self::isAssocArray($data) || !self::isAssocArray(reset($data))){
                $result['data'] = $data;
            }
			else{
                $keys = array_keys(reset($data));
                $result['keys'] = $keys;
                $result['data'] = array_map(function($v){
                    return array_values($v);
                }, $data);
			}
		}
		return $result;
	}

    /**
     * 是否为关联数组
     * @access public
     * @param  mixed  $data
     * @return bool
     */
	public static function isAssocArray($data){
	    $isAssoc = false;
	    if(is_array($data)){
	        foreach(array_keys($data) as $v){
	            if(!is_numeric($v)){
	                $isAssoc = true;
	                break;
                }
            }
        }
	    return $isAssoc;
    }
}