/*
	服务器到客户端之间的数据传输
	get -> post -> cookie -> session -> working
*/
const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const urlLib = require('url');
const EventEmitter = require('events').EventEmitter;
var E = new EventEmitter();

http.createServer(function(req,res){
	E.emit('parse-get',req,res);
}).listen(8081);

E.on('parse-get',function(req,res){
	req.get = urlLib.parse(req.url,true).query;
	req.url = urlLib.parse(req.url,true).pathname;
	E.emit('parse-post',req,res);
});

E.on('parse-post',function(req,res){
	var str = '';
	req.on('data',function(s){
		str += s;
	});
	req.on('err',function(){
		req.post = qs.parse(str);
		E.emit('parse-cookie',req,res);
	});
});

E.on('parse-cookie',function(req,res){
	req.cookie = qs.parse(req.headers.cookie,'; ');
	E.emit('parse-session',req,res);
});

E.on('parse-session',function(req,res){
	if(!req.cookie.sessid){
		req.cookie.sessid = '' + Data.now() + Math.random();
	}
	E.emit('read-file',req,res);
});

E.on('read-file',function(req,res){
	fs.readFile('session'+req.cookie.sessid,function(err,data){
		if(err){
			req.session = {};
		}else{
			req.session = JSON.parse(data.toString());
		}
		if(req.session.visite){
			req.session.visite = 1;
		}else{
			req.session.visite ++;
		}
		E.emit('write-file',req,res);
	});
});

E.on('write-file',function(req,res){
	fs.writeFile('session'+req.cookie.sessid,JSON.stringify(req.session),function(err){

	});
	E.emit('end',req,res);
});

E.on('end',function(req,res){
	res.setHeader('set-cookie',req.cookie.sessid);
	res.write();
	res.end();
});