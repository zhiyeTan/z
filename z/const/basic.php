<?php

//默认路由模式，协议名://主机名/应用或模块名(index时省略)/业务名称-key-value-key-value... + 任意后缀名
const DEFAULT_ROUTER_MODEL = 0;
//短地址路由模式，协议名://主机名/六位字符串 + 任意后缀名
const SHORTURL_ROUTER_MODEL = 1;
//目录路由模式，协议名://主机名/应用或模块名/业务名称/key/value/key/value...
const DIRECTORY_ROUTER_MODEL = 2;

//作者密钥，作为加密的salt
const AUTHOR_KEY = 'tanZhiYe';
//由大小写字母和数字组成的基本字符表
const BASE_CHAR_MAP = '0aAbBcC1dDeEfF2gGhHiI3jJkKlL4mMnNoO5pPqQrR6sStTuU7vVwWxX8yYzZ9';

//前端渲染模式的业务名称
const FERM_BUSINESS = 'home';

//缓存类型
const CACHE_TYPE_VIEW = 'appview';//应用视图
const CACHE_TYPE_MODEL =  'sqlmodel';//查询结果
const CACHE_TYPE_URLMAP = 'urlmap';//短地址映射
const CACHE_TYPE_DEFAULT = 'default';//未指定类型的缓存

//集群连接类型
const CLUSTER_CONNECT_TYPE_MYSQL = 0; //mysql
const CLUSTER_CONNECT_TYPE_REDIS = 1;//redis

//规则的解析类型
const PARSE_TYPE_TABLE = 1;
const PARSE_TYPE_PARTITION = 2;

//映射规则类型
const MAP_RULE_NORMAL = 99;//固定
//const MAP_RULE_CAPACITY = 10;//容量划分的场景几乎都可用时间划分，且实施麻烦，不建议使用
const MAP_RULE_MOBILE_SEGMENT = 21;//手机号段，即1~3位，通常用于分表、分区值
const MAP_RULE_MOBILE_FOURTH = 22;//手机号段第4位，通常用于号段分表下的分区值
const MAP_RULE_YEAR = 31;//年份，通常用于分表
const MAP_RULE_MONTH = 32;//月份，通常用于分区值(如2018年1月份为201801)
const MAP_RULE_QUARTER = 33;//季度，通常用于分区值(如2018年第一季度为20181)

//错误代码以'E_'作为前缀
const E_NONE = 0;//没有发生错误

//提示信息以'T_'作为前缀
const T_NO_PERMISSION_MODULE = '未开放的传送门';
const T_ILLEGAL_CLASS_FORMAT = '无效的咒语';

const T_BUSINESS_NOT_EXIST = '无效的魔法节点';
const T_TEMPLATE_NOT_EXIST = '无效的魔法镜像';
const T_ILLEGAL_PARAMETER = '魔力成份异常';

const T_DB_MAP_NOT_EXISTS = '尚未配置该库名映射';
const T_TABLE_MAP_NOT_EXISTS = '尚未配置该表名映射';
const T_PARTITION_MAP_NOT_EXISTS = '尚未配置该分区映射';

const LOG_MAX_SIZE = 1000000;//日志文件大小上限，单位字节




