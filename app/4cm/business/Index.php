<?php

class appBizIndex extends appPubViewController
{
	protected function main(){
        register_shutdown_function([$this, 't'], ['first']);
        register_shutdown_function([$this, 't'], ['second']);
        register_shutdown_function([$this, 'e'], ['first']);
	}

	public function t($str){
	    echo 't -> ',$str,'<br>';
    }

    public function e($str){
	    echo 'e -> ',$str,'<br>';
    }
}
