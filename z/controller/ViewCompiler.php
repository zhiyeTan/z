<?php
/**
 * 视图编译器
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zConViewCompiler
{
	use zConCompile;
	
	private static $tags = '';
	
	/**
	 * 解析组件语法
	 * 组件引用格式:<component id="组件名" api="组件接口地址" attach="附加文件" keep="是否保留组件标签"></component>
	 * eg. <component id="public.header" api="/public/header" attach="all" keep="1"></component>
	 * eg. <component id="silber" api="/admin/navlist" attach="js" keep="0"></component>
	 * api允许省略，相当于不加载数据
	 * attach允许省略，相当于只引用html文件
	 * keep允许省略，相当于不保留组件标签
	 * @access private
	 * @param  sting  $content  内容
	 * @return string
	 */
	private static function parseComponent($content){
		$pattern = [];
		preg_match_all('/<component(.*?)><\/component>/i', $content, $res);
		foreach($res[1] as $k => $v){
			//取得ID信息，对应模版所在的应用/模块目录以及文件名
			preg_match('/id="(.*?)"/i', $v, $file);
			$appid = zCoreRequest::appid();
			$module = '';
			$business = $file[1];
			if(stripos($file[1], '.') > 0){
				$tmp = explode('.', $file[1]);
                $appid = $tmp[0];
				if(count($tmp) > 2){
                    $module = $tmp[1];
                    $business = $tmp[2];
                }
				else{
                    $business = $tmp[1];
                }
			}
            //取得ATTACH信息
            preg_match('/attach="(.*?)"/i', $v, $attach);
            $attach = $attach[1] ?? 'html';
            //处理下是否要加上js和css
            self::attachHandle($attach, $appid, $module, $business);
			//判断是否包含html
            $pattern[$res[0][$k]] = '';
            if(preg_match('/all|html/i', $attach)){
                //取得API信息，通过接口地址获取数据，允许为空
                preg_match('/api="(.*?)"/i', $v, $api);
                $data = empty($api[1]) ? '' : zCoreMethod::curl($api[1]);
                //取得KEEP信息，判断是否保留component标签
                preg_match('/keep="(.*?)"/i', $v, $keep);
                if(empty($keep[1])){
                    $pattern[$res[0][$k]] = zConComponentCompiler::render($appid, $module, $business, $data);
                }
                else{
                    $newTag = '<component' . preg_replace('/(id=")(.*?)(")/i', '\\1'.$appid.'.'.$business.'\\3', $v) . '>';
                    $pattern[$res[0][$k]] = $newTag . zConComponentCompiler::render($appid, $module, $business, $data) . '</component>';
                }
            }
		}
		return strtr($content, $pattern);
	}
	
	/**
	 * 附加资源处理器
	 * @access private
	 * @param  string  $attachStr  附加信息
     * @param  string  $appid      应用名
     * @param  string  $module     模块名
	 * @param  string  $business   业务名称
	 * @param  bool    $isPage     是否为页面资源(false表示组件资源)
	 */
	private static function attachHandle($attachStr, $appid, $module, $business, $isPage = false){
		//包含样式
	    if(preg_match('/all|css/i', $attachStr)){
	        self::$tags .= self::getResourceTag($appid, $module, $business, 0, $isPage) . PHP_EOL;
	    }
	    //包含脚本
	    if(preg_match('/all|js/i', $attachStr)){
	        self::$tags .= self::getResourceTag($appid, $module, $business, 1, $isPage) . PHP_EOL;
	    }
	}
	
	/**
	 * 渲染视图模板
	 * @access public
	 * @param  array   $data      要导入的数据
     * @param  string  $business  视图名
     * @param  string  $module    模块名
     * @param  string  $appid     应用名
	 * @return string
	 */
	public static function render($data = '', $business = '', $module = '', $appid = ''){
        $appid = $appid ?: zCoreRequest::appid();
        $module = $module ?: zCoreRequest::module();
        $business = $business ?: zCoreRequest::business();
		$tplPath = self::getViewPath($appid, $module, $business);
		$cplPath = self::getViewPath($appid, $module, $business, true, true);
		if(!zCoreConfig::$options['compile_enable'] || !is_file($cplPath)){
			//模版不存在，抛出异常
			if(!is_file($tplPath)){
			    echo $tplPath;exit;
				trigger_error(T_TEMPLATE_NOT_EXIST, E_USER_ERROR);
			}
			$content = zCoreMethod::read($tplPath) ?: '';
			if($content){
				//匹配META标签，判断是否需要添加页面样式
				preg_match('/<meta attach="(.*?)">/i', $content, $attach);
				self::attachHandle($attach[1] ?? '', $appid, $module, $business, true);
				//编译模板内容
				$content = self::compile(self::parseComponent($content));
				if(self::$tags){
					$content = str_replace('</head>', self::$tags.'</head>', $content);
				}
			}
			//写到编译文件里面
			zCoreMethod::mkFolder(dirname($cplPath));
			zCoreMethod::write($cplPath, $content);
		}
		//如果有数据，则导入，通过缓冲区生成内容
		if(is_array($data)){
			extract($data);
			ob_start();
			include $cplPath;
			return ob_get_clean();
		}
		//否则直接返回模板解析结果
		else{
			return zCoreMethod::read($cplPath);
		}
	}

    /**
     * 获取静态资源标签
     * @access private
     * @param  string  $appid     应用名
     * @param  string  $module    模块名
     * @param  string  $business  业务名
     * @param  int     $type      资源类型(0样式，1脚本)
     * @param  bool    $isPage    是否为页面资源
     * @return string
     */
    private static function getResourceTag($appid, $module, $business, $type, $isPage){
        $tag = [
            '<link rel="stylesheet" type="text/css" href="%s">',//样式标签
            '<script type="text/javascript" src="%s"></script>'//脚本标签
        ];
        //TODO '?v='.time();//版本号根据具体需求调整，当前写法与浏览器缓存时间一致
        $url  = '/' . APP_RESOURCE_DIR . '/' . $appid . '/';
        $url .= $isPage ? 'page' : 'component';
        $url .= '/' . $module . '/' . $business . '/';
        $url .= $type ? 'script.js' : 'style.css';
        return sprintf($tag[$type], $url);
    }
}
