<?php
/**
 * 表名与表名规则、分区规则、表数据类型的映射关系
 */
return [
	//原始表名 => [表名规则, 分区规则, 表数据类别(对应储存在redis上的类型标记，默认空，对应redis的default)]
	'admin'			        => [MAP_RULE_NORMAL, MAP_RULE_NORMAL],
    'role'	                => [MAP_RULE_NORMAL, MAP_RULE_NORMAL],
    'permission'	        => [MAP_RULE_NORMAL, MAP_RULE_NORMAL],
    'admin_role_map'	    => [MAP_RULE_NORMAL, MAP_RULE_NORMAL],
    'role_permission_map'	=> [MAP_RULE_NORMAL, MAP_RULE_NORMAL],
    'site'	                => [MAP_RULE_NORMAL, MAP_RULE_NORMAL],
    'site_permission_map'	=> [MAP_RULE_NORMAL, MAP_RULE_NORMAL],
];
