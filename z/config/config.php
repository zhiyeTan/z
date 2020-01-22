<?php

return [
	
	//调试模式(0关闭，1开启) [非调试模式，非致命错误的信息将保存到栈堆中，由业务逻辑控制处理方式，否则直接输出错误信息]
	'debug_mode'			=> 0,
	
	//应用是否采用HTTPS协议(0不采用，1采用)
	'is_https'				=> 0,
	
	//静态资源的域名
	'static_domain'			=> 'http://s.4cm.com',
	
	//静态资源后缀名(以|分割)
	'static_suffix'			=> 'js|css|jpg|png|bmp|gif',
	
	//是否启用服务器动态缓存 (0否，1是)
	'compile_enable'		=> 0,
	
	//是否启用redis服务作为高速缓存(0否，1是)
	'redis_enable'			=> 0,
	
	//应用视图缓存有效期(单位s) [小于0表示不使用，0表示永久，大于0表示指定值]
	'view_cache_expire'		=> -1,
	
	//应用接口缓存有效期(单位s) [小于0表示不使用，0表示永久，大于0表示指定值]
	'data_cache_expire'		=> -1,
	
	//查询模型缓存有效期(单位s) [小于0表示不使用，0表示永久，大于0表示指定值]
	//该设置可被突破，即允许缓存指定的查询模型(此时需要建立对应更新机制)
	'model_cache_expire'	=> -1,
	
	//客户端本地缓存时间(单位s) 过期前不会重复请求服务器 [使用在header表头中]
	'local_expire'			=> 10800,
	
	//默认时区
	'default_timezone'		=> 'PRC',
	
	//默认语言（响应体的语言）
	'default_lang'			=> 'zh-cn',
	
	//设置session有效时间(单位s)
	'session_expire'		=> 10800,
	
	//设置cookie有效时间(单位s)
	'cookie_expire'			=> 10800,
	
	//是否共享同一域名的cookie
	'cookie_same_domain'	=> true,
	
];