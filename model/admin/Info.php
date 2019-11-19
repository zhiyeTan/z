<?php

class mAdminInfo
{
    public function getInfoMap($account){
        $res = [];
        $admin = dHoldlonAdmin::init()::where(['mobile', '=', $account])::getRow();
        $res = array_merge($res, $admin);
        if($admin["sitekey"]){
            $where = ['sitekey', '=', $admin['sitekey']];
            $siteInfo = dHoldlonSite::init()::where($where)::getRow();
            $res = array_merge($res, $siteInfo);
            //$sitePermissions = dHoldlonSite_permission_map::init()::where($where)::getAll();
        }
        $adminRole = dHoldlonAdmin_role_map::init()::where(['adminid', '=', $admin['adminid']])::getRow();
        if($adminRole["roleid"]){
            $where = ['roleid', '=', $adminRole['roleid']];
            $roleInfo = dHoldlonRole::init()::where($where)::getRow();
            $res = array_merge($res, $roleInfo);
            $rolePermissions = dHoldlonRole_permission_map::init()::where($where)::getAll();
            $res["permisssions"] = $rolePermissions;
        }
        return $res;
    }
}
