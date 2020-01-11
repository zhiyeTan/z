{
    formApiUrl: '/4cm/platform/saveSite',
    dataApiUrl: '/4cm/platform/site',
    gridWidth: 3,
    renderType: 2,
    buttons: [
        {
            name: '新增',
            class: 'btn-primary',
            click: 'addNew',
        },
        {
            name: '设置显示数据列',
            class: 'btn-primary',
            click: 'toggleTheadFilter',
        },
    ],
    actions: [
        {
            key: 'edit',
            name: '修改',
            class: 'btn-primary',
            click: 'editData',
        },
        {
            key: 'delete',
            name: '删除',
            class: 'btn-danger',
            click: 'editData',
        }
    ],
    editData: function() {
        console.log(this.data.listIdx)
    },
    addNew: function () {
        $('#'+this.id).find('form').show();
    },
    form: [
        {
            key: 'sitename',
            name: '站点名称',
            type: 'text',
            placeholder: '请输入站点名称',
            default: '111',
            unit: '.com',
            column: 4,
        },
        {
            key: 'sitetype',
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
    ],
    filter: [
        {
            key: 'sitename',
            name: '站点名称',
            type: 'text',
            default: '',
            column: 4,
        },
    ],
    thead:[
        {
            key: 'id',
            name: 'ID',
        },
        {
            key: 'name',
            name: '名称',
        },
        {
            key: 'keyword',
            name: '关键词',
        },
        {
            key: 'desc',
            name: '描述',
        },
        {
            key: 'thumb',
            name: '缩略图'
        }
    ],
}