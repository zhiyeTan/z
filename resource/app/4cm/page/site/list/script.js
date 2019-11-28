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
    $('#addSite').on('click', function(){
        if($('#siteForm:hidden').length){
            siteForm.init().show();
        }
    });
    $('#siteSubmit').on('click', function(){
        siteForm.submit();
    });
    $('#siteCancel').on('click', function(){
        siteForm.hide();
    });
})

var siteForm = {
    init: function(info){
        if(!info){
            info = {
                sitename: '',
                title: '',
                keywords: '',
                description: '',
            }
        }
        $('#sitename').val(info.sitename);
        $('#title').val(info.title);
        $('#keywords').val(info.keywords);
        $('#description').val(info.description);
        return this;
    },
    show: function(){
        $('#siteForm').show();
    },
    hide: function(){
        $('#siteForm').hide();
    },
    submit: function(){
        let siteinfo = {
            sitename: $('#sitename').val(),
            title: $('#title').val(),
            keywords: $('#keywords').val(),
            description: $('#description').val(),
        }
        console.log(siteinfo)
        this.hide();
    }
}