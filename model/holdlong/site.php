<?php

class mHoldlongSite
{
    /**
     * 列出站点信息
     * @param $param array(
     *      'sitekey'=>站点key
     *      'sitename'=>站点名称
     *      'page'=>页码
     *      'pagenum'=>每页记录数
     * )
     */
    public static function list($param){
        $siteDB = dHoldlongSite::init();
        $where = [];
        if(!empty($param['sitekey'])){
            $where[] = ['sitekey', '=', $param['sitekey']];
        }
        if(!empty($param['sitename'])){
            $where[] = ['sitename', '=', $param['sitename']];
        }
        return $siteDB::where($where)::page($param['page'] ?? 1, $param['pagenum'] ?? 0)::getAll();
    }

    /**
     * 新增站点信息
     * @param $data
     */
    public static function add($data){
        $siteDB = dHoldlongSite::init();
        if(empty($data['sitename'])){
            trigger_error('无效的站点名称！', E_USER_NOTICE);
            return false;
        }
        //判断站点名唯一
        if($siteDB::field('sitekey')::where(['sitename', '=', $data['sitename']])::getOne()){
            trigger_error('该站点已经存在！', E_USER_NOTICE);
            return false;
        }
        //生成唯一站点key
        $siteKey = strtoupper(base_convert(strrev(time()).rand(0, 9), 10, 32));
        $data['sitekey'] = str_pad($siteKey, 8, 0, STR_PAD_LEFT);
        $siteDB::setAssoc($data)::add();
        return $data['sitekey'];
    }

    /**
     * 修改站点信息
     * @param $sitekey 站点key
     * @param $data
     */
    public static function edit($sitekey, $data){
        if(!$sitekey){
            trigger_error('无效的站点key！', E_USER_NOTICE);
            return false;
        }
        if(empty($data)){
            trigger_error('要修改的站点信息为空！', E_USER_NOTICE);
            return false;
        }
        return dHoldlongSite::init()::setAssoc($data)::where(['sitekey', '=', $sitekey])::edit();
    }

    /**
     * 删除站点信息
     * @param $sitekey 站点key
     */
    public static function delete($sitekey){
        if($sitekey){
            return dHoldlongSite::init()::where(['sitekey', '=', $sitekey])::del();
        }
        return false;
    }
}
