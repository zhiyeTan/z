/**
 * 基于bootstrap4的筛选器组件
 */
const Filter = {
	apiUrl: '',//数据接口
	filterSelector: '',//筛选器选择器
	filterElements:{//过滤器表单元素(键名和表单元素ID一一对应)
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
		// },
	},
	/**
	 * 初始化表单对象
	 */
	init: function(param){
		let self = this;
		this.apiUrl = param.apiUrl;
		this.filterSelector = param.filterSelector;
		if(param.filterElements){
			Object.keys(param.filterElements).forEach(function(key){
				self.filterElements[key] = {
					title: param.filterElements[key].hasOwnProperty('title') ? param.filterElements[key].title : '',
					type: param.filterElements[key].hasOwnProperty('type') ? param.filterElements[key].type : 'text',
					placeholder: param.filterElements[key].hasOwnProperty('placeholder') ? param.filterElements[key].placeholder : '',
					options: param.filterElements[key].hasOwnProperty('options') ? param.filterElements[key].options : [],
					value: param.filterElements[key].hasOwnProperty('value') ? param.filterElements[key].value : '',
					regex: param.filterElements[key].hasOwnProperty('regex') ? param.filterElements[key].regex : '',
					tips: param.filterElements[key].hasOwnProperty('tips') ? param.filterElements[key].tips : '',
					className: param.filterElements[key].hasOwnProperty('className') ? param.filterElements[key].className : '',
					click: param.filterElements[key].hasOwnProperty('click') ? param.filterElements[key].click : '',
				}
			});
		}
		//自动加一个搜索按钮进去
		this.searchBtnName = 'searchBtn';
		this.filterElements[this.searchBtnName] = {
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
		this.createFilter();
	},
	/**
	 * 创建过滤器
	 */
	createFilter: function(){
		let self = this;
		$(this.filterSelector).html('');
		if(!$(this.filterSelector).hasClass('form-inline')){
			$(this.filterSelector).addClass('form-inline');
		}
		//表单元素
		Object.keys(this.filterElements).forEach(function(key){
			let info = self.filterElements[key];
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
			else if(info.type == 'text'){
				let eleObj = document.createElement('input');
				eleObj.type = 'text';
				eleObj.className = 'form-control';
				eleObj.value = info.value;
				eleObj.placeholder = info.placeholder;
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
					$(self.filterSelector).on('click', '[name='+key+']', function(){
						if(key == self.searchBtnName){
							self.search();
						}
						else{
							info.click();
						}
					});
				}
			}
			else if(info.type == 'timer'){

			}
			$(self.filterSelector).append(groupObj);
			//绑定表单change事件
			$(self.filterSelector).on('change', '[name='+key+']', function(){
				self.filterElements[key].value = $(this).val();
			});
		});
	},
	search: function(){
		let self = this;
		let formData = {};
		Object.keys(this.filterElements).forEach(function(key){
			formData[key] = self.filterElements[key].value;
		})
		console.log(formData)
	}
}