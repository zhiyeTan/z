/**
 * 遮挡层组件
 */
const Backdrop = {
	/**
	 * 初始化
	 */
	init: function(){
		let backdropObj = document.createElement('div');
		backdropObj.id = 'backdrop';
		//加载中图标
		let loading = $('<div id="loading">\n' +
							'<div class="loading-container">\n' +
							'<div class="circle1"></div>\n' +
							'<div class="circle2"></div>\n' +
							'<div class="circle3"></div>\n' +
							'<div class="circle4"></div>\n' +
						'</div>\n' +
						'<div class="loading-container">\n' +
							'<div class="circle1"></div>\n' +
							'<div class="circle2"></div>\n' +
							'<div class="circle3"></div>\n' +
							'<div class="circle4"></div>\n' +
						'</div>\n' +
						'<div class="loading-container">\n' +
							'<div class="circle1"></div>\n' +
							'<div class="circle2"></div>\n' +
							'<div class="circle3"></div>\n' +
							'<div class="circle4"></div>\n' +
						'</div>\n' +
					'</div>')[0];
		backdropObj.append(loading);
		$('body').append(backdropObj);
		return this;
	},
	/**
	 * 显示加载中提示
	 */
	showLoading: function(){
		$('#loading').show();
		$('#backdrop').show();
	},
	/**
	 * 隐藏加载中提示
	 */
	hideLoading: function(){
		$('#loading').hide();
		$('#backdrop').hide();
	},
}
