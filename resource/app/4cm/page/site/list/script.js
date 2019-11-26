$(function () {
    Pagination.init({
        selector: '#pagination',
        currentPage: 1,
        totalPage: 20,
        pageSideNum: 2,
        pageClick: function(page){
            console.log(page)
        }
    });
})
