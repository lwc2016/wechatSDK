#### WechatSDK介绍
在微信网页开发过程中，获取微信授权，页面上调用比如：微信分享、图片预览等js-sdk功能时，实现过程很繁琐。第一次实现一遍，第二次开始时还得安步骤再实现一次。这个模块对实现功能进行了封装。

#### WechaSDK使用
1.安装模块
```
npm install wechat-web-sdk
```
2.导入模块
```angular2html
const WechatSKD = require("wechatSKD");
```
3.实例化模块，本模块使用单例模式，全局只存在一个实例对象。需要传入微信appid和secret
```angular2html
const wechatSDK = WechatSDK.getInstance({
    appid: "wx63269ff8e99cf80d",
    secret: "be15277adb1df632e310f779a56cd02c"
})
```
4.获取js-sdk签名
```angular2html
wechatSDK.getSignature(url).then(resp => {
    console.log(resp);
});
```
5.获取微信授权，wechatJDK.webAuthorize方法作为中间价配置到需要获取微信授权的页面路由后面。
```angular2html
router.get("/", wechatJDK.webAuthorize, function(req, res, next){
    res.sendFile("hello world!");
});
```

#### 备注说明
1. 此模块中的微信网页授权是基于express框架的，暂时不支持koa框架
