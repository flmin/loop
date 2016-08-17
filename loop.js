// 检测浏览器,在第一次调用该方法时检测,并更新这个方法
function addEvent (event, callback) {
	return (function() {
		// 如果浏览器支持addEventListener,
		if (document.addEventListener) {
			addEvent = window.addEventListener;
		// 如果浏览器不支持addEventListener, 而是attachEvent
		} else if (document.attachEvent) {
			addEvent = window.attachEvent;
		}
		// 在第一次调用时,绑定事件
		addEvent.call(this, event, callback);
	})();
}
window.onload = function() {
	// 获得dom元素
	var loopImgE = document.getElementById('LoopImg')
	// 生成滚动元素对象
	var loop = new loopImg(
		loopImgE
	);
	// 开启定时滚动
	loop.timer();
};

// 滚动元素类
var loopImg = function(container) {
	var imgs = container.getElementsByTagName('img');
	this.container = container;
	this.length = imgs.length;
	// 定时器
	this.timeOut = null;
	// 生成图片滚动区域Div
	this.loopArea = ['<div class="roll-container">',container.innerHTML,'</div>'].join("");
	// 生成向前按钮String
	this.nextBtn = '<div class="roll-controller-next"></div>';
	// 生成向后按钮String
	this.prevBtn = '<div class="roll-controller-prev"></div>';
	// 生成list
	this.listArea = '<ul class="roll-controller-list"></ul>';
	// 滚图开关 默认开启
	this.switch = true;
	// 当前显示的图片 默认开始显示第一张 
	this.now = 1;
	
	// 初始化
	this.init();
}

