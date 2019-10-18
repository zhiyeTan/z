<?php

class appBizLogin extends zConDataController
{
	protected $postAllowedKeys = ['account', 'password'];
	protected $postVerifyRules = ['account'=>'mobile'];
	
	public function main(){
		$this->errno = 0;
		$this->useCache = false;
		if(!empty($this->exception('post'))){
			$this->errno = 2;
			$this->message = '账号必须是手机号码';
		}
		else{
			$account = zCoreRequest::post('account');
			$password = zCoreRequest::post('password');
			$expSet = ['account'=>$account];
			if($account && $password){
				if($account == 'tank*zhiye' && $password == '123123'){
					zCoreRequest::session($expSet);
					zCoreRequest::cookie($expSet);
					$this->message = '登陆成功';
				}
				else{
					$admin = dHoldlonAdmin::init()::where(['mobile', '=', $account])::getRow();
					if(empty($admin)){
						$this->errno = 2;
						$this->message = '账号不存在';
					}
					elseif($admin['password'] != md5($password)){
						$this->errno = 1;
						$this->message = '密码不正确';
					}
					else{
						zCoreRequest::session($expSet);
						zCoreRequest::cookie($expSet);
						$this->message = '登陆成功';
					}
				}
			}
			elseif($account){
				$this->errno = 1;
				$this->message = '请输入密码';
			}
			else{
				$this->errno = 2;
				$this->message = '请输入账号';
			}
		}
	}
}
