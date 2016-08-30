"use strict";
const http=require("http");
const querystring=require("querystring");
const urlLib=require("url");
const fs=require("fs");

http.createServer(function(req,res){

	console.log("有人来了！"+req.url);
	var url=urlLib.parse(req.url,true).pathname;
	req.get=urlLib.parse(req.url,true).query;

	var str="";
	req.on("data",function(s){
		str+=s;
	});
	req.on("end",function(){
		req.post=querystring.parse(str);
		console.log(url,req.get,req.post);

		if(url=="/login"){
			var user=req.get?req.get.username:req.post.username;
			var password=req.get?req.get.password:req.post.password;

			fs.readFile('./user.data','utf-8',function(err,data){
				if(err){
					res.write('404');
					res.end();
				}else{
					data=eval(data);
					var count=0;
					for(var i=0;i<data.length;i++){
						if(data[i].username==user&&data[i].password==password){
							res.write('{err:1,msg:"登陆成功"}');
							res.end();
						}else{
							count++;
							if(count==data.length){
								res.write('{err:0,msg:"用户名或密码错误"}');
								res.end();
							}
						}
					}
				}
			});
		}else if(url=="/register"){
			var user=req.get?req.get.username:req.post.username;
			var password=req.get?req.get.password:req.post.password;

			fs.readFile('./user.data','utf-8',function(err,data){
				if(err){
					res.write('404');
					res.end();
				}else{
					data=eval(data);
					var count=0;
					for(var i=0;i<data.length;i++){
						if(data[i].username==user&&data[i].password==password){
							res.write('{err:0,msg:"用户名已被注册"}');
							res.end();
						}else{
							count++;
						}
					}
					if(count==data.length){
						data[data.length]={"username":user,"password":password};
						data=JSON.stringify(data);
						fs.writeFile('./user.data',data);
						res.write('{err:1,msg:"注册成功"}');
						res.end();
					}
				}
			});
		}else{
			url=url.replace(/^\//,'');
			fs.readFile(url,function(err,data){
				if(err){
					res.write("404");
					res.end();
				}else{
					res.write(data);
					res.end();
				}
			});
		}
	});
}).listen(8081);