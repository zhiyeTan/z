<?php

/**
 * 域名对应应用/模块目录名的映射
 * [ HTTP_HOST => [应用/模块目录名,xN] ]
 * 请求协议并不会对域名映射产生影响，因此这里的key不包含协议部分
 * value为域名绑定的应用/模块目录名集合，其中第一个值表示default的默认目录
 * 空集表示无绑定限制，且无访问限制
 * 仅有一个值表示仅修正该域名的默认应用目录，且无访问限制
 */
return [
	//'www.example1.com' => [],
	//'www.example2.com' => ['example2', 'elsedir2'],
	//'www.example3.com' => ['default', 'elsedir3'],
	'www.4cm.com' => ['4cm'],
];