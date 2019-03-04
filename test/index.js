"use strict";
const WechatJDK = require("../index.js");
const expect = require("chai").expect;

describe("wechatJDK", function(){
    let wechatJDK = WechatJDK.getInstance({
        appid: "wx63269ff8e99cf80d",
        secret: "be15277adb1df632e310f779a56cd02c"
    });

    it("测试getAccessTokenByNet", function(done){
        wechatJDK.getAccessTokenByNet().then(resp => {
            expect(resp).to.be.an("object");
            expect(resp).to.have.a.property("access_token");
            done();

        }).catch(err=>{
            console.log(err);

            done();
        })
    });

    it("测试getAccessToken", function(done){
        wechatJDK.getAccessToken().then(resp => {
            expect(resp).to.be.an("object");
            done();

        }).catch(err=>{
            console.log(err);
            done();
        })
    });

    it("测试getTicketByNet", function(done){
       wechatJDK.getAccessToken().then(resp => {
           setTimeout(function(){
               wechatJDK.getTicketByNet().then(resp => {
                   expect(resp).to.be.an("object");
                   expect(resp).to.have.property("ticket");
                   done();
               }).catch(err => {
                   console.log(err);
                   done();
               })
           }, 1000);
       })
    });

    it("测试getTicket", function(done){
        wechatJDK.getAccessToken().then(resp => {
            setTimeout(function(){
                wechatJDK.getTicket().then(resp => {
                    expect(resp).to.be.an("object");
                    expect(resp).to.have.property("ticket");
                    done();
                }).catch(err => {
                    console.log(err);
                    done();
                })
            }, 1000);
        })
    });

    it("测试getSignature", function(done){
        wechatJDK.getSignature().then(function(){
            expect(wechatJDK.accessTokenCache).to.be.an("object");
            expect(wechatJDK.accessTokenCache).to.have.property("access_token");

            expect(wechatJDK.ticketCache).to.be.an("object");
            expect(wechatJDK.ticketCache).to.have.property("ticket");
            done();
        })
    });

    it("测试getSignature返回值测试", function(done){
        wechatJDK.getSignature("http://yizhenjia.com").then(function(resp){
            expect(resp).to.be.an("object");
            expect(resp).to.have.property("signature");
            expect(resp).to.have.property("appId");
            expect(resp).to.have.property("timestamp");
            expect(resp).to.have.property("nonceStr");
            done();
        })
    });
});


