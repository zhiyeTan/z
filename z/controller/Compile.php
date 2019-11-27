<?php
/**
 * 编译机制
 * 
 * @author 谈治烨<594557148@qq.com>
 */
trait zConCompile
{
	/**
	 * 编译模板内容
	 * @access private
	 * @param  sting  $content  模板内容
	 * @return string
	 */
	private static function compile($content){
		if(!$content){
			return '';
		}
		$pattern = [];
		//foreach起始标签
		preg_match_all('/<foreach.*?>/i', $content, $res);
		foreach($res[0] as $v){
			preg_match('/data=[\'|"](.*?)[\'|"]/i', $v, $data);
			preg_match('/key=[\'|"](.*?)[\'|"]/i', $v, $key);
			preg_match('/value=[\'|"](.*?)[\'|"]/i', $v, $value);
			$pattern[$v] = '<?php foreach(' . self::replaceVar($data[1]) . ' as ' . (empty($key[1]) ? '' : '$'.$key[1].'=>') . '$' . $value[1] . ') { ?>';
		}
		//foreach结束标签
		$pattern['</foreach>'] = '<?php } ?>';
		//if起始标签
		preg_match_all('/<if.*?flag="(.*?)">/i', $content, $res);
		foreach($res[0] as $k => $v){
			$pattern[$v] = '<?php if(' . self::replaceVar($res[1][$k]) . ') { ?>';
		}
		//if结束标签
		$pattern['</if>'] = '<?php } ?>';
		//变量
		preg_match_all('/{{(.*?)}}/', $content, $res);
		foreach($res[0] as $k => $v){
			$pattern[$v] = '<?php echo ' . self::replaceVar($res[1][$k]) . '; ?>';
		}
		return strtr($content, $pattern);
	}
	

	/**
	 * 替换变量
	 * @access private
	 * @param  sting  $content  内容
	 * @return string
	 */
	private static function replaceVar($content){
		//value.key
		$content = preg_replace('/([a-zA-Z_][a-zA-Z0-9_]+)\.([a-zA-Z_][a-zA-Z0-9_]+)/', "$\\1['\\2']", $content);
		//value.number
		$content = preg_replace('/([a-zA-Z_][a-zA-Z0-9_]+)\.(\d+)/', '$\\1[\\2]', $content);
		//表达式中的变量
		$content = preg_replace('/(?!\'|")([a-zA-Z_][a-zA-Z0-9_]+)(?!\S)/', '$\\1', $content);
		//value
		$content = preg_replace('/^([a-zA-Z_][a-zA-Z0-9_]+)$/', '$\\1', $content);
		//若由大写字母和下划线组成则表示是常量，要还原回来
		$content = preg_replace('/$([A-Z_]+)/', '\\1', $content);
		return $content;
	}

    /**
     * 获取模版路径
     * @access private
     * @param  string  $appid       应用名
     * @param  string  $module      模块名
     * @param  string  $business    业务名
     * @param  bool    $pageView    是否为页面视图
     * @param  bool    $complied    是否为编译文件
     * @return path
     */
    private static function getViewPath($appid, $module, $business, $pageView = true, $complied = false){
        $path  = $complied ? COMPILED_PATH : APP_RESOURCE_PATH;
        $path .= $appid . Z_DS;
        $path .= $pageView ? 'page' : 'component';
        $path .= Z_DS . $module . Z_DS . $business . Z_DS;
        $path .= $complied ? $business . '.php' : 'struct.htm';
        return $path;
    }
}
