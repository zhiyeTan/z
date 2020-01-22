<?php

class appBizPlatformSaveSite extends appPubDataController
{
	protected $postAllowedKeys = ['sitename', 'title', 'keywords', 'description'];
//	protected $postVerifyRules = [];
//	protected $postFilterRules = [];

	protected function main(){
        $sitekey = mHoldlongSite::add(zCoreRequest::post());
        if(!$sitekey){
            $lastError = end(zCoreRequest::error());
            $this->errno = $lastError['errno'];
            $this->message = $lastError['message'];
        }
        else{
            $this->assign('sitekey', $sitekey);
        }
	}
}