/*
	业务流程
*/
const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const urlLib = require('url');

http.createServer(function(req,res){
	//获取get数据
	req.get = urlLib.parse(req.url,true).query;
	req.url = urlLib.parse(req.url,true).pathname;
	//获取怕post数据
	var str = '';
	req.on('data',function(s){
		str += s;
	});
	req.on('end',function(){
		req.post = qs.parse(str);
		//获取cookie数据
		req.cookie = qs.parse(req.headers.cookie,'; ');
		//获取session数据
		if(!req.cookie.sessid){
			req.cookie.sessid = ''+Date.now()+Math.random();
		}

		fs.readFile('session/'+req.cookie.sessid,function(err,data){
			if(err){
				req.session = {};
			}else{
				req.session = JSON.parse(data.toString());
			}
			//业务
			res.setHeader('set-cookie','sessid='+req.cookie.sessid+'; path=/');
			if(req.session.visite){
				req.session.visite++;
			}else{
				req.session.visite = 1;
			}

			//session数据记录
			var sessionData = JSON.stringify(req.session);
			fs.writeFile('session/'+req.cookie.sessid,sessionData,function(err){
				if(err){
	                console.log('session重新写回文件-失败了');
	            }else{
	                res.end();
	                //定期清理数据
					fs.stat('session/'+req.cookie.sessid,function(err,stat){
						if(err){
							console.log('err');
						}else{
							var mtime=stat.mtime.getTime();
				            console.log(mtime);
				            clearInterval(timer);
				            var timer=setInterval(function(){
				                var now=Date.now();
				                if((now-mtime)/1000>3){
				                    //删除文件
				                    fs.unlink('session/'+req.cookie.sessid,function(){});
				                    clearInterval(timer);
				                }
				            },1000);
						}
			            
			        });
	            }
			});

		});
	});
}).listen(8081);