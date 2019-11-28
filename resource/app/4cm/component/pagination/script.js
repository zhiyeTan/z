/**
 * 基于bootstrap4的分页组件
 */
var Pagination = {
	selector: '',//选择器
	currentPage: 1,//当前页码
	totalPage: 1,//总页数
	pageSideNum: 2,//当前页码两侧的页码显示数量
	init: function(param){
		this.selector = param.selector;
		this.currentPage = param.currentPage > 1 ? param.currentPage : 1;
		this.totalPage = param.totalPage > 1 ? param.totalPage : 1;
		this.pageSideNum = param.pageSideNum > 0 ? param.pageSideNum : 2;
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
		let html = this.compile(this.currentPage, '', 1);
		for(let i=1; i<=this.pageSideNum; i++){
			html = this.compile(this.currentPage - i) + html + this.compile(this.currentPage + i);
		}
		if(this.currentPage > 1){
			html = this.compile(this.currentPage - 1, '上一页') + html;
			html = this.compile(1, '首页') + html;
		}
		if(this.currentPage < this.totalPage){
			html += this.compile(this.currentPage + 1, '下一页');
			html += this.compile(this.totalPage, '末页');
		}
		html = '<nav aria-label="Page navigation">\n' +
			'<ul class="pagination">' + html + '</ul>\n' +
			'</nav>\n';
		$(this.selector).html(html);
	},
	compile: function(page, pageText, active){
		if(page < 1 || page > this.totalPage){
			return '';
		}
		pageText = pageText ? pageText : page;
		return '<li class="page-item ' + (active ? 'active' : '') +'">\n' +
			'<a class="page-link" data-page="' + page + '" href="#">' + pageText + '</a>\n' +
			'</li>\n';
	},
}