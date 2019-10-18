"use strict";
var App = {
	
	//可配置参数
	config: {
		appName: '',//应用名
		version: 1,//版本号
		versionControl: true,//默认开启版本控制
		versionCheckName: 'Version',//版本校对的业务名称
		resourceDomain: '',//资源所在域名
		retryTimes: 3,//加载失败后重试次数
	},
	
	//对象数据
	data: {
		appResourceDir: 'app',//应用资源目录
		appUrlPrefix: '',//应用地址前缀
		resourceUrlPrefix: '',//资源资源url前缀
		mobileAccess: false,//是否为移动端访问
		failRequestMap: [],//请求次数映射
		updateItems: {},//需要更新的项目eg.{appName:{css:[],htm:[],js:[]}}
		pageContainerName: 'pageContainer',//页面内容容器ID名
		contentFilterName: 'content-filter',//内容模糊的样式类名
		backdropName: 'backdrop',//遮挡层容器ID名
		
		comScriptMap: {},//组件脚本对象映射
		comViewNum: 0,//视图数量
		comViewMap: {},//组件视图映射(已完成编译)
		comApiMap: {},//组件接口映射
		pageScript: {},//页面脚本对象
		pageScriptLoaded: true,//页面脚本加载完成
		pageInitState: false,//页面初始化状态
	},
	
	/**
	 * 应用基本配置设置
	 */
	set: function(obj){
		if(typeof obj === 'object'){
			for(let i in obj){
				App.config[i] = obj[i];
			}
		}
		return this;
	},
	
	/**
	 * 重置参数
	 */
	reset: function(){
		App.data.comScriptMap = {};//组件脚本对象映射
		App.data.comViewNum = 0;//视图数量
		App.data.comViewMap = {};//组件视图映射(已完成编译)
		App.data.comApiMap = {};//组件接口映射
		App.data.pageScript = {};//页面脚本对象
		App.data.pageScriptLoaded = true;//页面脚本加载完成
		App.data.pageInitState = false;//页面初始化状态
	},
	
	/**
	 * 初始化
	 */
	init: function(){
		App.data.appUrlPrefix = window.location.href.split(':')[0] + '://' + document.domain + '/' + App.config.appName + '/';
		App.config.resourceDomain = App.config.resourceDomain.replace(/[\/]+$/, '');
		App.data.resourceUrlPrefix = App.config.resourceDomain + '/';
		App.data.resourceUrlPrefix += App.data.appResourceDir ? App.data.appResourceDir+'/' : '';
		App.data.mobileAccess = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
		if(App.config.versionControl){
			App.db = new Dexie(App.config.appName);
			App.db.version(1).stores({
				appCache: 'name, content',
				configure: 'name, value'
			});
			App.checkVersion();
		}
		else{
			App.loadPage();
		}
	},
	
	/**
	 * 校对版本号
	 * 使用localStorage+websql进行版本管理
	 */
	checkVersion: function(){
		let localVersion = parseInt(localStorage.getItem('version'));
		localVersion = localVersion || 0;
		//版本有更新
		if(App.config.version > localVersion){
			App.ajax('get', App.data.appUrlPrefix+App.config.versionCheckName+'/'+new Date().getTime()).then( result => {
				//result必须包含version, delete:{css:[],htm:[],js:[]}, update：{css:[],htm:[],js:[]}
				localStorage.setItem('version', result.version);
				App.db.configure.get('updateItems').then( rs => {
					let items = App.mergeUpdateItems(rs.value, result.updateItems);
					App.data.updateItems = items;
					App.db.configure.put({name: 'updateItems', value: items});
					App.loadPage();
				})
				.catch( error => {
					App.loadPage();
				});
			})
			.catch( error => {
				App.loadPage();
			});
		}
		else{
			App.db.configure.get('updateItems').then( rs => {
				App.data.updateItems = rs.value;
			})
			.catch( error => {
				App.loadPage();
			});
		}
	},
	
	/**
	 * 合并更新项
	 * appName => [ css=>[], htm=>[], js=>[] ]
	 */
	mergeUpdateItems: function(localItems, onlineItems){
		localItems = localItems || {};
		onlineItems = onlineItems || {};
		for(let i in localItems){
			for(let j in localItems[i]){
				//删掉已经移除的项
				if(onlineItems.delete && onlineItems.delete[i] && onlineItems.delete[i][j]){
					let tmpItems = [];
					for(let k in localItems[i][j]){
						if(onlineItems.delete[i][j].indexOf(localItems[i][j][k]) < 0){
							tmpItems.push(localItems[i][j][k]);
						}
					}
					localItems[i][j] = tmpItems;
				}
			}
		}
		if(onlineItems.update){
			for(let i in onlineItems.update){
				for(let j in onlineItems.update[i]){
					//合并需要更新的项并排除重复
					if(!localItems[i] || !localItems[i][j]){
						localItems[i] = localItems[i] || {};
						localItems[i][j] = onlineItems.update[i][j];
					}
					else{
						for(let k in onlineItems.update[i][j]){
							if(localItems[i][j].indexOf(onlineItems.update[i][j][k]) < 0){
								localItems[i][j].push(onlineItems.update[i][j][k]);
							}
						}
					}
				}
			}
		}
		return localItems;
	},
	
	/**
	 * 加载页面
	 */
	loadPage: function(target){
		let appName = App.config.appName;
		let pageName;
		if(!target){
			target = window.location.href.indexOf('#') > 0 ? window.location.href.split('#')[1] : '';
			target = target ? target : 'index';
		}
		else{
			let newUrl = App.data.appUrlPrefix+'#'+target;
			if(window.history && history.pushState){
				history.pushState(null, null, newUrl);
			}
			else{
				window.location.href = newUrl;
				return ;
			}
		}
		if(target.indexOf('.') > 0){
			let tarr = target.split('.');
			appName = tarr[0];
			pageName = tarr[1] ? tarr[1] : 'index';
		}
		else{
			pageName = target;
		}
		App.reset();
		App.load(appName, pageName, 0, 'htm');
	},
	
	/**
	 * 获取资源地址
	 * @param  appName   str  应用名(资源可以跨应用使用)
	 * @param  resName   str  资源名称
	 * @param  fileType  int  类型(0页面, 1组件)
	 * @param  resType   str  类型[css,htm,js]
	 */
	getResourceUrl: function(appName, resName, fileType, resType){
		let folder = fileType ? 'component' : 'page';
		let fileName = resType == 'css' ? 'style.css' : resType == 'htm' ? 'struct.htm' : 'script.js';
		return App.data.resourceUrlPrefix + appName + '/' + folder + '/' + resName + '/' + fileName + '?v=' + new Date().getTime();
	},
	
	/**
	 * 获取缓存键名
	 * @param  appName   str  应用名(资源可以跨应用使用)
	 * @param  resName   str  资源名称
	 * @param  resType   str  类型[css,htm,js]
	 */
	getCacheKey: function(appName, resName, resType){
		return appName + '_' + resName + '_' + resType;
	},
	
	/**
	 * 加载资源
	 * @param  appName   str  应用名(资源可以跨应用使用)
	 * @param  fileName  str  资源文件名
	 * @param  fileType  int  类型(0页面, 1组件)
	 * @param  resType   str  类型[css,htm,js]
	 */
	load: function(appName, fileName, fileType, resType){
		//如果是组件，并且已经存在视图映射，停止加载
		if(fileType && App.data.comViewMap[appName+'.'+fileName]){
			return;
		}
		if(App.config.versionControl
			&& (!App.data.updateItems[appName]
				|| !App.data.updateItems[appName][resType]
				|| App.data.updateItems[appName][resType].indexOf(fileName) < 0)
		){
			App.db.appCache.get(App.getCacheKey(appName, fileName, resType)).then(function(rs){
				if(rs && rs.content){
					App.display(appName, fileName, fileType, resType, rs.content);
				}
				else{
					App.loadOnline(appName, fileName, fileType, resType);
				}
			});
		}
		else{
			App.loadOnline(appName, fileName, fileType, resType);
		}
	},
	
	/**
	 * 加载线上资源
	 * @param  appName   str  应用名(资源可以跨应用使用)
	 * @param  fileName  str  资源文件名
	 * @param  fileType  int  类型(0页面, 1组件)
	 * @param  resType   str  类型[css,htm,js]
	 */
	loadOnline: function(appName, fileName, fileType, resType){
		App.ajax('get', App.getResourceUrl(appName, fileName, fileType, resType)).then( result => {
			App.display(appName, fileName, fileType, resType, result);
			if(App.config.versionControl){
				//更新至缓存
				App.db.appCache.put({name: App.getCacheKey(appName, fileName, resType), content: result});
				//从需要更新的列表中移除
				let idx = App.data.updateItems[appName][resType].indexOf(fileName);
				if(App.data.updateItems[appName] && App.data.updateItems[appName][resType] && idx >= 0){
					App.data.updateItems[appName][resType].splice(idx, 1);
					App.db.configure.put({name: 'updateItems', value: App.data.updateItems});
				}
			}
		})
		.catch( error => {
			if(resType == 'css'){ return false; }//css加载失败时忽略
			//加载失败后，构建失败请求的次数映射
			//每个失败的请求都可以重新发起n次
			let resKey = App.getCacheKey(appName, fileName, resType);
			if(!App.data.failRequestMap[resKey]){
				App.data.failRequestMap[resKey] = 0;
			}
			if(App.data.failRequestMap[resKey] <= App.config.retryTimes){
				App.data.failRequestMap[resKey]++;
				//App.loadOnline(appName, fileName, fileType, resType);
			}
			else{
				let dStyle = `padding-top:50%; line-height:2; text-align:center;`
							+ (App.data.mobileAccess ? '' : 'margin-top: -30%;');
				let aStyle = `padding:4px 8px;
							  margin:2px;
							  border-radius:4px;
							  background:#006400;
							  text-decoration:none;
							  font-size:13px;
							  color:#fff;`;
				if(fileType){
					//加载组件失败，在该组件的位置上提示组件加载失败，并添加一个手动刷新组件的按钮
					//TODO 重新加载组件的方法要写一下
					let comKey = appName+'.'+fileName;
					if(!App.data.comViewMap[comKey]){
						let componentHtml = `<div style="${dStyle}">
												<p>组件加载失败</p>
												<p><a href="javascript:;" style="${aStyle}">立即刷新</a></p>
											</div>`;
						App.data.comViewMap[comKey] = componentHtml;
						App.initPage();//尝试初始化页面
					}
				}
				else{
					//页面加载失败，提示页面加载失败，有手动刷新页面的按钮以及返回首页按钮
					document.getElementsByTagName('body')[0].innerHTML = 
					`<div style="${dStyle}">
						<p>页面加载失败</p>
						<p>
							<a href="javascript:window.location.reload();" style="${aStyle}">立即刷新</a>
							<a href="${App.data.appUrlPrefix}" style="${aStyle}">返回首页</a>
						</p>
					</div>`;
				}
			}
		});
	},
	
	/**
	 * 渲染资源
	 * @param  fileName  str  样式名
	 * @param  fileType  int  类型(0页面, 1组件)
	 * @param  resType   str  类型[css,htm,js]
	 * @param  content   str  样式内容
	 */
	display: function(appName, fileName, fileType, resType, content){
		let cacheKey = App.getCacheKey(appName, fileName, resType);
		let comKey = appName+'.'+fileName;
		//样式资源直接插入到head中
		if(resType == 'css'){
			let styleEle = document.createElement('style');
			styleEle.id = cacheKey;
			styleEle.innerHTML = content;
			document.getElementsByTagName('head')[0].appendChild(styleEle);
		}
		//脚本资源要存放到已加载的对象中
		else if(resType == 'js'){
			let scriptObj = {};
			if(content){
				try{
					scriptObj = eval('(' + content + ')');
				}
				catch(e){}
			}
			scriptObj.setData = function(data){
				this.data = this.data || {};
				for(let i in data){
					this.data[i] = data[i];
				}
				this.display();
			}
			//如果没有初始化方法，则添加一个空方法
			if(!scriptObj.hasOwnProperty('init')){
				scriptObj.init = function(){}
			}
			if(fileType){//组件
				//如果已经加载模版文件，赋值相关方法，并渲染组件视图
				if(App.data.comScriptMap[fileName]){
					scriptObj.render = App.data.comScriptMap[fileName].render;
					scriptObj.display = App.data.comScriptMap[fileName].display;
					scriptObj.api = App.data.comApiMap[fileName];//组件api
					scriptObj.init();
					scriptObj.display();
				}
				App.data.comScriptMap[fileName] = scriptObj;
			}
			else{//页面
				scriptObj.render = App.data.pageScript.render;
				scriptObj.display = App.data.pageScript.display;
				App.data.pageScript = scriptObj;
				App.data.pageInitState = false;
				App.data.pageScriptLoaded = true;
			}
			App.initPage();//尝试初始化页面
		}
		//资源模版
		else{
			if(fileType){//组件
				let scriptObj = App.data.comScriptMap[fileName] || {};
				scriptObj.render = App.compile(content);
				scriptObj.display = function(){
					let viewHtml = this.render(this.data || '');
					//初始化完成后，只需要渲染指定组件元素
					if(App.data.pageInitState){
						document.getElementById(comKey).innerHTML = viewHtml;
					}
					//未完成初始化，渲染结果将会保存到视图映射中
					else{
						App.data.comViewMap[comKey] = viewHtml;
					}
				}
				//如果已经加载了脚本文件，直接渲染组件视图
				if(App.data.comScriptMap[fileName]){
					scriptObj.api = App.data.comApiMap[fileName];//组件api
					scriptObj.init();
					scriptObj.display();
				}
				App.data.comScriptMap[fileName] = scriptObj;
				App.initPage();//尝试初始化页面
			}
			else{//页面
				let attach = content.match(/<meta attach="(.*?)">/i);
				//如果标记页面带有样式，加载样式文件
				if(attach && (attach[1] == 'all' || attach[1].indexOf('css') >= 0)){
					App.load(appName, fileName, 0, 'css');
				}
				//匹配组件标签，加载组件
				let components = content.match(/<component.*?id="(.*?)".*?\/component>/gi);
				components = components || [];
				App.data.comViewNum = components.length;
				App.data.comApiMap = {};
				components.forEach(function(str){
					//取得组件名和所属应用名
					let tmpFileName, tmpAppName;
					let componentName = str.match(/id="(.*?)"/i);
					if(componentName[1].indexOf('.') > 0){
						let tmpArr = componentName[1].split('.');
						tmpAppName = tmpArr[0];
						tmpFileName = tmpArr[1];
					}
					else{
						tmpAppName = App.config.appName;
						tmpFileName = componentName[1];
					}
					//取得组件的api接口
					let componentDataApi = str.match(/api="(.*?)"/i);
					App.data.comApiMap[tmpFileName] = componentDataApi ? componentDataApi[1] : '';
					//取得组件的附加信息
					let tmpAttach = str.match(/attach="(.*?)"/i);
					if(tmpAttach){
						if(tmpAttach[1] == 'all' || tmpAttach[1].indexOf('css')){
							App.load(tmpAppName, tmpFileName, 1, 'css');
						}
						if(tmpAttach[1] == 'all' || tmpAttach[1].indexOf('js')){
							App.load(tmpAppName, tmpFileName, 1, 'js');
						}
					}
					App.load(tmpAppName, tmpFileName, 1, 'htm');
				});
				//绑定渲染方法
				App.data.pageScript = {};
				App.data.pageScript.init = function(){}
				App.data.pageScript.render = App.compile(content);
				App.data.pageScript.display = function(){
					let pageElem = document.getElementById(App.data.pageContainerName);
					if(!pageElem){
						pageElem = document.createElement('div');
						pageElem.id = App.data.pageContainerName;
					}
					pageElem.innerHTML = this.render(this.data || '');
					document.getElementsByTagName('body')[0].appendChild(pageElem);
					for(let mapkey in App.data.comViewMap){
						document.getElementById(mapkey).innerHTML = App.data.comViewMap[mapkey];
					}
				}
				//如果标记页面带有脚本，加载脚本文件
				if(attach && attach[1] == 'all' || attach[1].indexOf('js') >= 0){
					App.data.pageScriptLoaded = false;
					App.load(appName, fileName, 0, 'js');
				}
				else{
					App.data.pageScriptLoaded = true;
				}
				App.initPage();//尝试初始化页面
			}
		}
	},
	
	/**
	 * 初始化页面
	 */
	initPage: function(){
		if(App.data.pageScriptLoaded && App.data.comViewNum == Object.keys(App.data.comViewMap).length){
			App.data.pageScript.display();
			App.data.pageScript.init();
			App.data.pageInitState = true;
			App.hideBackdrop();
		}
	},
	
	/**
	 * 显示遮罩层
	 * @param dropName str 遮罩层名称(即ID)
	 */
	showBackdrop: function(dropName){
		document.getElementById(App.data.pageContainerName).classList.add(App.data.contentFilterName);
		let child = document.getElementById(App.data.backdropName).childNodes;
		for(let i in child){
			if(child[i].nodeType == 1){
				child[i].style.display = (child[i].id == dropName ? 'block' : 'none');
			}
		}
		document.getElementById(App.data.backdropName).style.display = 'block';
	},
	
	/**
	 * 隐藏遮罩层
	 */
	hideBackdrop: function(){
		document.getElementById(App.data.pageContainerName).classList.remove(App.data.contentFilterName);
		document.getElementById(App.data.backdropName).style.display = 'none';
	},
	
	/**
	 * 解析模版
	 * @param html str 模版内容
	 */
	compile: function(html){
		html = html.replace(/[\r\t\n]/g, '');
		//处理foreach循环
		let tags = html.match(/<foreach.*?>/gi);
		if(tags){
			tags.forEach(function(str){
				let o = str.match(/data="(.*?)"/i);
				let k = str.match(/key="(.*?)"/i);
				let v = str.match(/value="(.*?)"/i);
				html = html.replace(str, `';${o[1]}.forEach(function(${v[1]},${k[1]}){html+='`);
			});
		}
		html = html.replace(/<\/foreach>/gi, `'});html+='`);
		//处理if语句
		html = html.replace(/<if.*?flag="(.*?)".*?>/gi, `';if($1){html+='`);
		html = html.replace(/<\/if>/gi, `'}html+='`);
		//处理变量
		html = html.replace(/{{(.*?)}}/g, `'+$1+'`);
		//对缺少应用名的组件名称进行补全
		html = html.replace(/(<component[^<]*?id=")([^\.]+?)(".*?\/component>)/gi, `$1${App.config.appName}.$2$3`);
//		html = html.replace(/<component([^<]*?id=")([^\.]+?)(".*?\/)component>/gi, `<div$1${App.config.appName}.$2$3div>`);
//		//<component></component>转为<div></div>
//		html = html.replace(/<component([^<]*?)><\/component>/gi, `<div$1></div>`);
		//创建一个匿名函数，利用with解析html
		return new Function('data', `let html='';with(data){html+='${html}';}return html;`);
	},
	
	/**
	 * 应用了promise的ajax
	 * @param  method  str     请求方式(post/get)
	 * @param  url     str     请求地址
	 * @pram   data    object  提交的数据
	 */
	ajax: function(method, url, data){
		return new Promise(function (resolve, reject){
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function(){
				if(xhr.readyState == 4){
					if(xhr.status == 200){
						let rs;
						try{
							rs = JSON.parse(xhr.response);
						}
						catch(err){
							rs = xhr.response;
						}
						resolve(rs);
					}
					else{
						reject(new Error(xhr.statusText));
					}
				}
			}
			xhr.open(method, url);
			xhr.send(data);
		});
	}
}


