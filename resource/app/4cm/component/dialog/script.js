const Dialog = {
	init: function(){
		$('body').append('<div id="dialog" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="fcmDialogTitle" aria-hidden="true">' +
							'<div class="modal-dialog">' +
								'<div class="modal-content">' +
									'<div class="modal-header">' +
										'<span class="modal-title"></span>' +
										'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
									'</div>' +
									'<div class="modal-body"></div>' +
									'<div class="modal-footer">' +
										'<button name="cancel" type="button" class="btn btn-default" data-dismiss="modal">取消</button>' +
										'<button name="confirm" type="button" class="btn btn-primary">确定</button>' +
									'</div>' +
								'</div>' +
							'</div>' +
						'</div>');
	},
	/**
	 * 显示对话框
	 * @param {Object} args 样式参数
	 * {
	 *     title: 对话框标题
	 *     message: 对话框提示信息
	 *     btnyes: 是否显示确认按钮
	 *     btnno: 是否显示取消按钮
	 *     confirm: 确认按钮的回调函数
	 *     cancel: 取消按钮的回调函数
	 * }
	 */
	show: function(args){
		$('#dialog .modal-title').html(args.title ? args.title : '系统提示');
		$('#dialog .modal-body').html(args.message ? args.message : '暂无明细信息');
		if(args.hasOwnProperty('btnyes') && !args.btnyes){
			$('#dialog [name=confirm]').hide();
		}
		else{
			$('#dialog [name=confirm]').show();
		}
		if(args.hasOwnProperty('btnno') && !args.btnno){
			$('#dialog [name=cancel]').hide();
		}
		else{
			$('#dialog [name=cancel]').show();
		}
		//绑定默认的点击事件
		$('#dialog [name=confirm],#dialog [name=cancel]').off('click').on('click', function(){
			$('#dialog').modal('hide');
		});
		if(args.confirm){
			this.confirm(args.confirm);
		}
		if(args.cancel){
			this.cancel(args.cancel);
		}
		$('#dialog .modal-dialog').css('top', '18%');
		$('#dialog').modal('show');
		return this;
	},
	/**
	 * 绑定确定按钮的回调函数
	 * @param {Object} callBack
	 */
	confirm: function(callBack){
		$('#dialog [name=confirm]').off('click').on('click', function(){
			callBack();
			$('#dialog').modal('hide');
		});
		return this;
	},
	/**
	 * 绑定取消按钮的回调函数
	 * @param {Object} callBack
	 */
	cancel: function(callBack){
		$('#dialog [name=cancel]').off('click').on('click', function(){
			callBack();
			$('#dialog').modal('hide');
		});
		return this;
	},
}