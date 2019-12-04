$(function () {
    Pagination.init({
        selector: '#pagination',
        currentPage: 1,
        recordNum: 500,
        onPageNum: 20,
        pageSideNum: 2,
        pageClick: function(page){
            console.log(page)
        }
    });
    Form.init({
        apiUrl: '/4cm/site/save',
        formSelector: '#siteForm',
        submitBtnId: 'siteSubmit',
        cancelBtnId: 'siteCancel',
        formElements: {
            sitename: {
                title: '站点名称',
                type: 'text',
                placeholder: '请输入站点名称',
                default: '111',
                unit: '.com',
            },
            sitetype: {
                title: '站点类型',
                type: 'checkbox',
                options: {
                    0: '个人',
                    1: '企业',
                    2: '政府',
                    3: '公益'
                },
                default: 0,
            }
        }
    });
    Filter.init({
        apiUrl: '/4cm/site/list',
        filterSelector: '#siteList',
        filterElements: {
            stype: {
                type: 'select',
                options: {
                    0: '个人',
                    1: '企业',
                    2: '政府',
                    3: '公益'
                },
                value: 0,
            },
            skey: {
                type: 'text',
                placeholder: '搜索关键词',
            }
        }
    });

    $('#addSite').on('click', function(){
        Form.show();
    });

    $(".formdatetimer").datetimepicker({});

});