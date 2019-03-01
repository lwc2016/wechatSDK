const express = require("express");
const bodyParser = require("body-parser");
const indexsRoute = require("./routes/index.js");
const cookieParser = require("cookie-parser");
const app = express();
const WechatJDK = require("../index.js");

const wechatJDK = WechatJDK.getInstance({
    appid: "wx63269ff8e99cf80d",
    secret: "be15277adb1df632e310f779a56cd02c"
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", indexsRoute);

app.listen(3030, function(){
    console.log("Server is running at port: 3030");
});
