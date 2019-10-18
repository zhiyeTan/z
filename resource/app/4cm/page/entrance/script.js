$(function(){
	$('#loginForm').on('submit', function(){
		let account = $('#account').val();
		let pwd = $('#password').val();
		$.post(
			'/4cm/login',
			{
				account: account,
				password: pwd
			},
			function(res){
				if(res.errno){
					$('.alert').html(res.message).removeClass('hidden');
					let elem = res.errno == 1 ? 'account' : 'password';
					let _event = 'input propertychange';
					$('#account, #password').off(_event);
					$('#'+elem).on(_event, function(){
						$('.alert').html(res.message).addClass('hidden');
						$(this).off(elem);
					});
				}
				else{
					let urlArr = window.location.href.toString().split('//');
					window.location.href = urlArr[0] + '//' + window.location.host + '/4cm/index';
				}
			}
		);
		return false;
	});
	
});
