"use strict";
const request = require("request");
const crypto = require("crypto");
const sha1 = require("sha1");
(function(){
    var WechatJDK = function(options){
        // 设置appid和secret
        this.appid = options.appid;
        this.secret = options.secret;
        // accessToken缓存
        this.accessTokenCache = {};
        // ticket缓存
        this.ticketCache = {};
        this.webAuthorize = this.webAuthorize.bind(this);
        this.getAccessToken2 = this.getAccessToken2.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
    };
    /*
    *** 获取微信JS-SDK签名
     */
    // 通过网络获取access_token
    WechatJDK.prototype.getAccessTokenByNet = function(){
        var url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appid}&secret=${this.secret}`;
        return new Promise((resolve, reject)=>{
            request(url, {}, (err, httpResponse, body)=>{
                let result = JSON.parse(body);
                if(result.access_token){
                    resolve(result);
                }else{
                    reject(result);
                }
            })
        })
    };

    // 将access_token设置到缓存中
    WechatJDK.prototype.setAccessToken = function(data){
        if(data.access_token && data.expires_in){
            let expired = Date.now() + (data.expires_in - 200) * 1000;
            this.accessTokenCache = {access_token: data.access_token, expired: expired};
        }
    };

    WechatJDK.prototype.getAccessToken = function(){
        return new Promise((resolve, reject)=>{
            if(this.accessTokenCache.access_token && this.accessTokenCache.expired &&  Date.now() < this.accessTokenCache.expired){
                console.log("----从缓存中获取access_token-----");
                resolve(this.accessTokenCache.access_token);
            }else{
                console.log("----从网络获取access_token------")
                return this.getAccessTokenByNet().then(resp=>{
                   this.setAccessToken(resp);
                   resolve(this.accessTokenCache);
                }).catch(err=>{
                    reject(err);
                })
            }
        })
    };

    // 获取ticket
    WechatJDK.prototype.getTicketByNet = function(){
        var accessToken = this.accessTokenCache.access_token;
        var url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
        return new Promise((resolve, reject)=>{
            request(url, {}, (err, httpResponse, body)=>{
                let result = JSON.parse(body);
                if(result.ticket){
                    resolve(result);
                }else{
                    reject(result);
                }
            });
        });
    };
    WechatJDK.prototype.setTicket = function(data){
      if(data.ticket && data.expires_in){
          var expired = Date.now() + (data.expires_in - 200) * 1000;
          this.ticketCache = {ticket: data.ticket, expired: expired};
      }
    };

    WechatJDK.prototype.getTicket = function(){
        return new Promise((resolve, reject)=>{
           if(this.ticketCache.ticket && this.ticketCache.expired && Date.now() < this.ticketCache.expired){
               resolve(this.ticketCache);
           } else {
               return this.getTicketByNet().then(resp=>{
                   this.setTicket(resp);
                   resolve(resp);
               }).catch(err=>{
                   reject(err);
               })
           }
        });
    };

    // 获取算法
    WechatJDK.prototype.getSignature = function(url){
        return new Promise((resolve, reject)=>{
            this.getAccessToken().then(this.getTicket.bind(this)).then(()=>{
                let jsapi_ticket = this.ticketCache.ticket;
                let timestamp =  Math.floor(Date.now() / 1000);
                let noncestr = crypto.randomBytes(8).toString("hex");
                let str = [`jsapi_ticket=${jsapi_ticket}`, `timestamp=${timestamp}`, `noncestr=${noncestr}`, `url=${url}`].sort().join("&");
                let signature = sha1(str);
                resolve({
                    signature: signature,
                    appId: this.appid,
                    timestamp: timestamp,
                    nonceStr: noncestr
                });
            }).catch(err=>{
                reject(err);
            })
        })
    };


    /*
    *** 获取网页授权
     */
    WechatJDK.prototype.webAuthorize = function(req, res, next){
        if(!req.cookies.openid){
            if(!req.query.code){
                let redirect_url = escape("http://" + req.hostname + req.originalUrl);
                let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${this.appid}&redirect_uri=${redirect_url}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`;
                res.redirect(url);
            }else{
                this.getAccessToken2(req.query.code).then(this.getUserInfo).then(resp => {
                    // 设置cookie
                    for(let item in resp){
                        res.cookie(item, resp[item], {expires: new Date(Date.now() + 24 * 60 * 60 * 1000)});
                    }
                    let query = req.query;
                    let search = [];
                    for(let item in query){
                        if(item !== "code" && item !== "state"){
                            search.push(`${item}=${query[item]}`);
                        }
                    }
                    let querystring = search.join("&");
                    let url = querystring ? req.path + "?" + querystring : req.path;
                    res.redirect(url);
                })
            }
        }else{
            next();
        }
    };
    // 获取网页授权access_token
    WechatJDK.prototype.getAccessToken2 = function(code){
        let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appid}&secret=${this.secret}&code=${code}&grant_type=authorization_code`;
        return new Promise((resolve, reject)=>{
            request.post(url, (err, httpResponse, body)=>{
                console.log(body);
                let result = JSON.parse(body);
                if(result.access_token){
                    resolve(result);
                }else{
                    reject(result);
                }

            })
        });
    };
    WechatJDK.prototype.getUserInfo = function(data){
        let url = `https://api.weixin.qq.com/sns/userinfo?access_token=${data.access_token}&openid=${data.openid}&lang=zh_CN`;
        return new Promise((resolve, reject)=>{
            request(url, (err, httpResponse, body)=>{
                let result = JSON.parse(body);
                resolve(result);
            })
        });
    };

    // 单例模式
    WechatJDK.getInstance = function(options){
        if(!this.instance){
            console.log("-----创建wechatJDK对象----")
            this.instance = new WechatJDK(options);
        }
        return this.instance;
    };

    module.exports = WechatJDK;
})();
