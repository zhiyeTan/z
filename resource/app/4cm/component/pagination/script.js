/**
 * 基于bootstrap4的分页组件
 */
const Pagination = {
	selector: '',//选择器
	currentPage: 1,//当前页码
	recordNum: 0,//总记录数
	onPageNum: 1,//每页记录数
	totalPage: 1,//总页数
	pageSideNum: 2,//当前页码两侧的页码显示数量
	init: function(param){
		this.selector = param.selector;
		this.currentPage = param.currentPage > 1 ? param.currentPage : 1;
		this.recordNum = param.recordNum > 0 ? param.recordNum : 0;
		this.onPageNum = param.onPageNum > 1 ? param.onPageNum : 1;
		this.pageSideNum = param.pageSideNum > 0 ? param.pageSideNum : 2;
		this.totalPage = Math.ceil(this.recordNum / this.onPageNum);
		if($(param.selector).length){
			let self = this;
			this.render();
			$(param.selector).on('click', 'a', function(e){
				e.preventDefault();
				if(self.currentPage != $(this).data('page')){
					self.currentPage = $(this).data('page');
					self.render();
					if(param.pageClick){
						(param.pageClick)(self.currentPage);
					}
				}
			});
		}
	},
	render: function(){
		let html = this.compile(this.currentPage, '', 'active');
		for(let i=1; i<=this.pageSideNum; i++){
			html = this.compile(this.currentPage - i) + html + this.compile(this.currentPage + i);
		}
		if(this.currentPage - this.pageSideNum > 1){
			html = this.compile(1, '...', 'disabled') + html;
			html = this.compile(1) + html;
		}
		if(this.currentPage > 1){
			html = this.compile(this.currentPage - 1, '<') + html;
		}
		if(this.currentPage + this.pageSideNum < this.totalPage){
			html += this.compile(this.totalPage, '...', 'disabled');
			html += this.compile(this.totalPage);
		}
		if(this.currentPage < this.totalPage){
			html += this.compile(this.currentPage + 1, '>');
		}
		//html = this.compile(1, this.currentPage+'/'+this.totalPage+'('+this.recordNum+')', 'disabled') + html;
		html = '<ul class="clearfix">' + html + '</ul>\n';
		$(this.selector).html(html);
	},
	compile: function(page, pageText, className){
		if(page < 1 || page > this.totalPage){
			return '';
		}
		pageText = pageText ? pageText : page;
		className = className ? className : '';
		return '<li class="page-item ' + className +'">\n' +
			'<a class="page-link" data-page="' + page + '" href="#">' + pageText + '</a>\n' +
			'</li>\n';
	},
}