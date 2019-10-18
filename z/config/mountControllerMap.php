<?php
/**
 * 挂载控制类的类名方法映射
 * [
 * 		使用的方法名(注意无法覆盖controller的默认方法，需避免同名)=>[
 * 			真实类名,
 * 			真实方法名,
 * 			是否为动态方法(true动态，false静态)
 * 			相对路径(基于UNIFIED_PATH，空表示使用自动加载)
 * 		]
 * ]
 */
return [
	'loadConfig'		=> ['zCoreConfig', 'loadConfig'],
	'loadAppDefine'		=> ['zCoreConfig', 'loadAppDefine'],
	'saveLog'			=> ['zCoreLog', 'save'],
	'error'				=> ['zCoreRequest', 'error'],
	'exception'			=> ['zCoreRequest', 'exception'],
	'get'				=> ['zCoreRequest', 'get'],
	'post'				=> ['zCoreRequest', 'post'],
	'request'			=> ['zCoreRequest', 'request'],
	'server'			=> ['zCoreRequest', 'server'],
	'cookie'			=> ['zCoreRequest', 'cookie'],
	'session'			=> ['zCoreRequest', 'session'],
	'files'				=> ['zCoreRequest', 'files'],
	'headers'			=> ['zCoreRequest', 'headers'],
	'param'				=> ['zCoreRequest', 'param'],
	'has'				=> ['zCoreRequest', 'has'],
	'isCli'				=> ['zCoreRequest', 'isCli'],
	'isCgi'				=> ['zCoreRequest', 'isCgi'],
	'isMobile'			=> ['zCoreRequest', 'isMobile'],
	'isPad'				=> ['zCoreRequest', 'isPad'],
	'isPc'				=> ['zCoreRequest', 'isPc'],
	'domain'			=> ['zCoreRequest', 'domain'],
	'url'				=> ['zCoreRequest', 'url'],
	'module'			=> ['zCoreRequest', 'module'],
	'business'			=> ['zCoreRequest', 'business'],
	'ip'				=> ['zCoreRequest', 'ip'],
	'setCode'			=> ['zCoreResponse', 'setCode'],
	'setExpire'			=> ['zCoreResponse', 'setExpire'],
	'goto'				=> ['zCoreRouter', 'goto'],
	'mkUrl'				=> ['zCoreRouter', 'mkUrl'],
	'getSqlStack'		=> ['zModDataBase', 'getSqlStack'],
	'listDirTree'		=> ['zCoreMethod', 'listDirTree'],
];