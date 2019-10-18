$(function(){
	$('#sidebarSwitch').on('click', function(){
		$('#sidebar').animate({left:0}, function(){
			$('body').on('click', function(){
				$('#sidebar').animate({left:'-240px'});
				$('body').off('click');
			});
		});
	});
});