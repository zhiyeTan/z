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
	 * @param  string  $dir   目录名
	 * @param  string  $file  文件名
	 * @param  array   $data  要导入的数据
	 */
	public static function render($dir, $file, $data){
		$tplPath = zCoreConfig::getViewPath($file, $dir, false);
		$cplPath = zCoreConfig::getViewPath($file, $dir, false, true);
		if(!zCoreConfig::$options['compile_enable'] || !is_file($cplPath)){
			zCoreMethod::mkFolder(dirname($cplPath));
			zCoreMethod::write($cplPath, self::compile(zCoreMethod::read($tplPath)));
		}
		//将数组键值对转换成多个变量值
		is_array($data) ? extract($data) : '';
		//打开缓冲区
		ob_start();
		//载入模板
		include $cplPath;
		//返回缓冲内容并清空
		return ob_get_clean();
	}
}
