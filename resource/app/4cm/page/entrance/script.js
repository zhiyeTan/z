$(function(){
	$('#loginForm').on('submit', function(){
		let account = $('#account').val();
		let pwd = $('#password').val();
		Backdrop.showLoading();
		$.post(
			'/4cm/login',
			{
				account: account,
				password: pwd
			},
			function(res){
				Backdrop.hideLoading();
				if(res.errno){
					$('.alert').html(res.message).removeClass('d-none');
					let elem = res.errno == 1 ? 'account' : 'password';
					let _event = 'input propertychange';
					$('#account, #password').off(_event);
					$('#'+elem).on(_event, function(){
						$('.alert').html(res.message).addClass('d-none');
						$(this).off(elem);
					});
				}
				else{
					window.location.href = '/4cm/index';
				}
			}
		);
		return false;
	});
	
});
