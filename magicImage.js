function MagicImage(canvas){
	//缩放比例
	this.scale = 1;
	//缩放中心
	this.center = '';
	//是否touch标志
	this.touchFlag = !1;
	//循环对象的timer
	this.timer = '';
	//绘制的ctx对象
	this.drawCtx = canvas.ctx;
	//将被绘制的图片对象, 用字符串初始化
	this.drawImg = 'unDrawed';
	this.touches = 0;
	//最终往画布上画的canvas对象
	this.ghostCav = {};
	//离屏canvas 对象.
	this.originalCav = {};
	//导出图片的canvas对象
	this.finalCav = {};
	//滑动时, touchstart手指合集
	this.mouses = [];
	//滑动时, 当前手指的合集
	this.curMouses = [];
	//屏幕高度
	this._height = window.innerHeight;
	//计算后开始坐标
	this.computedStartPos = {};
	//计算后的区域
	this.computedRange = {};
	//旋转角度
	this.rotateAngle = 0;
	//图片开始绘制的位置
	this.imgStartPos = {};
}
MagicImage.prototype = {
	/**
	 * 设置触发touch事件的dom 
	 * 
	 */
	setTouchTag : function(touchDom){
		var that = this;
		var mouses = [];
		var curMouses = [];
		var distance;
		
		if( !isElement(touchDom) ) return;
		
		touchDom.addEventListener('touchstart', function(event){
			var event = event; 
			event.preventDefault();
			that.touches = event.touches.length;
			that.mouses = [];
			that.curMouses = [];
			that.mouses.push({
				x : event.touches[0].pageX,
				y : event.touches[0].pageY
			})
			
			that.curMouses.push({
				x : event.touches[0].pageX,
				y : event.touches[0].pageY
			})
			
			if(1 != that.touches) {
				that.mouses.push({
					x : event.touches[event.touches.length - 1].pageX,
					y : event.touches[event.touches.length - 1].pageY
				});
				that.curMouses.push({
					x : event.touches[event.touches.length - 1].pageX,
					y : event.touches[event.touches.length - 1].pageY
				});
				that.center = getCenter(that.mouses[0], that.mouses[1]);
				distance = getDistance(that.mouses[0], that.mouses[1]);
			}
			that.touchFlag = !0;
		});
		touchDom.addEventListener('touchmove', function(event){
			var event = event;
			var tempDistance;
			
			that.curMouses = [];
			that.curMouses.push({
				x : event.touches[0].pageX,
				y : event.touches[0].pageY
			});
			if(1 != that.touches) {
				that.curMouses.push({
					x : event.touches[event.touches.length - 1].pageX,
					y : event.touches[event.touches.length - 1].pageY
				});
				
				tempDistance = getDistance(that.curMouses[0], that.curMouses[1]);
				that.scale = parseFloat((tempDistance/distance).toFixed(2));
			}
		});
		
		touchDom.addEventListener('touchend', function(){
			that.touchFlag = !1;
			that.mouses = [];
			that.curMouses = [];
			that.cavStartPos = {
				x : that.computedStartPos.x,
				y : that.computedStartPos.y	
			}
			that.drawWidth = that.computedRange.width;
			that.drawHeight = that.computedRange.height;
		 	that.cavMaxPos ={
			   x : {
			    	left: -1 * that.drawWidth * .9,
			    	right : 640 - that.drawWidth * .1 
			   },
			   y : {
			    	top : -1 * that.drawHeight * .9,
			    	bottom : that._height - that.drawHeight * .1
			   }
		   };
		 	that.scale = 1;
		});
	},
	//初始化数据
	initData : function(){
		this.cavWidth = 640;
		this.cavHeight = winH;
		this.drawWidth = 640;
		this.drawHeight = winH;
		//canvas起绘点
		this.cavStartPos = {
			x : 0,
			y : 0
		};
		//图片起绘点
		this.imgStartPos = {
		   x : 0,
		   y : 0
		};
		//移动范围限制。
		this.cavMaxPos = {
			x : {
				left: -300,
				right : 340
			},
			y : {
				top : -192,
				bottom : this.cavHeight - 192
			}
	   }
	   this.computedStartPos = {};
	   this.computedRange = {
			width : this.drawWidth,
			height : this.drawHeight
	   };

	   this.computedHeight = Math.min(this._height, parseInt(this.drawImg.height * 640/this.drawImg.width));   
	   
	   this.drawImg.width = 640;
	   this.drawImg.height = this.computedHeight;
	   
	   this.imgWidth = 640;
	   this.imgHeight = this.computedHeight;
	   
	},
	//往canvas上绘制图形.
	drawImage : function(img){
		this.drawImg = img;
		if( 'number' == typeof this.timer ) clearInterval(this.timer);
		
		this.initData();
		this.rotateAngle = 0;
		this.createTempCav();
		this.render();
	},
	//主要是通过离屏来绘制多个canvas做旋转处理
	createTempCav : function(){
		var _height = this._height,
			computedHeight = this.computedHeight,
			ghostCav = this.ghostCav, originalCav = this.originalCav;
		   
		   ghostCav.rect = 640 > computedHeight ? 640 : computedHeight;
		   ghostCav.canvas = document.createElement('canvas');
		   ghostCav.ctx = ghostCav.canvas.getContext('2d');
			
		   originalCav.canvas = document.createElement('canvas');
		   originalCav.ctx = originalCav.canvas.getContext('2d');
			
		   ghostCav.canvas.width = ghostCav.rect;
		   ghostCav.canvas.height = ghostCav.rect;
			
		   originalCav.canvas.width = 640;
		   originalCav.canvas.height = _height;
			
		   originalCav.ctx.drawImage(this.drawImg, 0, 0, this.drawImg.width, this.drawImg.height);
		   ghostCav.ctx.drawImage(originalCav.canvas, 0, 0, this.drawImg.width, computedHeight, 0, 0, this.drawImg.width, computedHeight);
		   ghostCav.drawWidth = this.drawImg.width;
		   ghostCav.drawHeight = computedHeight;
		   
		   if( 640 > computedHeight) this.rotateImg();
		   
		 //  this.finalCav.canvas = document.createElement('canvas');
		 //  finalCav.canvas.width = 500;
		 //  finalCav.canvas.height = 500;
		  
		 //  finalCav.ctx = finalCav.canvas.getContext('2d');
	},
	rotateImg : function(){
		var scale, imgStartPos, 
			ghostCav = this.ghostCav, 
			originalCav = this.originalCav,
			computedHeight = this.computedHeight;
		
		if('string' == typeof this.drawImg) return;
		
		this.rotateAngle += 90;
		if(360 == this.rotateAngle) this.rotateAngle = 0;
		
		ghostCav.ctx.clearRect(0, 0, ghostCav.rect, ghostCav.rect);
		ghostCav.ctx.save();
		ghostCav.ctx.translate(ghostCav.rect/2, ghostCav.rect/2);
		ghostCav.ctx.rotate(Math.PI/180 * this.rotateAngle);
		ghostCav.ctx.drawImage(originalCav.canvas, 0, 0, 640, computedHeight, -0.5 * ghostCav.rect, -0.5 * ghostCav.rect, 640, computedHeight);
		switch(this.rotateAngle){
	   		case 0:
				imgStartPos = {x : 0, y : 0}
				ghostCav.drawWidth = 640;
				ghostCav.drawHeight = computedHeight;
				break;
			case 90:
				imgStartPos = {
					x : ghostCav.rect - computedHeight, 
					y : 0
				}
				ghostCav.drawWidth = computedHeight;
				ghostCav.drawHeight = 640;
				break;
			case 180:
				imgStartPos = {
					x : ghostCav.rect - 640, 
					y : ghostCav.rect - computedHeight
				}
				ghostCav.drawWidth = 640;
				ghostCav.drawHeight = computedHeight;
				break;
			case 270:
				imgStartPos = {
					x : 0, 
					y : ghostCav.rect - 640
				}
				ghostCav.drawWidth = computedHeight;
				ghostCav.drawHeight = 640;
				break;
		}
		ghostCav.ctx.restore();
		this.imgStartPos = imgStartPos;
	},
	render : function(){
		var that = this;
		function doRender(){
			var cavTempStartPos = {
				x : that.cavStartPos.x,
				y : that.cavStartPos.y
			},
			tempDrawRange = {
				width : that.drawWidth,
				height : that.drawHeight
		   };
				
		   if( that.touchFlag ) {
			   //滑动
			   if(1 == that.touches) {
				   cavTempStartPos.x = parseInt(that.cavStartPos.x + that.curMouses[0].x - that.mouses[0].x);
				   cavTempStartPos.y = parseInt(that.cavStartPos.y + that.curMouses[0].y - that.mouses[0].y);
					
				   //负左，正右
				   if(cavTempStartPos.x < that.cavMaxPos.x.left) cavTempStartPos.x =  that.cavMaxPos.x.left;
				   if(cavTempStartPos.x >  that.cavMaxPos.x.right) cavTempStartPos.x =  that.cavMaxPos.x.right;
					
				   if(cavTempStartPos.y < that.cavMaxPos.y.top) cavTempStartPos.y = that.cavMaxPos.y.top;
				   if(cavTempStartPos.y > that.cavMaxPos.y.bottom) cavTempStartPos.y = that.cavMaxPos.y.bottom;
			   }
			   //缩放
			   else {
				   try{
					   tempDrawRange.width = parseInt(that.drawWidth * that.scale);
					   tempDrawRange.height = parseInt(that.drawHeight * that.scale);
						
					   //放大
					   if(that.scale > 1) {
						   cavTempStartPos.x -= (tempDrawRange.width - that.drawWidth) / 2;
						   cavTempStartPos.y -= (tempDrawRange.height - that.drawHeight) / 2; 
					   }
					   //缩小。、
					   else{
						   cavTempStartPos.x += (that.drawWidth - tempDrawRange.width) / 2;
						   cavTempStartPos.y += (that.drawHeight - tempDrawRange.height) / 2; 
					   }
				   }
				   catch(e) {
					   alert(e);
				   }
				  
			   }
		   }
		   that.drawCtx.clearRect(0, 0, 640, that._height);
			
		   that.drawCtx.drawImage(that.ghostCav.canvas, that.imgStartPos.x, that.imgStartPos.y, that.ghostCav.drawWidth, that.ghostCav.drawHeight, cavTempStartPos.x, cavTempStartPos.y, tempDrawRange.width, tempDrawRange.height);
		   that.computedStartPos = {
			   x : cavTempStartPos.x,
			   y : cavTempStartPos.y
		   };
		   that.computedRange = {
				width : tempDrawRange.width,
				height : tempDrawRange.height
		   };
		   that.timer = requestAnimationFrame(doRender);
		}
		doRender();
	},
	/**
	 * 导出base64
	 * @param {string} w 要导出的宽度
	 * @param {string} h 要导出的高度
	 **/
	exportImg : function(w, h){
		var ghostCav = this.ghostCav,
			finalCav = document.createElement('canvas');
		
		finalCav.width = w;
		finalCav.height = h;
		finalCav.ctx.drawImage(ghostCav.canvas, 0, 0, ghostCav.canvas.width, ghostCav.canvas.height, 0, 0, w, h);
		var	imgData = finalCav.canvas.toDataURL("image/jpeg");
		console.log(imgData);
	}
}
function isElement(obj) {
	return !!(obj && obj.nodeType === 1);
};
//获取两个点之间的距离
function getDistance(p1, p2){
	return Math.sqrt(Math.pow(p1.x- p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
//获取两个点的中心点.
function getCenter(p1, p2) {
	return {
		x : parseInt((p1.x + p2.x)/2),
		y : parseInt((p1.y + p2.y)/2),
	}
}
