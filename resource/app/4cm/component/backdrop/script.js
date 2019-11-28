/**
 * 遮挡层组件
 */
var Backdrop = {
	/**
	 * 显示加载中提示
	 */
	showLoading: function(){
		$('#loading').show();
		this.switchBackdropDisplay();
	},
	/**
	 * 隐藏加载中提示
	 */
	hideLoading: function(){
		$('#loading').hide();
		this.switchBackdropDisplay();
	},
	/**
	 * 背景层显示切换
	 */
	switchBackdropDisplay: function(){
		if($('#backdrop').children().length == $('#backdrop').find(':only-child:hidden').length){
			$('#backdrop').hide();
		}
		else{
			$('#backdrop').show();
		}
	},
}
