const Dialog = {
	/**
	 * @param {Object} args 样式参数
	 * {
	 *     title: 对话框标题
	 *     message: 对话框提示信息
	 *     btnyes: 是否显示确认按钮
	 *     btnno: 是否显示取消按钮
	 * }
	 */
	set: function(args){
		$('#fcmDialogTitle').html(args.title ? args.title : '系统提示');
		$('#fcmDialogContent').html(args.message ? args.message : '暂无明细信息');
		if(args.hasOwnProperty('btnyes') && !args.btnyes){
			$('#fcmBtnYes').hide();
		}
		else{
			$('#fcmBtnYes').show();
		}
		if(args.hasOwnProperty('btnno') && !args.btnno){
			$('#fcmBtnNo').hide();
		}
		else{
			$('#fcmBtnNo').show();
		}
		//绑定默认的点击事件
		$('#fcmBtnYes,#fcmBtnNo').off('click').on('click', function(){
			$('#fcmDialog').modal('hide');
		});
		return this;
	},
	/**
	 * 绑定确定按钮的回调函数
	 * @param {Object} callBack
	 */
	confirm: function(callBack){
		$('#fcmBtnYes').off('click').on('click', function(){
			callBack();
			$('#fcmDialog').modal('hide');
		});
		return this;
	},
	/**
	 * 绑定取消按钮的回调函数
	 * @param {Object} callBack
	 */
	cancel: function(callBack){
		$('#fcmBtnNo').off('click').on('click', function(){
			callBack();
			$('#fcmDialog').modal('hide');
		});
		return this;
	},
	/**
	 * 显示对话框
	 */
	show: function(){
		$('#fcmDialog .modal-dialog').css('top', '18%');
		$('#fcmDialog').modal('show');
	}
}