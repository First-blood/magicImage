# magicImage
magicImage是一个用来在微信内置浏览器上提供照片拖动, 旋转, 缩放, 导出功能的小工具.
用户上传照片, 是很常见的一个H5开发需求.我们在实现这个功能的时候可能会遇到以下一些问题:
* 如果是上传原照片的话, 手机拍摄的原照片会比较大,上传耗时,用户体验不好.一旦上传过多,相信服务器端口也恼火.
* 常见需求中, 页面上往往会提供一个相框要求用户拖动照片到相框中, 程序在上传的时候只需要上传相框中的照片部分.<br>
### 我的开发思路:
用户触发type="file"的input, 在input值改变后通过FileReader接口new出一个image, 然后再将该image绘制到canvas上, 用canvas的绘图对象所提供的方法来处理照片.这样做有一个很明显的问题:
* input触发后,如果用户通过拍照使用照片(也就是iphone相机胶卷里的照片)的话,绘制出来的照片是旋转后的
这也是该插件主要要解决的问题..


### Start
* new一个, magicImage = new MagicImage(canvas); //canvas参数是用来绘制照片的dom对象
* 设置触发touch事件的dom对象 magicImage.setTouchTag(domObj);
* magicImage.drawImage(img); 开始往canvas上绘制img.

### 导出图片,并上传
* magicImage.exportImg(w, h), 执行该方法会给出一个图片对应的Base64字符串向后台作为提交.
