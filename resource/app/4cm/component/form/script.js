/**
 * 基于bootstrap4的表单组件
 * TODO 待补充files相关功能(独立做一个上传功能，表单这里不提供上传功能，只能选择已上传的图片)
 */
const Form = {
	apiUrl: '',//保存数据接口
	formSelector: '',//表单选择器
	submitBtnId: '',//表单提交按钮ID
	cancelBtnId: '',//表单取消按钮ID
	formElements:{//表单元素(键名和表单元素ID一一对应)
		// elementName: {
		//     title: '',//表单元素的标题
		//     type: 'text',//表单类型[select/text/textarea/password/radio/checkbox/number/tel/files]
		//     placeholder: '',//描述文字
		//     options: {//选项(仅select/radio/checkbox类型用到)
		//         // value: text,//选项值与提示文字键值对
		//     },
		//     unit: '',//单位描述(空表示没有单位)
		//     value: '',//值(checkbox/files类型为数组)
		//     default: '',//默认值(checkbox/files类型为数组)
		//     regex: '',//检验值的正则表达式(空表示不校验)
		//     tips: '',//校验不通过时的提示信息
		// },
	},
	/**
	 * 初始化表单对象
	 */
	init: function(param){
		let self = this;
		this.apiUrl = param.apiUrl;
		this.formSelector = param.formSelector;
		this.submitBtnId = param.submitBtnId;
		this.cancelBtnId = param.cancelBtnId;
		if(param.formElements){
			Object.keys(param.formElements).forEach(function(key){
				self.formElements[key] = {
					title: param.formElements[key].hasOwnProperty('title') ? param.formElements[key].title : '',
					type: param.formElements[key].hasOwnProperty('type') ? param.formElements[key].type : 'text',
					placeholder: param.formElements[key].hasOwnProperty('placeholder') ? param.formElements[key].placeholder : '',
					options: param.formElements[key].hasOwnProperty('options') ? param.formElements[key].options : [],
					unit: param.formElements[key].hasOwnProperty('unit') ? param.formElements[key].unit : '',
					//value: param.formElements[key].hasOwnProperty('value') ? param.formElements[key].value : '',
					default: param.formElements[key].hasOwnProperty('default') ? param.formElements[key].default : '',
					regex: param.formElements[key].hasOwnProperty('regex') ? param.formElements[key].regex : '',
					tips: param.formElements[key].hasOwnProperty('tips') ? param.formElements[key].tips : '',
				}
				//多选项的值和默认值自动转换为数组
				if(self.formElements[key].type == 'checkbox' && !Array.isArray(self.formElements[key].default)){
					let _default = self.formElements[key].default;
					self.formElements[key].default = [];
					if(_default !== ''){
						self.formElements[key].default.push(_default.toString());
					}
				}
				//值和默认值保持一致
				self.formElements[key].value = self.formElements[key].default;
			});
		}
		this.createForm();
	},
	/**
	 * 创建表单
	 */
	createForm: function(){
		let self = this;
		$(this.formSelector).html('');
		//表单元素
		Object.keys(this.formElements).forEach(function(key){
			let info = self.formElements[key];
			let rowObj = document.createElement('div');
			let titleObj = document.createElement('label');
			rowObj.className = 'form-row';
			titleObj.innerHTML = info.title;
			rowObj.append(titleObj);
			//input
			if(['text','password','radio','checkbox','number','tel'].indexOf(info.type) >= 0){
				//具有多个选项
				if(['radio','checkbox'].indexOf(info.type) >= 0){
					let optKeys = Object.keys(info.options);
					if(optKeys.length){
						let optBoxObj = document.createElement('div');
						optBoxObj.className = 'form-multiselect-row';
						optKeys.forEach(function(optKey){
							let label = document.createElement('label');
							label.innerHTML = info.options[optKey];
							let eleObj = document.createElement('input');
							eleObj.type = info.type;
							eleObj.name = key;
							eleObj.value = optKey;
							if(Array.isArray(info.default)){
								if(info.default.indexOf(optKey) >= 0){
									eleObj.checked = true;
								}
							}
							else if(info.default == optKey){
								eleObj.checked = true;
							}
							label.prepend(eleObj);
							optBoxObj.append(label);
						});
						rowObj.append(optBoxObj);
					}
				}
				//唯一表单元素
				else{
					let eleObj = document.createElement('input');
					eleObj.type = info.type;
					eleObj.name = key;
					eleObj.value = info.default;
					eleObj.placeholder = info.placeholder;
					eleObj.className = 'form-control';
					if(info.unit){
						let groupObj = document.createElement('div');
						groupObj.className = 'input-group';
						groupObj.append(eleObj);
						let groupText = document.createElement('span');
						groupText.className = 'input-group-text';
						groupText.innerHTML = info.unit;
						let groupAppend = document.createElement('div');
						groupAppend.className = 'input-group-append';
						groupAppend.append(groupText);
						groupObj.append(groupAppend);
						rowObj.append(groupObj);
					}
					else{
						rowObj.append(eleObj);
					}
				}
			}
			else if(info.type == 'textarea'){
				let eleObj = document.createElement('textarea');
				eleObj.name = key;
				eleObj.value = info.default;
				eleObj.className = 'form-control';
				eleObj.placeholder = info.placeholder;
				rowObj.append(eleObj);
			}
			else if(info.type == 'select'){
				let eleObj = document.createElement('select');
				eleObj.name = key;
				eleObj.className = 'form-control';
				Object.keys(info.options).forEach(function(optKey){
					let option = document.createElement('option');
					option.value = optKey;
					option.innerHTML = info.options[optKey];
					if(info.default === optKey){
						option.selected = true;
					}
					eleObj.append(option);
				})
				rowObj.append(eleObj);
			}
			$(self.formSelector).append(rowObj);
			//绑定表单change事件
			$(self.formSelector).on('change', '[name='+key+']', function(){
				let val = $(this).val();
				//多选项要单独处理
				if($(this).attr('type') == 'checkbox'){
					if(!Array.isArray(self.formElements[key].value)){
						self.formElements[key].value = [];
					}
					if($(this).prop('checked')){
						self.formElements[key].value.push(val);
					}
					else{
						self.formElements[key].value.splice(self.formElements[key].value.indexOf(val), 1);
					}
				}
				else{
					self.formElements[key].value = val;
				}
			});
		});
		//按钮组
		let rowObj = document.createElement('div');
		let submitBtn = document.createElement('button');
		let cancelBtn = document.createElement('button');
		rowObj.className = 'form-row';
		submitBtn.className = 'btn btn-success';
		submitBtn.id = this.submitBtnId;
		submitBtn.innerHTML = '提交';
		rowObj.append(submitBtn);
		cancelBtn.className = 'btn btn-default';
		cancelBtn.id = this.cancelBtnId;
		cancelBtn.innerHTML = '取消';
		rowObj.append(cancelBtn);
		$(self.formSelector).append(rowObj);
		//绑定按钮click事件
		$(this.formSelector).on('click', '#'+this.submitBtnId+',#'+this.cancelBtnId, function(){
			if($(this).attr('id') == self.submitBtnId){
				self.submit();
			}
			else{
				self.hide();
			}
		});
	},
	/**
	 * 设置表单数据
	 * @param formData
	 */
	setFormData: function(formData){
		let self = this;
		formData = formData ? formData : {};
		Object.keys(this.formElements).forEach(function(key){
			let newVal = formData.hasOwnProperty(key) ? formData[key] : self.formElements[key].default;
			//多选项单独处理
			if(self.formElements[key].type == 'checkbox'){
				self.formElements[key].value = [].concat(newVal);//要防止地址引用
				$('input[name='+key+']').prop('checked', false);
				self.formElements[key].value.forEach(function(val){
					$('input[name='+key+'][value='+val+']').prop('checked', true);
				});
			}
			else{
				self.formElements[key].value = newVal;
				$('[name='+key+']').val(self.formElements[key].value);
			}
		});
	},
	/**
	 * 显示表单
	 * @param formData 表单数据
	 */
	show: function(formData){
		if($(this.formSelector+':hidden').length){
			this.setFormData(formData);
			$(this.formSelector).show();
		}
	},
	hide: function(){
		$(this.formSelector).hide();
	},
	submit: function(){
		let self = this;
		let formData = {};
		Object.keys(this.formElements).forEach(function(key){
			formData[key] = self.formElements[key].value;
		})
		console.log(formData)
		this.hide();
	}
}