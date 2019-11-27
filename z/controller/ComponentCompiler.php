<?php
/**
 * 组件编译器
 * 
 * @author 谈治烨<594557148@qq.com>
 */
class zConComponentCompiler
{
	use zConCompile;
	
	/**
	 * 渲染模板
	 * @access public
	 * @param  string  $appid     应用名
     * @param  string  $module    模块名
     * @param  string  $business  业务名
	 * @param  array   $data      要导入的数据
	 */
	public static function render($appid, $module, $business, $data){
		$tplPath = self::getViewPath($appid, $module, $business, false);
		$cplPath = self::getViewPath($appid, $module, $business, false, true);
		if(!zCoreConfig::$options['compile_enable'] || !is_file($cplPath)){
			zCoreMethod::mkFolder(dirname($cplPath));
			zCoreMethod::write($cplPath, self::compile(zCoreMethod::read($tplPath)));
		}
		if(is_array($data)){
			extract($data);
			ob_start();
			include $cplPath;
			return ob_get_clean();
		}
		else{
			return zCoreMethod::read($cplPath);
		}
	}
}
