/**
 * 表格组件
 */
const Table = {
	id: '',//表格ID
	header: {//表头信息
		// key: {//即键名数组中的值
		// 	show: 1,//是否显示(可自由选择)
		// 	name: '',//列名
		// 	regex: '',//用来修正显示的正则表达式
		// }
	},
	actions: {//操作列表
		// edit: {
		// 	name: '',//显示名称
		// 	click: '',//点击事件
		// 	className: '',//样式名
		// }
	},
	keys: [],//键名数组，键名索引和数据索引保持一致
	data: [],
	actKey: '',//操作时标记对应数据行的key
	init: function(param){
		let self = this;
		this.id = param.id;
		Object.keys(param.header).forEach(function(key){
			self.header[key] = {
				show: param.header[key].hasOwnProperty('show') ? param.header[key].show : 1,
				name: param.header[key].hasOwnProperty('name') ? param.header[key].name : '',
				regex: param.header[key].hasOwnProperty('regex') ? param.header[key].regex : '',
			}
		});
		Object.keys(param.actions).forEach(function(key){
			self.actions[key] = {
				name: param.actions[key].hasOwnProperty('name') ? param.actions[key].name : '',
				click: param.actions[key].hasOwnProperty('click') ? param.actions[key].click : '',
				className: param.actions[key].hasOwnProperty('className') ? param.actions[key].className : '',
			}
		});
		this.create();
		return this;
	},
	setKeys: function(keys){
		this.keys = keys;
		return this;
	},
	setData: function(data){
		this.data = data;
		this.render();
	},
	create: function(){
		let self = this;
		let tableBox = document.createElement('div');
		tableBox.className = 'table-responsive';
		tableBox.append(document.createElement('table'));
		$(tableBox).find('table').addClass('table table-striped')
			.append(document.createElement('thead'))
			.append(document.createElement('tbody'));
		$(tableBox).find('thead').append(document.createElement('tr'));
		Object.keys(this.header).forEach(function(key){
			if(self.header[key].show){
				let th = document.createElement('th');
				th.innerHTML = self.header[key].name;
				$(tableBox).find('thead tr').append(th);
			}
		});
		let actTh = document.createElement('th');
		actTh.innerHTML = '操作';
		$(tableBox).find('thead tr').append(actTh);
		$('#'+this.id).append(tableBox);
	},
	render: function(){
		let self = this;
		Object.keys(this.data).forEach(function(i){
			let tr = document.createElement('tr');
			Object.keys(self.header).forEach(function(key){
				let td = document.createElement('td');
				let idx = self.keys.indexOf(key);
				let value = self.data[i][idx] ? self.data[i][idx] : '';
				if(self.header[key].regex){
					value = self.header[key].regex.test(value);
				}
				td.innerHTML = value;
				tr.append(td);
			});
			//操作列
			let actTd = document.createElement('td');
			Object.keys(self.actions).forEach(function(key){
				let actBtn = document.createElement('button');
				actBtn.className = 'btn btn-sm ' + self.actions[key].className;
				actBtn.innerHTML = self.actions[key].name;
				actBtn.onclick = function(){
					self.actKey = i;
				}
				if(self.actions[key].click){
					$(actBtn).on('click', self.actions[key].click);
				}
				actTd.append(actBtn);
			});
			tr.append(actTd);
			$('#'+self.id).find('tbody').append(tr);
		});
	}
}