<?php

class appBizPlatformSite extends appPubDataController
{
	protected function main(){
//	    $this->assign('data', mHoldlongSite::list(zCoreRequest::get()));
//        mHoldlongSite::edit('0NKB0C9D', ['sitename'=>'测试测试']);
        mHoldlongSite::delete('0NKB0C9D');
	}
}