loopImg.prototype = {
	// 初始化函数
	init: function() {
		// 初始化滚动区域W
		this.container.innerHTML = this.loopArea + this.prevBtn
			+ this.nextBtn + this.listArea;
		// 获取刚刚生成的元素
		var containerDiv = this.container.getElementsByTagName('div');
		this.loopArea = containerDiv[0];
		var imgs = this.loopArea.getElementsByTagName('img');
		this.firstImg = imgs[0];
		this.lastImg = imgs[this.length - 1];
		this.imgWidth = this.firstImg.clientWidth;
		this.container.style.width = this.imgWidth + "px";
		//
		this.step = this.imgWidth / 3;
		this.prevBtn = containerDiv[1];
		this.nextBtn = containerDiv[2];
		this.listArea = this.container.getElementsByTagName('ul')[0];
		
		// 生成loopArea的宽度 宽度为 (图片数+1)*图片宽度
		this.loopArea.style.width = (this.length + 1) * this.imgWidth + "px";
		
		// 初始化list
		for (var i = 0; i < this.length; i++) {
			var li = document.createElement('li');
//			li.setAttribute("data-i", i + 1);
			li.index = i + 1
			this.listArea.appendChild(li);
		}
		this.list = this.listArea.getElementsByTagName('li');
		this.list[0].className = "roll-controller-list-item-active";
	
		// 绑定click事件
		var that = this;
		this.prevBtn
		addEvent.call(this.prevBtn, 'click', function () {
			if (!that.switch) {
				return false;
			}
			that.showPrev();
		},false);
		addEvent.call(this.nextBtn, 'click', function () {
			if (!that.switch) {
				return false;
			}
			that.showNext();
		},false);
		addEvent.call(this.listArea,'click', function(e) {
			e = e || window.event;
			if (e.target.nodeName !== "LI") {
				return false;
			}
			if (!that.switch) {
				return false;
			}
			that.off();
			
			var i = parseInt(e.target.index);
			if (that.now === i) {
				return false;
			}
			that.indexListener(that.now, i);
			that.now = i;
		});
	},
	// 滚动到上一个图片
	showPrev: function() {
		this.off();
		if (this.now === 1){
			this.indexListener(this.now, this.length, 1);
			this.now = this.length;
		}else {
			this.indexListener(this.now, --this.now, 1);
		}
	},
	// 滚动到下一个图片
	showNext: function() {
		this.off();
		if (this.now == this.length){
//			console.log(this.now);
			this.indexListener(this.now, 1, -1);
			this.now = 1;
		}else {
			console.log(this.length);
			this.indexListener(this.now, ++this.now, -1);
		}
	},
	// 滑动效果动画 需要原来图片的left值 和 step
	loopAnimate: function(oldleft, arrow, newImg, width, finallyLeft) {
		var left = 0;
		var that = this;
		// 代表方向
		// 取绝对值
		var step = width / that.imgWidth * 5;
		
		var loopAniIns = setInterval(function() {
			if (0 < left < that.step) {
				left += step;
			} else if (that.step < left < that.step * 2){
				left += 4 * step;
			} else if (left < width){
				left += step;
			}
			if (left > width) {
				left = width;
				
				clearInterval(loopAniIns);
				that.loopArea.style.left = oldleft + arrow * left + "px";
				// 去掉新添加的newImg
				// 显示最后一个图片
				
				if (finallyLeft) {
					that.loopArea.removeChild(newImg);
					that.loopArea.style.left = finallyLeft;
				// 显示第一个
				}
				that.on();
				return;
			}
			
			that.loopArea.style.left = oldleft + arrow * left + "px";
		}, 2);
	},
	// 下标监听,根据下标的变化来滚动图片
	indexListener: function(last, now, arrow) {
		if (this.length > 2) {
			this.indexListener = manyImgIndexListener;
		} else if (this.length <=2 ){
			this.indexListener = twoImgIndexListener;
		}
		this.indexListener = newImgIndexListener;
		this.indexListener(last, now, arrow);
		// 当不只两个图片时的方法
		function manyImgIndexListener(last, now, arrow) {
			this.loopListListener(last, now);
			var last = arguments[0];
			var now = arguments[1];
			var width = this.imgWidth;
			// 如果是从第一个向前翻, 则要翻到最后一个
			// 先将最后一个复制到最前,以完善动画效果
			// 如果是点击list切换, 那么 arrow是undefined 此时并不是逆向翻滚
			if (last === 1 && now === this.length 
				&& typeof arrow !== "undefined" ) {
				var newImg = this.lastImg.cloneNode();
				var finallyLeft = -this.imgWidth * (this.length - 1) + "px";
				this.loopArea.insertBefore(newImg, this.firstImg);
				this.loopArea.style.left = -this.imgWidth + "px";
			// 如果是从最后一个往后翻, 则要翻到第一个
			// 将第一个复制到最后一个 完善动画效果
			} else if (last === this.length && now === 1 
				&& typeof arrow !== "undefined" ) {
				var finallyLeft = 0 + "px";
				var newImg = this.firstImg.cloneNode(true);
				this.loopArea.appendChild(newImg);
			}
			
			if (typeof arrow === "undefined") {
				arrow = now - last > 0 ? -1 : 1;
				width = this.imgWidth * Math.abs(now - last);
			}
			
			
			// 动画效果
			var oldLeft = parseInt(this.loopArea.style.left || 0);
			this.loopAnimate(oldLeft, arrow, newImg, width, finallyLeft);
		}
		
		function twoImgIndexListener (last, now, arrow) {
			this.loopListListener(last, now);
			// 最后一个往前翻
			if (last === 1 && arrow === 1) {
				var newImg = this.lastImg.cloneNode();
				this.loopArea.insertBefore(newImg, this.firstImg);
				this.loopArea.style.left = -this.imgWidth + "px";
				var finallyLeft = -this.imgWidth + "px";
			} else if(last === 2 && arrow === -1) {
				var newImg = this.firstImg.cloneNode(true);
				this.loopArea.appendChild(newImg);
				var finallyLeft = 0 + "px";
			}
			if (typeof arrow === "undefined") {
				arrow = now - last > 0 ? -1 : 1;
			}
			var oldLeft = parseInt(this.loopArea.style.left || 0);
			this.loopAnimate(oldLeft, arrow, newImg, this.imgWidth, finallyLeft);
		}
		// 适用于 >= 2张图
		function newImgIndexListener (last, now, arrow) {
			this.loopListListener(last, now);
			// 向前
			width = this.imgWidth;
			// 处于第一张仍 向前滚动
			if (arrow === 1 && last === 1) {
				var newImg = this.lastImg.cloneNode();
				var finallyLeft = -this.imgWidth * (this.length - 1) + "px";
				this.loopArea.insertBefore(newImg, this.firstImg);
				this.loopArea.style.left = -this.imgWidth + "px";
			// 处于最后一张 向后滚动
			} else if (arrow === -1 && last === this.length) {
				var finallyLeft = 0 + "px";
				var newImg = this.firstImg.cloneNode(true);
				this.loopArea.appendChild(newImg);
			// list点击时
			} else if (typeof arrow === "undefined") {
				arrow = now - last > 0 ? -1 : 1;
				width = this.imgWidth * Math.abs(now - last);
			}
			// 进行滚动
			var oldLeft = parseInt(this.loopArea.style.left || 0);
			this.loopAnimate(oldLeft, arrow, newImg, width, finallyLeft);
		}
	},
	loopListListener: function(last, now) {
		this.list[now - 1].className = "roll-controller-list-item-active";
		this.list[last - 1].className = "";
	},
	// 开启滚动效果
	on: function() {
		this.switch = true;
	},
	// 关闭滚动
	off: function() {
		this.switch = false;
	},
	// 定时滚动
	timer: function() {
		var that = this;
		this.timeOut = setInterval(function() {
			that.showNext()
		}, 2000);
		addEvent.call (this.container,"mouseleave", function() {
			that.timeOut = setInterval(function() {
					that.showNext()
			}, 2000);
		});
		addEvent.call (this.container,"mouseenter", function() {
			clearTimeout(that.timeOut);
		});	
	}
};

