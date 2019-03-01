const express = require("express");
const path = require("path");
const WechatJDK = require("../../index.js");

const wechatJDK = WechatJDK.getInstance({
    appid: "wx63269ff8e99cf80d",
    secret: "be15277adb1df632e310f779a56cd02c"
});

const router = express.Router();

router.get("/", wechatJDK.webAuthorize, function(req, res, next){
    res.sendFile(path.join(__dirname, "../views/index.html"));
});

router.post("/signature", function(req, res, next){
    wechatJDK.getSignature(req.body.url).then(resp => {
        res.send(resp);
    });
});

module.exports = router;
