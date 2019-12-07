/**
 * 基于bootstrap4的表单组件
 * TODO 待补充files相关功能(独立做一个上传功能，表单这里不提供上传功能，只能选择已上传的图片)
 */
const Form = {
	id: '',//表单ID
	apiUrl: '',//保存数据接口
	elements:{//表单元素(键名和表单元素ID一一对应)
		// elementName: {
		//     name: '',//表单元素的名字
		//     type: 'text',//表单类型[select/text/textarea/password/radio/checkbox/number/tel/timer/html/files]
		//     placeholder: '',//描述文字
		//     options: {//选项(仅select/radio/checkbox类型用到)
		//         // value: text,//选项值与提示文字键值对
		//     },
		//     unit: '',//单位描述(空表示没有单位)
		//     value: '',//值(checkbox/files类型为数组)
		//     default: '',//默认值(checkbox/files类型为数组)
		//     regex: '',//检验值的正则表达式(空表示不校验)
		//     tips: '',//校验不通过时的提示信息
		//     format: '',//时间格式(仅timer类型用到)
		//     column: 0,//所占列数(一行12列)
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
					name: param.elements[key].hasOwnProperty('name') ? param.elements[key].name : '',
					type: param.elements[key].hasOwnProperty('type') ? param.elements[key].type : 'text',
					placeholder: param.elements[key].hasOwnProperty('placeholder') ? param.elements[key].placeholder : '',
					options: param.elements[key].hasOwnProperty('options') ? param.elements[key].options : [],
					unit: param.elements[key].hasOwnProperty('unit') ? param.elements[key].unit : '',
					//value: param.elements[key].hasOwnProperty('value') ? param.elements[key].value : '',
					default: param.elements[key].hasOwnProperty('default') ? param.elements[key].default : '',
					regex: param.elements[key].hasOwnProperty('regex') ? param.elements[key].regex : '',
					tips: param.elements[key].hasOwnProperty('tips') ? param.elements[key].tips : '',
					format: param.elements[key].hasOwnProperty('format') ? param.elements[key].format : '',
					column: param.elements[key].hasOwnProperty('column') ? param.elements[key].column : 0,
				}
				//多选项的值和默认值自动转换为数组
				if(self.elements[key].type == 'checkbox' && !Array.isArray(self.elements[key].default)){
					let _default = self.elements[key].default;
					self.elements[key].default = [];
					if(_default !== ''){
						self.elements[key].default.push(_default.toString());
					}
				}
				//值和默认值保持一致
				self.elements[key].value = self.elements[key].default;
			});
		}
		this.create();
	},
	/**
	 * 创建行元素
	 */
	createRowElement: function(){
		let obj = document.createElement('div');
		obj.className = 'row';
		return obj;
	},
	/**
	 * 创建表单
	 */
	create: function(){
		let self = this;
		$('#'+this.id).html('');
		//表单元素
		let eleKeys = Object.keys(this.elements);
		let lastEleKey = eleKeys[eleKeys.length - 1];//最后一个元素的key
		let colNumOnRow = 0;//一行的列数
		let rowBox = this.createRowElement();
		eleKeys.forEach(function(key){
			let info = self.elements[key];
			let colTitle = document.createElement('label');
			colTitle.innerHTML = info.name;
			let colBox = document.createElement('div');
			let colNum = info.column > 0 ? info.column : 12;
			colBox.className = 'col-sm-'+colNum;
			colBox.append(colTitle);
			let eleObj;
			//input
			if(['text','password','radio','checkbox','number','tel','timer'].indexOf(info.type) >= 0){
				//具有多个选项
				if(['radio','checkbox'].indexOf(info.type) >= 0){
					let optKeys = Object.keys(info.options);
					if(optKeys.length){
						let optBoxObj = document.createElement('div');
						optBoxObj.className = 'form-multiselect-row';
						optKeys.forEach(function(optKey){
							let label = document.createElement('label');
							label.innerHTML = info.options[optKey];
							eleObj = document.createElement('input');
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
						colBox.append(optBoxObj);
					}
				}
				//唯一表单元素
				else{
					eleObj = document.createElement('input');
					eleObj.type = info.type;
					eleObj.name = key;
					eleObj.value = info.default;
					eleObj.placeholder = info.placeholder;
					eleObj.className = 'form-control';
					if(info.type == 'timer'){
						eleObj.readOnly = true;
					}
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
						colBox.append(groupObj);
					}
					else{
						colBox.append(eleObj);
					}
				}
			}
			//else if(info.type == 'textarea'){
			else if(['textarea','html'].indexOf(info.type) >= 0){
				eleObj = document.createElement('textarea');
				eleObj.name = key;
				eleObj.value = info.default;
				eleObj.className = 'form-control';
				eleObj.placeholder = info.placeholder;
				if(info.type == 'html'){
					eleObj.dataset.editor = 1;
				}
				colBox.append(eleObj);
			}
			else if(info.type == 'select'){
				eleObj = document.createElement('select');
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
				colBox.append(eleObj);
			}
			//绑定表单change事件
			$(colBox).on('change', '[name='+key+']', function(){
				let val = $(this).val();
				//多选项要单独处理
				if($(this).attr('type') == 'checkbox'){
					if(!Array.isArray(self.elements[key].value)){
						self.elements[key].value = [];
					}
					if($(this).prop('checked')){
						self.elements[key].value.push(val);
					}
					else{
						self.elements[key].value.splice(self.elements[key].value.indexOf(val), 1);
					}
				}
				else{
					self.elements[key].value = val;
				}
			});
			//时间选择器要绑一下控件
			if(info.type == 'timer'){
				self.baseTimerParam.minView = 2;
				self.baseTimerParam.format = info.format ? info.format : 'yyyy-mm-dd';
				if(/h/i.test(self.baseTimerParam.format)){
					self.baseTimerParam.minView = 1;
				}
				$(eleObj).datetimepicker(self.baseTimerParam);
			}
			colNumOnRow += colNum;
			//一行只能放下12列
			if(colNumOnRow <= 12){
				rowBox.append(colBox);
			}
			//如果当前行已经放不下表单元素，先把行放到表单中
			//最后一个表单元素要把行放到表单中
			//再生成一个新的行对象，重置行内列数
			if(colNumOnRow >= 12 || key == lastEleKey){
				$('#'+self.id).append(rowBox);
				rowBox = self.createRowElement();
				if(colNumOnRow > 12){
					rowBox.append(colBox);
					colNumOnRow = colNum;
				}
				else{
					colNumOnRow = 0;
				}
			}
			if(colNumOnRow >= 12 && key == lastEleKey){
				$('#'+self.id).append(rowBox);
			}
		});
		//按钮组
		rowBox = self.createRowElement();
		let submitBtn = document.createElement('button');
		submitBtn.className = 'btn btn-success';
		submitBtn.id = this.id + '_btn_submit';
		submitBtn.innerHTML = '提交';
		let cancelBtn = document.createElement('button');
		cancelBtn.className = 'btn btn-default';
		cancelBtn.id = this.id + '_btn_submit';
		cancelBtn.innerHTML = '取消';
		let colBox = document.createElement('div');
		colBox.className = 'col-12';
		colBox.append(submitBtn);
		colBox.append(cancelBtn);
		rowBox.append(colBox);
		$('#'+self.id).append(rowBox);
		//绑定按钮click事件
		$('#'+this.id).on('click', '#'+submitBtn.id+',#'+cancelBtn.id, function(){
			if($(this).attr('id') == submitBtn.id){
				self.submit();
			}
			else{
				self.hide();
			}
		});
		//如果有富文本元素，进行初始化
		//TODO 后面要改一下图片和视频插入按钮相关逻辑
		$('#'+self.id).find('[data-editor=1]').each(function(){
			let key = $(this).attr('name');
			$(this).summernote({
				lang: 'zh-CN',
				height: 150,
				callbacks: {
					onChange: function(contents){
						self.elements[key].value = contents;
					}
				}
			});
		});
	},
	/**
	 * 设置表单数据
	 * @param formData
	 */
	setData: function(formData){
		let self = this;
		formData = formData ? formData : {};
		Object.keys(this.elements).forEach(function(key){
			let type = self.elements[key].type;
			let newVal = formData.hasOwnProperty(key) ? formData[key] : self.elements[key].default;
			//多选项
			if(type == 'checkbox'){
				self.elements[key].value = [].concat(newVal);//要防止地址引用
				$('#'+self.id+' [name='+key+']').prop('checked', false);
				self.elements[key].value.forEach(function(val){
					$('#'+self.id+' [name='+key+'][value='+val+']').prop('checked', true);
				});
			}
			//富文本
			else if(type == 'html'){
				$('#'+self.id+' [name='+key+']').summernote('code', newVal);
			}
			else{
				self.elements[key].value = newVal;
				$('#'+self.id+' [name='+key+']').val(self.elements[key].value);
			}
		});
	},
	/**
	 * 显示表单
	 * @param formData 表单数据
	 */
	show: function(formData){
		this.setData(formData);
		$('#'+this.id).show();
	},
	hide: function(){
		$('#'+this.id).hide();
	},
	submit: function(){
		let self = this;
		let formData = {};
		Object.keys(this.elements).forEach(function(key){
			formData[key] = self.elements[key].value;
		})
		console.log(formData)
		this.hide();
	}
}