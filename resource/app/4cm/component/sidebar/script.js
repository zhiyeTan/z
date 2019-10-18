var component_sidebar = {
	sidebarHeight: 0,//侧边栏高度
	contentHeight: 0,//内容高度
	scrollBarHeight: 0,//滚动条高度
	sliderHeight: 0,//滑块高度
	ratio: 1,//内容可见部分的比例
	timer: null,//延迟变量，用来确定何时停止滚动
	scrollDown: true,//是否向下滚动(即正数)
	scrollTimes: 0,//滚动次数(反向滚动时清零)
	step: 0,//每次滚动的固定幅度
	contentInitialPosition: 0,//内容的初始位置
	sliderInitialPosition: 0,//滑块的初始位置
	startY: 0,//Y轴的初始位置
	lastY: 0,//Y轴的最后位置
	timeStamp: 0,//初始时间戳
	init: function(){
		let _this = this;
		this.sidebarHeight = $('#sidebar').height();
		this.contentHeight = $('#sidebarContent').height();
		//高度值再额外加上内容的上下内边距才能完全展现
		this.contentHeight += parseFloat($('#sidebarContent').css("padding-top"))+parseFloat($('#sidebarContent').css("padding-bottom"));
		this.scrollBarHeight = $('#sideScrollBar').height();
		this.step = this.sidebarHeight / 10;//设定初始滚动幅度为可见高的1/10
		if(this.sidebarHeight < this.contentHeight){
			this.ratio = this.sidebarHeight / this.contentHeight;
			this.ratio = this.ratio > 1 ? 1 : this.ratio;
			this.sliderHeight = this.ratio * this.scrollBarHeight;
			$('#sideScrollBarSlider').height(this.sliderHeight).show();
		}
		else{
			this.sliderHeight = 0;
			$('#sideScrollBarSlider').hide();
		}
		//自动绑定相关事件
		if(/applewebkit.*mobile.*/.test(window.navigator.userAgent.toLowerCase())){
			$('#sidebar').on('touchstart', function(){
				window.event.preventDefault();
				_this.mobileTouchStart();
			})
			.on('touchmove', function(){
				window.event.preventDefault();
				_this.mobileTouchMove();
			})
			.on('touchend', function(){
				window.event.preventDefault();
				_this.mobileTouchEnd();
			})
		}
		else{
			$('#sidebarContent').on('wheel', function(){
				_this.webScroll();
			})
			.css('transition', '.2s');//丝一般顺滑，不能直接写到样式，否则移动端会有异常
			$('#sideScrollBarSlider').on('mousedown', function(){
				_this.webSliderMouseDown();
			})
			.css('transition', '.2s');//丝一般顺滑，不能直接写到样式，否则移动端会有异常
			$(window).on('mouseup', function(){
				$(window).off('mousemove selectstart');
			})
		}
		//导航栏点击事件
		$('#sidebarContent').on('click', 'nav li', function(){
			$(this).find('ul').show().prev().addClass('active').closest('li').siblings().each(function(){
				let tarObj = $(this).find('a');
				if(tarObj.hasClass('active') && !tarObj.data('onpage')){
					tarObj.removeClass('active');
				}
				tarObj.next().hide();
			});
			
		});
		//根据data-onpage标记当前页
		$('#sidebarContent a').each(function(){
			if($(this).data('onpage')){
				$(this).addClass('active').closest('ul').show().prev().addClass('active').data('onpage', 1);
			}
		});
	},
	//web端的滚动事件
	webScroll: function(){
		if(this.sliderHeight > 0){
			clearTimeout(this.timer);
			let e = window.event;
			let wheelValue = e.wheelDelta ? e.wheelDelta : e.detail;
			if(this.scrollDown != wheelValue < 0){
				this.scrollDown = wheelValue < 0;
				this.scrollTimes = 0;
			}
			let currStep = this.step * (1 + this.scrollTimes * 0.5);
			this.changeContentMarginTop(parseFloat($('#sidebarContent').css('margin-top')) + (this.scrollDown ? -currStep : currStep));
			this.scrollTimes++;
			//停止连续滚动时清0滚动次数
			let _this = this;
			this.timer = setTimeout(function(){
				_this.scrollTimes = 0;
			}, 300);
		}
	},
	//web端滑块位置鼠标按下
	webSliderMouseDown: function(){
		let _this = this;
		this.sliderInitialPosition = parseFloat($('#sideScrollBarSlider').css('margin-top'));
		this.startY = window.event.pageY;
		$(window).off('mousemove').on('mousemove', function(){
			_this.webSliderMouseMove();
		})
		//鼠标按下时禁掉文本选择，以免在拖动时选中文本，影响效果
		.on('selectstart', function(){
			return false;
		})
	},
	//web端滑块位置鼠标移动
	webSliderMouseMove: function(){
		this.changeSliderMarginTop(this.sliderInitialPosition + window.event.pageY - this.startY);
	},
	//移动端的touch事件
	mobileTouchStart: function(){
		clearInterval(this.timer);
		this.lastY = this.startY = window.event.touches[0].pageY;
		this.timeStamp = new Date().getTime();
		this.contentInitialPosition = parseFloat($('#sidebarContent').css('margin-top'));
	},
	mobileTouchMove: function(){
		this.lastY = window.event.touches[0].pageY;
		this.changeContentMarginTop(this.contentInitialPosition + this.lastY - this.startY);
	},
	mobileTouchEnd: function(){
		let valueY = this.lastY - this.startY;
		if(valueY){
			let timeStamp = new Date().getTime() - this.timeStamp;
			let scrollUp = valueY < 0 ? true : false;
			//从开始到结束的时间小于180，表示快速滑动
			if(timeStamp < 180){
				let step = this.step;
				let cspTimes = Math.floor(Math.abs(valueY) / step * 2) + 1;//停止后继续匀速滑动的次数，最少1次
				let interval = 80;//间隔时间
				let _this = this;
				this.timer = setInterval(function(){
					cspTimes ? cspTimes-- : (step *= 0.7) && (interval += 10);
					if(step <= 5){
						clearInterval(_this.timer);
						return false;
					}
					_this.changeContentMarginTop(parseFloat($('#sidebarContent').css('margin-top')) + (scrollUp ? -step : step));
				}, interval);
			}
		}
	},
	//改变内容的外边距
	changeContentMarginTop: function(marginTop){
		if(marginTop > 0){
			marginTop = 0;
		}
		else if(- marginTop + this.sidebarHeight > this.contentHeight){
			marginTop = - this.contentHeight + this.sidebarHeight;
		}
		$('#sideScrollBarSlider').css('margin-top', -marginTop * this.ratio + 'px');
		$('#sidebarContent').css('margin-top', marginTop + 'px');
	},
	//改变滑块的外边距
	changeSliderMarginTop: function(marginTop){
		if(marginTop < 0){
			marginTop = 0;
		}
		else if(marginTop + this.sliderHeight > this.scrollBarHeight){
			marginTop = this.scrollBarHeight - this.sliderHeight;
		}
		$('#sideScrollBarSlider').css('margin-top', marginTop + 'px');
		$('#sidebarContent').css('margin-top', -marginTop / this.ratio + 'px');
	}
}

$(function(){
	component_sidebar.init();
});
