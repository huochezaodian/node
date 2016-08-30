'use strict';
/*
	需求：
		user?act=xxx&username=xxx&password=xxx
			act=add 注册
				return {code:0/1,msg}
			act=login 登陆
				return {code:0/1,msg}
*/
const http = require('http');
const fs =require('fs');
const cluster = require('cluster');
const os = require('os');
const EventEmitter = require('events').EventEmitter;
const urlLib = require('url');
const mysql = require('mysql');
const md5 = require('./md5').md5;

var cpus = os.cpus().length;
if(cluster.isMaster){
	for(var i=0;i<cpus;i++){
		cluster.fork();
	}
	cluster.on('exit',function(){
		cluster.fork();
	});
}else{
	var Event = new EventEmitter;

	http.createServer(function(req,res){
		req.get = urlLib.parse(req.url,true).query;
		req.url = urlLib.parse(req.url,true).pathname;

		var bool = Event.emit(req.url,req,res);

		if(bool == false){
			Event.emit('read-file',req,res);
		}
	}).listen(8081);

	Event.on('read-file',function(req,res){
		var rs = fs.createReadStream(req.url.substring(1));
		rs.pipe(res);
		rs.on('error',function(){
			res.writeHeader(404);
			res.write('404');
			res.end();
		});
	});

	Event.on('/user',function(req,res){
		var db = mysql.createConnection({
			host:'localhost',
			user:'root',
			password:'123456',
			database:'node_2016_8_30'
		});
		Event.emit(`user-${ req.get.act }`,req,res,db);
	});

	Event.on('user-add',function(req,res,db){
		var username = req.get.username,
			password = req.get.password,
			sql = `SELECT * FROM user WHERE username="${username}"`;
		db.query(sql,function(err,data){
			if(err){
				res.end(JSON.stringify({code:1,msg:"数据库方面有问题"}));
			}else{
				if(data.length ==0){
					sql = `INSERT INTO user VALUES(NULL,"${username}","${md5(password)}")`;
					db.query(sql,function(err,data){
						if(err){
                            res.end(JSON.stringify({code:1, msg:"数据库方面有问题"}));
                        }else{
                            res.end(JSON.stringify({code:0, msg:"注册成功"}));
                        }
					});
				}else{
					res.end(JSON.stringify({code:1,msg:"此用户已被注册"}));
				}
			}
		});
	});

	Event.on('user-login',function(req,res,db){
		var username = req.get.username,
			password = req.get.password,
			sql = `SELECT * FROM user WHERE username="${username}" AND password="${md5(password)}"`;
		db.query(sql,function(err,data){
			if(err){
				res.end(JSON.stringify({code:1,msg:"数据库方面有问题"}));
			}else{
				if(data.length ==0){
                    res.end(JSON.stringify({code:1, msg:"用户名或密码错误"}));
				}else{
					res.end(JSON.stringify({code:0,msg:"登陆成功"}));
				}
			}
		});
	});
}