<?php

class appBizPlatformSite extends appPubDataController
{
	protected function main(){
	    $list = [
            1=>['title'=>'title1','pid'=>0,'id'=>1,'name'=>'name1','keyword'=>'keyword1','desc'=>'desc1','thumb'=>'#'],
            2=>['title'=>'title2','pid'=>0,'id'=>2,'name'=>'name2','keyword'=>'keyword2','desc'=>'desc2','thumb'=>'#'],
            3=>['title'=>'title3','pid'=>0,'id'=>3,'name'=>'name3','keyword'=>'keyword3','desc'=>'desc3','thumb'=>'#'],
            4=>['title'=>'title4','pid'=>1,'id'=>4,'name'=>'name4','keyword'=>'keyword4','desc'=>'desc4','thumb'=>'#'],
            5=>['title'=>'title5','pid'=>1,'id'=>5,'name'=>'name5','keyword'=>'keyword5','desc'=>'desc5','thumb'=>'#'],
            6=>['title'=>'title6','pid'=>1,'id'=>6,'name'=>'name6','keyword'=>'keyword6','desc'=>'desc6','thumb'=>'#'],
            7=>['title'=>'title7','pid'=>2,'id'=>7,'name'=>'name7','keyword'=>'keyword7','desc'=>'desc7','thumb'=>'#'],
            8=>['title'=>'title8','pid'=>3,'id'=>8,'name'=>'name8','keyword'=>'keyword8','desc'=>'desc8','thumb'=>'#'],
            9=>['title'=>'title9','pid'=>3,'id'=>9,'name'=>'name9','keyword'=>'keyword9','desc'=>'desc9','thumb'=>'#'],
        ];
	    $this->assign('data', $list);
	}
}