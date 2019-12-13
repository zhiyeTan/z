{
    Pagination: {
        id: 'pagination',
            currentPage: 1,
            recordNum: 500,
            onPageNum: 20,
            pageSideNum: 2,
            pageClick: function(page){
                console.log(page)
            }
    },
    Form: {
        id: 'siteForm',
            apiUrl: '/4cm/site/save',
            elements: {
            name: {
                name: '站点名称',
                type: 'text',
                placeholder: '请输入站点名称',
                default: '111',
                unit: '.com',
                column: 4,
            },
            sitetype: {
                name: '站点类型',
                type: 'checkbox',
                options: {
                    0: '个人',
                    1: '企业',
                    2: '政府',
                    3: '公益'
                },
                default: 0,
                column: 4,
            },
            adddate: {
                type: 'timer',
                name: '添加日期',
                column: 4,
            },
            description: {
                type: 'html',
                name: '站点内容',
                column: 12,
            },
        }
    },
    Filter: {
        id: 'siteListFilter',
            apiUrl: '/4cm/site/list',
            elements: {
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
            },
            adddate: {
                type: 'timer',
                    name: '添加时间',
                    format: 'yyyy-mm-dd hh:ii'
            },
        }
    },
    Table: {
        id: 'siteList',
            header: {
            name: {
                name: '名称'
            },
            title: {
                name: '标题'
            },
            description: {
                name: '描述'
            },
        },
        actions: {
            edit: {
                name: '修改',
                    className: 'btn-success',
                    click: function () {
                    Form.show(Table.getActionData());
                }
            },
            del: {
                name: '删除',
                    className: 'btn-danger'
            },
        }
    }
}