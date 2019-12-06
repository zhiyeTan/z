/**
 * 基于bootstrap4的筛选器组件
 */
const Filter = {
	id: '',//筛选器ID
	apiUrl: '',//数据接口
	elements: {//过滤器表单元素(键名和表单元素ID一一对应)
		// elementName: {
		//     title: '',//表单元素的标题
		//     type: 'text',//表单类型[select/text/timer/button]
		//     placeholder: '',//描述文字
		//     options: {//选项(仅select类型用到)
		//         value: text,//选项值与提示文字键值对
		//     },
		//     value: '',//值(checkbox/files类型为数组)
		//     regex: '',//检验值的正则表达式(空表示不校验)
		//     tips: '',//校验不通过时的提示信息
		//     className: '',//样式名(仅button类型可用)
		//	   click: '',//点击事件(仅button类型可用)
		//     format: '',//时间格式(仅timer类型可用)
		// },
	},
	baseTimerParam: {//基本的时间选择器参数(基本不需要改变)
		language:  'zh-CN',
		weekStart: 1,
		todayBtn:  1,
		todayHighlight: 1,
		autoclose: 1,
		maxView: 4,
		startView: 2,
		// format: 'yyyy-mm-dd',
		// minView: 1,
	},
	/**
	 * 初始化表单对象
	 */
	init: function(param){
		let self = this;
		this.apiUrl = param.apiUrl;
		this.id = param.id;
		if(param.elements){
			Object.keys(param.elements).forEach(function(key){
				self.elements[key] = {
					title: param.elements[key].hasOwnProperty('title') ? param.elements[key].title : '',
					type: param.elements[key].hasOwnProperty('type') ? param.elements[key].type : 'text',
					placeholder: param.elements[key].hasOwnProperty('placeholder') ? param.elements[key].placeholder : '',
					options: param.elements[key].hasOwnProperty('options') ? param.elements[key].options : [],
					value: param.elements[key].hasOwnProperty('value') ? param.elements[key].value : '',
					regex: param.elements[key].hasOwnProperty('regex') ? param.elements[key].regex : '',
					tips: param.elements[key].hasOwnProperty('tips') ? param.elements[key].tips : '',
					className: param.elements[key].hasOwnProperty('className') ? param.elements[key].className : '',
					click: param.elements[key].hasOwnProperty('click') ? param.elements[key].click : '',
					format: param.elements[key].hasOwnProperty('format') ? param.elements[key].format : '',
				}
			});
		}
		//自动加一个搜索按钮进去
		this.searchBtnName = 'searchBtn';
		this.elements[this.searchBtnName] = {
			title: '',
			type: 'button',
			placeholder: '',
			options: [],
			value: '搜索',
			regex: '',
			tips: '',
			className: 'btn-primary',
			click: this.search
		}
		this.create();
	},
	/**
	 * 创建过滤器
	 */
	create: function(){
		let self = this;
		$('#'+this.id).html('');
		if(!$('#'+this.id).hasClass('form-inline')){
			$('#'+this.id).addClass('form-inline');
		}
		//表单元素
		Object.keys(this.elements).forEach(function(key){
			let info = self.elements[key];
			let groupObj = document.createElement('div');
			groupObj.className = 'form-group';
			if(info.title){
				let label = document.createElement('label');
				label.innerHTML = info.title;
				groupObj.append(label);
			}
			if(info.type == 'select'){//下拉框
				let eleObj = document.createElement('select');
				eleObj.name = key;
				eleObj.className = 'form-control';
				Object.keys(info.options).forEach(function(optKey){
					let option = document.createElement('option');
					option.value = optKey;
					option.innerHTML = info.options[optKey];
					if(info.value === optKey){
						option.selected = true;
					}
					eleObj.append(option);
				});
				groupObj.append(eleObj);
			}
			//文本框和时间选择器都用input
			else if(['text','timer'].indexOf(info.type) >= 0){
				let eleObj = document.createElement('input');
				eleObj.name = key;
				eleObj.type = 'text';
				eleObj.className = 'form-control';
				eleObj.value = info.value;
				eleObj.placeholder = info.placeholder;
				if(info.type == 'timer'){
					eleObj.readOnly = true;
				}
				groupObj.append(eleObj);
			}
			else if(info.type == 'button'){
				let eleObj = document.createElement('button');
				eleObj.name = key;
				eleObj.className = 'btn btn-default ' + info.className;
				eleObj.innerHTML = info.value;
				groupObj.append(eleObj);
				//绑定点击事件
				if(info.click){
					$('#'+self.id).on('click', '[name='+key+']', function(){
						if(key == self.searchBtnName){
							self.search();
						}
						else{
							info.click();
						}
					});
				}
			}
			$('#'+self.id).append(groupObj);
			//绑定表单change事件
			$('#'+self.id).on('change', '[name='+key+']', function(){
				self.elements[key].value = $(this).val();
			});
			//时间选择器要绑一下控件
			if(info.type == 'timer'){
				self.baseTimerParam.minView = 2;
				self.baseTimerParam.format = info.format ? info.format : 'yyyy-mm-dd';
				if(/h/i.test(self.baseTimerParam.format)){
					self.baseTimerParam.minView = 1;
				}
				$('[name='+key+']').datetimepicker(self.baseTimerParam);
			}
		});
	},
	search: function(){
		let self = this;
		let formData = {};
		Object.keys(this.elements).forEach(function(key){
			formData[key] = self.elements[key].value;
		})
		console.log(formData)
	}
}