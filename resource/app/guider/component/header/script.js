$(function(){
	$('#sidebar').on('click', 'a', function(){
		$(this).addClass('active').closest('li').siblings().find('a').removeClass('active');
	});
})

