<?php

class mAdminInfo
{
    public function getInfoMap($account){
        $res = [];
        $admin = dHoldlongAdmin::init()::where(['mobile', '=', $account])::getRow();
        $res = array_merge($res, $admin);
        if($admin["sitekey"]){
            $where = ['sitekey', '=', $admin['sitekey']];
            $siteInfo = dHoldlongSite::init()::where($where)::getRow();
            $res = array_merge($res, $siteInfo);
            //$sitePermissions = dHoldlongSite_permission_map::init()::where($where)::getAll();
        }
        $adminRole = dHoldlongAdmin_role_map::init()::where(['adminid', '=', $admin['adminid']])::getRow();
        if($adminRole["roleid"]){
            $where = ['roleid', '=', $adminRole['roleid']];
            $roleInfo = dHoldlongRole::init()::where($where)::getRow();
            $res = array_merge($res, $roleInfo);
            $rolePermissions = dHoldlongRole_permission_map::init()::where($where)::getAll();
            $res["permisssions"] = $rolePermissions;
        }
        return $res;
    }
}
